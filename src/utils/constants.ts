import type {
  CelestialBody,
  DimensionKey,
  DimensionMeta,
  DimensionWeights,
  WeightPreset,
} from '../types'

/**
 * Canonical order of the seven similarity dimensions. Every engine, chart and
 * weight slider iterates this array so ordering can never drift between views.
 */
export const DIMENSION_KEYS: readonly DimensionKey[] = [
  'geology',
  'terrain',
  'thermal',
  'volatiles',
  'dust',
  'subsurface',
  'astrobiology',
]

/**
 * Display metadata for each dimension.
 *
 * Colors follow a colorblind-safe qualitative palette (amber / red / orange /
 * cyan / violet / indigo / emerald) with luminance separation so adjacent radar
 * axes remain distinguishable for deuteranopes and protanopes.
 */
export const DIMENSION_META: readonly DimensionMeta[] = [
  {
    key: 'geology',
    label: 'Geology & Mineralogy',
    shortLabel: 'Geology',
    unit: 'unitless index (0–1)',
    description:
      'Mineralogical diversity and aqueous/hydrothermal alteration, constrained on Earth by ASTER and Landsat 8/9 band ratios and on Mars by CRISM and OMEGA spectroscopy.',
    color: '#fbbf24',
  },
  {
    key: 'terrain',
    label: 'Terrain & Trafficability',
    shortLabel: 'Terrain',
    unit: 'unitless index (0–1)',
    description:
      'Regional slope, RMS roughness at wheel scale and rock abundance — the three parameters that dominate rover mobility and lander footpad stability. Derived from SRTM, ASTER GDEM, LOLA and MOLA digital terrain models.',
    color: '#f87171',
  },
  {
    key: 'thermal',
    label: 'Thermal Environment',
    shortLabel: 'Thermal',
    unit: 'unitless index (0–1)',
    description:
      'Thermal inertia, diurnal temperature swing and annual solar illumination, measured by MODIS Land Surface Temperature and Diviner Lunar Radiometer, and modeled through thermal inertia for Mars by TES.',
    color: '#fb923c',
  },
  {
    key: 'volatiles',
    label: 'Volatile Inventory & ISRU',
    shortLabel: 'Volatiles',
    unit: 'unitless index (0–1)',
    description:
      'Water-ice presence, depth to ice, permafrost extent and water-extraction feasibility — the controlling resource for propellant production. Constrained by SMAP, SHARAD, LOLA and neutron-spectrometer data.',
    color: '#22d3ee',
  },
  {
    key: 'dust',
    label: 'Dust & Aeolian Hazard',
    shortLabel: 'Dust',
    unit: 'unitless index (0–1)',
    description:
      'Dust cover index, aerosol optical depth and aeolian sediment mobility, which together govern solar-array soiling and optical instrument degradation. Earth values use MODIS MAIAC AOD; Mars values use TES Dust Cover Index.',
    color: '#a78bfa',
  },
  {
    key: 'subsurface',
    label: 'Subsurface Habitability',
    shortLabel: 'Subsurface',
    unit: 'unitless index (0–1)',
    description:
      'Lava-tube and cave presence, void diameter, roof thickness and radiation shielding — the parameters that determine whether a subsurface habitat can be pressurized and crew-shielded. Constrained by GRAIL gravity gradients, LROC imagery and SHARAD radar sounding.',
    color: '#818cf8',
  },
  {
    key: 'astrobiology',
    label: 'Astrobiology Potential',
    shortLabel: 'Astrobiology',
    unit: 'unitless index (0–1)',
    description:
      'Extremophile presence, biosignature preservation, water activity and relative UV flux — the habitability envelope used to prioritize sample-return and life-detection targets. Earth analogs are characterized by field microbiology; Mars by CRISM and SHARAD paleoenvironment reconstructions.',
    color: '#34d399',
  },
]

/** Neutral starting weights: every dimension contributes equally. */
export const DEFAULT_WEIGHTS: DimensionWeights = {
  geology: 1.0,
  terrain: 1.0,
  thermal: 1.0,
  volatiles: 1.0,
  dust: 1.0,
  subsurface: 1.0,
  astrobiology: 1.0,
}

