import type {
  AnalogSite,
  BreakdownItem,
  BreakdownSeverity,
  TestbedApplication,
} from '../types'
import {
  TESTBED_CATALOG,
  UNIVERSAL_BREAKDOWNS,
  type TargetBody,
} from '../data/breakdown_matrix'
import { DIMENSION_KEYS, DIMENSION_META } from '../utils/constants'
import { formatNumber } from '../utils/formatters'
import { dimensionDeltas } from './similarity'

/** Ordering used when a panel sorts breakdowns from worst to mildest. */
const SEVERITY_RANK: Record<BreakdownSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  fundamental: 3,
}

/** Maximum number of site-specific entries added on top of the six universal ones. */
const SITE_SPECIFIC_LIMIT = 4

/** Effective depth: `Infinity` (no accessible ice) collapses to the 100 m cap. */
function effectiveDepth(depthM: number): number {
  return Number.isFinite(depthM) ? depthM : 100
}

/** Depth rendered with its unit, or an explicit "no accessible ice column". */
function describeDepth(depthM: number): string {
  if (!Number.isFinite(depthM)) return 'no accessible ice column'
  const decimals = depthM > 0 && depthM < 10 ? 1 : 0
  return `${formatNumber(depthM, decimals)} m`
}

/** Absolute per-dimension gap between an analog and its target. */
function closestDimension(
  earth: AnalogSite,
  target: AnalogSite,
): { label: string; delta: number } {
  const deltas = dimensionDeltas(earth.featureVector, target.featureVector)
  let bestKey = DIMENSION_KEYS[0]
  let bestDelta = deltas[bestKey]
  for (const key of DIMENSION_KEYS) {
    if (deltas[key] < bestDelta) {
      bestKey = key
      bestDelta = deltas[key]
    }
  }
  const meta = DIMENSION_META.find((dimension) => dimension.key === bestKey)
  return { label: meta?.label ?? bestKey, delta: bestDelta }
}

type SiteBreakdownRule = (
  earth: AnalogSite,
  target: AnalogSite,
) => BreakdownItem | null

const thermalSwingRule: SiteBreakdownRule = (earth, target) => {
  const earthSwing = earth.rawParameters.diurnalDeltaTK
  const targetSwing = target.rawParameters.diurnalDeltaTK
  const gap = Math.abs(targetSwing - earthSwing)
  if (gap < 40) return null
  const severity: BreakdownSeverity =
    gap >= 150 ? 'fundamental' : gap >= 80 ? 'high' : 'medium'
  const direction = targetSwing > earthSwing ? 'wider' : 'narrower'
  return {
    domain: 'Diurnal Thermal Swing',
    earthValue: `${formatNumber(earthSwing, 0)} K peak-to-trough`,
    targetValue: `${formatNumber(targetSwing, 0)} K peak-to-trough`,
    deltaDescription: `${target.name} has a ${direction} surface swing than ${earth.name} by ${formatNumber(gap, 0)} K per cycle, so radiator, heater and battery sizing validated at the analog does not transfer to the target.`,
    severity,
    mitigationStrategy:
      'Size active thermal control for the target swing, add multilayer insulation and phase-change buffers, and cold-start actuators at the target minimum temperature.',
  }
}

const illuminationRule: SiteBreakdownRule = (earth, target) => {
  const earthIllumination = earth.rawParameters.annualIlluminationPct
  const targetIllumination = target.rawParameters.annualIlluminationPct
  const gap = Math.abs(targetIllumination - earthIllumination)
  if (gap < 20) return null
  const severity: BreakdownSeverity = gap >= 50 ? 'high' : 'medium'
  return {
    domain: 'Solar Illumination Continuity',
    earthValue: `${formatNumber(earthIllumination, 0)}% of the year lit`,
    targetValue: `${formatNumber(targetIllumination, 0)}% of the year lit`,
    deltaDescription: `Annual illumination differs by ${formatNumber(gap, 0)} percentage points, so a solar-plus-battery architecture sized at the analog cannot cover the target's unlit interval.`,
    severity,
    mitigationStrategy:
      'Add nuclear or regenerative fuel-cell power and thermal storage for the unlit interval, and validate the architecture in a solar-simulator chamber.',
  }
}

