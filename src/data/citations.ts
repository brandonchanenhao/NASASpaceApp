import type { Citation } from '../types'

/**
 * Traceable NASA data sources used by the explorer.
 *
 * Every URL points at the official mission, PDS node or LP DAAC product page
 * that distributes the dataset; DOIs are included where the product carries a
 * citable data DOI.
 */
const CITATION_LIST: readonly Citation[] = [
  {
    id: 'srtm',
    instrument: 'SRTM',
    dataset: 'SRTMGL1 v003 — Shuttle Radar Topography Mission 30 m DEM',
    description:
      'Global 1-arc-second digital elevation model used for slope, roughness and elevation at the six Earth analog sites.',
    url: 'https://lpdaac.usgs.gov/products/srtmgl1v003/',
    doi: '10.5067/MEaSUREs/SRTM/SRTMGL1.003',
  },
  {
    id: 'aster-gdem',
    instrument: 'ASTER',
    dataset: 'ASTGTM v003 — ASTER Global Digital Elevation Model',
    description:
      '15–30 m global DEM and shaded relief from ASTER stereo pairs, used for terrain normalization and site imagery.',
    url: 'https://lpdaac.usgs.gov/products/astgtmv003/',
    doi: '10.5067/ASTER/ASTGTM.003',
  },
  {
    id: 'modis-lst',
    instrument: 'MODIS Terra/Aqua',
    dataset: 'MOD11A1 v061 — Land Surface Temperature/Emissivity Daily L3',
    description:
      'Daily 1 km daytime and nighttime land surface temperature used for thermal inertia fitting and diurnal temperature range.',
    url: 'https://lpdaac.usgs.gov/products/mod11a1v061/',
    doi: '10.5067/MODIS/MOD11A1.061',
  },
  {
    id: 'ecostress',
    instrument: 'ECOSTRESS',
    dataset: 'ECO2LSTE v001 — Ecosystem Spaceborne Thermal Radiometer LST',
    description:
      '70 m evapotranspiration-optimized thermal infrared surface temperature used to resolve sub-kilometre thermal contrasts.',
    url: 'https://lpdaac.usgs.gov/products/eco2lstev001/',
    doi: '10.5067/ECOSTRESS/ECO2LSTE.001',
  },
  {
    id: 'modis-aod',
    instrument: 'MODIS MAIAC',
    dataset: 'MCD19A2 v061 — Multi-Angle Implementation of Atmospheric Correction AOD',
    description:
      'Daily 1 km aerosol optical depth at 550 nm used for the Earth dust/aerosol term of the dust dimension.',
    url: 'https://lpdaac.usgs.gov/products/mcd19a2v061/',
    doi: '10.5067/MODIS/MCD19A2.061',
  },
  {
    id: 'smap',
    instrument: 'SMAP',
    dataset: 'SPL4SMGP v007 — SMAP L4 Global 3-hourly 9 km Surface/ Root-Zone Soil Moisture',
    description:
      'Soil moisture and freeze/thaw state used to map permafrost extent and near-surface water availability at high-latitude analogs.',
    url: 'https://nsidc.org/data/spl4smgp/versions/7',
  },
  {
    id: 'lola',
    instrument: 'LRO LOLA',
    dataset: 'LRO-L-LOLA-3-DSP-5-TOPO-V1.0 — Lunar Orbiter Laser Altimeter topography',
    description:
      'Global lunar DEM and polar illumination modeling used for slope, elevation and annual illumination fractions.',
    url: 'https://pds-geosciences.wustl.edu/missions/lro/lola.htm',
  },
  {
    id: 'diviner',
    instrument: 'LRO Diviner',
    dataset: 'LRO-L-DLRE-5-GDR-V1.0 — Diviner Lunar Radiometer GDR',
    description:
      'Bolometric surface temperatures and rock abundance used for lunar thermal inertia, diurnal swing and rock fraction.',
    url: 'https://pds-geosciences.wustl.edu/missions/lro/diviner.htm',
  },
  {
    id: 'lroc',
    instrument: 'LRO LROC',
    dataset: 'LROC WAC Global Morphological Map and NAC hazard mosaics',
    description:
      'Wide Angle Camera basemaps and Narrow Angle Camera imagery used for lava-tube, pit and boulder-field identification.',
    url: 'https://pds-geosciences.wustl.edu/missions/lro/lroc.htm',
  },
  {
    id: 'm3',
    instrument: 'Chandrayaan-1 M³',
    dataset: 'M3 Level 2 reflectance and mineralogy products',
    description:
      'Imaging spectrometer mineral maps used for lunar mineral diversity and pyroclastic glass identification.',
    url: 'https://pds-geosciences.wustl.edu/missions/chandrayaan1/m3.htm',
  },
  {
    id: 'grail',
    instrument: 'GRAIL',
    dataset: 'GRAIL gravity field and crustal thickness models (GRGM1200A)',
    description:
      'High-resolution gravity gradients used to infer subsurface mass deficits consistent with lava tubes and dike intrusions.',
    url: 'https://pds-geosciences.wustl.edu/missions/grail/default.htm',
  },
  {
    id: 'mola',
    instrument: 'MGS MOLA',
    dataset: 'MGS-M-MOLA-5-MEGDR-L3-V1.0 — Mars Orbiter Laser Altimeter DEM',
    description:
      'Global Mars topography used for slope, elevation and atmospheric density context at candidate base sites.',
    url: 'https://pds-geosciences.wustl.edu/missions/mgs/mola.htm',
  },
  {
    id: 'tes',
    instrument: 'MGS TES',
    dataset: 'TES thermal inertia, albedo and dust cover global mosaics',
    description:
      'Thermal Emission Spectrometer retrievals used for Mars thermal inertia, dust cover index and surface composition.',
    url: 'https://pds-geosciences.wustl.edu/missions/mgs/tes.htm',
  },
  {
    id: 'crism',
    instrument: 'MRO CRISM',
    dataset: 'CRISM L2 targeted and MTRDR mapped reflectance products',
    description:
      'Visible–infrared spectrometer mineralogy used for phyllosilicate, sulfate and carbonate identification at Mars sites.',
    url: 'https://pds-geosciences.wustl.edu/missions/mro/crism.htm',
  },
  {
    id: 'hirise',
    instrument: 'MRO HiRISE',
    dataset: 'HiRISE RDR and DTMs (0.25–1 m/pixel)',
    description:
      'High-resolution imaging and stereo DTMs used for rock abundance, slope and skylight/cave detection at Mars targets.',
    url: 'https://www.uahirise.org/',
  },
  {
    id: 'themis',
    instrument: 'Mars Odyssey THEMIS',
    dataset: 'THEMIS infrared daytime and nighttime mosaics',
    description:
      'Thermal infrared imaging used for Mars thermal inertia, rock abundance and dust cover context.',
    url: 'https://pds-geosciences.wustl.edu/missions/mars_odyssey/themis.htm',
  },
  {
    id: 'sharad',
    instrument: 'MRO SHARAD',
    dataset: 'SHARAD radargrams and clutter simulations',
    description:
      'Shallow radar sounding used to detect subsurface ice layers and constrain lava-tube roof thickness.',
    url: 'https://pds-geosciences.wustl.edu/missions/mro/sharad.htm',
  },
  {
    id: 'omega',
    instrument: 'Mars Express OMEGA',
    dataset: 'OMEGA visible–infrared mapping spectrometer products',
    description:
      'Mars surface mineralogy used together with CRISM for phyllosilicate and sulfate diversity at Mawrth Vallis.',
    url: 'https://pds-geosciences.wustl.edu/missions/mars_express/omega.htm',
  },
]

/** Citation lookup keyed by stable id. */
export const CITATIONS: Record<string, Citation> = Object.fromEntries(
  CITATION_LIST.map((citation) => [citation.id, citation]),
)

/** All citations in declaration order. */
export const ALL_CITATIONS: readonly Citation[] = CITATION_LIST

/** Resolve a citation by id, throwing on a typo rather than losing provenance. */
export function getCitation(id: string): Citation {
  const citation = CITATIONS[id]
  if (!citation) {
    throw new Error(`Unknown NASA citation id: ${id}`)
  }
  return citation
}
