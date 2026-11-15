import { ChevronDown, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import type { AnalogPairing, BreakdownSeverity } from '../../types'
import { bodyColors, severityColors } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'

interface BreakdownPanelProps {
  pairing: AnalogPairing
}

const SEVERITY_RANK: Record<BreakdownSeverity, number> = {
  fundamental: 3,
  high: 2,
  medium: 1,
  low: 0,
}

export function BreakdownPanel({ pairing }: BreakdownPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const { targetSite } = pairing
  const targetColor = bodyColors[targetSite.body]

  const sorted = [...pairing.breakdowns].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  )

  return (
    <section
      aria-labelledby="breakdown-heading"
      className="rounded-2xl border border-hairline-strong bg-panel/70 p-4 sm:p-5 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-orange-400" />
          <h3 id="breakdown-heading" className="text-sm font-semibold text-white">
            Where the Analogy Breaks Down
          </h3>
        </div>
        <span className="text-xs text-ink-dim font-mono">
          {sorted.length} physical limits
        </span>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {sorted.map((item, index) => {
          const isExpanded = expandedIndex === index
          const color = severityColors[item.severity]

          return (
            <div
              key={`${item.domain}-${index}`}
              className="rounded-xl border border-hairline bg-abyss/60 p-3 transition-colors hover:border-hairline-strong"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {item.domain}
                </span>
                <span
                  className="rounded border px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider"
                  style={{
                    color,
                    borderColor: `${color}55`,
                    backgroundColor: `${color}15`,
                  }}
                >
                  {item.severity}
                </span>
              </div>

              {/* Values Comparison */}
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-elevated/50 px-2.5 py-1.5 font-mono text-[0.6875rem]">
                <span className="text-sky-400 truncate">
                  Earth: {item.earthValue}
                </span>
                <span className="text-ink-dim text-[0.625rem]">vs</span>
                <span className="truncate text-right" style={{ color: targetColor }}>
                  {BODY_LABELS[targetSite.body]}: {item.targetValue}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {item.deltaDescription}
              </p>

              {/* Mitigation Toggle */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="mt-2 flex items-center gap-1 text-[0.6875rem] font-semibold text-plasma hover:text-white transition-colors"
              >
                <span>{isExpanded ? 'Hide Mitigation' : 'Show Mitigation'}</span>
                <ChevronDown
                  className={`size-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="mt-2 rounded-lg border border-hairline bg-panel p-2 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block text-[0.625rem] uppercase mb-0.5">
                    Testing Protocol:
                  </strong>
                  {item.mitigationStrategy}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
