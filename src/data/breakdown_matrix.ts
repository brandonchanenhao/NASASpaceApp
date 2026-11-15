import type { BreakdownSeverity, TestbedApplication } from '../types'

/**
 * Target bodies addressed by an Earth analog pairing. The Moon and Mars are the
 * only permanent-base destinations in scope, so Earth cannot appear here.
 */
export type TargetBody = 'moon' | 'mars'

/**
 * One physics gap that no terrestrial site can reproduce.
 *
 * The same physical domain has different measured values on the Moon and on
 * Mars, so every field that varies by body is keyed by body rather than being
 * flattened into one string.
 */
export interface UniversalBreakdown {
  /** Physical domain, e.g. "Gravity" or "Radiation". */
  domain: string
  /** Earth-side measurement with SI units. */
  earthValue: string
  /** Target-side measurements, keyed by destination body. */
  targetValues: Record<TargetBody, string>
  /** Physical consequence of the gap, keyed by destination body. */
  consequences: Record<TargetBody, string>
  /** How badly the analogy breaks: low → fundamental. */
  severity: BreakdownSeverity
  /** Engineering or operational countermeasure. */
  mitigationStrategy: string
}

/**
 * The six universal physics breakdowns.
 *
 * Values are published mission-engineering figures:
 * - Surface gravity: IAU nominal values (Earth 9.81, Moon 1.62, Mars 3.72 m s⁻²).
 * - Surface pressure: Earth 101.3 kPa; lunar exosphere < 3 × 10⁻¹² Pa;
 *   Mars 0.636 kPa mean annual pressure.
 * - Annual dose: Earth sea-level natural background 0.5–1 mSv yr⁻¹;
 *   lunar surface ≈ 380 mSv yr⁻¹; Martian surface ≈ 240 mSv yr⁻¹
 *   (MSL/RAD-based estimates).
 * - Synodic day: Earth 24 h; Moon 708 h (29.53 d); Mars 24.66 h (1 sol).
 */
