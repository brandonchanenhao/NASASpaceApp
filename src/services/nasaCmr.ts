import type {
  BoundingBox,
  CmrCollection,
  CmrGranule,
  CmrPointSample,
} from '../types'
import { NASA_CMR_BASE } from '../utils/constants'

/**
 * Minimal, dependency-free NASA CMR client.
 *
 * CMR's JSON responses are untyped from TypeScript's point of view, so every
 * payload is validated with narrow type guards instead of `any` casts. All
 * failures degrade to empty results: a hackathon demo must keep working when
 * the venue Wi-Fi drops.
 */

const JSON_HEADERS: Record<string, string> = { Accept: 'application/json' }

/** Distinguishes "CMR answered with no hits" from "CMR was unreachable". */
export type CmrLookup<T> =
  | { status: 'ok'; value: T }
  | { status: 'offline' }

type FetchOutcome =
  | { reachable: true; payload: unknown }
  | { reachable: false }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** Fetch JSON, recording whether the endpoint was reachable at all. */
async function fetchOutcome(url: string): Promise<FetchOutcome> {
  try {
    const response = await fetch(url, { headers: JSON_HEADERS })
    if (!response.ok) return { reachable: true, payload: null }
    return { reachable: true, payload: (await response.json()) as unknown }
  } catch {
    return { reachable: false }
  }
}

/** Fetch JSON, returning null for network errors and non-2xx responses. */
async function fetchJson(url: string): Promise<unknown> {
  const outcome = await fetchOutcome(url)
  return outcome.reachable ? outcome.payload : null
}

/** Entries from a CMR `feed` envelope; tolerates single-object entries. */
function feedEntries(payload: unknown): Record<string, unknown>[] {
  if (!isRecord(payload)) return []
  const feed = payload.feed
  if (!isRecord(feed)) return []
  const entry = feed.entry
  if (Array.isArray(entry)) return entry.filter(isRecord)
  if (isRecord(entry)) return [entry]
  return []
}

/** CMR boxes are "south west north east" strings in decimal degrees. */
function parseBox(value: unknown): BoundingBox | null {
  if (!Array.isArray(value)) return null
  const first = value[0]
  if (typeof first !== 'string') return null
  const parts = first.trim().split(/\s+/).map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null
  }
  const [south, west, north, east] = parts
  return { west, south, east, north }
}

/** First `href` in a CMR links array whose `rel` contains `kind`. */
function linkHref(value: unknown, kind: 'browse' | 'data'): string | undefined {
  if (!Array.isArray(value)) return undefined
  for (const candidate of value) {
    if (!isRecord(candidate)) continue
    const rel = asString(candidate.rel)
    const href = asString(candidate.href)
    if (href && rel && rel.includes(kind)) return href
  }
  return undefined
}

function toCollection(entry: Record<string, unknown>): CmrCollection | null {
  const conceptId = asString(entry.id)
  const title = asString(entry.title)
  if (!conceptId || !title) return null
  return {
    conceptId,
    title,
    summary: asString(entry.summary) ?? '',
    timeStart: asString(entry.time_start) ?? '',
    timeEnd: asString(entry.time_end) ?? '',
    spatialExtent: parseBox(entry.boxes),
  }
}

function toGranule(entry: Record<string, unknown>): CmrGranule | null {
  const conceptId = asString(entry.id)
  if (!conceptId) return null
  const browseUrl = linkHref(entry.links, 'browse')
  const downloadUrl = linkHref(entry.links, 'data')
  const boundingBox = parseBox(entry.boxes)
  return {
    title: asString(entry.title) ?? conceptId,
    conceptId,
    ...(browseUrl ? { browseUrl } : {}),
    ...(downloadUrl ? { downloadUrl } : {}),
    timeStart: asString(entry.time_start) ?? '',
    ...(boundingBox ? { boundingBox } : {}),
  }
}

