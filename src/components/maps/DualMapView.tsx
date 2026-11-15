import { ArrowRight, Globe, Mars, Moon } from 'lucide-react'
import type { MapSyncController } from '../../hooks/useMapSync'
import type { TargetBody } from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'
import { formatCoordinate, formatSimilarityScore } from '../../utils/formatters'
import { EarthMap } from './EarthMap'
import { MarsMap } from './MarsMap'
import { MoonMap } from './MoonMap'

interface DualMapViewProps {
  sync: MapSyncController
  /** Selects a site and opens its comparison record. */
  onCompareSite: (siteId: string) => void
  /** Opens the dashboard for the current pair without changing selection. */
  onOpenComparison: () => void
}

const TARGET_BODIES: readonly TargetBody[] = ['moon', 'mars']

/**
 * Side-by-side Earth and Moon/Mars map survey.
 *
 * The two panes share one pairing controller, so a marker click on either map
 * updates both highlighted sites, the layer attribution, and the selected-pair
 * summary beneath the maps.
 */
export function DualMapView({
  sync,
  onCompareSite,
  onOpenComparison,
}: DualMapViewProps) {
  const { pairing, selectedEarth, selectedTarget, activeBody, rankings } = sync
  const targetSiteCount = rankings.length
  const scoreColor = similarityColorScale(pairing.similarityScore)

  return (
    <section aria-labelledby="dual-map-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
            Dual-map survey
          </p>
          <h2
            id="dual-map-heading"
            className="mt-1 text-lg font-semibold sm:text-xl"
          >
            Earth analog paired with its {BODY_LABELS[activeBody]} target
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted sm:text-sm">
            NASA GIBS true-color and geophysical imagery on the left, NASA{' '}
            {BODY_LABELS[activeBody]} Trek products on the right. Selecting a
            pin re-scores the pairing and highlights the best counterpart on the
            opposite map.
          </p>
        </div>

        <div
          className="inline-flex shrink-0 rounded-xl border border-hairline bg-panel p-1"
          role="group"
          aria-label="Planetary target body"
        >
          {TARGET_BODIES.map((body) => {
            const isActive = body === activeBody
            const Icon = body === 'moon' ? Moon : Mars
            return (
              <button
                key={body}
                type="button"
                onClick={() => sync.setActiveBody(body)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-plasma/15 text-plasma'
                    : 'text-ink-muted hover:bg-elevated/70 hover:text-ink'
                }`}
              >
                <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                {BODY_LABELS[body]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <article className="overflow-hidden rounded-xl border border-hairline bg-panel">
          <div className="flex items-center justify-between gap-2 border-b border-hairline bg-panel px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="grid size-6 shrink-0 place-items-center rounded-md border border-hairline bg-elevated"
                style={{ color: bodyColors.earth }}
              >
                <Globe className="size-3.5" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
                  Earth analog
                </p>
                <p className="truncate text-xs font-semibold text-ink">
                  {selectedEarth.name}
                </p>
              </div>
            </div>
            <span className="hidden shrink-0 font-mono text-[0.625rem] text-ink-dim sm:block">
              {formatCoordinate(selectedEarth.coordinate)}
            </span>
          </div>
          <div className="relative h-[24rem] xl:h-[29rem]">
            <EarthMap
              selectedSiteId={sync.selectedEarthId}
              activeLayerId={sync.activeEarthLayer}
              onSiteSelect={sync.selectEarthSite}
              onLayerChange={sync.setActiveEarthLayer}
              onCompare={onCompareSite}
            />
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-hairline bg-panel">
          <div className="flex items-center justify-between gap-2 border-b border-hairline bg-panel px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="grid size-6 shrink-0 place-items-center rounded-md border border-hairline bg-elevated"
                style={{ color: bodyColors[activeBody] }}
              >
                {activeBody === 'moon' ? (
                  <Moon
                    className="size-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                ) : (
                  <Mars
                    className="size-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
                  {BODY_LABELS[activeBody]} target · {targetSiteCount} sites
                </p>
                <p className="truncate text-xs font-semibold text-ink">
                  {selectedTarget.name}
                </p>
              </div>
            </div>
            <span className="hidden shrink-0 font-mono text-[0.625rem] text-ink-dim sm:block">
              {formatCoordinate(selectedTarget.coordinate)}
            </span>
          </div>
          <div className="relative h-[24rem] xl:h-[29rem]">
            {activeBody === 'moon' ? (
              <MoonMap
                selectedSiteId={sync.selectedTargetId}
                activeLayerId={sync.activeTargetLayer}
                onSiteSelect={sync.selectTargetSite}
                onLayerChange={sync.setActiveTargetLayer}
                onCompare={onCompareSite}
              />
            ) : (
              <MarsMap
                selectedSiteId={sync.selectedTargetId}
                activeLayerId={sync.activeTargetLayer}
                onSiteSelect={sync.selectTargetSite}
                onLayerChange={sync.setActiveTargetLayer}
                onCompare={onCompareSite}
              />
            )}
          </div>
        </article>
      </div>

      <div className="rounded-xl border border-hairline bg-panel/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-dim">
            Selected pair
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: bodyColors.earth }}
                aria-hidden="true"
              />
              {selectedEarth.shortName}
            </span>
            <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-dim">
              Earth
            </span>
            <ArrowRight
              className="size-4 text-plasma"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: bodyColors[selectedTarget.body] }}
                aria-hidden="true"
              />
              {selectedTarget.shortName}
            </span>
            <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-dim">
              {BODY_LABELS[selectedTarget.body]}
            </span>
          </div>
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{
              color: scoreColor,
              borderColor: `${scoreColor}66`,
              backgroundColor: 'rgb(5 7 15 / 0.55)',
            }}
          >
            {formatSimilarityScore(pairing.similarityScore)} similarity
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-hairline pt-2 text-[0.6875rem] text-ink-dim">
          <span>
            Cosine{' '}
            <span className="font-mono text-ink-muted">
              {formatSimilarityScore(pairing.cosineSimilarity)}
            </span>
          </span>
          <span>
            Euclidean{' '}
            <span className="font-mono text-ink-muted">
              {formatSimilarityScore(pairing.euclideanSimilarity)}
            </span>
          </span>
          <span>
            <span className="font-mono text-ink-muted">
              {pairing.breakdowns.length}
            </span>{' '}
            breakdown domains
          </span>
          <span>
            <span className="font-mono text-ink-muted">
              {pairing.testbedApplications.length}
            </span>{' '}
            testbed operations
          </span>
          <button
            type="button"
            onClick={onOpenComparison}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-plasma/40 bg-plasma/10 px-2.5 py-1 text-xs font-semibold text-plasma transition-colors hover:bg-plasma/20"
          >
            Open comparison
            <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
