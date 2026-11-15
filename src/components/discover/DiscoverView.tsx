import { ExternalLink, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { getSite, moonSites, marsSites } from '../../data/analogs_dataset'
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  TRAITS,
  cellCoordinate,
  distanceKm,
  makeCountryFilter,
  decodeGrid,
  nearestKnownAnalog,
  scoreGrid,
  topCandidates,
  type CellScore,
  type EarthGridPayload,
  type GridCell,
  type TraitMatch,
} from '../../engine/hiddenAnalogs'
import { buildWorldviewUrl } from '../../services/gibsTiles'
import { bodyColors } from '../../utils/colors'
import { formatCoordinate } from '../../utils/formatters'

const GRID_URL = `${import.meta.env.BASE_URL}data/earth_grid.json`

/** NASA Blue Marble in plate carrée, so it lines up 1:1 with the 1° grid. */
const BASEMAP =
  'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_ShadedRelief_Bathymetry&STYLES=&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=1440&HEIGHT=720&FORMAT=image/jpeg'

const traitLabel = (key: TraitMatch['key']) =>
  TRAITS.find((trait) => trait.key === key)?.high ?? key

/** Warm ramp: dim orange → bright yellow-white as the match gets stronger. */
function heatColor(t: number): [number, number, number] {
  const r = 255
  const g = Math.round(80 + 175 * t)
  const b = Math.round(40 + 180 * t * t)
  return [r, g, b]
}


function strengths(entry: CellScore): string[] {
  return [...entry.matches]
    .filter((match) => match.target >= 0.5)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3)
    .map((match) => traitLabel(match.key))
}

function weakness(entry: CellScore): TraitMatch | undefined {
  return [...entry.matches].sort((a, b) => b.delta - a.delta)[0]
}

function fmt(value: number | null, unit: string, digits = 0): string {
  return value === null ? '—' : `${value.toFixed(digits)} ${unit}`
}

/**
 * Global "hidden analog" finder: scores every 1° land cell on Earth against a
 * chosen Moon or Mars target using measured NASA GIBS data, paints the result
 * as a heatmap, and lists the strongest regions that are *not* already famous
 * analog sites.
 */
export function DiscoverView({ onCompareTarget }: { onCompareTarget: (targetId: string) => void }) {
  const [grid, setGrid] = useState<{ payload: EarthGridPayload; cells: GridCell[] } | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(GRID_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<EarthGridPayload>
      })
      .then((payload) => {
        if (!cancelled) setGrid({ payload, cells: decodeGrid(payload) })
      })
      .catch((error: unknown) => {
        console.error('Failed to load analog grid', error)
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!grid) {
    return (
      <div
        role="status"
        className="rounded-xl border border-hairline bg-panel/70 px-5 py-12 text-center text-sm text-ink-muted"
      >
        {loadError
          ? 'Could not load the global analog grid.'
          : 'Loading global analog grid…'}
      </div>
    )
  }
  return <DiscoverMap payload={grid.payload} cells={grid.cells} onCompareTarget={onCompareTarget} />
}

