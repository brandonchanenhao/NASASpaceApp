import { ExternalLink, Globe, Mars, Moon } from 'lucide-react'
import type { AnalogSite } from '../../types'
import { bodyColors } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'
import { formatCoordinate } from '../../utils/formatters'

interface SiteInfoCardProps {
  site: AnalogSite
}

/**
 * Compact site identity card used at the top of the comparison dashboard.
 *
 * The thumbnail and primary link resolve to the same NASA product: Worldview
 * for Earth analogs and the relevant PDS node for Moon/Mars targets.
 */
export function SiteInfoCard({ site }: SiteInfoCardProps) {
  const BodyIcon = site.body === 'earth' ? Globe : site.body === 'moon' ? Moon : Mars
  const color = bodyColors[site.body]
  const role = site.body === 'earth' ? 'Earth analog' : `${BODY_LABELS[site.body]} target`

  const primaryUrl = site.worldviewUrl ?? site.pdsUrl ?? site.imageUrl
  const primaryLabel = site.worldviewUrl
    ? 'Worldview'
    : site.pdsUrl
      ? 'PDS product'
      : 'Orbital imagery'

  return (
    <article className="rounded-xl border border-hairline bg-panel/70 p-3">
      <div className="flex gap-3">
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          title={`Open ${primaryLabel} for ${site.name}`}
          className="group relative block size-24 shrink-0 overflow-hidden rounded-lg border border-hairline-strong bg-abyss"
        >
          <img
            src={site.imageUrl}
            alt={`Orbital imagery centered on ${site.name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-x-0 bottom-0 bg-void/80 px-1 py-0.5 text-center text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Orbital imagery
          </span>
        </a>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
            <span
              className="grid size-5 place-items-center rounded border border-hairline bg-elevated"
              style={{ color }}
            >
              <BodyIcon className="size-3" strokeWidth={2} aria-hidden="true" />
            </span>
            {role}
          </p>
          <h3 className="mt-1 text-sm font-semibold leading-snug text-ink">
            {site.name}
          </h3>
          <p className="mt-0.5 font-mono text-[0.625rem] text-plasma">
            {formatCoordinate(site.coordinate)}
          </p>
          <p className="mt-0.5 text-[0.625rem] leading-snug text-ink-dim">
            {site.region}
          </p>

          <a
            href={primaryUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[0.625rem] font-semibold text-plasma transition-colors hover:text-ink"
          >
            {primaryLabel}
            <ExternalLink className="size-3" strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>

      <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-muted">
        {site.description}
      </p>

      <div className="mt-2 space-y-1.5">
        <div>
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim">
            Lithology
          </p>
          <p className="mt-0.5 text-[0.625rem] leading-snug text-ink-muted">
            {site.rawParameters.rockType}
          </p>
        </div>

        <div>
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim">
            Detected minerals
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {site.rawParameters.primaryMinerals.map((mineral) => (
              <li
                key={mineral}
                className="rounded border border-hairline-strong bg-elevated px-1.5 py-px text-[0.5625rem] text-ink-muted"
              >
                {mineral}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim">
            Constraining instruments
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {site.instruments.map((instrument) => (
              <li
                key={instrument}
                className="rounded border border-plasma/30 bg-plasma/5 px-1.5 py-px text-[0.5625rem] text-plasma"
              >
                {instrument}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
