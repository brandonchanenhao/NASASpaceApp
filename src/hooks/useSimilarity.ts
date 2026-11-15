import { useMemo } from 'react'
import { getSite } from '../data/analogs_dataset'
import { buildPairing } from '../engine/ranker'
import type { AnalogPairing, DimensionWeights } from '../types'

/**
 * Memoized pairing for the comparison dashboard.
 *
 * The hook is intentionally a thin wrapper over `buildPairing`: all scoring,
 * breakdown and testbed logic stays in the engine so the dashboard can never
 * disagree with the maps or the configurator.
 */
export function useSimilarity(
  earthSiteId: string,
  targetSiteId: string,
  weights: DimensionWeights,
): AnalogPairing {
  return useMemo(
    () => buildPairing(getSite(earthSiteId), getSite(targetSiteId), weights),
    [earthSiteId, targetSiteId, weights],
  )
}
