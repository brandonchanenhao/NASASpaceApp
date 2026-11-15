import {
  ExternalLink,
  Loader2,
  MapPinned,
  Search,
  Satellite,
} from 'lucide-react'
import { useState } from 'react'
import { earthSites } from '../../data/analogs_dataset'
import { useNasaCmr } from '../../hooks/useNasaCmr'
import { sampleCmrPoint } from '../../services/nasaCmr'
import {
  buildEarthdataSearchUrl,
  buildWorldviewUrl,
} from '../../services/gibsTiles'
import type { AnalogSite, CmrPointSample, Coordinate } from '../../types'
import { formatCoordinate, formatNumber } from '../../utils/formatters'
import { LoadingOverlay } from '../ui/LoadingOverlay'

interface QuickPick {
  label: string
  region: string
  lat: number
  lon: number
}

/** Unlisted analog candidates evaluated on demand against the NASA catalog. */
const QUICK_PICKS: readonly QuickPick[] = [
  {
    label: 'Tabernas Desert',
    region: 'Almería, Spain',
    lat: 37.0,
    lon: -2.4,
  },
  {
    label: 'Channeled Scablands',
    region: 'Washington, USA',
    lat: 47.6,
    lon: -118.9,
  },
  {
    label: 'Piton de la Fournaise',
    region: 'Réunion, France',
    lat: -21.2,
    lon: 55.7,
  },
  {
    label: 'Qaidam Basin',
    region: 'Qinghai, China',
    lat: 37.5,
    lon: 93.5,
  },
]

const EARTH_RADIUS_KM = 6371.0088

/** Predicate that treats a coordinate with no intersecting collection as empty. */
function hasNoCollections(sample: CmrPointSample): boolean {
  return sample.collections.length === 0
}

/** Parse validated decimal-degree inputs, or null when out of range. */
function parseCoordinate(latText: string, lonText: string): Coordinate | null {
  const latValue = latText.trim()
  const lonValue = lonText.trim()
  if (latValue.length === 0 || lonValue.length === 0) return null
  const lat = Number(latValue)
  const lon = Number(lonValue)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
  return { lat, lon }
}

/** Great-circle distance in kilometres (haversine, mean Earth radius). */
function haversineKm(a: Coordinate, b: Coordinate): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const deltaLat = toRad(b.lat - a.lat)
  const deltaLon = toRad(b.lon - a.lon)
  const latA = toRad(a.lat)
  const latB = toRad(b.lat)
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Closest curated Earth analog, used as qualitative context for a coordinate. */
function nearestAnalog(coordinate: Coordinate): {
  site: AnalogSite
  distanceKm: number
} {
  let bestSite = earthSites[0]
  let bestDistance = haversineKm(coordinate, bestSite.coordinate)
  for (const site of earthSites.slice(1)) {
    const distance = haversineKm(coordinate, site.coordinate)
    if (distance < bestDistance) {
      bestSite = site
      bestDistance = distance
    }
  }
  return { site: bestSite, distanceKm: bestDistance }
}

/** Human-readable temporal coverage for a CMR collection. */
function temporalLabel(collection: {
  timeStart: string
  timeEnd: string
}): string {
  const start = collection.timeStart.slice(0, 10)
  const end = collection.timeEnd.slice(0, 10)
  if (start.length === 0 && end.length === 0) {
    return 'Temporal coverage not published'
  }
  return `${start.length > 0 ? start : 'unknown'} → ${end.length > 0 ? end : 'present'}`
}

/** CMR landing page for a collection concept id. */
function cmrConceptUrl(conceptId: string): string {
  return `https://cmr.earthdata.nasa.gov/search/concepts/${encodeURIComponent(conceptId)}.html`
}

const STATUS_COPY: Record<string, string> = {
  idle: 'Enter a coordinate or choose a quick pick, then sample the catalog at that point.',
  loading: 'Querying CMR collections at this coordinate…',
  offline:
    'CMR is unreachable from this network. The keyless Worldview link below still resolves against GIBS imagery.',
  empty:
    'No CMR collection page intersects this point. Open ocean, ice sheet and dense forest coordinates often have no local granule hits; try a quick pick over a primary calibration site.',
}

