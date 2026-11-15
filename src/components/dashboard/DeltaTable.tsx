import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { AnalogPairing, DimensionKey } from '../../types'
import {
  PARAMETER_BOUNDS,
  type NumericParameterKey,
} from '../../data/parameter_bounds'
import { normalizeParameter } from '../../engine/normalize'
import { DIMENSION_KEYS, DIMENSION_META } from '../../utils/constants'
import { formatNumber } from '../../utils/formatters'
import { bodyColors } from '../../utils/colors'

interface DeltaTableProps {
  pairing: AnalogPairing
}

interface ParameterDefinition {
  key: NumericParameterKey
  label: string
  decimals: number
}

const DIMENSION_PARAMETERS: Record<
  DimensionKey,
  readonly ParameterDefinition[]
> = {
  geology: [
    { key: 'mineralDiversityIndex', label: 'Mineral diversity', decimals: 2 },
    { key: 'alterationState', label: 'Aqueous alteration', decimals: 2 },
  ],
  terrain: [
    { key: 'meanSlopeDeg', label: 'Mean surface slope', decimals: 1 },
    { key: 'surfaceRoughnessRMS', label: 'RMS roughness', decimals: 1 },
    { key: 'rockAbundancePct', label: 'Rock abundance', decimals: 1 },
    { key: 'elevationM', label: 'Elevation datum', decimals: 0 },
  ],
  thermal: [
    { key: 'thermalInertia', label: 'Thermal inertia', decimals: 0 },
    { key: 'diurnalDeltaTK', label: 'Diurnal swing', decimals: 0 },
    { key: 'peakSurfaceTempK', label: 'Peak surface temp', decimals: 0 },
    { key: 'minSurfaceTempK', label: 'Min surface temp', decimals: 0 },
    { key: 'annualIlluminationPct', label: 'Annual illumination', decimals: 0 },
  ],
  volatiles: [
    { key: 'waterIcePresence', label: 'Water ice presence', decimals: 2 },
    { key: 'depthToIceM', label: 'Depth to ice', decimals: 1 },
    { key: 'permafrostExtent', label: 'Permafrost extent', decimals: 2 },
    { key: 'isruPotentialIndex', label: 'ISRU potential', decimals: 2 },
  ],
  dust: [
    { key: 'dustCoverIndex', label: 'Dust cover', decimals: 2 },
    { key: 'aerosolOpticalDepth', label: 'Aerosol optical depth', decimals: 2 },
    { key: 'aeolianActivityIndex', label: 'Aeolian activity', decimals: 2 },
  ],
  subsurface: [
    { key: 'caveLavaTubePresence', label: 'Lava tube presence', decimals: 2 },
    { key: 'estimatedTubeDiameterM', label: 'Void diameter', decimals: 0 },
    { key: 'roofThicknessM', label: 'Roof thickness', decimals: 0 },
    { key: 'radiationShieldingFactor', label: 'Radiation shielding', decimals: 2 },
  ],
  astrobiology: [
    { key: 'extremophilePresence', label: 'Extremophile presence', decimals: 2 },
    { key: 'biosignaturePreservation', label: 'Biosignature preservation', decimals: 2 },
    { key: 'waterActivity', label: 'Water activity', decimals: 2 },
    { key: 'uvFluxRelative', label: 'Relative UV flux', decimals: 2 },
  ],
}

function formatRawValue(
  key: NumericParameterKey,
  value: number,
  decimals: number,
): string {
  if (key === 'depthToIceM' && !Number.isFinite(value)) {
    return 'None'
  }
  return formatNumber(value, decimals)
}

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

function deltaColor(delta: number): string {
  if (delta < 0.2) return '#34d399'
  if (delta < 0.4) return '#f5c451'
  return '#f87171'
}

export function DeltaTable({ pairing }: DeltaTableProps) {
  const { earthSite, targetSite } = pairing
  const targetColor = bodyColors[targetSite.body]
  const [collapsed, setCollapsed] = useState<ReadonlySet<DimensionKey>>(new Set())

  function toggle(key: DimensionKey) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {DIMENSION_KEYS.map((dimKey) => {
        const meta = DIMENSION_META.find((m) => m.key === dimKey)!
        const params = DIMENSION_PARAMETERS[dimKey]
        const isCollapsed = collapsed.has(dimKey)

        return (
          <div
            key={dimKey}
            className="overflow-hidden rounded-xl border border-hairline bg-abyss/60"
          >
            <button
              type="button"
              onClick={() => toggle(dimKey)}
              className="flex w-full items-center justify-between p-2.5 text-xs font-semibold text-white hover:bg-elevated/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ChevronDown
                  className={`size-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
                <span>{meta.label}</span>
                <span className="text-[0.625rem] text-ink-dim font-normal">
                  ({params.length})
                </span>
              </span>
              <span className="font-mono text-[0.625rem] text-ink-dim">
                Δ {formatNumber(pairing.dimensionDeltas[dimKey], 2)}
              </span>
            </button>

            {!isCollapsed && (
              <div className="border-t border-hairline divide-y divide-hairline/40 text-xs">
                {params.map((def) => {
                  const earthVal = earthSite.rawParameters[def.key]
                  const targetVal = targetSite.rawParameters[def.key]
                  const earthNorm = normalizedValue(def.key, earthVal)
                  const targetNorm = normalizedValue(def.key, targetVal)
                  const delta = Math.abs(earthNorm - targetNorm)
                  const unit = PARAMETER_BOUNDS[def.key].unit

                  return (
                    <div
                      key={def.key}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-[0.6875rem]"
                    >
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-white font-medium">{def.label}</span>
                        <span className="text-ink-dim text-[0.5625rem] ml-1">({unit})</span>
                      </div>

                      <div className="flex items-center gap-4 font-mono shrink-0">
                        <span className="text-sky-400">
                          {formatRawValue(def.key, earthVal, def.decimals)}
                        </span>
                        <span className="text-ink-dim text-[0.625rem]">vs</span>
                        <span style={{ color: targetColor }}>
                          {formatRawValue(def.key, targetVal, def.decimals)}
                        </span>
                        <span
                          className="font-bold w-12 text-right"
                          style={{ color: deltaColor(delta) }}
                        >
                          Δ {formatNumber(delta, 2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
