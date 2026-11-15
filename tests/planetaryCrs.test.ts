// @vitest-environment jsdom

import { latLng } from 'leaflet'
import { describe, expect, it } from 'vitest'
import { PLANETARY_CRS } from '../src/components/maps/planetaryCrs'
import { marsSites, moonSites } from '../src/data/analogs_dataset'
import { geographicTile } from '../src/services/gibsTiles'

/**
 * The Trek WMTS trees use a 2×1 geographic tile matrix. Leaflet derives tile
 * indices from `CRS.latLngToPoint`, so this regression test proves the custom
 * transformation lands on the same TileCol/TileRow as the WMTS service.
 */
describe('PLANETARY_CRS', () => {
  it('projects curated sites onto the same tile indices as the WMTS matrix', () => {
    for (const site of [...moonSites, ...marsSites]) {
      for (const zoom of [0, 1, 2, 4]) {
        const point = PLANETARY_CRS.latLngToPoint(
          latLng(site.coordinate.lat, site.coordinate.lon),
          zoom,
        )
        const actual = {
          col: Math.floor(point.x / 256),
          row: Math.floor(point.y / 256),
        }
        const expected = geographicTile(site.coordinate, zoom)
        expect(actual).toEqual({ col: expected.col, row: expected.row })
      }
    }
  })

  it('maps the planetographic corners to a 2:1 world at level zero', () => {
    const northWest = PLANETARY_CRS.latLngToPoint(latLng(90, -180), 0)
    const southEast = PLANETARY_CRS.latLngToPoint(latLng(-90, 180), 0)

    expect(northWest.x).toBeCloseTo(0)
    expect(northWest.y).toBeCloseTo(0)
    expect(southEast.x).toBeCloseTo(512)
    expect(southEast.y).toBeCloseTo(256)
  })
})
