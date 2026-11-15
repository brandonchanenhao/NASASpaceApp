import { Check, X } from 'lucide-react'
import type { TechnologyReadinessLevel, TestbedApplication } from '../../types'
import { TRL_STEPS } from '../../utils/constants'

interface TestbedCardProps {
  application: TestbedApplication
  siteName: string
  targetName: string
  physicsLimits: readonly string[]
}

function readinessColor(level: TechnologyReadinessLevel): string {
  if (level >= 7) return '#34d399'
  if (level >= 5) return '#22d3ee'
  if (level >= 3) return '#f5c451'
  return '#fb923c'
}

export function TestbedCard({
  application,
  siteName,
  targetName,
  physicsLimits,
}: TestbedCardProps) {
  const color = readinessColor(application.readinessLevel)

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-hairline bg-abyss/70 p-3.5 transition-colors hover:border-hairline-strong">
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-hairline pb-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {application.operation}
            </h4>
            <p className="text-[0.625rem] text-ink-dim">
              {siteName} → {targetName}
            </p>
          </div>
          <span
            className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.625rem] font-bold"
            style={{
              color,
              backgroundColor: `${color}15`,
              border: `1px solid ${color}40`,
            }}
          >
            TRL {application.readinessLevel}/{TRL_STEPS}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
          {application.description}
        </p>

        {/* Dual Panels: Can Test vs Cannot Test */}
        <div className="mt-2.5 space-y-1.5 text-xs">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2">
            <span className="flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wider text-emerald-400">
              <Check className="size-3 stroke-[2.5]" />
              Can Test Here
            </span>
            <p className="mt-0.5 text-slate-200 text-xs">
              {application.specificTest}
            </p>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-2">
            <span className="flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wider text-red-400">
              <X className="size-3 stroke-[2.5]" />
              Cannot Reproduce
            </span>
            <p className="mt-0.5 text-slate-300 text-xs">
              {physicsLimits.length > 0
                ? `${physicsLimits.join(', ')} (requires vacuum or low-g secondary testing)`
                : 'Requires vacuum and low-gravity secondary testing.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-hairline flex flex-wrap gap-1">
        {application.relevantSystems.map((system) => (
          <span
            key={system}
            className="rounded bg-elevated px-1.5 py-0.5 text-[0.5625rem] text-slate-300 font-medium"
          >
            {system}
          </span>
        ))}
      </div>
    </article>
  )
}