const volatileAccessRule: SiteBreakdownRule = (earth, target) => {
  const earthIce = earth.rawParameters.waterIcePresence
  const targetIce = target.rawParameters.waterIcePresence
  const iceGap = Math.abs(targetIce - earthIce)
  const depthGap = Math.abs(
    effectiveDepth(target.rawParameters.depthToIceM) -
      effectiveDepth(earth.rawParameters.depthToIceM),
  )
  if (iceGap < 0.3 && depthGap < 5) return null
  const strongIceMismatch =
    (earthIce >= 0.4 && targetIce < 0.2) ||
    (targetIce >= 0.4 && earthIce < 0.2)
  return {
    domain: 'Volatile Accessibility',
    earthValue: `ice index ${formatNumber(earthIce, 2)}, ${describeDepth(earth.rawParameters.depthToIceM)}`,
    targetValue: `ice index ${formatNumber(targetIce, 2)}, ${describeDepth(target.rawParameters.depthToIceM)}`,
    deltaDescription: `${
      Number.isFinite(earth.rawParameters.depthToIceM) &&
      Number.isFinite(target.rawParameters.depthToIceM)
        ? `Water-ice abundance and burial depth differ by ${formatNumber(iceGap, 2)} in normalized index and ${formatNumber(depthGap, 0)} m respectively`
        : `Water-ice abundance differs by ${formatNumber(iceGap, 2)} in normalized index, and only ${
            Number.isFinite(earth.rawParameters.depthToIceM) ? earth.name : target.name
          } has an accessible ice layer`
    }, so drilling, sublimation-control and ISRU power budgets demonstrated at the analog require re-derivation for ${target.name}.`,
    severity: strongIceMismatch ? 'high' : 'medium',
    mitigationStrategy:
      'Test the same drill and cryogenic sampling chain on both ice-rich and ice-poor ground, and calibrate ground-penetrating radar against auger ground truth before committing to an ISRU architecture.',
  }
}

const dustRegimeRule: SiteBreakdownRule = (earth, target) => {
  const earthAod = earth.rawParameters.aerosolOpticalDepth
  const targetAod = target.rawParameters.aerosolOpticalDepth
  const earthCover = earth.rawParameters.dustCoverIndex
  const targetCover = target.rawParameters.dustCoverIndex
  const aodGap = Math.abs(targetAod - earthAod)
  const coverGap = Math.abs(targetCover - earthCover)
  if (aodGap < 0.2 && coverGap < 0.3) return null
  const highContrast =
    (targetAod >= 0.4 && earthAod <= 0.2) ||
    (earthAod >= 0.4 && targetAod <= 0.2)
  return {
    domain: 'Aeolian Dust Loading',
    earthValue: `AOD ${formatNumber(earthAod, 2)}, dust cover ${formatNumber(earthCover, 2)}`,
    targetValue: `AOD ${formatNumber(targetAod, 2)}, dust cover ${formatNumber(targetCover, 2)}`,
    deltaDescription: `Aerosol optical depth differs by ${formatNumber(aodGap, 2)} and dust cover by ${formatNumber(coverGap, 2)}; soiling rates and cleaning intervals measured at ${earth.name} therefore under- or over-estimate the ${target.name} environment.`,
    severity: highContrast ? 'high' : 'medium',
    mitigationStrategy:
      'Run solar-array soiling and optical-cleaning tests in a dust tunnel at the target AOD, and carry soiling monitors plus scheduled cleaning cycles.',
  }
}

const uvEnvironmentRule: SiteBreakdownRule = (earth, target) => {
  const earthUv = earth.rawParameters.uvFluxRelative
  const targetUv = target.rawParameters.uvFluxRelative
  const gap = Math.abs(targetUv - earthUv)
  if (gap < 1) return null
  const severity: BreakdownSeverity = gap >= 2 ? 'high' : 'medium'
  return {
    domain: 'Surface UV Environment',
    earthValue: `${formatNumber(earthUv, 1)}× Earth sea-level UV`,
    targetValue: `${formatNumber(targetUv, 1)}× Earth sea-level UV`,
    deltaDescription: `Relative UV flux differs by a factor of ${formatNumber(gap, 1)}; polymer seals, optics and organic biosignatures exposed at the analog degrade at a rate that cannot be projected directly to ${target.name}.`,
    severity,
    mitigationStrategy:
      'Qualify seals, optics and suit materials under the target UV dose, and cache organic-sensitive samples behind opaque, UV-blocking shielding.',
  }
}

