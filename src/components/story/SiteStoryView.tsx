import {
  ArrowLeft,
  ChevronDown,
  Globe,
  Layers,
  MapPin,
  Orbit,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SITE_STORIES, type SiteStory } from '../../data/story_dataset'
import { formatCoordinate } from '../../utils/formatters'

interface SiteStoryViewProps {
  siteId: string
  onBackToMap: () => void
  onSelectSite?: (siteId: string) => void
  onOpenDualMap: (siteId: string) => void
  onOpenDashboard: (siteId: string) => void
}

type ChapterId = 'prologue' | 'comparison'

/** Bite-sized documentary storylines */
const DOCUMENTARY_PROFILES: Record<
  string,
  {
    heroTitle: string
    heroSubtitle: string
    discoveryQuote: string
    storyOverview: string
    keyStats: { label: string; value: string; desc: string }[]
    similarities: string[]
    divergences: string[]
    fieldStories: { title: string; target: string; summary: string }[]
  }
> = {
  'la-corona': {
    heroTitle: 'LA CORONA LAVA TUBE',
    heroSubtitle: 'Lanzarote, Canary Islands, Spain · Subterranean Basaltic Shield',
    discoveryQuote:
      'Beneath the frozen black lava of Lanzarote lies a 7.6-kilometer subterranean corridor carved by ancient fire.',
    storyOverview:
      'In this pitch-black basalt cavern, astronauts step into perpetual darkness to explore underground shelters that could protect future lunar and Martian colonies from lethal cosmic radiation and extreme surface temperature swings.',
    keyStats: [
      { label: 'Radiation Shielding', value: '99%', desc: 'Cosmic rays blocked by 8m basalt roof' },
      { label: 'Thermal Buffer', value: '+18°C', desc: 'Stable year-round temperature' },
      { label: 'Cavern Span', value: '7.6 km', desc: 'Continuous subterranean tube length' },
    ],
    similarities: [
      'Basalt Composition: Identical volcanic rock rich in pyroxene and olivine minerals.',
      'Radiation Shield: Solid basalt roof absorbs 99%+ of lethal cosmic rays.',
      'Thermal Buffer: Underground void eliminates surface thermal swings of over 200°C.',
    ],
    divergences: [
      'Gravity & Scale: Lunar 0.17 g gravity allows caverns to span up to 500 m without collapsing.',
      'Atmosphere: Terrestrial caves contain moist air; Moon and Mars caves are dry vacuums.',
    ],
    fieldStories: [
      {
        title: 'GPS-Denied 3D LiDAR Mapping',
        target: 'Artemis Subsurface Drones',
        summary:
          'Astronauts and autonomous drones practice laser scanning in total darkness where GPS satellites cannot reach.',
      },
      {
        title: 'Structural Stability Testing',
        target: 'Cave Inhabitation Modules',
        summary:
          'Engineers measure stress fractures in basalt rock vaults to design inflatable pressurized habitats for human crews.',
      },
      {
        title: 'Tethered Skylight Descent',
        target: 'Lunar Pit Rappelling Systems',
        summary:
          'Crews practice vertical descents into steep volcanic collapse holes (jameos) simulating lunar pit entries.',
      },
    ],
  },

  'kilbourne-hole': {
    heroTitle: 'KILBOURNE HOLE MAAR',
    heroSubtitle: 'Potrillo Volcanic Field, New Mexico, USA · Mantle Xenoliths & Inverted Stratigraphy',
    discoveryQuote:
      'A violent subterranean steam explosion blasted through the desert floor, turning geological layers inside-out.',
    storyOverview:
      'When hot basalt magma collided with deep groundwater 24,000 years ago, explosive steam dredged up pristine green mantle rocks from 50 kilometers beneath the Earth. This inverted crater rim trained Apollo astronauts and now prepares Artemis crews to hunt for lunar mantle samples.',
    keyStats: [
      { label: 'Crater Basin', value: '2.0 km', desc: 'Diameter of explosive excavation' },
      { label: 'Mantle Source', value: '50 km', desc: 'Depth of dredged green peridotite' },
      { label: 'Apollo Provenance', value: '4 Missions', desc: 'Trained Apollo 12, 14, 16, & 17' },
    ],
    similarities: [
      'Inverted Stratigraphy: Explosive blast throws deep mantle rocks directly onto the crater rim.',
      'Peridotite Minerals: Pristine green olivine xenoliths match lunar highland samples.',
      'Regolith Slopes: Steep loose ash slopes test astronaut boots, scoops, and rover wheel traction.',
    ],
    divergences: [
      'Blast Trigger: Formed by subterranean steam explosion, not hypervelocity meteorite impact.',
      'Weathering: Eroded by Earth wind and rainfall, unlike vacuum-preserved lunar craters.',
    ],
    fieldStories: [
      {
        title: 'Artemis Field Geology Drills',
        target: 'EVA Hand Tools & Sample Bags',
        summary:
          'Astronauts practice identifying high-value mantle peridotite rocks within seconds while wearing pressurized spacesuit gloves.',
      },
      {
        title: 'Loose Ash Traction Control',
        target: 'Lunar Terrain Vehicle (LTV)',
        summary:
          'Testing rover wheel tread patterns and electric drive motors across steep 20° unconsolidated ash slopes.',
      },
      {
        title: 'Handheld Raman Spectrometry',
        target: 'Real-time Mineral Sensors',
        summary:
          'Validating laser spectrometers to instantly unmix olivine and pyroxene crystals without bringing samples back to the lab.',
      },
    ],
  },

  'pajonales': {
    heroTitle: 'SALAR DE PAJONALES',
    heroSubtitle: 'Atacama Desert, Antofagasta, Chile · High-Altitude Evaporite Salt Basin',
    discoveryQuote:
      'At 3,500 meters under lethal ultraviolet skies, microbial life survives hidden inside translucent salt crystals.',
    storyOverview:
      'In the hyper-arid Atacama Desert, rain almost never falls and solar radiation is intense. Yet inside translucent halite and gypsum crystals, photosynthetic microbes thrive in microscopic pores—demonstrating where ancient microbial life could be fossilized on Mars.',
    keyStats: [
      { label: 'Elevation', value: '3,537 m', desc: 'High-altitude UV-exposed plateau' },
      { label: 'Mineral Matrix', value: 'Halite & Gypsum', desc: 'Translucent optical light guides' },
      { label: 'Rainfall', value: '< 1 mm/yr', desc: 'Driest non-polar desert on Earth' },
    ],
    similarities: [
      'Evaporite Salt Beds: Identical gypsum and halite minerals from evaporated ancient lakes.',
      'UV Shielding: Translucent salt crystals block lethal UV while letting in photosynthetic light.',
      'Fossil Pores: Microbes survive inside crystal fluid inclusions as long-lasting biosignatures.',
    ],
    divergences: [
      'Atmospheric Gas: Earth has oxygen; Mars has thin (0.6 kPa) dry CO₂.',
      'Soil Chemistry: Martian salts contain highly oxidizing, ancient perchlorates.',
    ],
    fieldStories: [
      {
        title: 'Microbial Biosignature Extraction',
        target: 'Perseverance SHERLOC / Mars Sample Return',
        summary:
          'Scientists test deep-UV Raman spectroscopy to detect lipid and carotenoid biomarkers preserved inside salt matrices.',
      },
      {
        title: 'Optical Crystal Light-Guiding',
        target: 'Extremophile Astrobiology',
        summary:
          'Studying how gypsum crystals channel useful sunlight into subsurface pores while absorbing destructive UV-C rays.',
      },
      {
        title: 'Autonomous Evaporite Navigation',
        target: 'Next-Gen Mars Rovers',
        summary:
          'Calibrating rover stereo cameras to recognize polygon salt ridges and avoid sharp, brittle evaporite terrain traps.',
      },
    ],
  },

  'dallol': {
    heroTitle: 'DALLOL HYDROTHERMAL FIELD',
    heroSubtitle: 'Danakil Depression, Afar Region, Ethiopia · Hyper-Acidic Geothermal Springs',
    discoveryQuote:
      'Neon-yellow boiling acid pools and towering salt chimneys mirror the volcanic hydrothermal systems of early Mars.',
    storyOverview:
      'Located 125 meters below sea level in an active continental rift, magma heats underground water into hyper-acidic brine with a pH below 0. Dallol pushes the absolute geochemical limits of life, showing what early Mars looked like when volcanic hot springs covered its surface 3.8 billion years ago.',
    keyStats: [
      { label: 'Fluid Acidity', value: 'pH < 0', desc: 'Water as acidic as concentrated battery acid' },
      { label: 'Spring Temperature', value: '108°C', desc: 'Boiling hyper-saline hydrothermal fluid' },
      { label: 'Elevation', value: '-125 m', desc: 'Depression basin beneath sea level' },
    ],
    similarities: [
      'Hydrothermal Chemistry: Acidic sulfur, iron oxides, and silica match early Mars hot springs.',
      'Silica Sinters: Precipitates nodular silica towers matching Spirit rover findings at Home Plate.',
      'Life Limits: Probes the absolute geochemical boundary where cellular life ceases to exist.',
    ],
    divergences: [
      'Active vs Extinct: Dallol is an active modern rift; Martian hydrothermal vents dried billions of years ago.',
      'Atmosphere: Boiling volcanic gas in Earth air vs. cold, thin Martian CO₂.',
    ],
    fieldStories: [
      {
        title: 'Extreme Life Boundary Probing',
        target: 'Astrobiology Search for Life',
        summary:
          'Taking sterile samples of boiling acid pools to identify the exact threshold where physical chemistry prevents cellular metabolism.',
      },
      {
        title: 'Silica Chimney Fingerprinting',
        target: 'Ancient Mars Hydrothermal Vents',
        summary:
          'Comparing silica deposits from Dallol springs with hydrothermal silica sinter discovered by the Spirit rover in Gusev Crater.',
      },
      {
        title: 'Corrosive Instrument Testing',
        target: 'Extreme Environment Sensors',
        summary:
          'Validating chemical sensors, drill bits, and metallic coatings against boiling hyper-acidic sulfuric fluids.',
      },
    ],
  },

  'hanksville': {
    heroTitle: 'HANKSVILLE BADLANDS',
    heroSubtitle: 'San Rafael Desert, Utah, USA · Ancient Inverted Paleoriver Channels',
    discoveryQuote:
      'Ancient riverbeds now stand elevated as stone ridges above the desert—sculpted by millions of years of wind.',
    storyOverview:
      'In Utah’s red rock desert, ancient rivers once carried heavy gravel across sandstone plains. Over millions of years, wind eroded away the softer surrounding dirt, leaving the hardened riverbeds standing high above the desert floor as raised stone ridges—a geological mirror of the inverted river channels seen across Mars.',
    keyStats: [
      { label: 'Channel Age', value: '145 Myr', desc: 'Preserved Jurassic fluvial gravels' },
      { label: 'Ridge Relief', value: '15 to 30 m', desc: 'Elevation above eroded desert plains' },
      { label: 'Sediment Type', value: 'Fluvial Sandstone', desc: 'Dense cemented paleoriver gravels' },
    ],
    similarities: [
      'Inverted Riverbeds: Hardened gravel channels stand as elevated ridges after wind deflation.',
      'Sedimentary Strata: Layered sandstone and clay deposits match Jezero Crater river deltas.',
      'Rover Terrain: Sinuous narrow ridges and sand dunes test autonomous rover navigation.',
    ],
    divergences: [
      'Tectonic History: Buried and uplifted by plate tectonics, absent on Mars.',
      'Preservation Age: Utah ridges are 145M years old; Martian paleochannels are 3.5B years old.',
    ],
    fieldStories: [
      {
        title: 'Rover Autonomous Ridge Driving',
        target: 'Perseverance AutoNav System',
        summary:
          'Testing computer vision algorithms that allow rovers to navigate along narrow riverbed ridges without tumbling off edges.',
      },
      {
        title: 'Paleoriver Stratigraphy Reading',
        target: 'Sedimentary Delta Mission Planning',
        summary:
          'Geologists practice deciphering cross-bedding and grain sizes from rover mast cameras to reconstruct ancient water flow speeds.',
      },
      {
        title: 'Wheeled Mobility Over Slickrock',
        target: 'Mars Sample Fetch Rovers',
        summary:
          'Evaluating titanium wheel cleat designs on transitions between hard slickrock sandstone and soft aeolian sand.',
      },
    ],
  },

  'adventdalen': {
    heroTitle: 'ADVENTDALEN PERMAFROST VALLEY',
    heroSubtitle: 'Spitsbergen, Svalbard, Norway · High-Arctic Cryogenic Ground Ice',
    discoveryQuote:
      'Deep in the Arctic archipelago of Svalbard, thick permafrost locks ancient ground ice beneath the frozen tundra.',
    storyOverview:
      'Svalbard’s continuous permafrost creates polygon-patterned ground and buried ice wedges. Here, scientists calibrate ground-penetrating radar instruments to probe beneath the surface, preparing for missions that will detect and extract drinking water ice for human bases on Mars.',
    keyStats: [
      { label: 'Permafrost Depth', value: '100–500 m', desc: 'Continuous frozen ground depth' },
      { label: 'Annual Mean Temp', value: '-5.8°C', desc: 'High-Arctic cryogenic climate' },
      { label: 'Ground Ice Type', value: 'Wedge & Pore Ice', desc: 'Ice lenses locked in frozen silt' },
    ],
    similarities: [
      'Patterned Ground: Giant thermal contraction ice polygons matching Martian orbital imagery.',
      'Radar Calibration: Premier testbed to calibrate Ground-Penetrating Radar (GPR) for subsurface ice.',
      'Cryogenic Sampling: Tests rotary core drills that sample pure ice without friction-melting.',
    ],
    divergences: [
      'Summer Thaw: Arctic tundra has a summer thaw layer; Martian permafrost remains permanently frozen.',
      'Atmosphere: Polar air pressure (101 kPa) vs. Martian thin-atmosphere vacuum (0.6 kPa).',
    ],
    fieldStories: [
      {
        title: 'Ground-Penetrating Radar Calibration',
        target: 'Mars RIMFAX / WISDOM Radar',
        summary:
          'Pulling high-frequency radar sleds across frozen tundra to map dielectric boundaries between soil and subsurface ice lenses.',
      },
      {
        title: 'Cryogenic Ice Core Extraction',
        target: 'Subsurface Water Drilling (ISRU)',
        summary:
          'Testing rotary percussive drill bits that extract uncontaminated ice cores without frictional heating melting the ice.',
      },
      {
        title: 'Polygonal Pattern Drone Surveys',
        target: 'Autonomous Planetary Aerial Mapping',
        summary:
          'Flying multi-spectral camera drones to measure frost heave crack dimensions and map permafrost distribution.',
      },
    ],
  },
}

