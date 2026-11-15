import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AnalogPairing, DimensionKey } from '../../types'
import {
  PARAMETER_BOUNDS,
  type NumericParameterKey,
} from '../../data/parameter_bounds'
import { normalizeParameter } from '../../engine/normalize'
import { DIMENSION_KEYS, DIMENSION_META } from '../../utils/constants'
import { formatNumber } from '../../utils/formatters'

interface DeltaTableProps {
  pairing: AnalogPairing
}

/** Display definition for one numeric parameter inside a dimension group. */
interface ParameterDefinition {
  key: NumericParameterKey
  label: string
  /** Decimal places used for the raw value. */
  decimals: number
}

/**
 * Parameters grouped by the dimension they feed. The grouping mirrors
 * `computeFeatureVector` exactly, so a reader can trace every aggregate back to
 * its instrument-derived inputs.
 */
const DIMENSION_PARAMETERS: Record<
  DimensionKey,
  readonly ParameterDefinition[]
> = {
  geology: [
    { key: 'mineralDiversityIndex', label: 'Mineral diversity index', decimals: 2 },
    { key: 'alterationState', label: 'Aqueous alteration state', decimals: 2 },
  ],
  terrain: [
    { key: 'meanSlopeDeg', label: 'Mean surface slope', decimals: 1 },
    { key: 'surfaceRoughnessRMS', label: 'RMS surface roughness', decimals: 1 },
    { key: 'rockAbundancePct', label: 'Rock abundance', decimals: 1 },
    { key: 'elevationM', label: 'Elevation (body datum)', decimals: 0 },
  ],
  thermal: [
    { key: 'thermalInertia', label: 'Thermal inertia', decimals: 0 },
    { key: 'diurnalDeltaTK', label: 'Diurnal temperature swing', decimals: 0 },
    { key: 'peakSurfaceTempK', label: 'Peak surface temperature', decimals: 0 },
    { key: 'minSurfaceTempK', label: 'Minimum surface temperature', decimals: 0 },
    { key: 'annualIlluminationPct', label: 'Annual illumination', decimals: 0 },
  ],
  volatiles: [
    { key: 'waterIcePresence', label: 'Water-ice presence', decimals: 2 },
    { key: 'depthToIceM', label: 'Depth to ice', decimals: 1 },
    { key: 'permafrostExtent', label: 'Permafrost extent', decimals: 2 },
    { key: 'isruPotentialIndex', label: 'ISRU potential index', decimals: 2 },
  ],
  dust: [
    { key: 'dustCoverIndex', label: 'Dust cover index', decimals: 2 },
    { key: 'aerosolOpticalDepth', label: 'Aerosol optical depth (550 nm)', decimals: 2 },
    { key: 'aeolianActivityIndex', label: 'Aeolian activity index', decimals: 2 },
  ],
  subsurface: [
    { key: 'caveLavaTubePresence', label: 'Cave / lava-tube presence', decimals: 2 },
    { key: 'estimatedTubeDiameterM', label: 'Estimated void diameter', decimals: 0 },
    { key: 'roofThicknessM', label: 'Roof thickness', decimals: 0 },
    { key: 'radiationShieldingFactor', label: 'Radiation shielding factor', decimals: 2 },
  ],
  astrobiology: [
    { key: 'extremophilePresence', label: 'Extremophile presence', decimals: 2 },
    { key: 'biosignaturePreservation', label: 'Biosignature preservation', decimals: 2 },
    { key: 'waterActivity', label: 'Water activity (a_w)', decimals: 2 },
    { key: 'uvFluxRelative', label: 'Relative UV flux', decimals: 2 },
  ],
}

/** One fully computed comparison row. */
interface ComparisonRow {
  key: NumericParameterKey
  label: string
  unit: string
  earthRaw: string
  targetRaw: string
  earthNormalized: number
  targetNormalized: number
  delta: number
}

