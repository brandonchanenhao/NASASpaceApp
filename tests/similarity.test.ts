import { describe, expect, it } from 'vitest'
import type { DimensionWeights, FeatureVector } from '../src/types'
import { DEFAULT_WEIGHTS } from '../src/utils/constants'
import {
  combinedSimilarity,
  cosineSimilarity,
  dimensionDeltas,
  euclideanSimilarity,
} from '../src/engine/similarity'

const ZERO_VECTOR: FeatureVector = {
  geology: 0,
  terrain: 0,
  thermal: 0,
  volatiles: 0,
  dust: 0,
  subsurface: 0,
  astrobiology: 0,
}

function vector(overrides: Partial<FeatureVector>): FeatureVector {
  return { ...ZERO_VECTOR, ...overrides }
}

const WEIGHTS: DimensionWeights = { ...DEFAULT_WEIGHTS }

describe('cosineSimilarity', () => {
  it('returns 1 for identical non-zero vectors', () => {
    const a = vector({
      geology: 0.8,
      terrain: 0.4,
      thermal: 0.6,
      volatiles: 0.2,
      dust: 0.5,
      subsurface: 0.3,
      astrobiology: 0.7,
    })
    expect(cosineSimilarity(a, a, WEIGHTS)).toBeCloseTo(1, 12)
  })

  it('returns 0 for orthogonal vectors', () => {
    const a = vector({ geology: 1 })
    const b = vector({ terrain: 1 })
    expect(cosineSimilarity(a, b, WEIGHTS)).toBeCloseTo(0, 12)
  })

  it('is symmetric in its two vector arguments', () => {
    const a = vector({ geology: 0.9, volatiles: 0.3 })
    const b = vector({ geology: 0.2, volatiles: 0.8 })
    expect(cosineSimilarity(a, b, WEIGHTS)).toBeCloseTo(
      cosineSimilarity(b, a, WEIGHTS),
      12,
    )
  })
})

describe('euclideanSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const a = vector({ geology: 0.5, dust: 0.25, astrobiology: 0.75 })
    expect(euclideanSimilarity(a, a, WEIGHTS)).toBeCloseTo(1, 12)
  })

  it('returns 0 for maximally separated vectors', () => {
    const ones = vector({
      geology: 1,
      terrain: 1,
      thermal: 1,
      volatiles: 1,
      dust: 1,
      subsurface: 1,
      astrobiology: 1,
    })
    expect(euclideanSimilarity(ones, ZERO_VECTOR, WEIGHTS)).toBeCloseTo(0, 12)
  })

  it('penalizes a weighted dimension proportional to the weight', () => {
    const a = vector({ geology: 0.8 })
    const b = vector({ geology: 0.2 })
    const geologyOnly: DimensionWeights = {
      ...DEFAULT_WEIGHTS,
      geology: 2,
      terrain: 0,
      thermal: 0,
      volatiles: 0,
      dust: 0,
      subsurface: 0,
      astrobiology: 0,
    }
    // 1 − √(2·0.6²)/√2 = 1 − 0.6 = 0.4
    expect(euclideanSimilarity(a, b, geologyOnly)).toBeCloseTo(0.4, 12)

    const terrainOnly: DimensionWeights = {
      ...geologyOnly,
      geology: 0,
      terrain: 2,
    }
    // The vectors differ only in geology, so a terrain-only weighting is blind.
    expect(euclideanSimilarity(a, b, terrainOnly)).toBeCloseTo(1, 12)
  })
})

describe('combinedSimilarity', () => {
  it('stays inside [0, 1] across mixed and extreme vector pairs', () => {
    const pairs: [FeatureVector, FeatureVector][] = [
      [ZERO_VECTOR, ZERO_VECTOR],
      [vector({ geology: 1 }), vector({ geology: 1 })],
      [vector({ geology: 1 }), ZERO_VECTOR],
      [
        vector({ geology: 0.9, volatiles: 0.1, dust: 0.6 }),
        vector({ geology: 0.2, volatiles: 0.8, dust: 0.05 }),
      ],
    ]
    for (const [a, b] of pairs) {
      const score = combinedSimilarity(a, b, WEIGHTS)
      expect(Number.isFinite(score)).toBe(true)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    }
  })

  it('equals 1 for identical vectors at any gamma', () => {
    const a = vector({ thermal: 0.65, subsurface: 0.35 })
    expect(combinedSimilarity(a, a, WEIGHTS, 0.6)).toBeCloseTo(1, 12)
    expect(combinedSimilarity(a, a, WEIGHTS, 0.0)).toBeCloseTo(1, 12)
    expect(combinedSimilarity(a, a, WEIGHTS, 1.0)).toBeCloseTo(1, 12)
  })
})

describe('dimensionDeltas', () => {
  it('returns all zeros for identical vectors', () => {
    const a = vector({
      geology: 0.4,
      terrain: 0.6,
      thermal: 0.2,
      volatiles: 0.8,
      dust: 0.1,
      subsurface: 0.3,
      astrobiology: 0.5,
    })
    const deltas = dimensionDeltas(a, a)
    for (const value of Object.values(deltas)) {
      expect(value).toBe(0)
    }
  })

  it('returns absolute per-dimension differences', () => {
    const a = vector({ geology: 0.8, dust: 0.1 })
    const b = vector({ geology: 0.3, dust: 0.9 })
    const deltas = dimensionDeltas(a, b)
    expect(deltas.geology).toBeCloseTo(0.5, 12)
    expect(deltas.dust).toBeCloseTo(0.8, 12)
    expect(deltas.terrain).toBe(0)
  })
})
