import type { FeatureVector, RawParameters } from '../types'
import { PARAMETER_BOUNDS, type NumericParameterKey } from '../data/parameter_bounds'

/** Clamp a number into the closed interval [0, 1]. */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value <= 0) return 0
  if (value >= 1) return 1
  return value
}

/** Arithmetic mean of a non-empty list of values. */
function mean(values: readonly number[]): number {
  const sum = values.reduce((total, value) => total + value, 0)
  return sum / values.length
}

/**
 * Min-max normalization with physical clamping.
 *
 *   x_norm = (x − min) / (max − min) ∈ [0, 1]
 *
 * Values outside the physical bounds are clamped to 0 or 1. A degenerate
 * range (max ≤ min) returns 0 rather than producing NaN.
 */
export function normalizeValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0
  return clamp01((value - min) / (max - min))
}

/**
 * Normalize one named physical parameter against its entry in
 * PARAMETER_BOUNDS. Throws for unknown keys instead of silently returning 0.
 */
export function normalizeParameter(
  value: number,
  paramKey: NumericParameterKey,
): number {
  const bound = PARAMETER_BOUNDS[paramKey]
  return normalizeValue(value, bound.min, bound.max)
}

/**
 * Convert raw instrument parameters into the seven normalized dimensions.
 *
 * Aggregation formulas (each dimension is the arithmetic mean of its terms and
 * therefore remains in [0, 1]):
 *
 *   D1 geology     = mean(mineralDiversityIndex, alterationState)
 *   D2 terrain     = mean(norm(meanSlopeDeg), norm(surfaceRoughnessRMS),
 *                         norm(rockAbundancePct))
 *   D3 thermal     = mean(norm(thermalInertia), norm(diurnalDeltaTK),
 *                         norm(annualIlluminationPct))
 *   D4 volatiles   = mean(waterIcePresence, 1 − norm(depthToIceM),
 *                         permafrostExtent, isruPotentialIndex)
 *   D5 dust        = mean(dustCoverIndex, norm(aerosolOpticalDepth),
 *                         aeolianActivityIndex)
 *   D6 subsurface  = mean(caveLavaTubePresence, norm(estimatedTubeDiameterM),
 *                         norm(roofThicknessM), radiationShieldingFactor)
 *   D7 astrobiology = mean(extremophilePresence, biosignaturePreservation,
 *                          waterActivity, 1 − norm(uvFluxRelative))
 *
 * Inversions encode desirability: shallower ice and lower UV flux both produce
 * a higher (more habitat-friendly) normalized score.
 */
export function computeFeatureVector(raw: RawParameters): FeatureVector {
  // Infinity means "no accessible ice column"; substitute the physical cap so
  // the inverted term becomes 0 (zero volatile accessibility).
  const iceDepth = Number.isFinite(raw.depthToIceM)
    ? raw.depthToIceM
    : PARAMETER_BOUNDS.depthToIceM.max

  const geology = mean([clamp01(raw.mineralDiversityIndex), clamp01(raw.alterationState)])

  const terrain = mean([
    normalizeParameter(raw.meanSlopeDeg, 'meanSlopeDeg'),
    normalizeParameter(raw.surfaceRoughnessRMS, 'surfaceRoughnessRMS'),
    normalizeParameter(raw.rockAbundancePct, 'rockAbundancePct'),
  ])

  const thermal = mean([
    normalizeParameter(raw.thermalInertia, 'thermalInertia'),
    normalizeParameter(raw.diurnalDeltaTK, 'diurnalDeltaTK'),
    normalizeParameter(raw.annualIlluminationPct, 'annualIlluminationPct'),
  ])

  const volatiles = mean([
    clamp01(raw.waterIcePresence),
    1 - normalizeParameter(iceDepth, 'depthToIceM'),
    clamp01(raw.permafrostExtent),
    clamp01(raw.isruPotentialIndex),
  ])

  const dust = mean([
    clamp01(raw.dustCoverIndex),
    normalizeParameter(raw.aerosolOpticalDepth, 'aerosolOpticalDepth'),
    clamp01(raw.aeolianActivityIndex),
  ])

  const subsurface = mean([
    clamp01(raw.caveLavaTubePresence),
    normalizeParameter(raw.estimatedTubeDiameterM, 'estimatedTubeDiameterM'),
    normalizeParameter(raw.roofThicknessM, 'roofThicknessM'),
    clamp01(raw.radiationShieldingFactor),
  ])

  const astrobiology = mean([
    clamp01(raw.extremophilePresence),
    clamp01(raw.biosignaturePreservation),
    clamp01(raw.waterActivity),
    1 - normalizeParameter(raw.uvFluxRelative, 'uvFluxRelative'),
  ])

  return {
    geology: clamp01(geology),
    terrain: clamp01(terrain),
    thermal: clamp01(thermal),
    volatiles: clamp01(volatiles),
    dust: clamp01(dust),
    subsurface: clamp01(subsurface),
    astrobiology: clamp01(astrobiology),
  }
}