/** One dimension group plus its worst normalized gap. */
interface DimensionGroup {
  key: DimensionKey
  label: string
  color: string
  rows: ComparisonRow[]
  maxDelta: number
}

/** Raw value, rendering the open-ended ice depth sentinel explicitly. */
function formatRawValue(
  key: NumericParameterKey,
  value: number,
  decimals: number,
): string {
  if (key === 'depthToIceM' && !Number.isFinite(value)) {
    return 'no accessible ice'
  }
  return formatNumber(value, decimals)
}

/**
 * Desirability-oriented normalization: shallower ice and lower UV flux score
 * higher, matching the inversions applied inside `computeFeatureVector`.
 */
function normalizedValue(key: NumericParameterKey, value: number): number {
  if (key === 'depthToIceM') {
    const depth = Number.isFinite(value)
      ? value
      : PARAMETER_BOUNDS.depthToIceM.max
    return 1 - normalizeParameter(depth, key)
  }
  if (key === 'uvFluxRelative') {
    return 1 - normalizeParameter(value, key)
  }
  return normalizeParameter(value, key)
}

/** Absolute normalized delta to display color (green → red). */
function deltaColor(delta: number): string {
  if (delta < 0.15) return '#34d399'
  if (delta < 0.3) return '#22d3ee'
  if (delta < 0.5) return '#f5c451'
  if (delta < 0.7) return '#fb923c'
  return '#f87171'
}

/**
 * Parameter-by-parameter comparison with raw and normalized values.
 *
 * Rows are grouped by dimension (collapsible) and can be sorted by normalized
 * delta magnitude, which surfaces the measurements that most strongly break
 * the analogy.
 */