/**
 * Custom Earth coordinate sampler.
 *
 * Validates decimal-degree input, resolves NASA CMR collections and recent
 * granules at the point, and always offers keyless Worldview / Earthdata deep
 * links so the workflow survives a CMR outage.
 */
export function CoordinatePicker() {
  const [latText, setLatText] = useState('37.0')
  const [lonText, setLonText] = useState('-2.4')
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const query = useNasaCmr<CmrPointSample>(hasNoCollections)

  function sample(lat: string, lon: string) {
    const parsed = parseCoordinate(lat, lon)
    if (!parsed) {
      setInputError(
        'Latitude must be between −90° and 90°, longitude between −180° and 180°.',
      )
      setCoordinate(null)
      query.reset()
      return
    }
    setInputError(null)
    setCoordinate(parsed)
    query.run(() => sampleCmrPoint(parsed.lat, parsed.lon))
  }

  function applyQuickPick(pick: QuickPick) {
    setLatText(pick.lat.toFixed(1))
    setLonText(pick.lon.toFixed(1))
    sample(pick.lat.toFixed(1), pick.lon.toFixed(1))
  }

  const nearest = coordinate ? nearestAnalog(coordinate) : null
  const sampled = query.data?.sampledCollection ?? null
  const worldviewUrl = coordinate ? buildWorldviewUrl(coordinate) : null
  const earthdataUrl = coordinate
    ? buildEarthdataSearchUrl(
        sampled?.title ?? 'ASTER GDEM elevation',
        coordinate,
      )
    : null
  const statusCopy =
    query.status === 'success' && query.data
      ? `CMR returned ${query.data.collections.length} collections intersecting this point; recent granules for the top collection are listed below.`
      : STATUS_COPY[query.status]

  return (
    <section
      aria-labelledby="coordinate-picker-heading"
      className="rounded-xl border border-hairline bg-panel/70 p-3"
    >
      <div className="flex items-start gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-solar/40 bg-solar/10 text-solar">
          <MapPinned className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 id="coordinate-picker-heading" className="text-sm font-semibold">
            Sample an unlisted Earth coordinate
          </h3>
          <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
            Query the Common Metadata Repository for collections and
            recent granules intersecting any point, with keyless Worldview and
            Earthdata Search deep links.
          </p>
        </div>
      </div>

      <form
        className="mt-2.5 flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          sample(latText, lonText)
        }}
      >
        <div className="min-w-[5.5rem] flex-1">
          <label
            htmlFor="coordinate-latitude"
            className="block text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ink-dim"
          >
            Latitude (°)
          </label>
          <input
            id="coordinate-latitude"
            type="number"
            inputMode="decimal"
            min={-90}
            max={90}
            step={0.0001}
            value={latText}
            onChange={(event) => setLatText(event.target.value)}
            className="mt-1 w-full rounded-lg border border-hairline-strong bg-abyss px-2 py-1 font-mono text-xs text-ink"
          />
        </div>

        <div className="min-w-[5.5rem] flex-1">
          <label
            htmlFor="coordinate-longitude"
            className="block text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ink-dim"
          >
            Longitude (°)
          </label>
          <input
            id="coordinate-longitude"
            type="number"
            inputMode="decimal"
            min={-180}
            max={180}
            step={0.0001}
            value={lonText}
            onChange={(event) => setLonText(event.target.value)}
            className="mt-1 w-full rounded-lg border border-hairline-strong bg-abyss px-2 py-1 font-mono text-xs text-ink"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg border border-plasma/40 bg-plasma/10 px-3 py-1.5 text-xs font-semibold text-plasma transition-colors hover:bg-plasma/20"
        >
          {query.status === 'loading' ? (
            <Loader2
              className="size-3.5 animate-spin"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            <Search className="size-3.5" strokeWidth={2} aria-hidden="true" />
          )}
          Sample
        </button>
      </form>

      {inputError ? (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-signal-red/40 bg-signal-red/10 px-2.5 py-1.5 text-[0.6875rem] text-signal-red"
        >
          {inputError}
        </p>
      ) : null}

      <div className="mt-2">
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">
          Quick picks · unlisted analogs
        </p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {QUICK_PICKS.map((pick) => (
            <li key={pick.label}>
              <button
                type="button"
                onClick={() => applyQuickPick(pick)}
                title={`Sample ${pick.region} at ${pick.lat.toFixed(1)}°, ${pick.lon.toFixed(1)}°`}
                className="rounded-full border border-hairline-strong bg-elevated px-2 py-0.5 text-[0.625rem] text-ink-muted transition-colors hover:border-solar/40 hover:text-solar"
              >
                {pick.label}
                <span className="ml-1 text-ink-dim">
                  {pick.lat.toFixed(1)}°, {pick.lon.toFixed(1)}°
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div aria-live="polite" className="relative mt-2 space-y-2">
        {query.status === 'loading' && coordinate ? (
          <LoadingOverlay
            detail={`CMR point query at ${coordinate.lat.toFixed(3)}°, ${coordinate.lon.toFixed(3)}°`}
          />
        ) : null}
        <p
          data-cmr-status={query.status}
          className={`rounded-lg border px-2.5 py-1.5 text-[0.6875rem] leading-relaxed ${
            query.status === 'offline'
              ? 'border-signal-orange/40 bg-signal-orange/10 text-signal-orange'
              : 'border-hairline bg-abyss/60 text-ink-muted'
          }`}
        >
          {statusCopy}
        </p>

        {coordinate ? (
          <div className="rounded-lg border border-hairline bg-abyss/60 px-2.5 py-2">
            <p className="font-mono text-[0.6875rem] font-semibold text-plasma">
              {formatCoordinate(coordinate, 3)}
            </p>
            {nearest ? (
              <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-dim">
                Nearest curated analog: {nearest.site.name} ·{' '}
                {formatNumber(nearest.distanceKm, 0)} km away
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {worldviewUrl ? (
                <a
                  href={worldviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-plasma/30 bg-plasma/5 px-1.5 py-0.5 text-[0.625rem] font-semibold text-plasma hover:bg-plasma/15"
                >
                  <Satellite
                    className="size-3"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Worldview
                  <ExternalLink
                    className="size-2.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </a>
              ) : null}
              {earthdataUrl ? (
                <a
                  href={earthdataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-hairline-strong bg-elevated px-1.5 py-0.5 text-[0.625rem] font-semibold text-ink-muted hover:text-plasma"
                >
                  Earthdata Search
                  <ExternalLink
                    className="size-2.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {query.status === 'success' && query.data ? (
          <div className="space-y-1.5">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim">
              {query.data.collections.length} collections intersect this point
            </p>
            <ul className="space-y-1">
              {query.data.collections.map((collection) => (
                <li
                  key={collection.conceptId}
                  className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5"
                >
                  <a
                    href={cmrConceptUrl(collection.conceptId)}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 text-[0.6875rem] font-semibold leading-snug text-ink hover:text-plasma"
                  >
                    {collection.title}
                  </a>
                  <p className="mt-0.5 text-[0.5625rem] text-ink-dim">
                    {collection.conceptId} · {temporalLabel(collection)}
                  </p>
                </li>
              ))}
            </ul>

            {sampled && query.data.granules.length > 0 ? (
              <div className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5">
                <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim">
                  Recent granules · {sampled.title}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {query.data.granules.map((granule) => (
                    <li
                      key={granule.conceptId}
                      className="flex items-baseline justify-between gap-2 text-[0.625rem] text-ink-muted"
                    >
                      <span className="min-w-0 truncate">{granule.title}</span>
                      {granule.browseUrl ? (
                        <a
                          href={granule.browseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 font-semibold text-plasma hover:text-ink"
                        >
                          browse
                        </a>
                      ) : (
                        <span className="shrink-0 text-ink-dim">
                          {granule.timeStart.slice(0, 10)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
