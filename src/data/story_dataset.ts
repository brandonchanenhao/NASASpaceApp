import type { AnalogSite } from '../types'
import { earthSites } from './analogs_dataset'

export interface InfographicComparison {
  earthFeatureTitle: string
  earthFeatureDescription: string
  earthImageUrl: string
  planetaryFeatureTitle: string
  planetaryFeatureDescription: string
  planetaryImageUrl: string
  targetBody: 'mars' | 'moon' | 'both'
  keySimilarities: string[]
  criticalDivergences: string[]
}

export interface TestbedApplicationItem {
  domain: string
  title: string
  description: string
  targetSystem: string
  readinessLevel: string
}

export interface SiteStory {
  siteId: string
  site: AnalogSite
  title: string
  subtitle: string
  category: string
  primaryTarget: string
  targetBodies: ('mars' | 'moon')[]
  heroImageUrl: string
  heroCaption: string
  tagline: string
  analogueThesis: string
  nuanceDisclaimer: string
  geologicalMechanism: string
  comparison: InfographicComparison
  diagramType:
    | 'lava-tube'
    | 'maar-impact'
    | 'evaporite-uv'
    | 'hydrothermal'
    | 'inverted-channel'
    | 'permafrost'
  diagramTitle: string
  diagramDescription: string
  testbedApplications: TestbedApplicationItem[]
  nasaMissions: string[]
  keyInstruments: string[]
  targetCoordinates?: { lat: number; lon: number; locationName: string }
}