export function DeltaTable({ pairing }: DeltaTableProps) {
  const { earthSite, targetSite } = pairing
  const [sortByDelta, setSortByDelta] = useState(false)
  const [collapsed, setCollapsed] = useState<ReadonlySet<DimensionKey>>(
    () => new Set(),
  )

  const groups = useMemo<DimensionGroup[]>(() => {
    return DIMENSION_KEYS.map((dimensionKey) => {
      const meta =
        DIMENSION_META.find((entry) => entry.key === dimensionKey) ??
        DIMENSION_META[0]
      const rows = DIMENSION_PARAMETERS[dimensionKey].map((definition) => {
        const earthValue = earthSite.rawParameters[definition.key]
        const targetValue = targetSite.rawParameters[definition.key]
        const earthNormalized = normalizedValue(definition.key, earthValue)
        const targetNormalized = normalizedValue(definition.key, targetValue)
        return {
          key: definition.key,
          label: definition.label,
          unit: PARAMETER_BOUNDS[definition.key].unit,
          earthRaw: formatRawValue(
            definition.key,
            earthValue,
            definition.decimals,
          ),
          targetRaw: formatRawValue(
            definition.key,
            targetValue,
            definition.decimals,
          ),
          earthNormalized,
          targetNormalized,
          delta: Math.abs(earthNormalized - targetNormalized),
        }
      })

      const orderedRows = sortByDelta
        ? [...rows].sort((a, b) => b.delta - a.delta)
        : rows

      return {
        key: dimensionKey,
        label: meta.label,
        color: meta.color,
        rows: orderedRows,
        maxDelta: rows.reduce((worst, row) => Math.max(worst, row.delta), 0),
      }
    })
  }, [earthSite, targetSite, sortByDelta])

  function toggleDimension(key: DimensionKey) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <section
      aria-labelledby="delta-table-heading"
      className="flex min-w-0 flex-col rounded-xl border border-hairline bg-panel/70 p-3.5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="delta-table-heading" className="text-sm font-semibold">
            Parameter delta table
          </h3>
          <p className="mt-0.5 max-w-lg text-[0.6875rem] leading-relaxed text-ink-muted">
            Raw instrument values and their desirability-normalized equivalents
            for every parameter that feeds the seven dimensions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSortByDelta((value) => !value)}
          aria-pressed={sortByDelta}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-[0.625rem] font-semibold transition-colors ${
            sortByDelta
              ? 'border-plasma/50 bg-plasma/10 text-plasma'
              : 'border-hairline-strong bg-elevated text-ink-muted hover:text-ink'
          }`}
        >
          <ArrowUpDown className="size-3" strokeWidth={2} aria-hidden="true" />
          Sort by Δ
        </button>
      </div>

      <div className="mt-2.5 -mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <caption className="sr-only">
            Parameter comparison between {earthSite.name} and{' '}
            {targetSite.name}
          </caption>
          <thead>
            <tr className="border-b border-hairline-strong text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim">
              <th scope="col" className="py-1.5 pr-2 font-semibold">
                Parameter · unit
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                Earth · {earthSite.shortName}
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-semibold">
                Target · {targetSite.shortName}
              </th>
              <th scope="col" className="py-1.5 pl-2 text-right font-semibold">
                Δ normalized
              </th>
            </tr>
          </thead>

          {groups.map((group) => {
            const isCollapsed = collapsed.has(group.key)
            const color = deltaColor(group.maxDelta)
            return (
              <tbody key={group.key} className="border-b border-hairline">
                <tr>
                  <th colSpan={4} scope="colgroup" className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleDimension(group.key)}
                      aria-expanded={!isCollapsed}
                      className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-elevated/60"
                    >
                      <ChevronDown
                        className={`size-3.5 shrink-0 text-ink-dim transition-transform ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: group.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[0.6875rem] font-semibold text-ink">
                        {group.label}
                      </span>
                      <span className="font-mono text-[0.5625rem] text-ink-dim">
                        {group.rows.length} parameters
                      </span>
                      <span
                        className="ml-auto rounded border px-1.5 py-px font-mono text-[0.5625rem] font-semibold"
                        style={{
                          color,
                          borderColor: `${color}55`,
                          backgroundColor: `${color}14`,
                        }}
                      >
                        max Δ {formatNumber(group.maxDelta, 2)}
                      </span>
                    </button>
                  </th>
                </tr>

                {isCollapsed
                  ? null
                  : group.rows.map((row) => {
                      const rowColor = deltaColor(row.delta)
                      return (
                        <tr
                          key={row.key}
                          className="border-t border-hairline/60 align-top"
                        >
                          <th
                            scope="row"
                            className="py-1.5 pr-2 text-left font-normal"
                          >
                            <span className="block text-[0.6875rem] text-ink">
                              {row.label}
                            </span>
                            <span className="block max-w-[12rem] truncate text-[0.5625rem] text-ink-dim">
                              {row.unit}
                            </span>
                          </th>
                          <td className="px-2 py-1.5 text-right">
                            <span className="block whitespace-nowrap font-mono text-[0.6875rem] text-ink">
                              {row.earthRaw}
                            </span>
                            <span className="block whitespace-nowrap font-mono text-[0.5625rem] text-ink-dim">
                              norm {formatNumber(row.earthNormalized, 2)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <span className="block whitespace-nowrap font-mono text-[0.6875rem] text-ink">
                              {row.targetRaw}
                            </span>
                            <span className="block whitespace-nowrap font-mono text-[0.5625rem] text-ink-dim">
                              norm {formatNumber(row.targetNormalized, 2)}
                            </span>
                          </td>
                          <td className="py-1.5 pl-2">
                            <div className="flex items-center justify-end gap-1.5">
                              <span
                                className="h-1 w-8 overflow-hidden rounded-full bg-hairline"
                                aria-hidden="true"
                              >
                                <span
                                  className="block h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, row.delta * 100)}%`,
                                    backgroundColor: rowColor,
                                  }}
                                />
                              </span>
                              <span
                                className="w-8 text-right font-mono text-[0.625rem] font-semibold"
                                style={{ color: rowColor }}
                              >
                                {formatNumber(row.delta, 2)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            )
          })}
        </table>
      </div>
    </section>
  )
}