const subsurfaceVoidRule: SiteBreakdownRule = (earth, target) => {
  const earthCave = earth.rawParameters.caveLavaTubePresence
  const targetCave = target.rawParameters.caveLavaTubePresence
  const gap = Math.abs(targetCave - earthCave)
  if (gap < 0.4) return null
  const severity: BreakdownSeverity =
    targetCave >= 0.75 || earthCave >= 0.75 ? 'high' : 'medium'
  const describeVoid = (site: AnalogSite): string =>
    `cave index ${formatNumber(site.rawParameters.caveLavaTubePresence, 2)}, tube Ø ${formatNumber(site.rawParameters.estimatedTubeDiameterM, 0)} m, roof ${formatNumber(site.rawParameters.roofThicknessM, 0)} m`
  return {
    domain: 'Subsurface Void Geometry',
    earthValue: describeVoid(earth),
    targetValue: describeVoid(target),
    deltaDescription: `Void confidence differs by ${formatNumber(gap, 2)}; the accessible geometry and overburden demonstrated at the analog do not match ${target.name}, so habitat volume and shielding assumptions must be rebuilt from orbiter data.`,
    severity,
    mitigationStrategy:
      'Map the target with LiDAR/SLAM and gravity or radar sounding, and validate roof stability with terrestrial lava-tube analogues before committing to a subsurface habitat.',
  }
}

const SITE_BREAKDOWN_RULES: readonly SiteBreakdownRule[] = [
  thermalSwingRule,
  illuminationRule,
  volatileAccessRule,
  dustRegimeRule,
  uvEnvironmentRule,
  subsurfaceVoidRule,
]

function sortBySeverity(items: readonly BreakdownItem[]): BreakdownItem[] {
  return [...items].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  )
}

/**
 * Universal physics breakdowns translated to a specific target body.
 * Earth targets are rejected because a pairing must cross to the Moon or Mars.
 */
function universalBreakdownsFor(target: AnalogSite): BreakdownItem[] {
  const body = target.body
  if (body === 'earth') {
    throw new Error('Analog breakdowns require a Moon or Mars target site')
  }
  const destination: TargetBody = body
  return UNIVERSAL_BREAKDOWNS.map((template) => ({
    domain: template.domain,
    earthValue: template.earthValue,
    targetValue: template.targetValues[destination],
    deltaDescription: template.consequences[destination],
    severity: template.severity,
    mitigationStrategy: template.mitigationStrategy,
  }))
}

/**
 * All breakdowns for one Earth → Moon/Mars pairing: the six universal physics
 * gaps plus up to four data-driven site-specific gaps, sorted by severity.
 */
export function getSiteBreakdowns(
  earth: AnalogSite,
  target: AnalogSite,
): BreakdownItem[] {
  const siteSpecific: BreakdownItem[] = []
  for (const rule of SITE_BREAKDOWN_RULES) {
    const item = rule(earth, target)
    if (item) siteSpecific.push(item)
  }
  const rankedSiteSpecific = sortBySeverity(siteSpecific).slice(
    0,
    SITE_SPECIFIC_LIMIT,
  )
  return sortBySeverity([
    ...universalBreakdownsFor(target),
    ...rankedSiteSpecific,
  ])
}

/**
 * Hardware and operational tests the Earth analog can host for a given target.
 *
 * The static catalog entry is extended with the closest-matching dimension for
 * this specific pairing, so two targets produce visibly different briefs.
 */
export function getTestbedApplications(
  earth: AnalogSite,
  target: AnalogSite,
): TestbedApplication[] {
  const catalog = TESTBED_CATALOG[earth.id]
  if (!catalog) return []
  const closest = closestDimension(earth, target)
  return catalog.map((application) => ({
    ...application,
    description: `${application.description} Closest analog dimension for ${target.name}: ${closest.label} (normalized Δ ${formatNumber(closest.delta, 2)}).`,
  }))
}
