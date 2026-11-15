import { describe, expect, it } from 'vitest'
import type { RawParameters } from '../src/types'
import { allSites } from '../src/data/analogs_dataset'
import {
  computeFeatureVector,
  normalizeParameter,
  normalizeValue,
} from '../src/engine/normalize'

const BASE_RAW: RawParameters = {
  primaryMinerals: ['olivine', 'plagioclase'],
  rockType: 'Basaltic tephra',
  mineralDiversityIndex: 0.5,
  alterationState: 0.5,
  meanSlopeDeg: 10,
  surfaceRoughnessRMS: 20,
  rockAbundancePct: 20,
  elevationM: 1000,
  thermalInertia: 300,
  diurnalDeltaTK: 50,
  peakSurfaceTempK: 300,
  minSurfaceTempK: 250,
  annualIlluminationPct: 60,
  waterIcePresence: 0.3,
  depthToIceM: 5,
  permafrostExtent: 0.2,
  isruPotentialIndex: 0.4,
  dustCoverIndex: 0.3,
  aerosolOpticalDepth: 0.2,
  aeolianActivityIndex: 0.3,
  caveLavaTubePresence: 0.1,
  estimatedTubeDiameterM: 0,
  roofThicknessM: 0,
  radiationShieldingFactor: 0,
  extremophilePresence: 0.2,
  biosignaturePreservation: 0.3,
  waterActivity: 0.2,
  uvFluxRelative: 1.2,
}

function withOverrides(overrides: Partial<RawParameters>): RawParameters {
  return { ...BASE_RAW, ...overrides }
}

describe('normalizeValue', () => {
  it('maps the physical bounds to 0 and 1', () => {
    expect(normalizeValue(0, 0, 10)).toBe(0)
    expect(normalizeValue(10, 0, 10)).toBe(1)
  })

  it('clamps values outside the physical range into [0, 1]', () => {
    expect(normalizeValue(-25, 0, 10)).toBe(0)
    expect(normalizeValue(999, 0, 10)).toBe(1)
  })

  it('normalizes a mid-range value exactly', () => {
    expect(normalizeValue(5, 0, 10)).toBe(0.5)
    expect(normalizeValue(2.5, 0, 10)).toBe(0.25)
    expect(normalizeValue(75, 50, 100)).toBe(0.5)
  })

  it('returns 0 for non-finite input and degenerate ranges', () => {
    expect(normalizeValue(Number.NaN, 0, 10)).toBe(0)
    expect(normalizeValue(5, 10, 10)).toBe(0)
    expect(normalizeValue(5, 10, 0)).toBe(0)
  })
})

describe('normalizeParameter', () => {
  it('uses the declared physical bounds from PARAMETER_BOUNDS', () => {
    // meanSlopeDeg is bounded 0–45°.
    expect(normalizeParameter(0, 'meanSlopeDeg')).toBe(0)
    expect(normalizeParameter(45, 'meanSlopeDeg')).toBe(1)
    expect(normalizeParameter(22.5, 'meanSlopeDeg')).toBe(0.5)
  })

  it('clamps instrument values that exceed the published bounds', () => {
    // thermalInertia is bounded 10–2500 tiu.
    expect(normalizeParameter(5, 'thermalInertia')).toBe(0)
    expect(normalizeParameter(9000, 'thermalInertia')).toBe(1)
  })
})

describe('computeFeatureVector', () => {
  it('produces seven components, each inside [0, 1], for every curated site', () => {
    expect(allSites).toHaveLength(16)
    for (const site of allSites) {
      const components = Object.values(site.featureVector)
      expect(components).toHaveLength(7)
      for (const value of components) {
        expect(Number.isFinite(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
      }
    }
  })

  it('treats Infinity depthToIceM as inaccessible ice at the 100 m cap', () => {
    const shallow = computeFeatureVector(withOverrides({ depthToIceM: 0 }))
    const noIce = computeFeatureVector(withOverrides({ depthToIceM: Infinity }))

    // Shallow ice must score higher than an inaccessible ice column.
    expect(shallow.volatiles).toBeGreaterThan(noIce.volatiles)

    // With depth 0 the inverted term is 1: mean(0.3, 1.0, 0.2, 0.4) = 0.475.
    expect(shallow.volatiles).toBeCloseTo(0.475, 6)
    // Infinity maps to the 100 m cap, so the inverted term is 0:
    // mean(0.3, 0.0, 0.2, 0.4) = 0.225.
    expect(noIce.volatiles).toBeCloseTo(0.225, 6)
  })

  it('inverts UV flux so a lower dose yields a higher astrobiology score', () => {
    const lowUv = computeFeatureVector(withOverrides({ uvFluxRelative: 0 }))
    const highUv = computeFeatureVector(withOverrides({ uvFluxRelative: 5 }))
    expect(lowUv.astrobiology).toBeGreaterThan(highUv.astrobiology)
    // UV 0 leaves the full inverted term: mean(0.2, 0.3, 0.2, 1.0) = 0.425.
    expect(lowUv.astrobiology).toBeCloseTo(0.425, 6)
    // UV 5 zeroes it: mean(0.2, 0.3, 0.2, 0.0) = 0.175.
    expect(highUv.astrobiology).toBeCloseTo(0.175, 6)
  })
})