function buildUrl(path: string, params: Record<string, string>): string {
  const search = new URLSearchParams(params).toString()
  return `${NASA_CMR_BASE}/${path}.json?${search}`
}

/**
 * Search CMR collections by keyword.
 *
 * @example searchCollections('land surface temperature', 10)
 */
export async function searchCollections(
  keyword: string,
  pageSize = 10,
): Promise<CmrCollection[]> {
  const payload = await fetchJson(
    buildUrl('collections', {
      keyword,
      page_size: String(pageSize),
      include_granule_counts: 'false',
    }),
  )
  return feedEntries(payload)
    .map(toCollection)
    .filter((collection): collection is CmrCollection => collection !== null)
}

/** Search granules of one collection intersecting a point (lon, lat). */
export async function searchGranulesByPoint(
  collectionId: string,
  lat: number,
  lon: number,
  pageSize = 5,
): Promise<CmrGranule[]> {
  const payload = await fetchJson(
    buildUrl('granules', {
      collection_concept_id: collectionId,
      point: `${lon},${lat}`,
      page_size: String(pageSize),
      sort_key: '-start_date',
    }),
  )
  return feedEntries(payload)
    .map(toGranule)
    .filter((granule): granule is CmrGranule => granule !== null)
}

/** Search granules of one collection intersecting a bounding box. */
export async function searchGranulesByBbox(
  collectionId: string,
  bbox: BoundingBox,
  pageSize = 5,
): Promise<CmrGranule[]> {
  const payload = await fetchJson(
    buildUrl('granules', {
      collection_concept_id: collectionId,
      bounding_box: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
      page_size: String(pageSize),
      sort_key: '-start_date',
    }),
  )
  return feedEntries(payload)
    .map(toGranule)
    .filter((granule): granule is CmrGranule => granule !== null)
}

/** Number of granules CMR reports for a query, or 0 when unavailable. */
export async function countGranules(
  collectionId: string,
  bbox: BoundingBox,
): Promise<number> {
  const payload = await fetchJson(
    buildUrl('granules', {
      collection_concept_id: collectionId,
      bounding_box: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
      page_size: '1',
    }),
  )
  if (!isRecord(payload)) return 0
  const feed = payload.feed
  if (!isRecord(feed)) return 0
  const hits = asNumber(feed.hits)
  return hits ?? 0
}

/**
 * Sample the NASA CMR catalog at one Earth coordinate.
 *
 * Collections are resolved with CMR's `point` spatial predicate, then recent
 * granules are attached for the first collection hit. An unreachable endpoint
 * reports `offline` so the UI can distinguish a dead network from a genuinely
 * empty catalog over open ocean or ice sheet.
 */
export async function sampleCmrPoint(
  lat: number,
  lon: number,
  pageSize = 5,
): Promise<CmrLookup<CmrPointSample>> {
  const collectionOutcome = await fetchOutcome(
    buildUrl('collections', {
      point: `${lon},${lat}`,
      page_size: String(pageSize),
      include_granule_counts: 'false',
    }),
  )
  if (!collectionOutcome.reachable) return { status: 'offline' }

  const collections = feedEntries(collectionOutcome.payload)
    .map(toCollection)
    .filter((collection): collection is CmrCollection => collection !== null)

  const sampledCollection = collections[0] ?? null
  if (!sampledCollection) {
    return {
      status: 'ok',
      value: { collections, granules: [], sampledCollection: null },
    }
  }

  const granuleOutcome = await fetchOutcome(
    buildUrl('granules', {
      collection_concept_id: sampledCollection.conceptId,
      point: `${lon},${lat}`,
      page_size: '3',
      sort_key: '-start_date',
    }),
  )
  const granules = granuleOutcome.reachable
    ? feedEntries(granuleOutcome.payload)
        .map(toGranule)
        .filter((granule): granule is CmrGranule => granule !== null)
    : []

  return {
    status: 'ok',
    value: { collections, granules, sampledCollection },
  }
}
