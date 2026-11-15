import type { CelestialBody, TileLayer } from '../types'
import {
  MARS_TREK_BASE,
  MOON_TREK_BASE,
} from '../utils/constants'
import { buildGibsTileTemplate, buildTrekTileTemplate } from '../services/gibsTiles'

/**
 * Imagery dates used for temporal GIBS layers. Each date is the most recent
 * fully populated daily mosaic verified against the live EPSG:3857 service
 * (2026-11-14 check); fixed dates keep the explorer reproducible.
 */
export const EARTH_IMAGERY_DATE = '2026-11-13'
export const EARTH_VIIRS_DATE = '2026-11-02'
export const EARTH_THERMAL_DATE = '2026-11-12'
export const EARTH_AOD_DATE = '2026-11-12'
export const EARTH_SOIL_MOISTURE_DATE = '2026-11-10'

/**
 * NASA GIBS Earth layers.
 *
 * URL templates resolve to the EPSG:3857 (Web Mercator) tree, whose
 * GoogleMapsCompatible matrix sets align with Leaflet's native CRS:
 * MODIS/VIIRS true color at Level9, ASTER shaded relief at Level12,
 * LST/AOD at Level7 and SMAP soil moisture at Level6. `maxZoom` records the
 * native matrix level so the tile layer upsamples rather than requesting
 * missing tiles above that level.
 */
export const EARTH_LAYERS: readonly TileLayer[] = [
  {
    id: 'earth-modis-truecolor',
    name: 'MODIS Terra Corrected Reflectance (True Color)',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      matrixSet: 'GoogleMapsCompatible_Level9',
      format: 'jpeg',
      time: EARTH_IMAGERY_DATE,
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / Worldview',
    maxZoom: 9,
    format: 'jpg',
    tms: false,
    category: 'basemap',
  },
  {
    id: 'earth-viirs-truecolor',
    name: 'VIIRS SNPP Corrected Reflectance (True Color)',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
      matrixSet: 'GoogleMapsCompatible_Level9',
      format: 'jpeg',
      time: EARTH_VIIRS_DATE,
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / Worldview',
    maxZoom: 9,
    format: 'jpg',
    tms: false,
    category: 'basemap',
  },
  {
    id: 'earth-aster-relief',
    name: 'ASTER GDEM Color Shaded Relief',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'ASTER_GDEM_Color_Shaded_Relief',
      matrixSet: 'GoogleMapsCompatible_Level12',
      format: 'jpeg',
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / ASTER GDEM',
    maxZoom: 12,
    format: 'jpg',
    tms: false,
    category: 'elevation',
  },
  {
    id: 'earth-modis-lst-day',
    name: 'MODIS Terra Land Surface Temperature (Day)',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'MODIS_Terra_Land_Surface_Temp_Day',
      matrixSet: 'GoogleMapsCompatible_Level7',
      format: 'png',
      time: EARTH_THERMAL_DATE,
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / MODIS LST',
    maxZoom: 7,
    format: 'png',
    tms: false,
    category: 'thermal',
  },
  {
    id: 'earth-modis-lst-night',
    name: 'MODIS Terra Land Surface Temperature (Night)',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'MODIS_Terra_Land_Surface_Temp_Night',
      matrixSet: 'GoogleMapsCompatible_Level7',
      format: 'png',
      time: EARTH_THERMAL_DATE,
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / MODIS LST',
    maxZoom: 7,
    format: 'png',
    tms: false,
    category: 'thermal',
  },
  {
    id: 'earth-modis-aod',
    name: 'MODIS MAIAC Aerosol Optical Depth',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth',
      matrixSet: 'GoogleMapsCompatible_Level7',
      format: 'png',
      time: EARTH_AOD_DATE,
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / MODIS MAIAC',
    maxZoom: 7,
    format: 'png',
    tms: false,
    category: 'other',
  },
  {
    id: 'earth-smap-moisture',
    name: 'SMAP L4 Root-Zone Soil Moisture',
    body: 'earth',
    urlTemplate: buildGibsTileTemplate({
      layerId: 'SMAP_L4_Analyzed_Root_Zone_Soil_Moisture',
      matrixSet: 'GoogleMapsCompatible_Level6',
      format: 'png',
      time: EARTH_SOIL_MOISTURE_DATE,
      projection: 'epsg3857',
    }),
    attribution: 'GIBS / SMAP',
    maxZoom: 6,
    format: 'png',
    tms: false,
    category: 'other',
  },
]

/**
 * NASA Moon Trek layers (verified WMTS products).
 * All Trek services use a standard north-west tile origin, so `tms` is false.
 */
