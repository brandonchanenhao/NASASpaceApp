import { useCallback, useMemo, useState } from 'react'
import {
  earthSites,
  getSite,
  marsSites,
  moonSites,
} from '../data/analogs_dataset'
import { DEFAULT_LAYER_BY_BODY, layersForBody } from '../data/gibs_layers'
import { buildPairing, rankAnalogs, topPairing } from '../engine/ranker'
import type {
  AnalogPairing,
  AnalogSite,
  DimensionWeights,
  TargetBody,
} from '../types'

/** Baseline pair shown when the dual-map view first mounts. */
const INITIAL_EARTH_ID = 'kilbourne-hole'
const INITIAL_BODY: TargetBody = 'moon'

function sitesForBody(body: TargetBody): readonly AnalogSite[] {
  return body === 'moon' ? moonSites : marsSites
}

/**
 * Best target for an Earth analog on one body. Falls back to the first
 * curated target so the controller can never return an undefined site.
 */
function bestTarget(
  earthSite: AnalogSite,
  body: TargetBody,
  weights: DimensionWeights,
): AnalogSite {
  const ranking = rankAnalogs(earthSite, sitesForBody(body), weights)
  return topPairing(ranking)?.targetSite ?? sitesForBody(body)[0]
}

/**
 * Earth analog with the highest similarity to a Moon/Mars target.
 * This is the inverse selection used when a marker is clicked on the
 * planetary map.
 */
function bestEarth(
  targetSite: AnalogSite,
  weights: DimensionWeights,
): AnalogSite {
  const ranking = earthSites
    .map((earthSite) => buildPairing(earthSite, targetSite, weights))
    .sort((a, b) => b.similarityScore - a.similarityScore)
  return ranking[0]?.earthSite ?? earthSites[0]
}

/** Shared state and actions for the side-by-side analog maps. */
export interface MapSyncController {
  activeBody: TargetBody
  selectedEarthId: string
  selectedTargetId: string
  activeEarthLayer: string
  activeTargetLayer: string
  selectedEarth: AnalogSite
  selectedTarget: AnalogSite
  pairing: AnalogPairing
  /** Best-first target ranking for the selected Earth analog and body. */
  rankings: readonly AnalogPairing[]
  setActiveBody: (body: TargetBody) => void
  selectEarthSite: (siteId: string) => void
  selectTargetSite: (siteId: string) => void
  /** Selects both sides of a known pair without re-deriving either side. */
  selectPairing: (earthSiteId: string, targetSiteId: string) => void
  setActiveEarthLayer: (layerId: string) => void
  setActiveTargetLayer: (layerId: string) => void
}

/**
 * Coordinates selection between the Earth and Moon/Mars maps.
 *
 * Selecting an Earth analog resolves its best target on the active body;
 * selecting a target resolves its best Earth analog and switches the right
 * pane when the target belongs to the other body. Both maps therefore always
 * highlight one complete, scored pairing.
 */
export function useMapSync(weights: DimensionWeights): MapSyncController {
  const [selectedEarthId, setSelectedEarthId] = useState(INITIAL_EARTH_ID)
  const [activeBody, setActiveBodyState] = useState<TargetBody>(INITIAL_BODY)
  const [selectedTargetId, setSelectedTargetId] = useState(() =>
    bestTarget(getSite(INITIAL_EARTH_ID), INITIAL_BODY, weights).id,
  )
  const [activeEarthLayer, setActiveEarthLayerState] = useState(
    DEFAULT_LAYER_BY_BODY.earth,
  )
  const [activeTargetLayer, setActiveTargetLayerState] = useState(
    DEFAULT_LAYER_BY_BODY[INITIAL_BODY],
  )

  const selectedEarth = getSite(selectedEarthId)
  const selectedTarget = getSite(selectedTargetId)

  const pairing = useMemo(
    () => buildPairing(selectedEarth, selectedTarget, weights),
    [selectedEarth, selectedTarget, weights],
  )

  const rankings = useMemo(
    () => rankAnalogs(selectedEarth, sitesForBody(activeBody), weights),
    [selectedEarth, activeBody, weights],
  )

  const selectEarthSite = useCallback(
    (siteId: string) => {
      const site = getSite(siteId)
      if (site.body !== 'earth') return
      setSelectedEarthId(siteId)
      setSelectedTargetId(bestTarget(site, activeBody, weights).id)
    },
    [activeBody, weights],
  )

  const selectTargetSite = useCallback(
    (siteId: string) => {
      const site = getSite(siteId)
      if (site.body === 'earth') return
      setActiveBodyState(site.body)
      setActiveTargetLayerState(DEFAULT_LAYER_BY_BODY[site.body])
      setSelectedTargetId(siteId)
      setSelectedEarthId(bestEarth(site, weights).id)
    },
    [weights],
  )

  const setActiveBody = useCallback(
    (body: TargetBody) => {
      setActiveBodyState(body)
      setActiveTargetLayerState(DEFAULT_LAYER_BY_BODY[body])
      setSelectedTargetId(
        bestTarget(getSite(selectedEarthId), body, weights).id,
      )
    },
    [selectedEarthId, weights],
  )

  /**
   * Applies an explicitly chosen pairing (from the configurator ranking).
   * Unlike the map handlers this never re-derives the opposite side, so the
   * ranking row's exact Earth → target combination is preserved.
   */
  const selectPairing = useCallback(
    (earthSiteId: string, targetSiteId: string) => {
      const earthSite = getSite(earthSiteId)
      const targetSite = getSite(targetSiteId)
      if (earthSite.body !== 'earth' || targetSite.body === 'earth') return
      setSelectedEarthId(earthSiteId)
      setSelectedTargetId(targetSiteId)
      setActiveBodyState(targetSite.body)
      setActiveTargetLayerState(DEFAULT_LAYER_BY_BODY[targetSite.body])
    },
    [],
  )

  const setActiveEarthLayer = useCallback((layerId: string) => {
    if (layersForBody('earth').some((layer) => layer.id === layerId)) {
      setActiveEarthLayerState(layerId)
    }
  }, [])

  const setActiveTargetLayer = useCallback(
    (layerId: string) => {
      if (layersForBody(activeBody).some((layer) => layer.id === layerId)) {
        setActiveTargetLayerState(layerId)
      }
    },
    [activeBody],
  )

  return {
    activeBody,
    selectedEarthId,
    selectedTargetId,
    activeEarthLayer,
    activeTargetLayer,
    selectedEarth,
    selectedTarget,
    pairing,
    rankings,
    setActiveBody,
    selectEarthSite,
    selectTargetSite,
    selectPairing,
    setActiveEarthLayer,
    setActiveTargetLayer,
  }
}
