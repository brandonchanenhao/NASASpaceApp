import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { useId, useMemo } from 'react'
import { earthSites, targetSites } from '../../data/analogs_dataset'
import { computeFullRankingMatrix } from '../../engine/ranker'
import type {
  DimensionKey,
  DimensionWeights,
  WeightPreset,
} from '../../types'
import {
  DEFAULT_WEIGHTS,
  DIMENSION_KEYS,
  DIMENSION_META,
  WEIGHT_PRESETS,
} from '../../utils/constants'
import { CoordinatePicker } from './CoordinatePicker'
import { MissionBriefExport } from './MissionBriefExport'
import { RankingList } from './RankingList'
import { WeightSlider } from './WeightSlider'

interface MissionConfiguratorProps {
  /** Mission weights lifted to App so the dashboard scores agree. */
  weights: DimensionWeights
  onWeightsChange: (weights: DimensionWeights) => void
  /** Opens a ranking row in the comparison dashboard. */
  onSelectPairing: (earthSiteId: string, targetSiteId: string) => void
  /** Pairing currently open in the dashboard. */
  selectedPairingId: string
}

const CUSTOM_PRESET_VALUE = 'custom'

/** Exact weight-vector comparison, tolerant of floating-point round-off. */
function weightsEqual(a: DimensionWeights, b: DimensionWeights): boolean {
  return DIMENSION_KEYS.every((key) => Math.abs(a[key] - b[key]) < 1e-9)
}

/** Active preset when the planner has not diverged from it, else null. */
function detectPreset(weights: DimensionWeights): WeightPreset | null {
  return WEIGHT_PRESETS.find((preset) => weightsEqual(preset.weights, weights)) ?? null
}

/**
 * Mission configurator workspace.
 *
 * Weight changes recompute the full 6 × 10 pairing matrix in the engine, so the
 * ranking, top-match brief, and dashboard all consume one consistent score set.
 * The active preset is derived from the current vector rather than stored, which
 * means dragging a single slider correctly flips the selector to "Custom".
 */
export function MissionConfigurator({
  weights,
  onWeightsChange,
  onSelectPairing,
  selectedPairingId,
}: MissionConfiguratorProps) {
  const presetSelectId = useId()
  const presetDescriptionId = useId()

  const rankings = useMemo(
    () => computeFullRankingMatrix(earthSites, targetSites, weights),
    [weights],
  )
  const topPairing = rankings[0] ?? null
  const activePreset = detectPreset(weights)
  const totalWeight = DIMENSION_KEYS.reduce(
    (sum, key) => sum + weights[key],
    0,
  )

  function setWeight(key: DimensionKey, value: number) {
    onWeightsChange({ ...weights, [key]: value })
  }

  function handlePresetChange(value: string) {
    const preset = WEIGHT_PRESETS.find((entry) => entry.id === value)
    if (preset) onWeightsChange({ ...preset.weights })
  }

  return (
    <section aria-labelledby="configurator-heading" className="space-y-3 print:space-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
            Mission configurator
          </p>
          <h2
            id="configurator-heading"
            className="mt-1 text-lg font-semibold sm:text-xl"
          >
            Re-rank Earth analogs for your mission profile
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink-muted sm:text-sm">
            Set the priority of all seven dimensions and the engine re-scores
            every Earth ↔ Moon and Earth ↔ Mars pairing in real time. Preset
            archetypes reproduce the standard ISRU, habitat, astrobiology and
            landing-safety campaigns.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-elevated px-2.5 py-1 text-[0.625rem] font-semibold text-ink-muted">
          <SlidersHorizontal
            className="size-3.5"
            strokeWidth={2}
            aria-hidden="true"
          />
          {activePreset ? activePreset.label : 'Custom'} · Σw{' '}
          {totalWeight.toFixed(1)}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-5 print:block">
        <div className="space-y-3 lg:col-span-2 print:hidden">
          <section
            aria-labelledby="weights-heading"
            className="rounded-xl border border-hairline bg-panel/70 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 id="weights-heading" className="text-sm font-semibold">
                  Mission priority weights
                </h3>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
                  Each dimension runs from 0.0 (ignore) to 2.0 (critical).
                  Scores are normalized, so only the relative ratios change the
                  ranking.
                </p>
              </div>
            </div>

            <div className="mt-2">
              <label
                htmlFor={presetSelectId}
                className="block text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ink-dim"
              >
                Mission archetype preset
              </label>
              <div className="relative mt-1">
                <select
                  id={presetSelectId}
                  value={activePreset?.id ?? CUSTOM_PRESET_VALUE}
                  onChange={(event) => handlePresetChange(event.target.value)}
                  aria-describedby={presetDescriptionId}
                  className="w-full appearance-none rounded-lg border border-hairline-strong bg-abyss px-2 py-1.5 pr-7 text-xs font-semibold text-ink"
                >
                  {activePreset ? null : (
                    <option value={CUSTOM_PRESET_VALUE} disabled>
                      Custom weights
                    </option>
                  )}
                  {WEIGHT_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-dim"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <p
                id={presetDescriptionId}
                className="mt-1 text-[0.625rem] leading-relaxed text-ink-muted"
              >
                {activePreset
                  ? activePreset.description
                  : 'Custom vector: values no longer match a standard archetype. The ranking below reflects exactly these seven weights.'}
              </p>
            </div>

            <div className="mt-2 space-y-1.5">
              {DIMENSION_META.map((meta) => (
                <WeightSlider
                  key={meta.key}
                  meta={meta}
                  value={weights[meta.key]}
                  onChange={(value) => setWeight(meta.key, value)}
                  onReset={() => setWeight(meta.key, 1)}
                />
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[0.625rem] text-ink-dim">
                Σw {totalWeight.toFixed(1)} across 7 dimensions
              </p>
              <button
                type="button"
                onClick={() => onWeightsChange({ ...DEFAULT_WEIGHTS })}
                disabled={weightsEqual(weights, DEFAULT_WEIGHTS)}
                className="inline-flex items-center gap-1 rounded-lg border border-hairline-strong bg-panel px-2 py-1 text-[0.625rem] font-semibold text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
              >
                <RotateCcw
                  className="size-2.5"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                Reset all
              </button>
            </div>
          </section>

          <details className="rounded-xl border border-hairline bg-panel/40 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-ink-muted hover:text-plasma">
              Check any Earth coordinate against NASA data
            </summary>
            <div className="mt-3">
              <CoordinatePicker />
            </div>
          </details>
        </div>

        <div className="space-y-3 lg:col-span-3 print:block">
          <RankingList
            pairings={rankings}
            selectedPairingId={selectedPairingId}
            onSelectPairing={onSelectPairing}
          />
          {topPairing ? (
            <MissionBriefExport
              pairing={topPairing}
              weights={weights}
              rankings={rankings}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