function DiscoverMap({
  payload,
  cells: CELLS,
  onCompareTarget,
}: {
  payload: EarthGridPayload
  cells: GridCell[]
  onCompareTarget: (targetId: string) => void
}) {
  /** Geocoded name, else "near" the closest geocoded cell within ~500 km. */
  const excludeCountry = useMemo(() => makeCountryFilter(payload.names), [payload])
  const placeName = (entry: CellScore): string => {
    const exact = payload.names[String(entry.cell.id)]
    if (exact) return exact
    let best: { name: string; km: number } | null = null
    for (const [id, name] of Object.entries(payload.names)) {
      const km = distanceKm(entry.cell.coordinate, cellCoordinate(Number(id)))
      if (km < 500 && (!best || km < best.km)) best = { name, km }
    }
    return best ? `Near ${best.name}` : formatCoordinate(entry.cell.coordinate)
  }

  const [targetId, setTargetId] = useState('jezero-crater')
  const [hiddenOnly, setHiddenOnly] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const target = getSite(targetId)
  const scores = useMemo(() => scoreGrid(CELLS, target), [CELLS, target])
  const byId = useMemo(() => new Map(scores.map((entry) => [entry.cell.id, entry])), [scores])
  const candidates = useMemo(
    () => topCandidates(scores, { count: 6, hiddenOnly, exclude: excludeCountry }),
    [scores, hiddenOnly, excludeCountry],
  )
  const selected =
    (selectedId !== null ? byId.get(selectedId) : undefined) ?? candidates[0]

  // Paint the heatmap: only the top ~12% of land is coloured so hotspots pop.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const sorted = scores.map((entry) => entry.score).sort((a, b) => a - b)
    const floor = sorted[Math.floor(sorted.length * 0.88)]
    const ceiling = sorted[sorted.length - 1]
    const image = ctx.createImageData(GRID_WIDTH, GRID_HEIGHT)
    for (const entry of scores) {
      if (entry.score < floor) continue
      const t = (entry.score - floor) / Math.max(1e-6, ceiling - floor)
      const [r, g, b] = heatColor(t)
      const i = entry.cell.id * 4
      image.data[i] = r
      image.data[i + 1] = g
      image.data[i + 2] = b
      image.data[i + 3] = Math.round(110 + 145 * t)
    }
    ctx.putImageData(image, 0, 0)
  }, [scores])

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * GRID_WIDTH)
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * GRID_HEIGHT)
    const id = row * GRID_WIDTH + col
    if (byId.has(id)) setSelectedId(id)
  }

  const selectedWeakness = selected ? weakness(selected) : undefined
  const nearest = selected ? nearestKnownAnalog(selected.cell.coordinate) : null

  return (
    <section aria-labelledby="discover-heading" className="space-y-3">
      <div>
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-solar">
          New · global search
        </p>
        <h2 id="discover-heading" className="mt-1 text-lg font-semibold sm:text-xl">
          Where on Earth is most like{' '}
          <span style={{ color: bodyColors[target.body] }}>{target.name}</span>?
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
          We scored all {CELLS.length.toLocaleString()} land areas on Earth (1° cells) using real
          orbital satellite measurements, not hand-picked sites. Bright spots are the closest match.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Target</span>
          <select
            value={targetId}
            onChange={(event) => {
              setTargetId(event.target.value)
              setSelectedId(null)
            }}
            className="rounded-lg border border-hairline-strong bg-abyss px-2 py-1.5 text-sm font-semibold text-ink"
          >
            <optgroup label="Moon">
              {moonSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Mars">
              {marsSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={hiddenOnly}
            onChange={(event) => {
              setHiddenOnly(event.target.checked)
              setSelectedId(null)
            }}
            className="accent-[var(--color-plasma)]"
          />
          Hide famous analog sites (Atacama, Iceland, Antarctica…)
        </label>
      </div>

      <div
        className="relative w-full cursor-crosshair overflow-hidden rounded-xl border border-hairline bg-abyss"
        style={{ aspectRatio: '2 / 1' }}
        onClick={handleMapClick}
        role="img"
        aria-label={`Heatmap of Earth regions most similar to ${target.name}`}
      >
        <img
          src={BASEMAP}
          alt=""
          className="absolute inset-0 size-full object-fill opacity-70"
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH}
          height={GRID_HEIGHT}
          className="absolute inset-0 size-full"
          style={{ imageRendering: 'pixelated' }}
        />
        {candidates.map((entry, index) => {
          const { lat, lon } = entry.cell.coordinate
          const isSelected = entry.cell.id === selected?.cell.id
          return (
            <button
              key={entry.cell.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setSelectedId(entry.cell.id)
              }}
              aria-label={`Candidate ${index + 1}: ${placeName(entry)}`}
              className={`absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[0.6875rem] font-bold shadow-lg transition-transform ${
                isSelected
                  ? 'scale-125 border-white bg-plasma text-void'
                  : 'border-white/80 bg-void/80 text-white hover:scale-110'
              }`}
              style={{ left: `${((lon + 180) / 360) * 100}%`, top: `${((90 - lat) / 180) * 100}%` }}
            >
              {index + 1}
            </button>
          )
        })}
        {selected && !candidates.some((c) => c.cell.id === selected.cell.id) ? (
          <span
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{
              left: `${((selected.cell.coordinate.lon + 180) / 360) * 100}%`,
              top: `${((90 - selected.cell.coordinate.lat) / 180) * 100}%`,
            }}
          />
        ) : null}
        <p className="pointer-events-none absolute bottom-1.5 left-2 text-[0.625rem] text-white/70">
          Click anywhere on land to inspect it
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <ol className="space-y-1.5 lg:col-span-2">
          {candidates.map((entry, index) => {
            const isSelected = entry.cell.id === selected?.cell.id
            return (
              <li key={entry.cell.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(entry.cell.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? 'border-plasma/50 bg-plasma/10'
                      : 'border-hairline bg-panel/60 hover:border-hairline-strong'
                  }`}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{placeName(entry)}</span>
                    <span className="block truncate text-[0.6875rem] text-ink-dim">
                      {strengths(entry).join(' · ')}
                    </span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-solar">
                    {Math.round(entry.score * 100)}%
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        {selected ? (
          <article className="rounded-xl border border-hairline bg-panel/70 p-4 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold">{placeName(selected)}</h3>
                <p className="font-mono text-[0.6875rem] text-ink-dim">
                  {formatCoordinate(selected.cell.coordinate)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-solar/40 bg-solar/10 px-2.5 py-1 text-sm font-semibold text-solar">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {Math.round(selected.score * 100)}% match
              </span>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-ink-muted">
              <li>
                <span className="font-semibold text-emerald-400">✓ Like {target.shortName}:</span>{' '}
                {strengths(selected).join(', ') || 'few strong traits'}
              </li>
              {selectedWeakness ? (
                <li>
                  <span className="font-semibold text-red-400">✗ Biggest difference:</span>{' '}
                  {TRAITS.find((t) => t.key === selectedWeakness.key)?.label} (Earth{' '}
                  {selectedWeakness.earth.toFixed(2)} vs target {selectedWeakness.target.toFixed(2)})
                </li>
              ) : null}
              <li>
                <span className="font-semibold text-ink">Always different:</span> gravity, air
                pressure and radiation, which no place on Earth can reproduce.
              </li>
              {nearest ? (
                <li>
                  <span className="font-semibold text-plasma">Nearest famous analog:</span>{' '}
                  {nearest.name}, {Math.round(nearest.km).toLocaleString()} km away
                </li>
              ) : null}
            </ul>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-hairline bg-abyss/60 p-3 text-[0.75rem] sm:grid-cols-3">
              {[
                ['Hottest day surface', fmt(selected.cell.raw.peakTempK, 'K')],
                ['Coldest night surface', fmt(selected.cell.raw.minTempK, 'K')],
                ['Day–night swing', fmt(selected.cell.raw.swingK, 'K')],
                ['Vegetation (NDVI)', fmt(selected.cell.raw.ndvi, '', 2)],
                ['Rainfall', fmt(selected.cell.raw.precipMmDay, 'mm/day', 2)],
                ['Aerosol depth', fmt(selected.cell.raw.aod, '', 2)],
                ['Albedo', fmt(selected.cell.raw.albedo, '', 2)],
                ['Snow / ice cover', fmt(selected.cell.raw.snowPct, '%')],
                ['Terrain relief', fmt(selected.cell.raw.reliefM, 'm')],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-ink-dim">{label}</dt>
                  <dd className="font-mono text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-1.5 text-[0.625rem] text-ink-dim">{payload.source}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={buildWorldviewUrl(selected.cell.coordinate)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-plasma/40 bg-plasma/10 px-3 py-1.5 text-xs font-semibold text-plasma hover:bg-plasma/20"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                See it in Worldview
              </a>
              <button
                type="button"
                onClick={() => onCompareTarget(target.id)}
                className="rounded-lg border border-hairline-strong px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-plasma"
              >
                Compare {target.shortName} with our curated sites →
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  )
}
