import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useSimilarity } from '../../hooks/useSimilarity'
import type { DimensionWeights } from '../../types'
import { ComparisonHero } from './ComparisonHero'
import { DeltaTable } from './DeltaTable'
import { PlanetaryAnalogCard } from './PlanetaryAnalogCard'
import { TestbedCard } from './TestbedCard'

interface ComparisonDashboardProps {
  earthSiteId: string
  targetSiteId: string
  weights: DimensionWeights
  onOpenMap: () => void
}

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
        className="rounded-2xl border border-hairline bg-panel/70 px-5 py-12 text-center"
      >
        <h2 id="comparison-empty-heading" className="text-base font-bold text-white">
          Select an Earth Analog and Moon or Mars Target
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">
          Choose an Earth site on the left map and a target site on the right to compare.
        </p>
        <button
          type="button"
          onClick={onOpenMap}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-plasma/40 bg-plasma/10 px-3.5 py-1.5 text-xs font-semibold text-plasma hover:bg-plasma/20 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Dual Map</span>
        </button>
      </section>
    )
  }

  const physicsLimits = Array.from(
    new Set(
      pairing.breakdowns
        .filter(
          (item) => item.severity === 'fundamental' || item.severity === 'high',
        )
        .map((item) => item.domain),
    ),
  ).slice(0, 3)

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Minimal Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={onOpenMap}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Dual Map</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Comparing</span>
          <span className="font-semibold text-sky-400">{earthSite.name}</span>
          <span>with</span>
          <span className="font-semibold text-slate-200">{targetSite.name}</span>
        </div>
      </div>

      {/* Primary Graphic Card: High-Impact Visual Comparison */}
      <PlanetaryAnalogCard pairing={pairing} weights={weights} />

      {/* Secondary Progressive Disclosure: Imagery, Hardware Operations & Raw Telemetry */}
      <details className="group rounded-2xl border border-slate-800 bg-[#0c1322]/80 p-5 shadow-lg transition-all">
        <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors select-none">
          <span>Explore Environmental Imagery &amp; Detailed Engineering Data</span>
          <ChevronDown className="size-4 transition-transform group-open:rotate-180 text-slate-500" />
        </summary>

        <div className="mt-6 pt-5 border-t border-slate-800 space-y-8">
          {/* Visual Environment Photos */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Orbital &amp; Surface Imagery
            </h3>
            <ComparisonHero pairing={pairing} />
          </div>

          {/* Hardware Testing Scenarios */}
          {pairing.testbedApplications.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Field Deployment &amp; Hardware Testing Scenarios
              </h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pairing.testbedApplications.map((application) => (
                  <TestbedCard
                    key={application.operation}
                    application={application}
                    siteName={earthSite.shortName}
                    targetName={targetSite.shortName}
                    physicsLimits={physicsLimits}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Raw Telemetry */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Full 28-Parameter Scientific Telemetry
            </h3>
            <DeltaTable pairing={pairing} />
          </div>
        </div>
      </details>
    </div>
  )
}