export function SiteStoryView({
  siteId,
  onBackToMap,
  onOpenDualMap,
  onOpenDashboard,
}: SiteStoryViewProps) {
  const story: SiteStory = SITE_STORIES[siteId] ?? SITE_STORIES['la-corona']
  const profile =
    DOCUMENTARY_PROFILES[siteId] ?? DOCUMENTARY_PROFILES['la-corona']
  const { site } = story

  // Chapter navigation & active chapter tracker
  const [activeChapter, setActiveChapter] = useState<ChapterId>('prologue')
  const containerRef = useRef<HTMLDivElement>(null)

  const prologueRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const outroRef = useRef<HTMLElement>(null)

  function scrollToChapter(chapter: ChapterId) {
    setActiveChapter(chapter)
    const refMap = {
      prologue: prologueRef,
      comparison: comparisonRef,
    }
    const target = refMap[chapter]?.current
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Auto-update active chapter on scroll
  useEffect(() => {
    function handleScroll() {
      const compRect = comparisonRef.current?.getBoundingClientRect()

      if (compRect && compRect.top <= 250) {
        setActiveChapter('comparison')
      } else {
        setActiveChapter('prologue')
      }
    }

    const scrollParent = containerRef.current?.parentElement
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    if (scrollParent) {
      scrollParent.addEventListener('scroll', handleScroll, { passive: true })
    }

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true } as any)
      if (scrollParent) {
        scrollParent.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen text-slate-100 cinematic-grain selection:bg-orange-500/30"
    >
      {/* =========================================================================
          STATIC LOCKED BACKGROUND: Locked to screen, does NOT move when scrolling
          ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={story.heroImageUrl}
          alt={story.title}
          className="h-full w-full object-cover filter brightness-[0.55] contrast-[1.15]"
        />
        {/* Subtle cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(2,6,23,0.6)_100%)]" />
      </div>

      {/* =========================================================================
          1. CINEMATIC EXPEDITION HUD (Floating Translucent Mission Bar)
          ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Back to Earth Globe Pill */}
          <button
            type="button"
            onClick={onBackToMap}
            className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-slate-400 transition-transform group-hover:-translate-x-0.5" />
            <span>Earth Globe</span>
          </button>

          {/* Documentary Chapter Stepper */}
          <nav
            aria-label="Expedition Chapters"
            className="hidden md:flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/80 p-1"
          >
            <button
              type="button"
              onClick={() => scrollToChapter('prologue')}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                activeChapter === 'prologue'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              I. Expedition
            </button>
            <button
              type="button"
              onClick={() => scrollToChapter('comparison')}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                activeChapter === 'comparison'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              II. Analogue vs. Space
            </button>
          </nav>

          {/* Right: Telemetry & Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDualMap(siteId)}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <Orbit className="size-3.5 text-slate-400" />
              <span>Dual Map</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard(siteId)}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <Layers className="size-3.5 text-slate-400" />
              <span>Physics</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. CHAPTER I: CINEMATIC PROLOGUE CONTENT
          Natural flow allowing user to scroll lower comfortably past bottom stats.
          ========================================================================= */}
      <section
        ref={prologueRef}
        id="chapter-prologue"
        className="relative z-10 flex min-h-[calc(100vh+6rem)] w-full flex-col justify-between px-4 pt-6 pb-28 sm:px-8 sm:pt-8 sm:pb-36 bg-transparent"
      >
        {/* Top Telemetry Stamp - scrolls naturally off with initial scroll */}
        <div className="relative z-10 mx-auto w-full max-w-7xl pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-3">
              <span className="inline-block size-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="uppercase tracking-widest text-slate-200">
                Planetary Analogue Expedition
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>{formatCoordinate(site.coordinate)}</span>
              <span>·</span>
              <span className="uppercase">{story.primaryTarget}</span>
            </div>
          </div>
        </div>

        {/* Center: Grand Documentary Editorial Title */}
        <div className="relative z-10 mx-auto max-w-4xl py-6 text-center sm:py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            <span className="size-1.5 rounded-full bg-orange-400 animate-ping" />
            <span>Chapter I · Terrestrial Analogue Expedition</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-5xl lg:text-6xl">
            {profile.heroTitle}
          </h1>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-sky-400 sm:text-base">
            <MapPin className="size-4 shrink-0 text-sky-400" />
            <span>{profile.heroSubtitle}</span>
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-sm font-normal leading-relaxed text-slate-200 drop-shadow sm:text-base italic">
            &quot;{profile.discoveryQuote}&quot;
          </p>

          {/* Concise 2-sentence story overview */}
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            {profile.storyOverview}
          </p>

          {/* Scroll Down Prompt */}
          <button
            type="button"
            onClick={() => scrollToChapter('comparison')}
            className="group mx-auto mt-6 flex flex-col items-center gap-1 text-xs text-slate-400 transition-colors hover:text-white"
          >
            <span className="uppercase tracking-widest text-[0.6875rem]">Explore Planetary Comparison</span>
            <ChevronDown className="size-4 animate-bounce text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Bottom: 3 Clean Minimalist Telemetry Indicators */}
        <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-1 divide-y divide-white/10 border-t border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {profile.keyStats.map((stat, idx) => (
            <div key={idx} className="p-3 text-center sm:p-4">
              <span className="block font-mono text-xl font-bold text-white sm:text-2xl">
                {stat.value}
              </span>
              <span className="mt-0.5 block text-xs font-semibold uppercase tracking-wider text-orange-400">
                {stat.label}
              </span>
              <span className="mt-0.5 block text-[0.6875rem] text-slate-400">
                {stat.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. CHAPTER II: ANALOGUE VS. REAL ENVIRONMENT COMPARISON
          ========================================================================= */}
      <section
        ref={comparisonRef}
        id="chapter-comparison"
        className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 scroll-mt-16 bg-transparent"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-6 text-center sm:mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Chapter II · Planetary Comparison
            </span>
            <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
              Earth Analogue vs. Real Space Environment
            </h2>
            <p className="mx-auto mt-1 max-w-2xl text-xs sm:text-sm text-slate-300">
              Direct comparison between Earth's terrestrial analogue and its extraterrestrial counterpart, highlighting environmental fidelity and key physical differences.
            </p>
          </div>

          {/* Concise Scientific Contrast: Similarities vs Differences */}
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
            {/* Similarities */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/75 p-4 sm:p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                  ✓
                </span>
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white">
                  Similarities
                </h3>
              </div>
              <ul className="mt-3 space-y-2.5">
                {profile.similarities.map((item, idx) => {
                  const colonIndex = item.indexOf(':')
                  const head = colonIndex !== -1 ? item.slice(0, colonIndex) : null
                  const tail = colonIndex !== -1 ? item.slice(colonIndex + 1).trim() : item

                  return (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-snug">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <div>
                        {head ? (
                          <>
                            <span className="font-semibold text-slate-100">{head}:</span>{' '}
                            <span className="text-slate-300">{tail}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">{item}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Differences */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/75 p-4 sm:p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 font-bold text-xs">
                  !
                </span>
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white">
                  Differences
                </h3>
              </div>
              <ul className="mt-3 space-y-2.5">
                {profile.divergences.map((item, idx) => {
                  const colonIndex = item.indexOf(':')
                  const head = colonIndex !== -1 ? item.slice(0, colonIndex) : null
                  const tail = colonIndex !== -1 ? item.slice(colonIndex + 1).trim() : item

                  return (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-snug">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange-400" />
                      <div>
                        {head ? (
                          <>
                            <span className="font-semibold text-slate-100">{head}:</span>{' '}
                            <span className="text-slate-300">{tail}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">{item}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CHAPTER V: QUANTITATIVE SCIENCE SUITE & OUTRO
          ========================================================================= */}
      <footer
        ref={outroRef}
        className="relative z-10 border-t border-slate-800/80 py-16 sm:py-24 bg-transparent"
      >
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          {/* Quantitative Science Suite Links */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-6 sm:p-8 text-center backdrop-blur-md shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              Quantitative Science Suite
            </span>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold text-white">
              Planetary Telemetry & Comparison Engine
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-slate-400">
              Ready for numerical analysis? Launch the 7-dimension physics comparison engine to analyze atmospheric densities, radiation fluxes, solar irradiance, and surface mineralogy between {story.title} and {story.comparison.planetaryFeatureTitle}.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenDualMap(siteId)}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-700 hover:border-slate-600 shadow-sm"
              >
                <Orbit className="size-4 text-sky-400" />
                <span>Launch Dual Planetary Map</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenDashboard(siteId)}
                className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-slate-700 hover:text-white"
              >
                <Layers className="size-4 text-slate-400" />
                <span>7D Physics Dashboard</span>
              </button>
              <button
                type="button"
                onClick={onBackToMap}
                className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-semibold text-slate-400 transition-all hover:border-slate-700 hover:text-white"
              >
                <Globe className="size-4 text-slate-500" />
                <span>Return to Earth Globe</span>
              </button>
            </div>
          </div>

          {/* Copyright / Hackathon Stamp */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80 pt-6 text-[0.6875rem] text-slate-400 font-mono">
            <span>Terra Analogues · Planetary Exploration</span>
            <span>All telemetry sourced from GIBS, SRTM, ASTER GDEM, MODIS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
