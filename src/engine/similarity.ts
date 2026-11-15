import type { DimensionKey, DimensionWeights, FeatureVector } from '../types'
import { DIMENSION_KEYS } from '../utils/constants'

/** Clamp any numeric result into the closed interval [0, 1]. */
function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value <= 0) return 0
  if (value >= 1) return 1
  return value
}

/** Sum of squared weighted components, √Σ(wᵢ·xᵢ²), for one feature vector. */
function weightedMagnitude(vector: FeatureVector, weights: DimensionWeights): number {
  let total = 0
  for (const key of DIMENSION_KEYS) {
    const weight = weights[key]
    const component = vector[key]
    total += weight * component * component
  }
  return Math.sqrt(total)
}

/**
 * Weighted cosine similarity.
 *
 *     Σ(wᵢ·aᵢ·bᵢ)
 *  ─────────────────────────────
 *  √Σ(wᵢ·aᵢ²) · √Σ(wᵢ·bᵢ²)
 *
 * Because every normalized component is non-negative, the cosine lies in
 * [0, 1], where 1 means the two signatures point in the same direction
 * regardless of magnitude. A zero vector or an all-zero weight set returns 0
 * instead of producing NaN.
 */
export function cosineSimilarity(
  a: FeatureVector,
  b: FeatureVector,
  weights: DimensionWeights,
): number {
  let dot = 0
  for (const key of DIMENSION_KEYS) {
    dot += weights[key] * a[key] * b[key]
  }
  const denominator = weightedMagnitude(a, weights) * weightedMagnitude(b, weights)
  if (denominator === 0) return 0
  return clamp01(dot / denominator)
}

/**
 * Weighted Euclidean similarity.
 *
 *     1 − √(Σ wᵢ·(aᵢ − bᵢ)²) / √(Σ wᵢ)
 *
 * The distance is normalized by √(Σ wᵢ), the maximum possible distance when
 * every component spans the full [0, 1] range, so the score is bounded in
 * [0, 1] and independent of the absolute weight scale.
 */
export function euclideanSimilarity(
  a: FeatureVector,
  b: FeatureVector,
  weights: DimensionWeights,
): number {
  let weightedSquares = 0
  let weightTotal = 0
  for (const key of DIMENSION_KEYS) {
    const weight = weights[key]
    const difference = a[key] - b[key]
    weightedSquares += weight * difference * difference
    weightTotal += weight
  }
  if (weightTotal <= 0) return 0
  const distance = Math.sqrt(weightedSquares)
  const maximumDistance = Math.sqrt(weightTotal)
  return clamp01(1 - distance / maximumDistance)
}

/**
 * Combined similarity: γ·cosine + (1 − γ)·Euclidean.
 *
 * The default γ = 0.6 favors profile shape (cosine) while retaining a penalty
 * for magnitude gaps, which is appropriate for normalized habitat indices.
 */
export function combinedSimilarity(
  a: FeatureVector,
  b: FeatureVector,
  weights: DimensionWeights,
  gamma = 0.6,
): number {
  const boundedGamma = clamp01(gamma)
  const shape = cosineSimilarity(a, b, weights)
  const proximity = euclideanSimilarity(a, b, weights)
  return clamp01(boundedGamma * shape + (1 - boundedGamma) * proximity)
}

/**
 * Per-dimension absolute deltas |aᵢ − bᵢ| for the delta table and radar chart.
 * Values stay in [0, 1] because they are differences of normalized indices.
 */
export function dimensionDeltas(a: FeatureVector, b: FeatureVector): FeatureVector {
  return {
    geology: Math.abs(a.geology - b.geology),
    terrain: Math.abs(a.terrain - b.terrain),
    thermal: Math.abs(a.thermal - b.thermal),
    volatiles: Math.abs(a.volatiles - b.volatiles),
    dust: Math.abs(a.dust - b.dust),
    subsurface: Math.abs(a.subsurface - b.subsurface),
    astrobiology: Math.abs(a.astrobiology - b.astrobiology),
  }
}

/** Largest per-dimension delta and the dimension that produced it. */
export function dominantGap(
  deltas: FeatureVector,
): { key: DimensionKey; delta: number } {
  let key: DimensionKey = DIMENSION_KEYS[0]
  let delta = deltas[key]
  for (const candidate of DIMENSION_KEYS) {
    if (deltas[candidate] > delta) {
      key = candidate
      delta = deltas[candidate]
    }
  }
  return { key, delta }
}