export const UNIVERSAL_BREAKDOWNS: readonly UniversalBreakdown[] = [
  {
    domain: 'Gravity',
    earthValue: '9.81 m s⁻² (1.00 g)',
    targetValues: {
      moon: '1.62 m s⁻² (0.17 g)',
      mars: '3.72 m s⁻² (0.38 g)',
    },
    consequences: {
      moon:
        'At 0.17 g, regolith bearing capacity, wheel traction, dust settling and human locomotion all scale differently; terrestrial soil-mechanics and EVA metabolic rates cannot be extrapolated.',
      mars:
        'At 0.38 g, slope stability, traction and ballistics differ materially from Earth, and dust settling velocities change the soiling environment.',
    },
    severity: 'fundamental',
    mitigationStrategy:
      'Qualify locomotion and excavation on parabolic-flight and gravity-offloaded rigs; design for reduced bearing pressure, anchored infrastructure and gravity-independent fluid systems.',
  },
  {
    domain: 'Atmosphere',
    earthValue: '101.3 kPa (78% N₂, 21% O₂)',
    targetValues: {
      moon: '< 3 × 10⁻¹² Pa (effectively vacuum)',
      mars: '0.636 kPa CO₂ (0.6% of Earth sea level)',
    },
    consequences: {
      moon:
        'With no atmosphere there is no convective cooling, aerodynamic drag or acoustic propagation; outgassing and sublimation behave as in vacuum and all pressure must come from a sealed habitat.',
      mars:
        'The thin CO₂ atmosphere gives weak convective cooling, aeolian transport and seasonal CO₂ frost, but no breathable oxygen and no pressure protection.',
    },
    severity: 'fundamental',
    mitigationStrategy:
      'Use vacuum and Mars-analog pressure/temperature chambers; require full life support, pressure-suited operations and dust-tolerant seals in every design verified at the analog.',
  },
  {
    domain: 'Radiation',
    earthValue: '0.5–1 mSv yr⁻¹ (natural background)',
    targetValues: {
      moon: '≈ 380 mSv yr⁻¹ (GCR + solar particle events)',
      mars: '≈ 240 mSv yr⁻¹ (thin-atmosphere attenuated)',
    },
    consequences: {
      moon:
        'The unshielded lunar surface delivers roughly 400× the terrestrial dose, exceeding career limits within about one year and driving single-event-upset rates in avionics.',
      mars:
        'The Martian surface delivers roughly 240× the terrestrial dose, approaching career limits over a single long-duration mission and requiring storm shelters for solar particle events.',
    },
    severity: 'fundamental',
    mitigationStrategy:
      'Provide ≥ 3 m of regolith overburden or lava-tube shelter, polyethylene/water shielding, radiation-hardened avionics and a dedicated solar-particle-event storm shelter.',
  },
  {
    domain: 'Electrostatic Dust',
    earthValue: 'Aeolian saltation and suspension, damped by air',
    targetValues: {
      moon: 'UV-charged grains lofted triboelectrically in vacuum',
      mars: 'Triboelectric charging plus global dust storms (AOD > 5)',
    },
    consequences: {
      moon:
        'Without atmospheric damping, charged lunar grains adhere to suits, optics and radiators and can levitate above the terminator; terrestrial dust tests miss the electrostatic component entirely.',
      mars:
        'Charged dust storms coat solar arrays and optical surfaces for weeks, and electrostatic adhesion defeats simple mechanical cleaning.',
    },
    severity: 'high',
    mitigationStrategy:
      'Test conductive/EDL coatings, electrostatic dust shields and brushes in plasma or vacuum chambers; carry soiling monitors and design cleaning cycles into operations.',
  },
  {
    domain: 'Day/Night Cycle',
    earthValue: '24 h day (12 h photoperiod at the equator)',
    targetValues: {
      moon: '708 h synodic day (≈ 29.5 Earth days)',
      mars: '24.66 h sol (within 50 min of Earth)',
    },
    consequences: {
      moon:
        'A 354 h lunar night forces nuclear or regenerative fuel-cell power and thermal storage; Earth solar-plus-battery architectures validated on a 24 h cycle do not transfer.',
      mars:
        'The 24.66 h sol is operationally close to Earth but shifts every Earth day, so ground teams must run on Mars time and batteries must cover a slightly longer night.',
    },
    severity: 'medium',
    mitigationStrategy:
      'Size power and thermal storage for the target cycle; run analog campaigns on a shifted sol clock and simulate the lunar night in a thermal-vacuum chamber.',
  },
  {
    domain: 'Seismic & Micrometeorite Environment',
    earthValue: 'Tectonic seismicity; meteoroids ablate in the atmosphere',
    targetValues: {
      moon: 'Deep and thermal moonquakes; unablated micrometeoroids',
      mars: 'Low seismicity (InSight M_w ≤ 5); thin-atmosphere impacts',
    },
    consequences: {
      moon:
        'Thermal moonquakes and micrometeoroid impacts reach the surface unshielded, producing a long-duration seismic background and impact flux with no terrestrial equivalent.',
      mars:
        'Marsquakes are rarer and weaker than those on Earth but still exceed design assumptions for a rigid habitat, and small impacts reach the surface through the thin atmosphere.',
    },
    severity: 'low',
    mitigationStrategy:
      'Include seismic isolation mounts, Whipple/micrometeoroid shielding and impact-tolerant radiator design; instrument the analog site with seismometers to separate anthropogenic from natural noise.',
  },
]

/**
 * Testbed operations available at each Earth analog, keyed by site id.
 *
 * Readiness levels follow the NASA TRL scale: 4 = laboratory validation,
 * 5 = relevant environment, 6 = relevant environment at prototype scale,
 * 7 = operational environment.
 */
