/**
 * LunaTerraMars Analog Explorer — shared type definitions.
 *
 * Every physical parameter carries its SI unit (or explicit unitless range)
 * in a comment so that the similarity engine, UI and validation script all
 * agree on dimensionality.
 */

/** Planetary body addressed by the explorer. */
export type CelestialBody = 'earth' | 'moon' | 'mars'

/** Right-hand side of an Earth analog pairing: the Moon or Mars. */
export type TargetBody = Exclude<CelestialBody, 'earth'>

/** Geodetic / planetographic coordinate pair in decimal degrees. */
export interface Coordinate {
  /** Latitude in decimal degrees; planetographic for Moon and Mars. */
  lat: number
  /** Longitude in decimal degrees, east-positive. */
  lon: number
}

/**
 * Normalized 7-dimension signature of a site.
 * Each component is clamped to [0, 1], where higher always means
 * "more of the property a habitat engineer cares about".
 */
export interface FeatureVector {
  /** D1 — mineralogical diversity and alteration state. Unitless [0,1]. */
  geology: number
  /** D2 — slope, roughness and rock abundance. Unitless [0,1]. */
  terrain: number
  /** D3 — thermal inertia, diurnal swing, illumination. Unitless [0,1]. */
  thermal: number
  /** D4 — water ice accessibility and ISRU potential. Unitless [0,1]. */
  volatiles: number
  /** D5 — dust cover and aeolian activity. Unitless [0,1]. */
  dust: number
  /** D6 — cave/lava-tube volume and radiation shielding. Unitless [0,1]. */
  subsurface: number
  /** D7 — extremophile habitability and biosignature preservation. Unitless [0,1]. */
  astrobiology: number
}

/** The seven dimension identifiers, in canonical radar-chart order. */
export type DimensionKey = keyof FeatureVector

/** Per-dimension importance weights supplied by the mission planner (0.0-2.0). */
export type DimensionWeights = Record<DimensionKey, number>

/** Named mission weight vector selectable in the mission configurator. */
export interface WeightPreset {
  /** Stable preset identifier, e.g. "isru-ice". */
  id: string
  /** Short mission archetype name shown in the preset selector. */
  label: string
  /** Mission rationale explaining why this weight vector was chosen. */
  description: string
  /** Dimension weights, each clamped to 0.0-2.0. */
  weights: DimensionWeights
}

/** Display metadata for one similarity dimension. */
export interface DimensionMeta {
  key: DimensionKey
  /** Full scientific label, e.g. "Volatile Inventory & ISRU". */
  label: string
  /** Compact radar-axis label, e.g. "Volatiles". */
  shortLabel: string
  /** Display unit for the normalized index. */
  unit: string
  /** One-sentence physical definition of what the dimension measures. */
  description: string
  /** Colorblind-safe hex color used consistently in charts and badges. */
  color: string
}

/**
 * Raw, instrument-derived physical parameters for a site.
 * All values are measurements or published best estimates, never synthetic
 * filler. Undefined-but-unbounded quantities use `Infinity`
 * (e.g. no accessible ice column) and are handled by the normalizer.
 */
export interface RawParameters {
  /* D1 — Geology */
  /** Named minerals detected (e.g. "olivine", "jarosite"). */
  primaryMinerals: string[]
  /** Dominant lithology, e.g. "phreatomagmatic basaltic tephra". */
  rockType: string
  /** Relative mineralogical diversity index. Unitless [0,1]. */
  mineralDiversityIndex: number
  /** Degree of aqueous / hydrothermal alteration. Unitless [0,1]. */
  alterationState: number

  /* D2 — Terrain */
  /** Mean regional surface slope, degrees (°). */
  meanSlopeDeg: number
  /** RMS surface roughness at rover-wheel scale, centimetres (cm). */
  surfaceRoughnessRMS: number
  /** Areal rock abundance from thermal or optical mapping, percent (%). */
  rockAbundancePct: number
  /** Elevation relative to the body datum, metres (m). */
  elevationM: number

