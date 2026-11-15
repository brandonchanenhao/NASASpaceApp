import type { AnalogSite, Coordinate } from '../types'

/**
 * Hidden-analog search engine.
 *
 * Every 1° land cell on Earth carries measured properties decoded from NASA
 * GIBS products (see scripts/build_analog_grid.py). Each Moon/Mars target is
 * translated into the same Earth-observable traits, and every cell is scored
 * by how close its traits sit to the target's. Traits are normalized to the
 * range Earth actually spans, so "1" means "as extreme as Earth gets" in the
 * direction of the target.
 */

/** Raw grid payload written by the Python builder. */
export interface EarthGridPayload {
  source: string
  resolutionDeg: number
  fields: string[]
  /** [cell, peakTempK, minTempK, diurnalSwingK, ndvi100, precip100, aod100, albedo100, snowPct, elevationM, reliefM] */
  cells: (number | null)[][]
  names: Record<string, string>
}

export type TraitKey =
  | 'barren'
  | 'arid'
  | 'cold'
  | 'heat'
  | 'swing'
  | 'ice'
  | 'dust'
  | 'albedo'
  | 'relief'

export interface TraitMeta {
  key: TraitKey
  label: string
  /** Plain-language reading of a high value. */
  high: string
  /** NASA product the Earth value is decoded from. */
  source: string
}

export const TRAITS: readonly TraitMeta[] = [
  { key: 'barren', label: 'No vegetation', high: 'bare ground', source: 'MODIS NDVI' },
  { key: 'arid', label: 'Dryness', high: 'almost no rain', source: 'MERRA-2 precipitation' },
  { key: 'cold', label: 'Cold nights', high: 'very cold nights', source: 'MODIS night LST' },
  { key: 'heat', label: 'Hot days', high: 'hot surface by day', source: 'MODIS day LST' },
  { key: 'swing', label: 'Day–night swing', high: 'big temperature swing', source: 'MODIS day/night LST' },
  { key: 'ice', label: 'Ice & snow', high: 'ice or snow cover', source: 'MODIS snow cover' },
  { key: 'dust', label: 'Dusty air', high: 'dusty/hazy air', source: 'MERRA-2 aerosol depth' },
  { key: 'albedo', label: 'Surface brightness', high: 'bright surface', source: 'MERRA-2 albedo' },
  { key: 'relief', label: 'Rugged terrain', high: 'rugged relief', source: 'SRTM elevation' },
]

export type TraitVector = Record<TraitKey, number | null>

