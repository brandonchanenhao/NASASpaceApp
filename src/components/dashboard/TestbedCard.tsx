import { Check, X } from 'lucide-react'
import type { TechnologyReadinessLevel, TestbedApplication } from '../../types'
import { TRL_STEPS } from '../../utils/constants'

interface TestbedCardProps {
  application: TestbedApplication
  /** Earth analog that hosts the testbed. */
  siteName: string
  /** Moon or Mars destination the test campaign supports. */
  targetName: string
  /** Physics domains that cannot be reproduced at this analog. */
  physicsLimits: readonly string[]
}

/** Readiness color: flight-proven green → laboratory orange. */
function readinessColor(level: TechnologyReadinessLevel): string {
  if (level >= 7) return '#34d399'
  if (level >= 5) return '#22d3ee'
  if (level >= 3) return '#f5c451'
  return '#fb923c'
}

/**
 * One hardware/operations test campaign.
 *
 * The card separates what the analog can physically exercise from the physics
 * it cannot reproduce, so a planner never mistakes a successful field campaign
 * for end-to-end qualification of the target environment.
 */
export function TestbedCard({
  application,
  siteName,
  targetName,
  physicsLimits,
}: TestbedCardProps) {
  const color = readinessColor(application.readinessLevel)

  return (
    <article className="flex h-full flex-col rounded-xl border border-hairline bg-panel/70 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-ink">
          {application.operation}
        </h3>
        <span
          className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.5625rem] font-semibold"
          style={{
            color,
            borderColor: `${color}55`,
            backgroundColor: `${color}14`,
          }}
        >
          TRL {application.readinessLevel}
        </span>
      </div>

      <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
        {application.description}
      </p>

      <div
        className="mt-2 flex gap-0.5"
        role="img"
        aria-label={`Technology readiness level ${application.readinessLevel} of ${TRL_STEPS}`}
      >
        {Array.from({ length: TRL_STEPS }, (_, index) => {
          const filled = index < application.readinessLevel
          return (
            <span
              key={index}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor: filled ? color : '#1e2b45',
              }}
            />
          )
        })}
      </div>
      <p className="mt-1 text-[0.5625rem] text-ink-dim">
        {siteName} testbed · validated for {targetName}
      </p>

      <div className="mt-2 grid gap-1.5">
        <div className="rounded-md border border-signal-green/30 bg-signal-green/5 px-2 py-1.5">
          <p className="flex items-center gap-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-signal-green">
            <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
            Can test here
          </p>
          <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-muted">
            {application.specificTest}
          </p>
        </div>

        <div className="rounded-md border border-signal-red/30 bg-signal-red/5 px-2 py-1.5">
          <p className="flex items-center gap-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-signal-red">
            <X className="size-3" strokeWidth={2.5} aria-hidden="true" />
            Cannot reproduce
          </p>
          <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-muted">
            {physicsLimits.length > 0
              ? `${physicsLimits.join(', ')} — these require chamber, parabolic-flight or orbital qualification.`
              : 'No fundamental physics gap is recorded for this pairing.'}
          </p>
        </div>
      </div>

      <ul className="mt-auto flex flex-wrap gap-1 pt-2">
        {application.relevantSystems.map((system) => (
          <li
            key={system}
            className="rounded border border-hairline-strong bg-elevated px-1.5 py-px text-[0.5625rem] text-ink-muted"
          >
            {system}
          </li>
        ))}
      </ul>
    </article>
  )
}
