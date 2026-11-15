import type { CmrCollection, Coordinate } from '../types'
import { searchCollections } from './nasaCmr'
import {
  buildEarthdataSearchUrl,
  buildWorldviewUrl,
  earthPreviewImageUrl,
  paddedBoundingBox,
} from './gibsTiles'

/**
 * CMR keywords sampled for an arbitrary Earth coordinate. Together they cover
 * the three parameter families the similarity engine needs most: terrain,
 * thermal state and mineralogy.
 */
export const EARTH_SAMPLE_QUERIES: readonly string[] = [
  'digital elevation model',
  'land surface temperature',
  'surface mineralogy',
]

/** One CMR dataset query bundled with the keyword that produced it. */
export interface SampledCollection {
  query: string
  collection: CmrCollection
}

/** Everything the coordinate picker needs to describe an unlisted site. */
export interface EarthCoordinateSample {
  /** Validated coordinate, clamped to the legal lat/lon domain. */
  coordinate: Coordinate
  /** Datasets returned by CMR, deduplicated across queries. */
  collections: SampledCollection[]
  /** Keywords that were actually queried. */
  queries: string[]
  /** NASA Worldview deep link centred on the coordinate. */
  worldviewUrl: string
  /** NASA Earthdata Search deep link for the sampled bounding box. */
  earthdataSearchUrl: string
  /** NASA GIBS ASTER shaded-relief preview tile. */
  previewImageUrl: string
  /** ISO-8601 timestamp of the sample. */
  sampledAt: string
}

/** Clamp latitude to [-90, 90] and wrap longitude into [-180, 180]. */
function validateCoordinate(lat: number, lon: number): Coordinate {
  const safeLat = Number.isFinite(lat) ? Math.min(90, Math.max(-90, lat)) : 0
  const safeLon = Number.isFinite(lon)
    ? ((((lon + 180) % 360) + 360) % 360) - 180
    : 0
  return { lat: safeLat, lon: safeLon }
}

/**
 * Query NASA CMR for datasets covering an arbitrary Earth coordinate and build
 * the corresponding NASA deep links.
 *
 * Network failures are absorbed by the CMR client, so an offline venue still
 * yields valid links and an empty collection list rather than an exception.
 */
export async function sampleEarthCoordinate(
  lat: number,
  lon: number,
): Promise<EarthCoordinateSample> {
  const coordinate = validateCoordinate(lat, lon)
  const results = await Promise.all(
    EARTH_SAMPLE_QUERIES.map(async (query) => ({
      query,
      collections: await searchCollections(query, 4),
    })),
  )

  const seen = new Set<string>()
  const collections: SampledCollection[] = []
  for (const result of results) {
    for (const collection of result.collections) {
      if (seen.has(collection.conceptId)) continue
      seen.add(collection.conceptId)
      collections.push({ query: result.query, collection })
    }
  }

  return {
    coordinate,
    collections,
    queries: [...EARTH_SAMPLE_QUERIES],
    worldviewUrl: buildWorldviewUrl(coordinate),
    earthdataSearchUrl: buildEarthdataSearchUrl(
      'land surface temperature',
      coordinate,
    ),
    previewImageUrl: earthPreviewImageUrl(coordinate),
    sampledAt: new Date().toISOString(),
  }
}

/** Bounding box used by the sampler, exported for UI previews. */
export function sampleBoundingBox(coordinate: Coordinate): {
  west: number
  south: number
  east: number
  north: number
} {
  return paddedBoundingBox(coordinate)
}
