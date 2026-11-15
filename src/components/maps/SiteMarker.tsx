import { divIcon, type DivIcon } from 'leaflet'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { AnalogSite } from '../../types'
import { bodyColors } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'
import { formatCoordinate } from '../../utils/formatters'

interface SiteMarkerProps {
  site: AnalogSite
  /** Highlights the pin when this site is part of the selected pair. */
  selected: boolean
  /** Selects the site without leaving the map view. */
  onSelect: (siteId: string) => void
  /** Opens the comparison workspace for this site's pairing. */
  onCompare: (siteId: string) => void
}

/**
 * Teardrop pin with a body-colored core. The selected state adds a pulsing
 * halo so the paired site remains identifiable on the opposite map.
 */
function createSiteIcon(color: string, selected: boolean): DivIcon {
  const activeClass = selected ? ' site-marker__ring--active' : ''
  return divIcon({
    className: 'site-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -32],
    html: `
      <span class="site-marker__ring${activeClass}" style="--marker-color: ${color}">
        <svg viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 36.5C15 36.5 28.5 21.8 28.5 14.5C28.5 6.9 22.4 1.5 15 1.5C7.6 1.5 1.5 6.9 1.5 14.5C1.5 21.8 15 36.5 15 36.5Z"
            fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2" />
          <circle cx="15" cy="14.5" r="4.75" fill="${color}" />
        </svg>
      </span>
    `,
  })
}

/**
 * Shared marker for all three bodies. Popup content is rendered by React, so
 * the compare action stays fully typed and keyboard accessible.
 */
export function SiteMarker({
  site,
  selected,
  onSelect,
  onCompare,
}: SiteMarkerProps) {
  const icon = useMemo(
    () => createSiteIcon(bodyColors[site.body], selected),
    [site.body, selected],
  )

  return (
    <Marker
      position={[site.coordinate.lat, site.coordinate.lon]}
      icon={icon}
      zIndexOffset={selected ? 1000 : 0}
      keyboard
      alt={site.name}
      title={`${site.name} — ${site.region}`}
      eventHandlers={{ click: () => onSelect(site.id) }}
    >
      <Popup minWidth={264} maxWidth={288} closeButton>
        <div className="space-y-2.5">
          <div>
            <p className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: bodyColors[site.body] }}
                aria-hidden="true"
              />
              {BODY_LABELS[site.body]} · {site.region}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-ink">
              {site.name}
            </h3>
            <p className="mt-0.5 font-mono text-[0.6875rem] text-plasma">
              {formatCoordinate(site.coordinate)}
            </p>
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">
            {site.description}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onCompare(site.id)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-plasma/40 bg-plasma/10 px-2.5 py-1.5 text-xs font-semibold text-plasma transition-colors hover:bg-plasma/20"
          >
            Compare
            <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
