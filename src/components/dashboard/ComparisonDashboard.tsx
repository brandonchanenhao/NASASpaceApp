import { ArrowLeft, Sparkles } from 'lucide-react'
import { useSimilarity } from '../../hooks/useSimilarity'
import type { DimensionWeights } from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { BODY_LABELS, DIMENSION_META } from '../../utils/constants'
import { formatNumber, formatSimilarityScore } from '../../utils/formatters'
import { BreakdownPanel } from './BreakdownPanel'
import { DeltaTable } from './DeltaTable'
import { RadarChart } from './RadarChart'
import { SiteInfoCard } from './SiteInfoCard'
import { TestbedCard } from './TestbedCard'
import { dominantGap } from '../../engine/similarity'

interface ComparisonDashboardProps {
  earthSiteId: string
  targetSiteId: string
  /** Current mission weights, shared with the configurator workspace. */
  weights: DimensionWeights
  onOpenMap: () => void
}

/**
 * Full comparison workspace for one Earth → Moon/Mars pairing.
 *
 * Score metrics, the normalized radar signature, the raw-parameter delta table,
 * the physics breakdown panel and the testbed cards all derive from the same
 * `AnalogPairing`, so every visualisation describes one consistent assessment.
 */
export function ComparisonDashboard({
  earthSiteId,
  targetSiteId,
  weights,
  onOpenMap,
}: ComparisonDashboardProps) {
  const pairing = useSimilarity(earthSiteId, targetSiteId, weights)
  const { earthSite, targetSite } = pairing

  if (earthSite.body !== 'earth' || targetSite.body === 'earth') {
    return (
      <section
        aria-labelledby="comparison-empty-heading"
        className="rounded-xl border border-hairline bg-panel/70 px-5 py-10 text-center"
      >
        <h2
          id="comparison-empty-heading"
          className="text-base font-semibold text-ink"
        >
          Select an Earth analog and Moon or Mars target to compare
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-ink-muted">
          The dashboard requires a cross-body pairing. Choose an Earth site on
          the left map, then a Moon or Mars target on the right.
        </p>
        <button
          type="button"
          onClick={onOpenMap}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-plasma/40 bg-plasma/10 px-3 py-1.5 text-xs font-semibold text-plasma transition-colors hover:bg-plasma/20"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden="true" />
          Return to dual map
        </button>
      </section>
    )
  }

  const scoreColor = similarityColorScale(pairing.similarityScore)
  const gap = dominantGap(pairing.dimensionDeltas)
  const gapMeta =
    DIMENSION_META.find((meta) => meta.key === gap.key) ?? DIMENSION_META[0]
  const targetBodyColor = bodyColors[targetSite.body]

  const physicsLimits = Array.from(
    new Set(
      pairing.breakdowns
        .filter(
          (item) => item.severity === 'fundamental' || item.severity === 'high',
        )
        .map((item) => item.domain),
    ),
  ).slice(0, 3)

  /** Plain-language verdict: closest two dimensions vs the largest gap. */
  const closest = [...DIMENSION_META]
    .sort(
      (a, b) => pairing.dimensionDeltas[a.key] - pairing.dimensionDeltas[b.key],
    )
    .slice(0, 2)
  const verdict =
    pairing.similarityScore >= 0.8
      ? 'Excellent analog'
      : pairing.similarityScore >= 0.6
        ? 'Good analog'
        : pairing.similarityScore >= 0.4
          ? 'Partial analog'
          : 'Weak analog'

  return (
    <section aria-labelledby="comparison-heading" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
            Comparison dashboard
          </p>
          <h2
            id="comparison-heading"
            className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold sm:text-xl"
          >
            <span style={{ color: bodyColors.earth }}>{earthSite.shortName}</span>
            <span className="text-ink-dim">↔</span>
            <span style={{ color: targetBodyColor }}>
              {targetSite.shortName}
            </span>
            <span className="rounded-full border border-hairline bg-elevated px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {BODY_LABELS[targetSite.body]} target
            </span>
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink-muted sm:text-sm">
            Quantitative comparison of {earthSite.name} and {targetSite.name}:
            normalized signatures, instrument-level deltas, fundamental physics
            breaks and the hardware tests this analog can host.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold"
            style={{
              color: scoreColor,
              borderColor: `${scoreColor}66`,
              backgroundColor: 'rgb(5 7 15 / 0.55)',
            }}
          >
            <Sparkles className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {formatSimilarityScore(pairing.similarityScore)}
          </span>
          <button
            type="button"
            onClick={onOpenMap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline-strong bg-panel px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Dual map
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-hairline bg-panel/70 p-4">
        <p className="text-lg font-semibold" style={{ color: scoreColor }}>
          {verdict} · {formatSimilarityScore(pairing.similarityScore)}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-ink-muted">
          <li>
            <span className="font-semibold text-emerald-400">✓ Strong match:</span>{' '}
            {closest.map((meta) => meta.label).join(' and ')}
          </li>
          <li>
            <span className="font-semibold text-red-400">✗ Biggest gap:</span>{' '}
            {gapMeta.label} (Δ {formatNumber(gap.delta, 2)})
          </li>
          <li>
            <span className="font-semibold text-plasma">→ Best use:</span>{' '}
            {pairing.testbedApplications[0]?.operation ?? 'General field training'}
          </li>
        </ul>
      </div>

      <RadarChart pairing={pairing} />

      <BreakdownPanel pairing={pairing} />

      <section aria-labelledby="testbed-heading" className="space-y-2">
        <div>
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
            Analog testbed readiness
          </p>
          <h3 id="testbed-heading" className="mt-1 text-sm font-semibold">
            Hardware and operations this pairing can qualify
          </h3>
          <p className="mt-0.5 max-w-3xl text-[0.6875rem] leading-relaxed text-ink-muted">
            {pairing.testbedApplications.length} campaigns hosted by{' '}
            {earthSite.name} for {targetSite.name}, with NASA TRL readiness and
            the physics limits that still require chamber or orbital testing.
          </p>
        </div>

        {pairing.testbedApplications.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pairing.testbedApplications.slice(0, 3).map((application) => (
              <TestbedCard
                key={application.operation}
                application={application}
                siteName={earthSite.shortName}
                targetName={targetSite.shortName}
                physicsLimits={physicsLimits}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-hairline bg-panel/70 px-3 py-4 text-center text-sm text-ink-muted">
            No curated testbed catalog entry exists for this Earth analog yet.
          </p>
        )}
      </section>

      <details className="group rounded-xl border border-hairline bg-panel/40 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink-muted hover:text-plasma">
          Show the science: site profiles &amp; all 25 raw parameters
        </summary>
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <SiteInfoCard site={earthSite} />
            <SiteInfoCard site={targetSite} />
          </div>
          <p className="text-[0.6875rem] text-ink-dim">
            Combined score = 0.6 × cosine ({formatSimilarityScore(pairing.cosineSimilarity)}) + 0.4 × Euclidean ({formatSimilarityScore(pairing.euclideanSimilarity)}).
          </p>
          <DeltaTable pairing={pairing} />
        </div>
      </details>
    </section>
  )
}
