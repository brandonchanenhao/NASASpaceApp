import { Globe, Mars, Moon, type LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { MapSyncController } from '../../hooks/useMapSync'
import {
  earthSites,
  marsSites,
  moonSites,
} from '../../data/analogs_dataset'
import { buildPairing } from '../../engine/ranker'
import type {
  AnalogSite,
  CelestialBody,
  DimensionWeights,
} from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { formatCoordinate, formatSimilarityScore } from '../../utils/formatters'

interface SidebarProps {
  open: boolean
  sync: MapSyncController
  weights: DimensionWeights
  onSelectSite: (siteId: string) => void
}

interface BodyGroup {
  body: CelestialBody
  label: string
  sites: readonly AnalogSite[]
  Icon: LucideIcon
}

const BODY_GROUPS: readonly BodyGroup[] = [
  { body: 'earth', label: 'Earth analogs', sites: earthSites, Icon: Globe },
  { body: 'moon', label: 'Lunar targets', sites: moonSites, Icon: Moon },
  { body: 'mars', label: 'Martian targets', sites: marsSites, Icon: Mars },
]

/**
 * Persistent benchmark catalog grouped by body. Similarity badges are always
 * scored against the counterpart currently selected on the dual map, so the
 * list doubles as a live ranking for the chosen pair.
 */
export function Sidebar({
  open,
  sync,
  weights,
  onSelectSite,
}: SidebarProps) {
  const scores = useMemo(() => {
    const result = new Map<string, number>()
    for (const group of BODY_GROUPS) {
      for (const site of group.sites) {
        const pairing =
          site.body === 'earth'
            ? buildPairing(site, sync.selectedTarget, weights)
            : buildPairing(sync.selectedEarth, site, weights)
        result.set(site.id, pairing.similarityScore)
      }
    }
    return result
  }, [sync.selectedEarth, sync.selectedTarget, weights])

  return (
    <aside
      id="site-sidebar"
      aria-label="Benchmark site catalog"
      aria-hidden={!open}
      inert={!open}
      className={`shrink-0 overflow-hidden border-r border-hairline bg-panel/30 transition-[width] duration-200 ${
        open ? 'w-72' : 'w-0 border-r-0'
      } lg:sticky lg:top-0 lg:h-screen`}
    >
      <div className="h-full w-72 overflow-y-auto">
        <div className="border-b border-hairline px-3.5 py-3">
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
            Benchmark catalog
          </p>
          <h2 className="mt-1 text-sm font-semibold">
            {earthSites.length + moonSites.length + marsSites.length}{' '}
            characterized analog sites
          </h2>
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
            Badges show similarity to the counterpart selected on the maps.
            Click any site to re-pair the survey.
          </p>
        </div>

        <nav aria-label="Benchmark sites by body">
          {BODY_GROUPS.map((group) => (
            <section key={group.body} className="border-b border-hairline">
              <h3 className="flex items-center gap-1.5 px-3.5 pb-1 pt-3 text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-ink-dim">
                <group.Icon
                  className="size-3"
                  strokeWidth={2}
                  style={{ color: bodyColors[group.body] }}
                  aria-hidden="true"
                />
                {group.label}
                <span className="ml-auto font-mono text-[0.5625rem] text-ink-dim">
                  {group.sites.length}
                </span>
              </h3>

              <ul className="space-y-0.5 px-1.5 pb-2">
                {group.sites.map((site) => {
                  const score = scores.get(site.id) ?? 0
                  const scoreColor = similarityColorScale(score)
                  const isActive =
                    site.body === 'earth'
                      ? site.id === sync.selectedEarthId
                      : site.id === sync.selectedTargetId

                  return (
                    <li key={site.id}>
                      <button
                        type="button"
                        onClick={() => onSelectSite(site.id)}
                        aria-current={isActive ? 'true' : undefined}
                        title={`${site.name} — ${site.region}`}
                        className={`w-full rounded-lg border px-2 py-1.5 text-left transition-colors ${
                          isActive
                            ? 'border-plasma/50 bg-plasma/10'
                            : 'border-transparent hover:border-hairline-strong hover:bg-elevated/60'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`min-w-0 truncate text-xs font-semibold ${
                              isActive ? 'text-plasma' : 'text-ink'
                            }`}
                          >
                            {site.name}
                          </span>
                          <span
                            className="shrink-0 rounded border px-1.5 py-px font-mono text-[0.5625rem] font-semibold"
                            style={{
                              color: scoreColor,
                              borderColor: `${scoreColor}55`,
                              backgroundColor: `${scoreColor}14`,
                            }}
                          >
                            {formatSimilarityScore(score)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[0.5625rem] text-ink-dim">
                          {formatCoordinate(site.coordinate)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  )
}
