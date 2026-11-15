import type { BoundingBox, Coordinate } from '../types'
import { NASA_GIBS_3857_BASE, NASA_GIBS_BASE } from '../utils/constants'

/** Tile extension accepted by the GIBS WMTS REST endpoints. */
export type TileFormat = 'png' | 'jpg' | 'jpeg'

export interface GeographicTile {
  /** Tile column index, west → east. */
  col: number
  /** Tile row index, north → south (WMTS TileRow). */
  row: number
  /** Number of columns in this zoom level: 2^(z+1). */
  cols: number
  /** Number of rows in this zoom level: 2^z. */
  rows: number
}

function clampIndex(value: number, max: number): number {
  if (value < 0) return 0
  if (value > max) return max
  return value
}

/**
 * Geographic (EPSG:4326) WMTS tile index for a planetographic coordinate.
 *
 * NASA GIBS and NASA Trek both publish a "2×1 at level 0" geographic tile
 * matrix: cols = 2^(z+1), rows = 2^z, origin at 180°W / 90°N. This mirrors
 * the OGC WMTS TileRow/TileCol convention (row 0 is north).
 */
export function geographicTile(
  coordinate: Coordinate,
  zoom: number,
): GeographicTile {
  const level = Math.max(0, Math.round(zoom))
  const cols = 2 ** (level + 1)
  const rows = 2 ** level
  const { lat, lon } = coordinate
  const col = clampIndex(Math.floor(((lon + 180) / 360) * cols), cols - 1)
  const row = clampIndex(Math.floor(((90 - lat) / 180) * rows), rows - 1)
  return { col, row, cols, rows }
}

/**
 * GIBS WMTS REST tile URL.
 *
 * Template: {GIBS}/{layer}/default/{time}/{tileMatrixSet}/{z}/{row}/{col}.{ext}
 * `time` is a date string for temporal layers and "default" for static layers.
 * The coordinate argument is geographic, so only the EPSG:4326 endpoint is
 * valid here; interactive Web Mercator maps use `buildGibsTileTemplate`.
 */
export function buildGibsTileUrl(options: {
  layerId: string
  matrixSet: string
  format: TileFormat
  zoom: number
  coordinate: Coordinate
  time?: string
}): string {
  const { layerId, matrixSet, format, zoom, coordinate, time = 'default' } = options
  const { row, col } = geographicTile(coordinate, zoom)
  return `${NASA_GIBS_BASE}/${layerId}/default/${time}/${matrixSet}/${zoom}/${row}/${col}.${format}`
}

/** GIBS WMTS projection trees exposed by the tile service. */
export type GibsProjection = 'epsg4326' | 'epsg3857'

/**
 * Leaflet-ready GIBS URL template (uses {z}/{y}/{x} tile tokens).
 *
 * EPSG:3857 templates target GIBS's GoogleMapsCompatible matrix sets and are
 * the correct choice for a Leaflet map, whose default CRS is Web Mercator.
 * EPSG:4326 templates remain available for geographic tile math and previews.
 */
export function buildGibsTileTemplate(options: {
  layerId: string
  matrixSet: string
  format: TileFormat
  time?: string
  projection?: GibsProjection
}): string {
  const {
    layerId,
    matrixSet,
    format,
    time = 'default',
    projection = 'epsg4326',
  } = options
  const base = projection === 'epsg3857' ? NASA_GIBS_3857_BASE : NASA_GIBS_BASE
  return `${base}/${layerId}/default/${time}/${matrixSet}/{z}/{y}/{x}.${format}`
}

/**
 * NASA Trek WMTS REST tile URL template.
 *
 * Template: {base}/{product}/1.0.0/default/default028mm/{z}/{row}/{col}.{ext}
 * The service is standard WMTS (origin 180°W / 90°N, TileRow increases south),
 * not TMS, so Leaflet must not flip the Y axis for these layers.
 */
export function buildTrekTileTemplate(options: {
  base: string
  layerId: string
  format: TileFormat
}): string {
  const { base, layerId, format } = options
  return `${base}/${layerId}/1.0.0/default/default028mm/{z}/{y}/{x}.${format}`
}

/** Concrete Trek tile URL for one coordinate (used for site thumbnails). */
export function buildTrekTileUrl(options: {
  base: string
  layerId: string
  format: TileFormat
  zoom: number
  coordinate: Coordinate
}): string {
  const { base, layerId, format, zoom, coordinate } = options
  const { row, col } = geographicTile(coordinate, zoom)
  return `${base}/${layerId}/1.0.0/default/default028mm/${zoom}/${row}/${col}.${format}`
}

/**
 * NASA Worldview deep link for an Earth coordinate.
 * Uses a padded bounding box so the site is visible at a useful scale.
 */
export function buildWorldviewUrl(
  coordinate: Coordinate,
  layers = 'MODIS_Terra_CorrectedReflectance_TrueColor',
  paddingDeg = 1.5,
): string {
  const bbox = paddedBoundingBox(coordinate, paddingDeg)
  return `https://worldview.earthdata.nasa.gov/?v=${bbox.west.toFixed(3)},${bbox.south.toFixed(3)},${bbox.east.toFixed(3)},${bbox.north.toFixed(3)}&l=${layers}`
}

/** NASA Earthdata Search deep link for a query and coordinate neighborhood. */
export function buildEarthdataSearchUrl(
  query: string,
  coordinate: Coordinate,
  paddingDeg = 1.5,
): string {
  const bbox = paddedBoundingBox(coordinate, paddingDeg)
  return `https://search.earthdata.nasa.gov/search?q=${encodeURIComponent(query)}&sb[0]=${bbox.west.toFixed(3)},${bbox.south.toFixed(3)},${bbox.east.toFixed(3)},${bbox.north.toFixed(3)}`
}

/** Bounding box around a coordinate, clamped to valid lat/lon ranges. */
export function paddedBoundingBox(
  coordinate: Coordinate,
  paddingDeg = 1.5,
): BoundingBox {
  return {
    west: Math.max(-180, coordinate.lon - paddingDeg),
    south: Math.max(-90, coordinate.lat - paddingDeg),
    east: Math.min(180, coordinate.lon + paddingDeg),
    north: Math.min(90, coordinate.lat + paddingDeg),
  }
}

/** GIBS ASTER shaded-relief tile centered on an Earth site (site thumbnail). */
export function earthPreviewImageUrl(coordinate: Coordinate, zoom = 5): string {
  return buildGibsTileUrl({
    layerId: 'ASTER_GDEM_Color_Shaded_Relief',
    matrixSet: '31.25m',
    format: 'jpeg',
    zoom,
    coordinate,
  })
}

/** LROC WAC tile centered on a lunar site (site thumbnail). */
export function moonPreviewImageUrl(coordinate: Coordinate, zoom = 4): string {
  return buildTrekTileUrl({
    base: 'https://trek.nasa.gov/tiles/Moon/EQ',
    layerId: 'LRO_WAC_Mosaic_Global_303ppd_v02',
    format: 'jpg',
    zoom,
    coordinate,
  })
}

/** Viking color mosaic tile centered on a Mars site (site thumbnail). */
export function marsPreviewImageUrl(coordinate: Coordinate, zoom = 4): string {
  return buildTrekTileUrl({
    base: 'https://trek.nasa.gov/tiles/Mars/EQ',
    layerId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    format: 'jpg',
    zoom,
    coordinate,
  })
}
