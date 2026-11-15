import * as L from 'leaflet'

/**
 * Equirectangular CRS for NASA Trek WMTS tiles.
 *
 * The Trek services publish a standard 2:1 geographic tile matrix: at level 0
 * the world is 2 columns × 1 row of 256 px tiles, with the origin at 180° W /
 * 90° N and TileRow increasing southward. Leaflet's stock `CRS.Simple` maps
 * y upward, so a custom transformation is required.
 *
 * At zoom z (scale 2^z) the pixel mapping is:
 *   x = 2^z · (256 · lon / 180 + 256)   → 0 … 2^(z+1) · 256
 *   y = 2^z · (128 − 256 · lat / 180)   → 0 … 2^z · 256
 *
 * Dividing by the 256 px tile size yields TileCol = (lon + 180) / 360 · 2^(z+1)
 * and TileRow = (90 − lat) / 180 · 2^z, exactly the WMTS indices requested by
 * the Trek tile URL. Because the row axis already increases southward, the
 * tile layers must use `tms: false`.
 */
export const PLANETARY_CRS = {
  ...L.CRS.Simple,
  transformation: new L.Transformation(512 / 360, 256, -256 / 180, 128),
  infinite: false,
}

/** Planetographic extent shared by the Moon and Mars image mosaics. */
export const PLANETARY_MAP_BOUNDS: L.LatLngBoundsExpression = [
  [-90, -180],
  [90, 180],
]
