import type { AnalogPairing, AnalogSite, DimensionWeights } from '../types'
import { getSiteBreakdowns, getTestbedApplications } from './breakdown'
import {
  combinedSimilarity,
  cosineSimilarity,
  dimensionDeltas,
  euclideanSimilarity,
} from './similarity'

/**
 * Build one fully-scored Earth → target pairing.
 *
 * Score fields are computed from the normalized feature vectors with the
 * planner's weights; breakdowns and testbeds are attached at construction so a
 * pairing is always a complete, renderable record.
 */
export function buildPairing(
  earthSite: AnalogSite,
  targetSite: AnalogSite,
  weights: DimensionWeights,
): AnalogPairing {
  return {
    id: `${earthSite.id}__${targetSite.id}`,
    earthSite,
    targetSite,
    similarityScore: combinedSimilarity(
      earthSite.featureVector,
      targetSite.featureVector,
      weights,
    ),
    cosineSimilarity: cosineSimilarity(
      earthSite.featureVector,
      targetSite.featureVector,
      weights,
    ),
    euclideanSimilarity: euclideanSimilarity(
      earthSite.featureVector,
      targetSite.featureVector,
      weights,
    ),
    dimensionDeltas: dimensionDeltas(
      earthSite.featureVector,
      targetSite.featureVector,
    ),
    breakdowns: getSiteBreakdowns(earthSite, targetSite),
    testbedApplications: getTestbedApplications(earthSite, targetSite),
  }
}

/** Descending similarity; ties broken by pairing id for deterministic output. */
export function comparePairings(a: AnalogPairing, b: AnalogPairing): number {
  if (b.similarityScore !== a.similarityScore) {
    return b.similarityScore - a.similarityScore
  }
  return a.id.localeCompare(b.id)
}

/**
 * Rank every candidate target for one Earth analog.
 * Returns a new array sorted best-first; the input array is untouched.
 */
export function rankAnalogs(
  earthSite: AnalogSite,
  targets: readonly AnalogSite[],
  weights: DimensionWeights,
): AnalogPairing[] {
  return targets
    .map((target) => buildPairing(earthSite, target, weights))
    .sort(comparePairings)
}

/**
 * Score the complete cross product of Earth analogs and Moon/Mars targets.
 * With the curated dataset this is 6 × 10 = 60 pairings, sorted best-first.
 */
export function computeFullRankingMatrix(
  earthSites: readonly AnalogSite[],
  targetSites: readonly AnalogSite[],
  weights: DimensionWeights,
): AnalogPairing[] {
  const pairings: AnalogPairing[] = []
  for (const earthSite of earthSites) {
    for (const targetSite of targetSites) {
      pairings.push(buildPairing(earthSite, targetSite, weights))
    }
  }
  return pairings.sort(comparePairings)
}

/** Highest-scoring pairing, or null for an empty list. */
export function topPairing(pairings: readonly AnalogPairing[]): AnalogPairing | null {
  if (pairings.length === 0) return null
  return pairings.reduce((best, candidate) =>
    comparePairings(candidate, best) < 0 ? candidate : best,
  )
}