export const SITE_STORIES: Record<string, SiteStory> = {
  'la-corona': {
    siteId: 'la-corona',
    site: earthSites.find((s) => s.id === 'la-corona')!,
    title: 'La Corona Lava Tube',
    subtitle: 'Lanzarote, Canary Islands, Spain',
    category: 'Subsurface Volcanism & Shielding',
    primaryTarget: 'Lunar Pits & Martian Volcanic Caves',
    targetBodies: ['moon', 'mars'],
    heroImageUrl:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
    heroCaption:
      'Cueva de los Verdes: Part of the 7.6 km La Corona volcanic lava tube system with towering basaltic vaults.',
    tagline:
      'A subterranean basaltic cavern network preserving stable microclimates and blocking cosmic radiation.',
    analogueThesis:
      'Lunar and Martian volcanic plains are dotted with skylights into massive subterranean lava tubes. La Corona provides an accessible 7.6 km basaltic conduit to test 3D LiDAR mapping in GPS-denied environments, assess structural stability under rock ceilings, and design pressurized astronaut habitats shielded from lethal surface radiation.',
    nuanceDisclaimer:
      'Earth analogues do not need to replicate lunar or Martian caves identically. La Corona formed under Earth gravity (1.0 g) with humid marine air, limiting tube widths to 20-30 meters. On the Moon (0.17 g) and Mars (0.38 g), reduced gravity permits lava tubes exceeding 500 meters in width without roof collapse. Furthermore, lunar and Martian caves are hyper-dry, sterile, and cold.',
    geologicalMechanism:
      'Formed roughly 21,000 years ago during the eruption of the Corona volcano, fluid pahoehoe basaltic lava crust solidified on top while molten lava continued draining beneath. When the eruption ceased, the drained tube left behind a hollow underground gallery with multiple collapse skylights (jameos).',
    comparison: {
      earthFeatureTitle: 'La Corona Subsurface Conduit (Canary Islands)',
      earthFeatureDescription:
        'A continuous basaltic tube with 8-meter roof rock thickness, providing natural thermal buffering (+18°C year-round) and complete darkness.',
      earthImageUrl:
        'https://images.unsplash.com/photo-1509225770129-fbcf8a696c0b?auto=format&fit=crop&w=800&q=80',
      planetaryFeatureTitle: 'Marius Hills & Olympus Mons Lava Tubes',
      planetaryFeatureDescription:
        'Orbital imagery from LRO and MRO reveals deep vertical pits (skylights) opening into cavernous voids beneath lunar mare and Martian volcanic flanks.',
      planetaryImageUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      targetBody: 'both',
      keySimilarities: [
        'Basaltic tholeiitic composition with pyroxene and olivine crystals',
        'Natural subterranean barrier attenuating galactic cosmic rays (GCR) and solar particle events',
        'Complete elimination of surface diurnal thermal extremes',
        'Steep-walled skylight entry points requiring tethered or autonomous descent systems',
      ],
      criticalDivergences: [
        'Gravity: 1.0 g on Earth restricts cave spans; 0.17 g on the Moon allows 500m+ wide caverns',
        'Atmosphere: 101 kPa humid air on Lanzarote vs. hard vacuum (<10⁻¹¹ Pa) on the Moon and 0.6 kPa CO₂ on Mars',
        'Biology: Active terrestrial micro-flora and endemic crustaceans vs. completely sterile extraterrestrial caves',
      ],
    },
    diagramType: 'lava-tube',
    diagramTitle: 'Radiation Attenuation & Thermal Stabilization in Basaltic Tubes',
    diagramDescription:
      'How 8 meters of basaltic overburden stops 99.9% of ionizing radiation while stabilizing internal temperatures against exterior temperature swings.',
    testbedApplications: [
      {
        domain: 'Autonomous Robotics',
        title: 'GPS-Denied 3D SLAM & Drone Exploration',
        description:
          'International research teams test tethered rovers and autonomous LiDAR drones inside La Corona to map dark underground labyrinths without satellite signals.',
        targetSystem: 'Autonomous Cave Drone / Tethered Rover',
        readinessLevel: 'TRL 6',
      },
      {
        domain: 'Human Habitat Architecture',
        title: 'In-Situ Subterranean Shelter Deployment',
        description:
          'Validating inflatable habitat shells and rock bolt anchoring systems under realistic basaltic ceilings.',
        targetSystem: 'Permanent Artemis / Mars Subsurface Habitat',
        readinessLevel: 'TRL 5',
      },
      {
        domain: 'Geophysics & Sensing',
        title: 'Through-Rock Ground Penetrating Radar (GPR)',
        description:
          'Calibrating surface radar antennas to detect hidden voids and determine ceiling thickness before landing heavy hardware.',
        targetSystem: 'Orbital & Surface GPR Sounders',
        readinessLevel: 'TRL 7',
      },
    ],
    nasaMissions: ['ESA CAVES / PANGAEA', 'PSTAR', 'Artemis Subsurface Working Group'],
    keyInstruments: ['3D LiDAR Scanners', 'Cavity Ring-Down Spectrometers', 'Micro-Seismometers', 'GPR Sounders'],
    targetCoordinates: { lat: 14.08, lon: -56.78, locationName: 'Marius Hills Hole, Moon' },
  },

  'kilbourne-hole': {
    siteId: 'kilbourne-hole',
    site: earthSites.find((s) => s.id === 'kilbourne-hole')!,
    title: 'Kilbourne Hole Maar',
    subtitle: 'Potrillo Volcanic Field, New Mexico, USA',
    category: 'Explosive Excavation & Deep Sampling',
    primaryTarget: 'Lunar & Martian Impact Crater Ejecta',
    targetBodies: ['moon', 'mars'],
    heroImageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    heroCaption:
      'Kilbourne Hole: A 2 km wide, 100 m deep phreatomagmatic volcanic maar crater exposing mantle xenoliths.',
    tagline:
      'An explosive excavation basin providing a natural window into deep planetary crust and mantle stratigraphy.',
    analogueThesis:
      'Impact craters on the Moon and Mars blast through upper surface regolith, dredging up deep crustal bedrock and depositing it along ejecta blankets in an inverted stratigraphy. Kilbourne Hole served as a training ground for Apollo 12, 14, 16, and 17 astronauts, and continues as a premier Artemis testbed for identifying mantle peridotite xenoliths and explosive ejecta.',
    nuanceDisclaimer:
      'Kilbourne Hole was generated by a phreatomagmatic steam eruption when ascending magma encountered groundwater, whereas lunar and Martian craters are primarily created by hypervelocity meteorite impacts. However, the physical sorting, ballistic throwing, and inverted stratigraphic deposition of ejecta provide an outstanding operational analogue.',
    geologicalMechanism:
      'Roughly 24,000 to 80,000 years ago, hot basaltic magma met water-saturated alluvium, causing violent steam explosions that excavated a 2-kilometer bowl. The explosion dredged up pristine green mantle peridotite and mantle xenoliths from depths of 40-60 km.',
    comparison: {
      earthFeatureTitle: 'Kilbourne Phreatomagmatic Maar & Ejecta Rim',
      earthFeatureDescription:
        'A steep crater rim blanketed with base-surge deposits, volcanic bombs, and mantle peridotite xenoliths resting atop desert sands.',
      earthImageUrl:
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      planetaryFeatureTitle: 'Lunar Impact Crater Ejecta (Cone Crater / Shackleton)',
      planetaryFeatureDescription:
        'Meteorite kinetic impacts blast bedrock upward and outwards, creating an inverted ejecta blanket where the deepest material lies right along the rim crest.',
      planetaryImageUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      targetBody: 'both',
      keySimilarities: [
        'Inverted stratigraphy: deepest bedrock fragments lie clustered closest to the crater rim',
        'High density of olivine, clinopyroxene, and plagioclase basaltic minerals',
        'Loose, poorly sorted volcanic/crater ejecta challenging rover wheel traction',
        'Ideal site for human visual reconnaissance: identifying high-value mantle samples amidst common basalt',
      ],
      criticalDivergences: [
        'Excavation mechanism: Steam explosion (phreatomagmatic) vs. hypervelocity kinetic impact (up to 20 km/s)',
        'Shock metamorphism: Lacks high-pressure shock features like maskelynite or planar deformation features (PDFs)',
        'Weathering: Exposed to terrestrial wind, desert flash floods, and oxidation over thousands of years',
      ],
    },
    diagramType: 'maar-impact',
    diagramTitle: 'Inverted Stratigraphy: Accessing Deep Crustal Bedrock at Crater Rims',
    diagramDescription:
      'How explosive excavation dredges up deep mantle xenoliths and peridotite, depositing the oldest and deepest strata directly on top of the rim.',
    testbedApplications: [
      {
        domain: 'Astronaut Field Geology',
        title: 'Artemis Crew Regolith & Ejecta Sampling',
        description:
          'Astronauts practice identifying mantle peridotite xenoliths within seconds while wearing pressurized spacesuit gloves and using long-handled sampling rakes.',
        targetSystem: 'EVA Hand Tools / Sample Bags',
        readinessLevel: 'TRL 8',
      },
      {
        domain: 'Rover Locomotion',
        title: 'Traversing Unconsolidated Slopes & Ash',
        description:
          'Testing rover wheel geometries and traction control algorithms on 15° to 25° loose volcanic ash slopes.',
        targetSystem: 'Lunar Terrain Vehicle (LTV) / Rover Drive Systems',
        readinessLevel: 'TRL 7',
      },
      {
        domain: 'Remote Sensing Calibration',
        title: 'Spectroscopic Mineral Unmixing',
        description:
          'Validating hyperspectral and thermal emission orbital instruments against hand-held Raman and VNIR ground truth.',
        targetSystem: 'Thermal Infrared Imaging Spectrometer',
        readinessLevel: 'TRL 6',
      },
    ],
    nasaMissions: ['Apollo 12/14/16/17 Training', 'SSERVI', 'Artemis Geology Field Tests'],
    keyInstruments: ['Handheld XRF / Raman Spectrometers', 'Core Sample Drills', 'Multispectral Camera Masts'],
    targetCoordinates: { lat: -89.9, lon: 0.0, locationName: 'Shackleton Crater Rim, Moon' },
  },

  'pajonales': {
    siteId: 'pajonales',
    site: earthSites.find((s) => s.id === 'pajonales')!,
    title: 'Salar de Pajonales',
    subtitle: 'Atacama Desert, Antofagasta, Chile',
    category: 'Hyper-Arid Evaporites & UV Astrobiology',
    primaryTarget: 'Martian Sulfate & Chloride Evaporite Flats',
    targetBodies: ['mars'],
    heroImageUrl:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
    heroCaption:
      'Salar de Pajonales: A 3,537 m high salt flat with polygonal halite and gypsum crusts under intense solar radiation.',
    tagline:
      'A hyper-arid evaporite plateau where microbial life survives inside translucent salt crystals under lethal UV.',
    analogueThesis:
      'As water evaporated from early Mars, it left behind vast beds of sulfates and chlorides in Gale Crater and Jezero Crater. Salar de Pajonales sits at 3,537 meters elevation in the hyper-arid Atacama Desert, where solar UV flux is punishing and rain virtually never falls. Microscopic halophile communities survive here inside translucent salt crystals, providing a direct analogue for Martian biosignature preservation in evaporite minerals.',
    nuanceDisclaimer:
      'Pajonales is not identical to modern Mars: it experiences terrestrial atmospheric pressure (65 kPa at altitude) and rare winter snowmelt, and its atmosphere contains oxygen. Mars has a thin 0.6 kPa CO₂ atmosphere with oxidizing perchlorates. However, the mineral crystallization pathways and micro-scale life habitats inside halite and gypsum are scientifically identical.',
    geologicalMechanism:
      'Prolonged groundwater evaporation in a closed volcanic basin concentrates brine, precipitating thick beds of halite (NaCl), gypsum (CaSO₄·2H₂O), anhydrite, and thenardite. Polygonal salt ridges form through repetitive thermal expansion and crystallization.',
    comparison: {
      earthFeatureTitle: 'Pajonales Halite & Gypsum Evaporite Crusts',
      earthFeatureDescription:
        'Porous salt crusts with microscopic brine inclusions acting as optical light-guides while shielding endolithic cyanobacteria from ultraviolet radiation.',
      earthImageUrl:
        'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=800&q=80',
      planetaryFeatureTitle: 'Jezero Crater & Meridiani Sulfate Deposits',
      planetaryFeatureDescription:
        'Curiosity and Perseverance have driven across kilometers of sulfate-bearing strata and polyhydrated sulfates deposited by evaporating Martian lakes.',
      planetaryImageUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      targetBody: 'mars',
      keySimilarities: [
        'Precipitation of calcium sulfate (gypsum/anhydrite) and chloride salts in closed evaporating basins',
        'High UV-B and UV-C flux due to extreme high altitude (3,537 m) and clear desert skies',
        'Endolithic micro-habitats: organisms inhabiting pore spaces within translucent mineral matrices',
        'Mineral-protected preservation of lipid and carotenoid biosignatures over geological epochs',
      ],
      criticalDivergences: [
        'Atmospheric chemistry: Earth N₂/O₂ atmosphere vs. Mars CO₂ with active perchlorate soil chemistry',
        'Absolute aridity: Pajonales receives occasional moisture via morning condensation; Mars is desiccated',
        'Age: Pajonales evaporites are Quaternary (thousands of years old); Martian deposits are Hesperian (>3 billion years old)',
      ],
    },
    diagramType: 'evaporite-uv',
    diagramTitle: 'Endolithic Survival: Translucent Salt as an Ultraviolet Shield',
    diagramDescription:
      'How millimeters of crystalline halite and gypsum filter lethal UV-C radiation while allowing photosynthetic light to reach protected microbes.',
    testbedApplications: [
      {
        domain: 'Astrobiology & Life Detection',
        title: 'Biosignature Detection in Evaporite Crystals',
        description:
          'Calibrating deep-UV Raman spectrometers (like SHERLOC on Perseverance) to detect organic pigments entombed inside salt crystals.',
        targetSystem: 'Deep-UV Raman & Fluorescence Spectrometer',
        readinessLevel: 'TRL 7',
      },
      {
        domain: 'Autonomous Rover Science',
        title: 'Autonomous Recognition of High-Value Habitats',
        description:
          'Training rover machine-learning algorithms to identify salt crust fractures and ridges most likely to shelter preserved organic compounds.',
        targetSystem: 'Rover Autonomous Science Targeting (AEGIS)',
        readinessLevel: 'TRL 6',
      },
      {
        domain: 'Sampling Systems',
        title: 'Brittle Salt Core Extraction',
        description:
          'Testing rotary percussive coring bits on fragile crystalline salt without fracturing the sample or melting fluid inclusions.',
        targetSystem: 'Perseverance-Style Sample Caching Corer',
        readinessLevel: 'TRL 8',
      },
    ],
    nasaMissions: ['Astrobiology Institute (NAI)', 'PSTAR (Atacama Rover Astrobiology Drilling Studies)'],
    keyInstruments: ['SHERLOC / WATSON Analogue Instruments', 'LIBS / ChemCam', 'Contact Fluoresence Imagers'],
    targetCoordinates: { lat: 18.38, lon: 77.58, locationName: 'Jezero Crater Delta & Margin, Mars' },
  },

  dallol: {
    siteId: 'dallol',
    site: earthSites.find((s) => s.id === 'dallol')!,
    title: 'Dallol Hydrothermal Field',
    subtitle: 'Danakil Depression, Afar Region, Ethiopia',
    category: 'Hyper-Acidic Hydrothermal Vents',
    primaryTarget: 'Martian Acid-Sulfate Hot Springs & Silica Deposits',
    targetBodies: ['mars'],
    heroImageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    heroCaption:
      'Dallol: Acid-sulfate hydrothermal springs at -125 m below sea level with boiling brine, jarosite, and native sulfur.',
    tagline:
      'An extreme geothermal caldera precipitating iron oxides, jarosite, and silica in boiling acidic brines.',
    analogueThesis:
      'When the Spirit rover traversed Columbia Hills in Gusev Crater, it uncovered nodular deposits of 90% pure opaline silica and jarosite—direct mineralogical fingerprints of ancient acid-sulfate hot springs. Dallol is Earth’s most extreme hydrothermal system, where boiling acidic fluids (pH < 0) precipitate jarosite, goethite, and silica sinter chimneys, showing how ancient Martian geothermal springs could have precipitated and preserved minerals.',
    nuanceDisclaimer:
      'Dallol sits atop a continental rift basin with marine salt deposits, whereas Martian hydrothermal vents formed in basaltic crust without an ocean basin. Dallol is intensely hot and active today, whereas Martian hydrothermal systems cooled billions of years ago. Dallol’s extreme combination of hyper-acidity, high temperature, and hypersalinity is studied to probe the ultimate abiotic-biotic boundary of life.',
    geologicalMechanism:
      'Groundwater circulating near an active shallow magma chamber beneath the Danakil Depression dissolves vast subterranean salt beds. The superheated fluid discharges at up to 108°C, erupting through salt chimneys and precipitating iron chlorides, jarosite, and native sulfur upon contact with air.',
    comparison: {
      earthFeatureTitle: 'Dallol Acid-Sulfate Terraces & Salt Chimneys',
      earthFeatureDescription:
        'Boiling hyper-acidic geysers (pH < 0) depositing iron-rich sinter terraces, halite towers, and vibrant jarosite precipitates.',
      earthImageUrl:
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      planetaryFeatureTitle: 'Gusev Crater Home Plate Hydrothermal Deposits',
      planetaryFeatureDescription:
        'Spirit rover discovered opaline silica sinter "cauliflower" structures and jarosite, confirming ancient explosive volcanism and acid-sulfate fumaroles.',
      planetaryImageUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      targetBody: 'mars',
      keySimilarities: [
        'Co-precipitation of jarosite, goethite, and silica under acid-sulfate hydrothermal conditions',
        'Formation of porous sinter deposits and vent chimneys that can entrap micro-fossils',
        'Complex geochemical gradients with rapid mineral phase changes over centimeters',
        'Spectral signatures matching Mars Reconnaissance Orbiter (CRISM) iron-sulfate observations',
      ],
      criticalDivergences: [
        'Basin geology: Dallol is embedded in a 2-km-thick marine evaporite sequence; Mars vents are basalt-dominated',
        'Surface pressure: 102 kPa at -125 m below sea level on Earth vs. ~0.6 kPa on Mars (lowering boiling points)',
        'Biotic threshold: Dallol’s hyper-acidic ponds (pH < 0, 108°C) test whether life can exist at all, or if physics sets an absolute limit',
      ],
    },
    diagramType: 'hydrothermal',
    diagramTitle: 'Hydrothermal Fluid Circulation & Acid-Sulfate Mineral Precipitation',
    diagramDescription:
      'Magmatic degassing drives acidic fluids that dissolve basaltic rock, precipitating jarosite, hematite, and amorphous silica chimneys.',
    testbedApplications: [
      {
        domain: 'Biomarker Verification',
        title: 'Abiotic vs. Biogenic Mineral Discrimination',
        description:
          'Determining whether silica "fingers" and micro-chimneys can form strictly through abiotic fluid dynamics or require microbial scaffolding.',
        targetSystem: 'Mars Sample Return Science Protocol',
        readinessLevel: 'TRL 6',
      },
      {
        domain: 'Corrosion & Instrument Durability',
        title: 'Extreme Acid-Sulfate Material Survivability',
        description:
          'Testing sensor enclosures, spectrometer windows, and rover chassis coatings against corrosive sulfurous vapors.',
        targetSystem: 'Rover In-Situ Analytical Package',
        readinessLevel: 'TRL 7',
      },
      {
        domain: 'Orbital Telemetry Ground-Truthing',
        title: 'Reflectance & Thermal Emission Calibration',
        description:
          'Comparing ASTER and ECOSTRESS satellite passes over Dallol to orbital CRISM and THEMIS data from Mars orbit.',
        targetSystem: 'Orbital Planetary Spectrometers',
        readinessLevel: 'TRL 8',
      },
    ],
    nasaMissions: ['Exobiology Program', 'Europlanet Research Infrastructure', 'Mars 2020 Science Team'],
    keyInstruments: ['Visible/Near-Infrared Spectrometers', 'Thermal Infrared Radiometers', 'Ion Chromatography Kits'],
    targetCoordinates: { lat: -14.57, lon: 175.47, locationName: 'Columbia Hills / Home Plate, Mars' },
  },

  hanksville: {
    siteId: 'hanksville',
    site: earthSites.find((s) => s.id === 'hanksville')!,
    title: 'Hanksville Badlands',
    subtitle: 'San Rafael Desert, Utah, USA',
    category: 'Inverted Paleochannels & Aeolian Yardangs',
    primaryTarget: 'Martian Sinuous Ridges & Deltaic Channels',
    targetBodies: ['mars'],
    heroImageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
    heroCaption:
      'Hanksville: Inverted river channel ridges and sandstone yardangs sculpted by millions of years of wind erosion.',
    tagline:
      'Ancient river channels transformed into elevated ridges by relentless desert winds, mirroring Martian deltas.',
    analogueThesis:
      'One of the most striking discoveries made by the Mars Global Surveyor and MRO was "inverted topography": ancient river valleys that now stand high above the landscape as winding ridges. In the Hanksville badlands of Utah, Jurassic river gravels cemented into hard sandstone. As wind stripped away the softer surrounding floodplain mudstones, the ancient river beds became elevated mesas—providing an identical geological morphology to inverted channels in Eberswalde and Jezero craters.',
    nuanceDisclaimer:
      'The Hanksville fluvial systems flowed during the Jurassic Period on Earth amidst a vegetated continent with high precipitation and atmospheric oxygen. On Mars, inverted channels formed during the Noachian and Hesperian epochs (>3 billion years ago) without land vegetation. However, the mechanical process of differential wind erosion and gravel induration is identical.',
    geologicalMechanism:
      'Fluvial channels in the Morrison and Cedar Mountain formations deposited dense sands and gravels. Groundwaters rich in calcium carbonate and iron cemented the river channel. Over subsequent millions of years, fierce desert winds and dry weathering eroded the softer clay-rich floodplains, leaving the hardened riverbeds standing as sinuous elevated ridges.',
    comparison: {
      earthFeatureTitle: 'Hanksville Inverted Paleochannel Ridges',
      earthFeatureDescription:
        'Sinuous, flat-topped sandstone ridges winding across the desert floor, preserving cross-bedding and hematite concretions.',
      earthImageUrl:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      planetaryFeatureTitle: 'Eberswalde Crater & Jezero Inverted Channels',
      planetaryFeatureDescription:
        'High-resolution HiRISE cameras image prominent winding ridges crossing Martian crater floors, tracing the exact paths of ancient rivers.',
      planetaryImageUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      targetBody: 'mars',
      keySimilarities: [
        'Morphological inversion: river beds standing as elevated positive-relief ridges due to differential aeolian deflation',
        'Preservation of cross-bedding and sediment transport vectors within the cemented channel fills',
        'Abundant diagenetic hematite concretions ("blueberries") mimicking Opportunity rover discoveries at Meridiani',
        'Home to the Mars Desert Research Station (MDRS) for human crew operational simulations',
      ],
      criticalDivergences: [
        'Sedimentology: Formed in terrestrial vegetated floodplains vs. sterile prebiotic Martian riverbeds',
        'Erosion rates: Terrestrial rain accelerates erosion; Mars relies almost entirely on dry aeolian sandblasting over billions of years',
        'Gravity: Martian dust grains saltate differently at 0.38 g in low atmospheric pressure',
      ],
    },
    diagramType: 'inverted-channel',
    diagramTitle: 'Inverted Topography: How River Valleys Become Desert Ridges',
    diagramDescription:
      '3-stage geological evolution: river channel deposition → mineral cementation → differential wind erosion of surrounding floodplains.',
    testbedApplications: [
      {
        domain: 'Human Mars Simulation',
        title: 'MDRS Crew Simulation & EVA Operations',
        description:
          'Long-duration human analog crews simulate living on Mars, conducting EVA traverses in pressurized suit mockups across inverted ridges.',
        targetSystem: 'Mars Habitat & EVA Protocol Validation',
        readinessLevel: 'TRL 8',
      },
      {
        domain: 'Autonomous Rover Traverse',
        title: 'Navigating Inverted Ridges & Escarpments',
        description:
          'Testing rover waypoint pathfinding along narrow, rocky ridge tops with 10-meter drop-offs on either side.',
        targetSystem: 'Autonomous Navigation (AutoNav)',
        readinessLevel: 'TRL 7',
      },
      {
        domain: 'Sedimentary Stratigraphy',
        title: 'Orbital-to-Ground Image Correlation',
        description:
          'Matching drone aerial imagery with orbital satellite passes to calibrate how orbital cameras interpret channel width and flow direction.',
        targetSystem: 'Planetary Orbital Photogrammetry',
        readinessLevel: 'TRL 8',
      },
    ],
    nasaMissions: ['Mars Desert Research Station (MDRS)', 'Spaceward Bound', 'Mars 2020 Landing Site Working Group'],
    keyInstruments: ['Drone Aerial Photogrammetry', 'Laser Profilometers', 'Sediment Corers'],
    targetCoordinates: { lat: -24.0, lon: -33.3, locationName: 'Eberswalde Crater Inverted Delta, Mars' },
  },

  adventdalen: {
    siteId: 'adventdalen',
    site: earthSites.find((s) => s.id === 'adventdalen')!,
    title: 'Adventdalen Permafrost Valley',
    subtitle: 'Spitsbergen, Svalbard, Norway',
    category: 'Cryogenic Permafrost & Patterned Ground',
    primaryTarget: 'Martian Ground Ice & Utopia Planitia Polygons',
    targetBodies: ['mars'],
    heroImageUrl:
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=80',
    heroCaption:
      'Adventdalen: Continuous Arctic permafrost with polygonal patterned ground, ice wedges, and pingos in Spitsbergen.',
    tagline:
      'An Arctic permafrost laboratory testing ground-penetrating radar and rotary drills for subsurface water ice.',
    analogueThesis:
      'Subsurface water ice is Mars’s most valuable resource for future human expedition survival and rocket propellant production. Orbital radar shows massive sheet ice buried under meters of regolith in Utopia Planitia and Arcadia Planitia. Adventdalen hosts continuous permafrost, ice-wedge polygons, and frozen siltstone—providing the benchmark terrestrial site for testing permafrost coring drills and calibrating ground-penetrating radar instruments like RIMFAX.',
    nuanceDisclaimer:
      'In Adventdalen, an active top layer of soil (tens of centimeters) thaws each summer under an Arctic sun and supports tundra vegetation. On Mars, surface temperatures never exceed the triple point of liquid water in most regions; water ice sublimates directly into gas rather than melting, and permafrost remains permanently frozen at -60°C or colder. However, the radar dielectric properties and mechanical strength of ice-cemented silt are closely matched.',
    geologicalMechanism:
      'Continuous thermal contraction cracking in Arctic winter opens vertical fractures in the frozen ground. In spring, meltwater enters the fissures and refreezes, growing massive subterranean ice wedges over centuries. This thermal expansion produces distinctive polygonal patterned ground.',
    comparison: {
      earthFeatureTitle: 'Adventdalen Ice-Wedge Polygons & Pingo Basins',
      earthFeatureDescription:
        'Hexagonal patterned ground formed by thermal contraction cracking over ice wedges in frozen glaciomarine sediments.',
      earthImageUrl:
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      planetaryFeatureTitle: 'Utopia Planitia & Phoenix Landing Site Polygons',
      planetaryFeatureDescription:
        'The Phoenix lander and MRO HiRISE cameras discovered vast plains of patterned polygonal ground covering subsurface pure ice slabs.',
      planetaryImageUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      targetBody: 'mars',
      keySimilarities: [
        'Thermal contraction polygon networks with identical meter-scale geometric spacing',
        'Ice-cemented siltstone exhibiting high compressive strength challenging rotary drills',
        'Sharply defined dielectric boundary between dry overburden and massive ground ice detected by radar',
        'Thermokarst collapse depressions mirroring scallop-shaped pits seen in Martian mid-latitudes',
      ],
      criticalDivergences: [
        'Seasonal thaw: Adventdalen has a summer active layer with liquid water; Martian ice sublimates directly into vapor',
        'Ground temperatures: Svalbard permafrost sits at -6°C to -3°C; Martian permafrost is cryogenic (-60°C to -100°C)',
        'Atmospheric shielding: Arctic permafrost is insulated by Earth’s thick atmosphere; Martian ice faces thin desiccating air',
      ],
    },
    diagramType: 'permafrost',
    diagramTitle: 'Subsurface Ground Ice & Radar Sounding Echo Profiles',
    diagramDescription:
      'How high-frequency Ground Penetrating Radar (RIMFAX analogue) detects the dielectric boundary between regolith and massive water ice.',
    testbedApplications: [
      {
        domain: 'Resource Utilization (ISRU)',
        title: 'Deep Cryogenic Permafrost Drilling',
        description:
          'Testing automated rotary percussive drills to extract ice-cemented regolith cores without heating or sublimating the ice sample.',
        targetSystem: 'Mars Subsurface Ice Drill (1–2 meter depth)',
        readinessLevel: 'TRL 7',
      },
      {
        domain: 'Radar Geophysical Sounding',
        title: 'RIMFAX Ground-Penetrating Radar Calibration',
        description:
          'Calibrating GPR antenna arrays over frozen tundra to distinguish pure ice lenses from gravel beds and clay layers.',
        targetSystem: 'Ground Penetrating Radar (GPR)',
        readinessLevel: 'TRL 9',
      },
      {
        domain: 'Cryo-Astrobiology',
        title: 'Subsurface Cryo-Biosignature Preservation',
        description:
          'Sampling ancient ice cores to analyze DNA and cell membrane preservation within hyper-saline sub-zero liquid veins.',
        targetSystem: 'Astrobiology Life Detection System',
        readinessLevel: 'TRL 6',
      },
    ],
    nasaMissions: ['AMASE (Arctic Mars Analog Svalbard Expedition)', 'Perseverance RIMFAX Team', 'ESA ExoMars Drill Tests'],
    keyInstruments: ['RIMFAX-Type GPR Sounder', 'Subsurface Cryogenic Core Drills', 'Down-Hole Optical Probes'],
    targetCoordinates: { lat: 46.7, lon: 117.5, locationName: 'Utopia Planitia Ground Ice Plain, Mars' },
  },
}

