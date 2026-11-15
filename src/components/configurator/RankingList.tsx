import {
  ArrowRight,
  ChevronDown,
  Crown,
  Mars,
  Moon,
  type LucideIcon,
} from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { AnalogPairing, TargetBody } from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'
import { formatSimilarityScore } from '../../utils/formatters'

interface RankingListProps {
  /** All pairings, best-first, across both target bodies. */
  pairings: readonly AnalogPairing[]
  /** Pairing currently open in the dashboard. */
  selectedPairingId: string
  /** Opens one pairing in the dashboard. */
  onSelectPairing: (earthSiteId: string, targetSiteId: string) => void
}

interface BodyGroup {
  body: TargetBody
  Icon: LucideIcon
}

const BODY_GROUPS: readonly BodyGroup[] = [
  { body: 'moon', Icon: Moon },
  { body: 'mars', Icon: Mars },
]

const ROW_TRANSITION = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Ranked list of every Earth → Moon/Mars pairing under the current weights.
 *
 * Ordering comes straight from `computeFullRankingMatrix`, so the displayed
 * rank is the global rank across all 60 pairings. Reordering is animated with a
 * FLIP pass: each row is measured before paint, then a compensating transform
 * is applied and released so React's keyed reorder reads as physical movement.
 * The pass is skipped under `prefers-reduced-motion`.
 */