export interface GridCell {
  id: number
  coordinate: Coordinate
  traits: TraitVector
  /** Raw measurements for the detail panel. */
  raw: {
    peakTempK: number | null
    minTempK: number | null
    swingK: number | null
    ndvi: number | null
    precipMmDay: number | null
    aod: number | null
    albedo: number | null
    snowPct: number | null
    elevationM: number | null
    reliefM: number | null
  }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const scaled = (value: number | null, divisor = 100) =>
  value === null ? null : value / divisor

export const GRID_WIDTH = 360
export const GRID_HEIGHT = 180

export function cellCoordinate(id: number): Coordinate {
  const row = Math.floor(id / GRID_WIDTH)
  const col = id % GRID_WIDTH
  return { lat: 90 - row - 0.5, lon: -180 + col + 0.5 }
}

/** Convert decoded measurements into 0–1 "planetary extremeness" traits. */
export function decodeGrid(payload: EarthGridPayload): GridCell[] {
  return payload.cells.map((row) => {
    const [id, peak, min, swing, ndvi100, precip100, aod100, albedo100, snow, elev, relief] = row
    const raw = {
      peakTempK: peak,
      minTempK: min,
      swingK: swing,
      ndvi: scaled(ndvi100),
      precipMmDay: scaled(precip100),
      aod: scaled(aod100),
      albedo: scaled(albedo100),
      snowPct: snow,
      elevationM: elev,
      reliefM: relief,
    }
    const traits: TraitVector = {
      // Missing NDVI means ice sheet or salt/rock with no retrieval: bare.
      barren: raw.ndvi === null ? 1 : clamp01(1 - raw.ndvi / 0.5),
      arid: raw.precipMmDay === null ? null : clamp01(1 - raw.precipMmDay / 3),
      cold: min === null ? null : clamp01((300 - min) / 90),
      heat: peak === null ? null : clamp01((peak - 230) / 110),
      swing: swing === null ? null : clamp01(swing / 30),
      ice: snow === null ? null : clamp01(snow / 100),
      dust: raw.aod === null ? null : clamp01(raw.aod / 0.6),
      albedo: raw.albedo === null ? null : clamp01((raw.albedo - 0.05) / 0.5),
      relief: relief === null ? null : clamp01(relief / 800),
    }
    return { id: id as number, coordinate: cellCoordinate(id as number), traits, raw }
  })
}

/** Typical Bond-style surface albedo by body (Moon maria/highlands ≈ 0.12, Mars ≈ 0.25). */
const BODY_ALBEDO = { moon: 0.12, mars: 0.25, earth: 0.3 } as const

/** Express a Moon/Mars target in the same Earth-observable traits. */
export function targetTraits(site: AnalogSite): Record<TraitKey, number> {
  const p = site.rawParameters
  return {
    barren: 1,
    arid: 1,
    cold: clamp01((300 - p.minSurfaceTempK) / 90),
    heat: clamp01((p.peakSurfaceTempK - 230) / 110),
    swing: clamp01(p.diurnalDeltaTK / 30),
    ice: clamp01(Math.max(p.waterIcePresence, p.permafrostExtent)),
    dust: clamp01(p.aerosolOpticalDepth / 0.6),
    albedo: clamp01((BODY_ALBEDO[site.body] - 0.05) / 0.5),
    relief: clamp01(p.meanSlopeDeg / 25),
  }
}

export interface TraitMatch {
  key: TraitKey
  earth: number
  target: number
  delta: number
}

export interface CellScore {
  cell: GridCell
  score: number
  matches: TraitMatch[]
}

/** Similarity = 1 − mean absolute trait gap over the traits measured for that cell. */
export function scoreCell(cell: GridCell, target: Record<TraitKey, number>): CellScore {
  const matches: TraitMatch[] = []
  for (const { key } of TRAITS) {
    const earth = cell.traits[key]
    if (earth === null) continue
    matches.push({ key, earth, target: target[key], delta: Math.abs(earth - target[key]) })
  }
  const meanGap =
    matches.reduce((sum, match) => sum + match.delta, 0) / Math.max(1, matches.length)
  // Cells missing many traits are less trustworthy; shrink them slightly.
  const coverage = matches.length / TRAITS.length
  return { cell, score: (1 - meanGap) * (0.85 + 0.15 * coverage), matches }
}

export function scoreGrid(cells: readonly GridCell[], site: AnalogSite): CellScore[] {
  const target = targetTraits(site)
  return cells.map((cell) => scoreCell(cell, target))
}

/** Well-studied analog regions the challenge asks us to look beyond. */
export const KNOWN_ANALOGS: readonly { name: string; lat: number; lon: number }[] = [
  { name: 'Atacama Desert', lat: -24.0, lon: -69.5 },
  { name: 'Salar de Pajonales', lat: -25.1, lon: -68.8 },
  { name: 'Haughton Crater', lat: 75.4, lon: -89.7 },
  { name: 'Axel Heiberg Island', lat: 79.4, lon: -90.8 },
  { name: 'Death Valley', lat: 36.5, lon: -117.0 },
  { name: 'Mojave Desert', lat: 35.0, lon: -116.0 },
  { name: 'Mars Desert Research Station', lat: 38.4, lon: -110.8 },
  { name: 'Meteor Crater', lat: 35.0, lon: -111.0 },
  { name: 'Kilbourne Hole', lat: 31.97, lon: -106.97 },
  { name: 'Iceland', lat: 64.9, lon: -18.5 },
  { name: 'Mauna Kea, Hawaii', lat: 19.8, lon: -155.5 },
  { name: 'Svalbard', lat: 78.2, lon: 15.8 },
  { name: 'Rio Tinto', lat: 37.7, lon: -6.6 },
  { name: 'Lanzarote', lat: 29.0, lon: -13.6 },
  { name: 'Dallol', lat: 14.2, lon: 40.3 },
  { name: 'Pilbara', lat: -21.2, lon: 119.5 },
  { name: 'Arkaroola', lat: -30.3, lon: 139.3 },
  { name: 'Qaidam Basin', lat: 37.5, lon: 93.5 },
  { name: 'Ries Crater', lat: 48.9, lon: 10.6 },
  { name: 'Tindouf / Anti-Atlas', lat: 30.0, lon: -7.0 },
]

const EARTH_RADIUS_KM = 6371

export function distanceKm(a: Coordinate, b: Coordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Nearest famous analog, used to flag genuinely new candidates. */
export function nearestKnownAnalog(coordinate: Coordinate) {
  let best = { name: '', km: Infinity }
  for (const known of KNOWN_ANALOGS) {
    const km = distanceKm(coordinate, known)
    if (km < best.km) best = { name: known.name, km }
  }
  return best
}

export const HIDDEN_RADIUS_KM = 400

/** A cell is "well known" if it is near a famous analog or in Antarctica. */
export function isWellKnown(coordinate: Coordinate): boolean {
  return coordinate.lat < -60 || nearestKnownAnalog(coordinate).km < HIDDEN_RADIUS_KM
}

/**
 * Best-scoring cells, spread out so the list shows distinct regions rather than
 * ten neighbouring pixels of the same desert.
 */
export function topCandidates(
  scores: readonly CellScore[],
  {
    count = 8,
    minSpacingKm = 900,
    hiddenOnly = true,
    exclude,
  }: {
    count?: number
    minSpacingKm?: number
    hiddenOnly?: boolean
    /** Drop cells for which this returns true (e.g. excluded countries). */
    exclude?: (cell: GridCell) => boolean
  } = {},
): CellScore[] {
  const sorted = [...scores].sort((a, b) => b.score - a.score)
  const picked: CellScore[] = []
  for (const entry of sorted) {
    if (picked.length >= count) break
    if (hiddenOnly && isWellKnown(entry.cell.coordinate)) continue
    if (exclude?.(entry.cell)) continue
    if (picked.some((p) => distanceKm(p.cell.coordinate, entry.cell.coordinate) < minSpacingKm)) {
      continue
    }
    picked.push(entry)
  }
  return picked
}

/** Countries left out of the candidate list. */
export const EXCLUDED_COUNTRIES: readonly string[] = ['China']

/**
 * Build a predicate that flags cells in an excluded country, using the
 * geocoded place names ("Region, Country"). A cell without its own name
 * inherits the country of the nearest named cell within 150 km.
 */
export function makeCountryFilter(
  names: Record<string, string>,
  countries: readonly string[] = EXCLUDED_COUNTRIES,
): (cell: GridCell) => boolean {
  const named = Object.entries(names).map(([id, name]) => ({
    coordinate: cellCoordinate(Number(id)),
    name,
  }))
  const inCountry = (name: string) =>
    countries.some((country) => name === country || name.endsWith(`, ${country}`))
  return (cell) => {
    const own = names[String(cell.id)]
    if (own) return inCountry(own)
    let best: { name: string; km: number } | null = null
    for (const entry of named) {
      const km = distanceKm(cell.coordinate, entry.coordinate)
      if (km < 150 && (!best || km < best.km)) best = { name: entry.name, km }
    }
    return best ? inCountry(best.name) : false
  }
}