  /* D3 — Thermal */
  /** Thermal inertia, J m⁻² K⁻¹ s⁻¹ᐟ² (1 tiu = 1 J m⁻² K⁻¹ s⁻¹ᐟ²). */
  thermalInertia: number
  /** Peak-to-trough diurnal surface temperature swing, kelvin (K). */
  diurnalDeltaTK: number
  /** Peak daytime surface temperature, kelvin (K). */
  peakSurfaceTempK: number
  /** Minimum nighttime surface temperature, kelvin (K). */
  minSurfaceTempK: number
  /** Fraction of the year in direct solar illumination, percent (%). */
  annualIlluminationPct: number

  /* D4 — Volatiles */
  /** Confidence-weighted water-ice presence indicator. Unitless [0,1]. */
  waterIcePresence: number
  /** Depth from surface to top of the ice-rich layer, metres (m). */
  depthToIceM: number
  /** Areal extent of permafrost / ice-cemented regolith. Unitless [0,1]. */
  permafrostExtent: number
  /** In-situ resource utilization feasibility for water extraction. Unitless [0,1]. */
  isruPotentialIndex: number

  /* D5 — Dust */
  /** TES-style dust cover index. Unitless [0,1], higher = dustier. */
  dustCoverIndex: number
  /** Aerosol optical depth at 550 nm (MODIS/MAIAC), dimensionless. */
  aerosolOpticalDepth: number
  /** Relative aeolian sediment mobility. Unitless [0,1]. */
  aeolianActivityIndex: number

  /* D6 — Subsurface */
  /** Confidence that lava tubes / caves exist at the site. Unitless [0,1]. */
  caveLavaTubePresence: number
  /** Estimated tube or void diameter, metres (m); 0 when absent. */
  estimatedTubeDiameterM: number
  /** Estimated roof thickness over a void, metres (m); 0 when absent. */
  roofThicknessM: number
  /** Attenuation of galactic cosmic rays by overburden. Unitless [0,1]. */
  radiationShieldingFactor: number

  /* D7 — Astrobiology */
  /** Evidence for extremophile communities. Unitless [0,1]. */
  extremophilePresence: number
  /** Likelihood that biosignatures survive deposition and exposure. Unitless [0,1]. */
  biosignaturePreservation: number
  /** Thermodynamic water activity (a_w). Unitless [0,1]. */
  waterActivity: number
  /** UV flux relative to Earth sea level (ratio, dimensionless). */
  uvFluxRelative: number
}

/** A benchmark site on Earth, the Moon or Mars. */
export interface AnalogSite {
  /** Stable identifier, e.g. "kilbourne-hole". */
  id: string
  /** Full site name, e.g. "Kilbourne Hole Maar". */
  name: string
  /** Short name for compact UI chips, e.g. "Kilbourne". */
  shortName: string
  body: CelestialBody
  coordinate: Coordinate
  /** Two-to-three sentence scientific characterization. */
  description: string
  /** Geographic or planetary region, e.g. "Potrillo Volcanic Field, New Mexico". */
  region: string
  rawParameters: RawParameters
  /** Precomputed normalized signature derived from rawParameters. */
  featureVector: FeatureVector
  /** NASA / partner instruments that constrain this site. */
  instruments: string[]
  citations: Citation[]
  /** Direct NASA image URL used as the site thumbnail. */
  imageUrl: string
  /** Optional NASA Worldview deep link (Earth sites only). */
  worldviewUrl?: string
  /** Optional Planetary Data System node / product link. */
  pdsUrl?: string
}

/** A scored Earth → Moon/Mars analog pairing. */
export interface AnalogPairing {
  /** Stable pairing identifier, e.g. "kilbourne-hole__shackleton-rim". */
  id: string
  earthSite: AnalogSite
  targetSite: AnalogSite
  /** Combined weighted similarity, unitless [0,1]. */
  similarityScore: number
  /** Weighted cosine similarity, unitless [0,1]. */
  cosineSimilarity: number
  /** Weighted Euclidean similarity, unitless [0,1]. */
  euclideanSimilarity: number
  /** Per-dimension absolute deltas |earth − target|, each [0,1]. */
  dimensionDeltas: FeatureVector
  /** Physics/engineering gaps where the analogy fails. */
  breakdowns: BreakdownItem[]
  /** Hardware and operational tests the analog enables. */
  testbedApplications: TestbedApplication[]
}