export const MOON_LAYERS: readonly TileLayer[] = [
  {
    id: 'moon-lroc-wac',
    name: 'LROC WAC Global Morphological Mosaic (303 ppd)',
    body: 'moon',
    urlTemplate: buildTrekTileTemplate({
      base: MOON_TREK_BASE,
      layerId: 'LRO_WAC_Mosaic_Global_303ppd_v02',
      format: 'jpg',
    }),
    attribution: 'LRO / Moon Trek',
    maxZoom: 8,
    format: 'jpg',
    tms: false,
    category: 'basemap',
  },
  {
    id: 'moon-lola-elevation',
    name: 'LOLA Elevation Color Hillshade (128 ppd)',
    body: 'moon',
    urlTemplate: buildTrekTileTemplate({
      base: MOON_TREK_BASE,
      layerId: 'LRO_LOLA_ClrShade_Global_128ppd_v04',
      format: 'png',
    }),
    attribution: 'LRO / Moon Trek',
    maxZoom: 5,
    format: 'png',
    tms: false,
    category: 'elevation',
  },
  {
    id: 'moon-diviner-rock-abundance',
    name: 'Diviner Rock Abundance',
    body: 'moon',
    urlTemplate: buildTrekTileTemplate({
      base: MOON_TREK_BASE,
      layerId: 'Diviner_avg_RockAbundance',
      format: 'png',
    }),
    attribution: 'LRO Diviner / Moon Trek',
    maxZoom: 6,
    format: 'png',
    tms: false,
    category: 'composition',
  },
  {
    id: 'moon-diviner-temperature',
    name: 'Diviner Rock-Free Surface Temperature',
    body: 'moon',
    urlTemplate: buildTrekTileTemplate({
      base: MOON_TREK_BASE,
      layerId: 'LRO_DIVINER_ClrRockFreeSurfaceTemp_Global_128ppd',
      format: 'png',
    }),
    attribution: 'LRO Diviner / Moon Trek',
    maxZoom: 6,
    format: 'png',
    tms: false,
    category: 'thermal',
  },
]

/**
 * Mars Trek layers (verified WMTS products).
 * TES mosaics are low-resolution by construction (levels 0–1 for thermal
 * inertia, 0–2 for the dust index), which is reflected in maxZoom.
 */
export const MARS_LAYERS: readonly TileLayer[] = [
  {
    id: 'mars-viking-color',
    name: 'Viking MDIM 2.1 Color Mosaic (232 m)',
    body: 'mars',
    urlTemplate: buildTrekTileTemplate({
      base: MARS_TREK_BASE,
      layerId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
      format: 'jpg',
    }),
    attribution: 'Mars Trek / Viking',
    maxZoom: 7,
    format: 'jpg',
    tms: false,
    category: 'basemap',
  },
  {
    id: 'mars-mola-elevation',
    name: 'MOLA Elevation Color Hillshade (463 m)',
    body: 'mars',
    urlTemplate: buildTrekTileTemplate({
      base: MARS_TREK_BASE,
      layerId: 'Mars_MGS_MOLA_ClrShade_merge_global_463m',
      format: 'jpg',
    }),
    attribution: 'MGS MOLA / Mars Trek',
    maxZoom: 7,
    format: 'jpg',
    tms: false,
    category: 'elevation',
  },
  {
    id: 'mars-tes-thermal-inertia',
    name: 'TES Global Thermal Inertia',
    body: 'mars',
    urlTemplate: buildTrekTileTemplate({
      base: MARS_TREK_BASE,
      layerId: 'TES_Thermal_Inertia',
      format: 'png',
    }),
    attribution: 'MGS TES / Mars Trek',
    maxZoom: 1,
    format: 'png',
    tms: false,
    category: 'thermal',
  },
  {
    id: 'mars-tes-dust-cover',
    name: 'TES Global Dust Cover Index',
    body: 'mars',
    urlTemplate: buildTrekTileTemplate({
      base: MARS_TREK_BASE,
      layerId: 'tes_ruffdust',
      format: 'png',
    }),
    attribution: 'MGS TES / Mars Trek',
    maxZoom: 2,
    format: 'png',
    tms: false,
    category: 'composition',
  },
]

/** All tile layers across the three bodies. */
export const TILE_LAYERS: readonly TileLayer[] = [
  ...EARTH_LAYERS,
  ...MOON_LAYERS,
  ...MARS_LAYERS,
]

/** Default basemap per body, used when a map first mounts. */
export const DEFAULT_LAYER_BY_BODY: Record<CelestialBody, string> = {
  earth: 'earth-modis-truecolor',
  moon: 'moon-lroc-wac',
  mars: 'mars-viking-color',
}

/** Layers for one body, in catalog order. */
export function layersForBody(body: CelestialBody): readonly TileLayer[] {
  return TILE_LAYERS.filter((layer) => layer.body === body)
}