/**
 * Mission archetype presets for the configurator.
 *
 * The five vectors mirror the mission profiles in PLAN.md: a neutral baseline,
 * then four resource- or hazard-driven campaigns where the two controlling
 * dimensions are doubled and supporting dimensions are raised to 1.5. Every
 * non-emphasised dimension stays at 0.5 so the ranking still reflects the full
 * seven-dimensional signature rather than collapsing to a single axis.
 */
export const WEIGHT_PRESETS: readonly WeightPreset[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    description:
      'Equal weighting across all seven dimensions. Use this as the neutral baseline before committing to a mission-specific priority order.',
    weights: { ...DEFAULT_WEIGHTS },
  },
  {
    id: 'isru-ice',
    label: 'ISRU Ice',
    description:
      'Water-ice resource campaign: volatile inventory and extraction depth dominate, with thermal environment and trafficability raised because ice stability and drill access both depend on them. Benchmarked on SHARAD, LOLA and neutron-spectrometer products.',
    weights: {
      geology: 0.5,
      terrain: 1.5,
      thermal: 1.5,
      volatiles: 2.0,
      dust: 0.5,
      subsurface: 0.5,
      astrobiology: 0.5,
    },
  },
  {
    id: 'lava-tube',
    label: 'Lava Tube Habitat',
    description:
      'Subsurface habitat campaign: void diameter and roof thickness dominate, with mineralogy and thermal stability raised because tube integrity and internal temperature buffering depend on them. Benchmarked on GRAIL gravity gradients and LROC imagery.',
    weights: {
      geology: 1.5,
      terrain: 0.5,
      thermal: 1.0,
      volatiles: 0.5,
      dust: 0.5,
      subsurface: 2.0,
      astrobiology: 0.5,
    },
  },
  {
    id: 'astrobiology',
    label: 'Astrobiology Survey',
    description:
      'Life-detection campaign: biosignature preservation dominates, with alteration mineralogy and water activity raised because both control whether organic signatures survive. Benchmarked on CRISM, OMEGA and SHARAD paleoenvironment reconstructions.',
    weights: {
      geology: 1.5,
      terrain: 0.5,
      thermal: 0.5,
      volatiles: 1.5,
      dust: 0.5,
      subsurface: 0.5,
      astrobiology: 2.0,
    },
  },
  {
    id: 'landing-safety',
    label: 'Landing Safety',
    description:
      'Entry, descent and landing campaign: slope, roughness and rock abundance dominate, with dust and thermal load raised because soiling and diurnal cycling drive lander power and thermal margins. Benchmarked on MOLA, LOLA and TES products.',
    weights: {
      geology: 0.5,
      terrain: 2.0,
      thermal: 1.0,
      volatiles: 0.5,
      dust: 1.5,
      subsurface: 0.5,
      astrobiology: 0.5,
    },
  },
]

/** NASA Common Metadata Repository search endpoint (no API key required). */
export const NASA_CMR_BASE = 'https://cmr.earthdata.nasa.gov/search'

/** NASA GIBS WMTS endpoint, geographic (EPSG:4326) tile matrix sets. */
export const NASA_GIBS_BASE =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best'

/**
 * NASA GIBS WMTS endpoint, Web Mercator (EPSG:3857) tile matrix sets.
 * Leaflet's default CRS is EPSG:3857, so interactive maps consume this tree
 * while the EPSG:4326 builders above remain in use for thumbnails/previews.
 */
export const NASA_GIBS_3857_BASE =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'

/**
 * Maximum zoom rendered by the Earth map and by the Moon/Mars basemaps.
 * Earth's GIBS matrix sets top out at level 9 (MODIS 250 m); Trek products
 * are capped per layer so lower-resolution products are upsampled, never
 * requested beyond their native level.
 */
export const EARTH_MAP_MAX_ZOOM = 9
export const TARGET_MAP_MAX_ZOOM = 8

/** NASA Moon Trek equatorial tile tree (TMS, Y-axis flipped). */
export const MOON_TREK_BASE = 'https://trek.nasa.gov/tiles/Moon/EQ'

/** NASA Mars Trek equatorial tile tree (TMS, Y-axis flipped). */
export const MARS_TREK_BASE = 'https://trek.nasa.gov/tiles/Mars/EQ'

/** Display names for each celestial body, used in headers and legends. */
export const BODY_LABELS: Record<CelestialBody, string> = {
  earth: 'Earth',
  moon: 'Moon',
  mars: 'Mars',
}

/** Number of discrete TRL steps used by testbed readiness bars. */
export const TRL_STEPS = 9
