import type { RawParameters } from '../types'

/**
 * Every numeric field of RawParameters. Deriving the union from the interface
 * guarantees that a new physical parameter cannot be added without bounds.
 */
export type NumericParameterKey = {
  [K in keyof RawParameters]: RawParameters[K] extends number ? K : never
}[keyof RawParameters]

/** Physically motivated normalization range for one raw parameter. */
export interface ParameterBound {
  /** Lower clamp of the physically plausible range, in `unit`. */
  min: number
  /** Upper clamp of the physically plausible range, in `unit`. */
  max: number
  /** SI unit (or explicit unitless range) of the parameter. */
  unit: string
  /** Physical meaning and the NASA retrieval that typically fills it. */
  description: string
}

/**
 * Normalization bounds spanning the full Earth → Moon → Mars parameter space.
 *
 * Ranges are deliberately wider than any single body so that one shared
 * min-max normalization remains comparable across all 16 benchmark sites.
 * `depthToIceM` uses 100 m as the effective upper bound; `Infinity` (no
 * accessible ice column) is clamped to it by the normalizer.
 */
export const PARAMETER_BOUNDS: Record<NumericParameterKey, ParameterBound> = {
  /* D1 — Geology */
  mineralDiversityIndex: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Relative diversity of detected mineral phases from VNIR/SWIR spectroscopy (ASTER, CRISM, M³); 0 = monomineralic, 1 = highly diverse assemblage.',
  },
  alterationState: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Degree of aqueous or hydrothermal alteration inferred from phyllosilicate, sulfate and oxide signatures; 0 = unaltered primary assemblage, 1 = pervasively altered.',
  },

  /* D2 — Terrain */
  meanSlopeDeg: {
    min: 0,
    max: 45,
    unit: 'degrees (°)',
    description:
      'Regional mean surface slope from SRTM, ASTER GDEM, LOLA or MOLA digital terrain models. Slopes above ~25° exceed safe landed-asset limits.',
  },
  surfaceRoughnessRMS: {
    min: 0,
    max: 100,
    unit: 'centimetres (cm)',
    description:
      'RMS relief at rover wheel scale (0.1–10 m baseline), derived from high-resolution stereo DEMs or rover-scale photogrammetry.',
  },
  rockAbundancePct: {
    min: 0,
    max: 80,
    unit: 'percent (%)',
    description:
      'Areal fraction of exposed rocks and boulders from optical or thermal mapping (LROC NAC hazards, Diviner rock abundance, THEMIS).',
  },
  elevationM: {
    min: -9000,
    max: 9000,
    unit: 'metres (m)',
    description:
      'Elevation relative to the body datum (EGM2008 for Earth, mean lunar radius 1737.4 km, IAU Mars areoid). Used for atmospheric and thermal context.',
  },

  /* D3 — Thermal */
  thermalInertia: {
    min: 10,
    max: 2500,
    unit: 'J m⁻² K⁻¹ s⁻¹ᐟ² (1 tiu = same)',
    description:
      'Resistance of the surface to temperature change, from MODIS LST amplitude fitting, ECOSTRESS or TES thermal inertia retrievals.',
  },
  diurnalDeltaTK: {
    min: 0,
    max: 300,
    unit: 'kelvin (K)',
    description:
      'Peak-to-trough diurnal surface temperature swing; on the Moon this exceeds 250 K and drives radiator and battery design.',
  },
  peakSurfaceTempK: {
    min: 40,
    max: 450,
    unit: 'kelvin (K)',
    description:
      'Maximum daytime surface kinetic temperature from MODIS, ECOSTRESS, Diviner or TES retrievals.',
  },
  minSurfaceTempK: {
    min: 40,
    max: 350,
    unit: 'kelvin (K)',
    description:
      'Minimum nighttime surface kinetic temperature; permanently shadowed regions on the Moon approach 40 K.',
  },
  annualIlluminationPct: {
    min: 0,
    max: 100,
    unit: 'percent (%)',
    description:
      'Fraction of the year with direct solar illumination at the site, modeled from LOLA or MOLA topography and orbital geometry.',
  },

  /* D4 — Volatiles */
  waterIcePresence: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Confidence-weighted water-ice indicator from neutron spectroscopy, radar sounding (SHARAD, LOLA) and thermal stability modeling.',
  },
  depthToIceM: {
    min: 0,
    max: 100,
    unit: 'metres (m)',
    description:
      'Depth from the surface to the top of the ice-rich layer (0–100 m effective range; Infinity means no accessible ice).',
  },
  permafrostExtent: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Areal extent of ice-cemented or perennially frozen ground, from SMAP, GPR and SHARAD sounding.',
  },
  isruPotentialIndex: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Feasibility of water extraction and propellant production given ice concentration, depth, regolith properties and power availability.',
  },

  /* D5 — Dust */
  dustCoverIndex: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'TES-style dust cover index; higher values indicate a thicker silicate dust layer and greater solar-array soiling risk.',
  },
  aerosolOpticalDepth: {
    min: 0,
    max: 5,
    unit: 'dimensionless (550 nm AOD)',
    description:
      'Aerosol optical depth at 550 nm from MODIS MAIAC (Earth) or Mars dust opacity records; >1 indicates a significant dust event.',
  },
  aeolianActivityIndex: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Relative sediment mobility from wind-dominant landform mapping, InSight/MET wind data on Mars and Earth analog field measurements.',
  },

  /* D6 — Subsurface */
  caveLavaTubePresence: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Confidence that lava tubes, pits or caves exist at the site from LROC imagery, GRAIL gravity gradients, SHARAD or field survey.',
  },
  estimatedTubeDiameterM: {
    min: 0,
    max: 1000,
    unit: 'metres (m)',
    description:
      'Estimated diameter of the largest accessible void or lava-tube segment; 0 when no subsurface void is identified.',
  },
  roofThicknessM: {
    min: 0,
    max: 100,
    unit: 'metres (m)',
    description:
      'Estimated overburden thickness above a void, derived from gravity residuals or field measurement; 0 when absent.',
  },
  radiationShieldingFactor: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Fraction of galactic cosmic radiation and solar particle events attenuated by overburden; 0 = unshielded surface, 1 = full shielding.',
  },

  /* D7 — Astrobiology */
  extremophilePresence: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Evidence for extremophile communities (halophiles, acidophiles, psychrophiles, UV-tolerant taxa) from field microbiology or culture-independent sequencing.',
  },
  biosignaturePreservation: {
    min: 0,
    max: 1,
    unit: 'unitless (0–1)',
    description:
      'Likelihood that organic or isotopic biosignatures survive deposition, diagenesis and surface radiation; drives sample-return target selection.',
  },
  waterActivity: {
    min: 0,
    max: 1,
    unit: 'unitless a_w (0–1)',
    description:
      'Thermodynamic water activity of the environment; terrestrial life requires a_w > 0.6, and most Mars surface brines fall below 0.5.',
  },
  uvFluxRelative: {
    min: 0,
    max: 5,
    unit: 'ratio (Earth sea level = 1)',
    description:
      'Relative UV flux at the surface; the Moon receives roughly 4× the Earth sea-level UV dose because it lacks an atmosphere.',
  },
}

/** All numeric parameter keys, in declaration (dimension) order. */
export const NUMERIC_PARAMETER_KEYS: readonly NumericParameterKey[] = [
  'mineralDiversityIndex',
  'alterationState',
  'meanSlopeDeg',
  'surfaceRoughnessRMS',
  'rockAbundancePct',
  'elevationM',
  'thermalInertia',
  'diurnalDeltaTK',
  'peakSurfaceTempK',
  'minSurfaceTempK',
  'annualIlluminationPct',
  'waterIcePresence',
  'depthToIceM',
  'permafrostExtent',
  'isruPotentialIndex',
  'dustCoverIndex',
  'aerosolOpticalDepth',
  'aeolianActivityIndex',
  'caveLavaTubePresence',
  'estimatedTubeDiameterM',
  'roofThicknessM',
  'radiationShieldingFactor',
  'extremophilePresence',
  'biosignaturePreservation',
  'waterActivity',
  'uvFluxRelative',
]