export const TESTBED_CATALOG: Record<string, readonly TestbedApplication[]> = {
  'kilbourne-hole': [
    {
      operation: 'EVA traverse and sample-caching rehearsal',
      description:
        'Crew-scale traverses across the 2 km maar rim exercise suit mobility, station keeping and sample documentation on unconsolidated ejecta.',
      readinessLevel: 5,
      specificTest:
        'Two-crew, 4 h traverses with suited-equivalent backpacks, sampling tephra and xenoliths at ten georeferenced stations.',
      relevantSystems: ['EVA suits', 'Sample caching system', 'Surface navigation'],
    },
    {
      operation: 'Explosive-excavation ejecta sampling',
      description:
        'Base-surge deposits expose excavation stratigraphy that stands in for impact and volcanic ejecta blankets on airless bodies.',
      readinessLevel: 4,
      specificTest:
        'Trench and sieve base-surge beds to measure ejecta thickness, grain size and component diversity against a photogrammetric section.',
      relevantSystems: ['Regolith sampling tools', 'Sieve and particle-size instruments'],
    },
    {
      operation: 'Rover mobility over unconsolidated tephra',
      description:
        'Tephra slopes reproduce the low-cohesion, high-slip surfaces that dominate rover traction risk on regolith.',
      readinessLevel: 5,
      specificTest:
        'Slope-climb and slip tests of a flight-like wheel on 10–25° tephra slopes, logging wheel slip, sinkage and power draw.',
      relevantSystems: ['Rover mobility subsystem', 'Terrain classification'],
    },
    {
      operation: 'Portable VNIR mineral identification',
      description:
        'Olivine, clinopyroxene and plagioclase xenoliths provide ground truth for field spectral classifiers.',
      readinessLevel: 6,
      specificTest:
        'Collect field VNIR spectra at 20 stations and score an onboard mineral classifier against laboratory XRD of the same samples.',
      relevantSystems: ['VNIR spectrometers', 'Autonomous science targeting'],
    },
  ],
  adventdalen: [
    {
      operation: 'Ice-cemented regolith drilling',
      description:
        'Continuous permafrost with an ice table shallower than a metre mirrors the ice-cemented regolith expected at mid-latitude Mars base sites.',
      readinessLevel: 5,
      specificTest:
        'Drill to the 0.8 m ice table and core ice-cemented silt while logging bit temperature, penetration rate and cuttings transport at −5 °C.',
      relevantSystems: ['Sample acquisition drill', 'Cryogenic sample handling'],
    },
    {
      operation: 'Ground-penetrating radar calibration',
      description:
        'Known ice-table depths let radar inversions be validated against direct auger ground truth rather than models.',
      readinessLevel: 6,
      specificTest:
        'Profile the ice table with 100–500 MHz GPR along surveyed transects and compare migrated depth picks with auger cores.',
      relevantSystems: ['GPR sounder', 'Subsurface inversion pipeline'],
    },
    {
      operation: 'Periglacial terrain classification',
      description:
        'Polygon networks, pingos and thermokarst give labelled examples of the periglacial morphology sought on Mars.',
      readinessLevel: 4,
      specificTest:
        'Map polygons and pingos from UAV orthophotos and train a terrain classifier scored against field-surveyed boundaries.',
      relevantSystems: ['UAV imaging', 'Autonomous terrain classification'],
    },
    {
      operation: 'Cryogenic sample chain of custody',
      description:
        'Volatile-bearing cores must stay below the sublimation threshold from acquisition to analysis.',
      readinessLevel: 4,
      specificTest:
        'Transfer drilled cores into a −20 °C portable freezer and log temperature excursions across a 12 h transport leg.',
      relevantSystems: ['Sample transfer mechanism', 'Thermal monitoring'],
    },
  ],
  pajonales: [
    {
      operation: 'Biosignature instrument calibration',
      description:
        'Halite and gypsum crusts with UV-tolerant halophiles provide realistic detection limits for life-detection payloads.',
      readinessLevel: 5,
      specificTest:
        'Measure crusts with Raman and fluorescence instruments and quantify detection limits for carotenoids and membrane lipids.',
      relevantSystems: ['Raman spectrometer', 'Fluorescence imager'],
    },
    {
      operation: 'UV-exposure sampling protocol',
      description:
        'High-altitude UV flux degrades surface biosignatures, making the site a natural laboratory for sampling depth rules.',
      readinessLevel: 4,
      specificTest:
        'Deploy UV dosimeters and sample surface versus 5 cm depth to quantify how flux and exposure time reduce biomarker recovery.',
      relevantSystems: ['UV dosimeters', 'Subsurface sampling tools'],
    },
    {
      operation: 'Spectral mineral identification',
      description:
        'Evaporite assemblages give sharp VNIR–SWIR endmembers for validating orbital mineral mapping.',
      readinessLevel: 6,
      specificTest:
        'Collect field VNIR–SWIR spectra of halite, gypsum and thenardite and match them to ASTER and CRISM endmember libraries.',
      relevantSystems: ['VNIR–SWIR spectrometers', 'Spectral matching pipeline'],
    },
    {
      operation: 'Planetary-protection clean sampling',
      description:
        'Low humidity and high UV at 3.5 km altitude stress aseptic protocols for organic-sensitive samples.',
      readinessLevel: 5,
      specificTest:
        'Execute blank-controlled sampling with witness plates to verify contamination budgets under field conditions.',
      relevantSystems: ['Aseptic sampling kit', 'Contamination monitoring'],
    },
  ],
  'la-corona': [
    {
      operation: 'LiDAR SLAM navigation',
      description:
        'A 7.6 km basaltic tube with multiple skylights provides a GPS-denied corridor for mapping and localization trials.',
      readinessLevel: 5,
      specificTest:
        'Map 1 km of tube with a handheld LiDAR SLAM unit and compare trajectory drift against a surveyed control network.',
      relevantSystems: ['LiDAR SLAM', 'GPS-denied navigation'],
    },
    {
      operation: 'Habitat volume estimation',
      description:
        'Tube cross-sections can be reconstructed photogrammetrically to size a pressurized habitat inside the void.',
      readinessLevel: 4,
      specificTest:
        'Reconstruct 20 tube cross-sections from photogrammetry and derive usable floor area, headroom and pressure-vessel geometry.',
      relevantSystems: ['Photogrammetry', 'Habitat layout modeling'],
    },
    {
      operation: 'Thermal stability monitoring',
      description:
        'The tube interior buffers the diurnal cycle, which is the same property that makes lava tubes attractive on the Moon and Mars.',
      readinessLevel: 5,
      specificTest:
        'Log interior and exterior temperature at 10 min intervals for 72 h and quantify the attenuation of the diurnal swing.',
      relevantSystems: ['Thermal sensors', 'Habitat thermal control'],
    },
    {
      operation: 'Skylight ingress and egress',
      description:
        'Collapse skylights are the only natural access points to a subsurface habitat and must be traversable with cargo.',
      readinessLevel: 4,
      specificTest:
        'Rehearse rappel and hoist operations through a skylight carrying a 20 kg sample basket and a suited-equivalent crew member.',
      relevantSystems: ['EVA mobility', 'Sample hoist', 'Anchoring systems'],
    },
  ],
  dallol: [
    {
      operation: 'Acid-resistant material testing',
      description:
        'Hyper-acidic brines and sulfur aerosols attack seals, optics and fabrics in ways clean terrestrial sites never do.',
      readinessLevel: 4,
      specificTest:
        'Expose coupons of seal, optic and suit materials to pH < 1 brine and sulfur aerosol for 30 days, measuring mass loss and transmittance.',
      relevantSystems: ['Seals and gaskets', 'Optical coatings', 'Suit materials'],
    },
    {
      operation: 'Hyperspectral mineral identification',
      description:
        'Jarosite, goethite and native sulfur form the acid-sulfate assemblage used as a hydrothermal biosignature proxy on Mars.',
      readinessLevel: 5,
      specificTest:
        'Acquire field VNIR–TIR spectra of sinter and evaporite crusts and validate the mineral assignments against laboratory XRD.',
      relevantSystems: ['Hyperspectral imager', 'Mineral classification pipeline'],
    },
    {
      operation: 'Extremophile sampling',
      description:
        'Acidophiles and thermophiles at the sinter margins provide analogues for putative hydrothermal life on Mars.',
      readinessLevel: 4,
      specificTest:
        'Collect brine and sinter samples under aseptic conditions for culturing and metagenomic sequencing.',
      relevantSystems: ['Aseptic sampling kit', 'Life-detection instruments'],
    },
    {
      operation: 'Thermal-instrument calibration',
      description:
        'Sinter surfaces above 340 K give a hot-target calibration field for handheld and rover thermal instruments.',
      readinessLevel: 5,
      specificTest:
        'Compare handheld radiometer readings with in-situ thermocouples across 340–360 K surfaces at five sinter sites.',
      relevantSystems: ['Thermal radiometers', 'Thermocouple reference network'],
    },
  ],
  hanksville: [
    {
      operation: 'Rover wheel–soil interaction',
      description:
        'Sandstone benches and loose sand reproduce the cohesion range that governs wheel slip on Mars.',
      readinessLevel: 6,
      specificTest:
        'Measure drawbar pull and slip on 0–15° slopes with a single-wheel testbed at flight-like wheel loading.',
      relevantSystems: ['Rover mobility subsystem', 'Wheel-soil testbed'],
    },
    {
      operation: 'Hematite concretion caching',
      description:
        'Hematite concretions in the Jurassic sandstone are mineralogical and morphological analogs of Meridiani blueberries.',
      readinessLevel: 5,
      specificTest:
        'Locate and cache concretions with a rover-class arm and caching mechanism, then verify sample integrity after transport.',
      relevantSystems: ['Robotic arm', 'Sample caching mechanism'],
    },
    {
      operation: 'Aeolian instrumentation campaign',
      description:
        'Yardang fields provide a natural wind tunnel for dust-flux and abrasion instruments.',
      readinessLevel: 5,
      specificTest:
        'Deploy anemometers, dust-collection traps and a dust-flux sensor across a yardang field for a 30-day campaign.',
      relevantSystems: ['Dust-flux sensors', 'Anemometry', 'Solar-array soiling monitors'],
    },
    {
      operation: 'Desert-varnish spectral survey',
      description:
        'Thin alteration rinds test whether orbital or standoff spectrometers can detect surface coatings.',
      readinessLevel: 4,
      specificTest:
        'Map varnish coatings with VNIR spectra from 1 m to 100 m standoff and score detection against field-confirmed coverage.',
      relevantSystems: ['Standoff VNIR spectrometer', 'Surface coating detection'],
    },
  ],
}