/** Severity classification for an analogy breakdown. */
export type BreakdownSeverity = 'low' | 'medium' | 'high' | 'fundamental'

/** One way in which an Earth analog diverges from its planetary target. */
export interface BreakdownItem {
  /** Physical domain, e.g. "Gravity", "Radiation", "Dust". */
  domain: string
  /** Earth-side value with units, formatted for display. */
  earthValue: string
  /** Target-side value with units, formatted for display. */
  targetValue: string
  /** Human-readable explanation of the physical consequence. */
  deltaDescription: string
  severity: BreakdownSeverity
  /** Engineering or operational countermeasure. */
  mitigationStrategy: string
}

/** NASA technology readiness level, 1 (basic principles) to 9 (flight proven). */
export type TechnologyReadinessLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** A testbed operation the analog site can host for a planetary mission. */
export interface TestbedApplication {
  /** Operation name, e.g. "Ice-cemented regolith drilling". */
  operation: string
  /** What the analog campaign actually exercises. */
  description: string
  readinessLevel: TechnologyReadinessLevel
  /** Concrete field test executable at the analog site. */
  specificTest: string
  /** Mission systems exercised by the test. */
  relevantSystems: string[]
}

/** A traceable NASA data source backing one or more parameters. */
export interface Citation {
  /** Stable citation identifier, e.g. "srtm-30m". */
  id: string
  /** Instrument or mission, e.g. "SRTM". */
  instrument: string
  /** Dataset / product name, e.g. "SRTMGL1 v003". */
  dataset: string
  /** What the dataset constrains scientifically. */
  description: string
  /** Public NASA URL. */
  url: string
  /** Optional DOI for the peer-reviewed product description. */
  doi?: string
}

/** Map tile layer exposed by the layer switcher. */
export interface TileLayer {
  /** Layer identifier used by the map components. */
  id: string
  /** Human-readable layer name. */
  name: string
  body: CelestialBody
  /** URL template with {z}/{x}/{y} (Leaflet tile tokens). */
  urlTemplate: string
  /** Required attribution string. */
  attribution: string
  /** Maximum zoom level supported by the tile matrix set. */
  maxZoom: number
  format: 'png' | 'jpg'
  /** True for TMS (Y-axis flipped) services such as NASA Trek. */
  tms: boolean
  category: 'basemap' | 'elevation' | 'thermal' | 'composition' | 'other'
}

/** Geographic bounding box in decimal degrees, east-positive. */
export interface BoundingBox {
  west: number
  south: number
  east: number
  north: number
}

/** Normalized NASA CMR collection search result. */
export interface CmrCollection {
  conceptId: string
  title: string
  summary: string
  /** ISO-8601 temporal coverage start. */
  timeStart: string
  /** ISO-8601 temporal coverage end. */
  timeEnd: string
  /** Spatial coverage, or null when globally distributed. */
  spatialExtent: BoundingBox | null
}

/** Normalized NASA CMR granule search result. */
export interface CmrGranule {
  title: string
  conceptId: string
  /** Optional browse-image URL supplied by CMR. */
  browseUrl?: string
  /** Optional direct download URL (may require Earthdata Login). */
  downloadUrl?: string
  /** ISO-8601 acquisition timestamp. */
  timeStart: string
  boundingBox?: BoundingBox
}

/**
 * Combined CMR point sample returned by the configurator coordinate picker.
 *
 * A single CMR round trip cannot return both collections and granules, so the
 * service resolves collections intersecting the coordinate first and then
 * attaches recent granules for the highest-ranked collection at that point.
 */
export interface CmrPointSample {
  /** Collections whose spatial coverage intersects the coordinate. */
  collections: readonly CmrCollection[]
  /** Recent granules of `sampledCollection` intersecting the coordinate. */
  granules: readonly CmrGranule[]
  /** Collection used for the granule query, or null when none intersect. */
  sampledCollection: CmrCollection | null
}