export function RankingList({
  pairings,
  selectedPairingId,
  onSelectPairing,
}: RankingListProps) {
  const [collapsed, setCollapsed] = useState<Record<TargetBody, boolean>>({
    moon: false,
    mars: false,
  })
  const [showAll, setShowAll] = useState<Record<TargetBody, boolean>>({
    moon: false,
    mars: false,
  })
  const listIdPrefix = useId()
  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  const previousTops = useRef(new Map<string, number>())
  const topPairing = pairings[0] ?? null

  useLayoutEffect(() => {
    const nextTops = new Map<string, number>()
    for (const [id, element] of rowRefs.current) {
      nextTops.set(id, element.getBoundingClientRect().top)
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (!reduceMotion) {
      for (const [id, top] of nextTops) {
        const previousTop = previousTops.current.get(id)
        const element = rowRefs.current.get(id)
        if (!element || previousTop === undefined) continue
        const delta = previousTop - top
        if (Math.abs(delta) < 1) continue
        element.style.transition = 'none'
        element.style.transform = `translateY(${delta}px)`
        // Force a style flush so the release animates from the offset.
        void element.offsetHeight
        element.style.transition = ROW_TRANSITION
        element.style.transform = ''
      }
    }

    previousTops.current = nextTops
  }, [pairings, collapsed])

  function toggleGroup(body: TargetBody) {
    setCollapsed((previous) => ({ ...previous, [body]: !previous[body] }))
  }

  return (
    <section
      aria-labelledby="ranking-heading"
      className="rounded-xl border border-hairline bg-panel/70 p-3 print:hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
            Live analog ranking
          </p>
          <h3 id="ranking-heading" className="mt-1 text-sm font-semibold">
            {pairings.length} Earth ↔ target pairings
          </h3>
          <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
            Ordered by the weighted combined score. Select any row to open that
            pairing in the comparison dashboard.
          </p>
        </div>
        {topPairing ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[0.625rem] font-semibold"
            style={{
              color: '#f5c451',
              borderColor: '#f5c45166',
              backgroundColor: 'rgb(245 196 81 / 0.1)',
            }}
          >
            <Crown className="size-3" strokeWidth={2} aria-hidden="true" />
            Top {formatSimilarityScore(topPairing.similarityScore)}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 space-y-2">
        {BODY_GROUPS.map(({ body, Icon }) => {
          const groupPairings = pairings.filter(
            (pairing) => pairing.targetSite.body === body,
          )
          const isOpen = !collapsed[body]
          const listId = `${listIdPrefix}-${body}`
          const groupBest = groupPairings[0]

          return (
            <div key={body}>
              <button
                type="button"
                onClick={() => toggleGroup(body)}
                aria-expanded={isOpen}
                aria-controls={listId}
                className="flex w-full items-center gap-2 rounded-lg border border-hairline bg-elevated/60 px-2.5 py-1.5 text-left transition-colors hover:border-plasma/30"
              >
                <span
                  className="grid size-5 place-items-center rounded border border-hairline bg-panel"
                  style={{ color: bodyColors[body] }}
                >
                  <Icon className="size-3" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="flex-1 text-[0.6875rem] font-semibold text-ink">
                  {BODY_LABELS[body]} targets
                </span>
                <span className="text-[0.5625rem] text-ink-dim">
                  {groupPairings.length} pairings
                </span>
                {groupBest ? (
                  <span
                    className="font-mono text-[0.625rem] font-semibold"
                    style={{ color: similarityColorScale(groupBest.similarityScore) }}
                  >
                    best {formatSimilarityScore(groupBest.similarityScore)}
                  </span>
                ) : null}
                <ChevronDown
                  className={`size-3.5 text-ink-dim transition-transform ${
                    isOpen ? '' : '-rotate-90'
                  }`}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>

              {isOpen ? (
                <ol id={listId} className="mt-1.5 space-y-1">
                  {(showAll[body] ? groupPairings : groupPairings.slice(0, 5)).map((pairing) => {
                    const rank = pairings.indexOf(pairing) + 1
                    const isTop = pairing.id === topPairing?.id
                    const isSelected = pairing.id === selectedPairingId
                    const scoreColor = similarityColorScale(
                      pairing.similarityScore,
                    )

                    return (
                      <li
                        key={pairing.id}
                        ref={(element) => {
                          if (element) rowRefs.current.set(pairing.id, element)
                          else rowRefs.current.delete(pairing.id)
                        }}
                        style={{ willChange: 'transform' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onSelectPairing(
                              pairing.earthSite.id,
                              pairing.targetSite.id,
                            )
                          }
                          aria-current={isSelected ? 'true' : undefined}
                          title={`Open ${pairing.earthSite.name} ↔ ${pairing.targetSite.name} in the dashboard`}
                          className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                            isTop
                              ? 'border-solar/50 bg-solar/10 hover:bg-solar/15'
                              : 'border-hairline bg-panel/60 hover:border-plasma/40 hover:bg-elevated/60'
                          } ${isSelected ? 'ring-1 ring-plasma/60' : ''}`}
                        >
                          <span
                            className={`w-5 shrink-0 text-right font-mono text-[0.625rem] font-semibold ${
                              isTop ? 'text-solar' : 'text-ink-dim'
                            }`}
                          >
                            {rank}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1 text-[0.6875rem] font-semibold leading-tight">
                              <span className="truncate text-ink">
                                {pairing.earthSite.shortName}
                              </span>
                              <ArrowRight
                                className="size-2.5 shrink-0 text-ink-dim"
                                strokeWidth={2.25}
                                aria-hidden="true"
                              />
                              <span
                                className="truncate"
                                style={{ color: bodyColors[body] }}
                              >
                                {pairing.targetSite.shortName}
                              </span>
                              {isTop ? (
                                <span className="ml-auto shrink-0 rounded-full bg-solar px-1.5 py-px text-[0.5rem] font-bold uppercase tracking-[0.08em] text-void">
                                  Top match
                                </span>
                              ) : null}
                            </span>
                            <span
                              className="mt-1 block h-1 overflow-hidden rounded-full bg-hairline"
                              aria-hidden="true"
                            >
                              <span
                                className="block h-full rounded-full transition-[width] duration-300"
                                style={{
                                  width: `${Math.max(3, pairing.similarityScore * 100)}%`,
                                  backgroundColor: scoreColor,
                                }}
                              />
                            </span>
                          </span>

                          <span
                            className="w-10 shrink-0 text-right font-mono text-[0.625rem] font-semibold"
                            style={{ color: scoreColor }}
                          >
                            {formatSimilarityScore(pairing.similarityScore)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              ) : null}
              {isOpen && groupPairings.length > 5 ? (
                <button
                  type="button"
                  onClick={() =>
                    setShowAll((previous) => ({ ...previous, [body]: !previous[body] }))
                  }
                  className="mt-1 text-[0.6875rem] font-semibold text-plasma hover:underline"
                >
                  {showAll[body]
                    ? 'Show top 5 only'
                    : `Show all ${groupPairings.length} pairings`}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
