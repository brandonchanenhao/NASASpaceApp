import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { useId, useState } from 'react'
import type {
  AnalogPairing,
  BreakdownSeverity,
} from '../../types'
import { bodyColors, severityColors } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'
import { formatPercent } from '../../utils/formatters'

interface BreakdownPanelProps {
  pairing: AnalogPairing
}

/** Severity ordering, worst first. */
const SEVERITY_RANK: Record<BreakdownSeverity, number> = {
  fundamental: 3,
  high: 2,
  medium: 1,
  low: 0,
}

const SEVERITY_ICON: Record<BreakdownSeverity, LucideIcon> = {
  fundamental: AlertTriangle,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
}

const SEVERITY_ORDER: readonly BreakdownSeverity[] = [
  'fundamental',
  'high',
  'medium',
  'low',
]

/**
 * "Where the analogy breaks down" panel.
 *
 * Universal physics gaps (gravity, atmosphere, radiation, dust, day length,
 * seismicity) are merged with data-driven site-specific gaps, then sorted from
 * fundamental to low severity. Mitigation engineering is collapsed by default
 * so the physical impact stays scannable.
 */
export function BreakdownPanel({ pairing }: BreakdownPanelProps) {
  const headingId = useId()
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set())
  const [showAll, setShowAll] = useState(false)
  const { earthSite, targetSite } = pairing

  const sorted = [...pairing.breakdowns].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  )

  const severityCounts = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: sorted.filter((item) => item.severity === severity).length,
  })).filter((entry) => entry.count > 0)

  function toggle(index: number) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-hairline bg-panel/70 p-3.5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={headingId} className="text-sm font-semibold">
            Where the analogy breaks down
          </h3>
          <p className="mt-0.5 max-w-2xl text-[0.6875rem] leading-relaxed text-ink-muted">
            Physics that no terrestrial site can reproduce, combined with the
            measured gaps between {earthSite.name} and {targetSite.name}.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-1.5">
          {severityCounts.map(({ severity, count }) => {
            const color = severityColors[severity]
            return (
              <li
                key={severity}
                className="rounded border px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em]"
                style={{
                  color,
                  borderColor: `${color}55`,
                  backgroundColor: `${color}14`,
                }}
              >
                {count} {severity}
              </li>
            )
          })}
        </ul>
      </div>

      <ol className="mt-3 space-y-2">
        {(showAll ? sorted : sorted.slice(0, 4)).map((item, index) => {
          const color = severityColors[item.severity]
          const Icon = SEVERITY_ICON[item.severity]
          const isOpen = expanded.has(index)
          const regionId = `${headingId}-mitigation-${index}`
          return (
            <li
              key={`${item.domain}-${index}`}
              className="rounded-lg border border-hairline bg-elevated/40 p-2.5"
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border"
                  style={{
                    color,
                    borderColor: `${color}55`,
                    backgroundColor: `${color}14`,
                  }}
                >
                  <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-semibold text-ink">
                      {item.domain}
                    </h4>
                    <span
                      className="rounded border px-1.5 py-px text-[0.5625rem] font-semibold uppercase tracking-[0.1em]"
                      style={{
                        color,
                        borderColor: `${color}66`,
                        backgroundColor: `${color}14`,
                      }}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <dl className="mt-1 grid gap-x-4 gap-y-0.5 font-mono text-[0.625rem] sm:grid-cols-2">
                    <div>
                      <dt className="inline text-ink-dim">Earth: </dt>
                      <dd className="inline text-ink-muted">{item.earthValue}</dd>
                    </div>
                    <div>
                      <dt className="inline text-ink-dim">
                        {BODY_LABELS[targetSite.body]}:{' '}
                      </dt>
                      <dd
                        className="inline"
                        style={{ color: bodyColors[targetSite.body] }}
                      >
                        {item.targetValue}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
                    {item.deltaDescription}
                  </p>

                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={regionId}
                    className="mt-1 inline-flex items-center gap-1 rounded border border-hairline-strong bg-panel px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim transition-colors hover:text-ink"
                  >
                    Mitigation
                    <ChevronDown
                      className={`size-3 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <p
                      id={regionId}
                      className="mt-1 rounded-md border border-hairline bg-panel/70 px-2 py-1.5 text-[0.625rem] leading-relaxed text-ink-muted"
                    >
                      {item.mitigationStrategy}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {sorted.length > 4 ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-2 text-[0.6875rem] font-semibold text-plasma hover:underline"
        >
          {showAll ? 'Show fewer' : `Show ${sorted.length - 4} more differences`}
        </button>
      ) : null}

      <p className="mt-2 text-[0.5625rem] leading-relaxed text-ink-dim">
        {formatPercent(
          sorted.filter((item) => item.severity === 'fundamental').length /
            Math.max(1, sorted.length),
          1,
        )}{' '}
        of the identified gaps are fundamental physics limits that require
        architectural mitigation rather than site selection.
      </p>
    </section>
  )
}
