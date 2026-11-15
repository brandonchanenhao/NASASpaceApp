import { readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { targetSites } from '../src/data/analogs_dataset'
import {
  cellCoordinate,
  decodeGrid,
  isWellKnown,
  makeCountryFilter,
  scoreGrid,
  topCandidates,
  type EarthGridPayload,
} from '../src/engine/hiddenAnalogs'

const payload = JSON.parse(
  readFileSync('public/data/earth_grid.json', 'utf-8'),
) as EarthGridPayload
const cells = decodeGrid(payload)
const excludeCountry = makeCountryFilter(payload.names)

function cellAt(lat: number, lon: number) {
  const id = Math.floor(90 - lat) * 360 + Math.floor(lon + 180)
  const cell = cells.find((entry) => entry.id === id)
  if (!cell) throw new Error(`no land cell at ${lat},${lon}`)
  return cell
}

describe('hidden analog engine', () => {
  it('maps cell ids back to cell-centre coordinates', () => {
    expect(cellCoordinate(0)).toEqual({ lat: 89.5, lon: -179.5 })
    expect(cellCoordinate(360 * 180 - 1)).toEqual({ lat: -89.5, lon: 179.5 })
  })

  it('decodes NASA measurements into sane traits', () => {
    const atacama = cellAt(-24.5, -69.5)
    const amazon = cellAt(-3.5, -60.5)
    expect(atacama.traits.barren).toBeGreaterThan(0.7)
    expect(atacama.traits.arid).toBeGreaterThan(0.9)
    expect(amazon.traits.barren).toBeLessThan(0.2)
    expect(amazon.traits.arid).toBe(0)
  })

  it('scores a hyper-arid desert above a rainforest for every Mars target', () => {
    const mars = targetSites.filter((site) => site.body === 'mars')
    for (const site of mars) {
      const scores = scoreGrid([cellAt(-24.5, -69.5), cellAt(-3.5, -60.5)], site)
      expect(scores[0].score).toBeGreaterThan(scores[1].score)
    }
  })

  it('returns distinct, not-famous candidates', () => {
    const scores = scoreGrid(cells, targetSites[0])
    const top = topCandidates(scores, { count: 8, exclude: excludeCountry })
    expect(top.length).toBe(8)
    for (const entry of top) {
      expect(isWellKnown(entry.cell.coordinate)).toBe(false)
      expect(payload.names[String(entry.cell.id)] ?? '').not.toMatch(/China$/)
      expect(entry.score).toBeGreaterThan(0)
      expect(entry.score).toBeLessThanOrEqual(1)
    }
  })

  // `npm run candidates` writes the cell list the Python builder geocodes.
  it('lists candidate cells for place-name lookup', () => {
    const ids = new Set<number>()
    for (const site of targetSites) {
      const scores = scoreGrid(cells, site)
      for (const hiddenOnly of [true, false]) {
        for (const entry of topCandidates(scores, { count: 8, hiddenOnly, exclude: excludeCountry })) {
          ids.add(entry.cell.id)
        }
      }
    }
    expect(ids.size).toBeGreaterThan(8)
    if (process.env.npm_lifecycle_event === 'candidates') {
      writeFileSync('scripts/.candidates.json', JSON.stringify([...ids]))
    }
  })
})
