# PLAN.md — Phased Execution Blueprint for OpenCode
# NASA Space Apps 2026: LunaTerraMars Analog Explorer
# ════════════════════════════════════════════════════

> **Usage:** Copy each Phase prompt block into OpenCode sequentially.
> Wait for OpenCode to complete and verify before proceeding to the next Phase.

---

## PHASE 1: Project Scaffolding & Dependencies

### Prompt for OpenCode:

```
Read the AGENTS.md file in this directory for full project context, repository structure, coding conventions, and NASA API endpoints.

Initialize a React 19 + TypeScript + Vite project in the CURRENT directory (not a subdirectory). Install all dependencies and create foundational files.

STEP 1 — Scaffold with Vite:
  npm create vite@latest . -- --template react-ts

STEP 2 — Install dependencies:
  npm install leaflet react-leaflet @types/leaflet recharts lucide-react
  npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom

STEP 3 — Configure Tailwind + Vite:
Update vite.config.ts:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })

STEP 4 — Create src/index.css with Tailwind import and the custom space-mission dark theme CSS variables defined in AGENTS.md. Include custom scrollbar styles for the dark theme.

STEP 5 — Create every directory listed in the AGENTS.md repository structure:
src/data, src/engine, src/services, src/components/layout, src/components/maps, src/components/dashboard, src/components/configurator, src/components/ui, src/hooks, src/types, src/utils, scripts, tests

STEP 6 — Create src/types/index.ts with ALL TypeScript interfaces:
- CelestialBody type ('earth' | 'moon' | 'mars')
- Coordinate interface (lat, lon)
- FeatureVector interface (7 dimension fields: geology, terrain, thermal, volatiles, dust, subsurface, astrobiology — all number [0-1])
- DimensionWeights type (same shape as FeatureVector)
- DimensionMeta interface (key, label, shortLabel, unit, description, color)
- RawParameters interface (24 physical parameters with SI units in comments):
  D1-Geology: primaryMinerals string[], rockType string, mineralDiversityIndex number, alterationState number
  D2-Terrain: meanSlopeDeg number (°), surfaceRoughnessRMS number (cm), rockAbundancePct number (%), elevationM number (m)
  D3-Thermal: thermalInertia number (J m⁻² K⁻¹ s⁻¹/²), diurnalDeltaTK number (K), peakSurfaceTempK number (K), minSurfaceTempK number (K), annualIlluminationPct number (%)
  D4-Volatiles: waterIcePresence number (0-1), depthToIceM number (m), permafrostExtent number (0-1), isruPotentialIndex number (0-1)
  D5-Dust: dustCoverIndex number (0-1), aerosolOpticalDepth number, aeolianActivityIndex number (0-1)
  D6-Subsurface: caveLavaTubePresence number (0-1), estimatedTubeDiameterM number (m), roofThicknessM number (m), radiationShieldingFactor number (0-1)
  D7-Astrobiology: extremophilePresence number (0-1), biosignaturePreservation number (0-1), waterActivity number (0-1), uvFluxRelative number
- AnalogSite interface (id, name, shortName, body, coordinate, description, region, rawParameters, featureVector, instruments string[], citations Citation[], imageUrl, worldviewUrl?, pdsUrl?)
- AnalogPairing interface (id, earthSite, targetSite, similarityScore, cosineSimilarity, euclideanSimilarity, dimensionDeltas FeatureVector, breakdowns BreakdownItem[], testbedApplications TestbedApplication[])
- BreakdownItem interface (domain, earthValue, targetValue, deltaDescription, severity 'low'|'medium'|'high'|'fundamental', mitigationStrategy)
- TestbedApplication interface (operation, description, readinessLevel 1-9, specificTest, relevantSystems string[])
- Citation interface (id, instrument, dataset, description, url, doi?)
- TileLayer interface (id, name, body CelestialBody, urlTemplate, attribution, maxZoom, format 'png'|'jpg', tms boolean, category 'basemap'|'elevation'|'thermal'|'composition'|'other')
- CmrCollection interface (conceptId, title, summary, timeStart, timeEnd, spatialExtent)
- CmrGranule interface (title, conceptId, browseUrl?, downloadUrl?, timeStart, boundingBox?)

STEP 7 — Create src/utils/constants.ts:
- DIMENSION_KEYS array: ['geology','terrain','thermal','volatiles','dust','subsurface','astrobiology']
- DIMENSION_META array with label, shortLabel, unit, description, and a distinct color for each dimension (use colorblind-safe palette: amber, red, orange, cyan, violet, indigo, emerald)
- DEFAULT_WEIGHTS object (all 1.0)
- NASA API base URLs: NASA_CMR_BASE, NASA_GIBS_BASE, MOON_TREK_BASE, MARS_TREK_BASE

STEP 8 — Create src/utils/formatters.ts:
- formatNumber(value, decimals): locale-formatted number
- formatPercent(value): "XX.X%"
- formatTemperature(kelvin): "XXX K (-XX °C)"
- formatSimilarityScore(score): "XX.X%"
- formatDelta(earth, target, unit): "+/-XX.XX unit"

STEP 9 — Create src/utils/colors.ts:
- bodyColors: earth=#3b82f6, moon=#9ca3af, mars=#c1440e
- similarityColorScale(score): green(≥0.8), cyan(≥0.6), gold(≥0.4), orange(≥0.2), red(<0.2)
- severityColors: low=green, medium=gold, high=orange, fundamental=red
- dimensionColors array matching DIMENSION_META

STEP 10 — Create minimal App.tsx with header showing "LunaTerraMars Analog Explorer" with Rocket icon, "NASA Space Apps 2026" badge.

STEP 11 — Create .env file: VITE_NASA_API_KEY=DEMO_KEY

STEP 12 — Update index.html title to "LunaTerraMars Analog Explorer | NASA Space Apps 2026"

STEP 13 — Verify:
  npm run build
Must complete with zero errors and zero warnings.
```

---

## PHASE 2: Scientific Data Engine & Curated Dataset

### Prompt for OpenCode:

```
Read AGENTS.md for project context, NASA API endpoints, and coding conventions.

Build the complete Scientific Data Engine — the core of the project. Create all data files and computation modules.

STEP 1 — Create src/data/parameter_bounds.ts:

Export a ParameterBound interface { min, max, unit, description } and a PARAMETER_BOUNDS Record<string, ParameterBound> with these physically-motivated bounds spanning Earth/Moon/Mars:

mineralDiversityIndex: 0-1, alterationState: 0-1, meanSlopeDeg: 0-45°, surfaceRoughnessRMS: 0-100 cm, rockAbundancePct: 0-80%, thermalInertia: 10-2500 tiu, diurnalDeltaTK: 0-300 K, peakSurfaceTempK: 40-450 K, minSurfaceTempK: 40-350 K, annualIlluminationPct: 0-100%, waterIcePresence: 0-1, depthToIceM: 0-100 m (Infinity→100), permafrostExtent: 0-1, isruPotentialIndex: 0-1, dustCoverIndex: 0-1, aerosolOpticalDepth: 0-5, aeolianActivityIndex: 0-1, caveLavaTubePresence: 0-1, estimatedTubeDiameterM: 0-1000 m, roofThicknessM: 0-100 m, radiationShieldingFactor: 0-1, extremophilePresence: 0-1, biosignaturePreservation: 0-1, waterActivity: 0-1, uvFluxRelative: 0-5.

STEP 2 — Create src/engine/normalize.ts:

Export functions:
- normalizeValue(value, min, max): min-max normalization clamped [0,1]
- normalizeParameter(value, paramKey): looks up bounds from PARAMETER_BOUNDS
- computeFeatureVector(raw: RawParameters): FeatureVector using these aggregation formulas:
  D1 geology = mean(mineralDiversityIndex, alterationState)
  D2 terrain = mean(norm(meanSlopeDeg), norm(surfaceRoughnessRMS), norm(rockAbundancePct))
  D3 thermal = mean(norm(thermalInertia), norm(diurnalDeltaTK), norm(annualIlluminationPct))
  D4 volatiles = mean(waterIcePresence, 1-norm(depthToIceM), permafrostExtent, isruPotentialIndex)
  — Note: for depthToIceM, treat Infinity as 100, normalize, then invert (1-norm) so shallower=higher
  D5 dust = mean(dustCoverIndex, norm(aerosolOpticalDepth), aeolianActivityIndex)
  D6 subsurface = mean(caveLavaTubePresence, norm(estimatedTubeDiameterM), norm(roofThicknessM), radiationShieldingFactor)
  D7 astrobiology = mean(extremophilePresence, biosignaturePreservation, waterActivity, 1-norm(uvFluxRelative))
  — Note: for uvFluxRelative, normalize then invert (1-norm) so lower UV = higher score

STEP 3 — Create src/data/analogs_dataset.ts:

This is the SINGLE SOURCE OF TRUTH. Define 16 sites with complete real scientific data:

6 EARTH SITES (every value is a real physical measurement):
E1: Kilbourne Hole Maar, NM (31.97°N, 106.97°W) — phreatomagmatic maar, mantle xenoliths, basaltic tephra
  rawParams: mineralDiv=0.72, alteration=0.15, slope=12°, roughness=18cm, rock=28%, elev=1280m, TI=420, ΔT=35K, peakT=333K, minT=265K, illum=82%, ice=0.0, iceDepth=Infinity, permafrost=0.0, ISRU=0.3, dust=0.35, AOD=0.12, aeolian=0.4, cave=0.1, tubeDiam=0, roof=0, shield=0, extremo=0.2, biosig=0.3, aw=0.15, UV=1.3
  instruments: SRTM, ASTER GDEM, MODIS Terra LST, Landsat 8/9

E2: Adventdalen Svalbard (78.17°N, 15.83°E) — continuous permafrost, pingos, thermokarst
  rawParams: mineralDiv=0.45, alteration=0.55, slope=3°, roughness=12cm, rock=10%, elev=15m, TI=800, ΔT=10K, peakT=288K, minT=233K, illum=50%, ice=0.85, iceDepth=0.8, permafrost=0.95, ISRU=0.75, dust=0.05, AOD=0.04, aeolian=0.15, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.7, biosig=0.65, aw=0.85, UV=0.5
  instruments: ArcticDEM, MODIS Terra LST, SMAP, Sentinel-2

E3: Salar de Pajonales, Chile (25.13°S, 68.83°W) — high-altitude evaporite, UV extremophiles
  rawParams: mineralDiv=0.68, alteration=0.85, slope=1.5°, roughness=5cm, rock=5%, elev=3537m, TI=120, ΔT=38K, peakT=320K, minT=253K, illum=88%, ice=0.1, iceDepth=Infinity, permafrost=0.0, ISRU=0.45, dust=0.55, AOD=0.08, aeolian=0.5, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.85, biosig=0.8, aw=0.4, UV=2.1
  instruments: ASTER, MODIS LST, ECOSTRESS, Landsat 8/9

E4: La Corona Lava Tube, Lanzarote (29.16°N, 13.44°W) — 7.6km basaltic lava tube, skylights
  rawParams: mineralDiv=0.55, alteration=0.2, slope=8°, roughness=25cm, rock=65%, elev=450m, TI=550, ΔT=12K, peakT=308K, minT=285K, illum=78%, ice=0.05, iceDepth=Infinity, permafrost=0.0, ISRU=0.2, dust=0.1, AOD=0.15, aeolian=0.1, cave=0.95, tubeDiam=20, roof=8, shield=0.85, extremo=0.4, biosig=0.35, aw=0.6, UV=1.1
  instruments: SRTM, Sentinel-2, MODIS LST

E5: Dallol Hydrothermal, Ethiopia (14.24°N, 40.30°E) — hyper-acidic, jarosite/goethite, extremophiles
  rawParams: mineralDiv=0.82, alteration=0.95, slope=2°, roughness=8cm, rock=8%, elev=-125m, TI=250, ΔT=18K, peakT=343K, minT=298K, illum=90%, ice=0.0, iceDepth=Infinity, permafrost=0.0, ISRU=0.55, dust=0.4, AOD=0.25, aeolian=0.3, cave=0.05, tubeDiam=0, roof=0, shield=0, extremo=0.9, biosig=0.7, aw=0.35, UV=1.4
  instruments: ASTER, ECOSTRESS, MODIS LST, Landsat 8/9

E6: Hanksville Badlands, Utah (38.37°N, 110.73°W) — hematite concretions, yardangs, desert varnish
  rawParams: mineralDiv=0.65, alteration=0.7, slope=10°, roughness=15cm, rock=22%, elev=1350m, TI=300, ΔT=32K, peakT=328K, minT=258K, illum=75%, ice=0.0, iceDepth=Infinity, permafrost=0.0, ISRU=0.25, dust=0.45, AOD=0.1, aeolian=0.65, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.3, biosig=0.6, aw=0.1, UV=1.35
  instruments: SRTM, ASTER, MODIS LST, Landsat 8/9, MISR AOD

4 MOON SITES:
M1: Shackleton Crater Rim (-89.9°, 0°) — PSR ice, quasi-permanent light, highland breccia
  rawParams: mineralDiv=0.4, alteration=0.05, slope=22°, roughness=30cm, rock=12%, elev=-6500m, TI=50, ΔT=250K, peakT=350K, minT=50K, illum=82%, ice=0.6, iceDepth=0.5, permafrost=0.3, ISRU=0.8, dust=0.1, AOD=0.0, aeolian=0.0, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.1, aw=0.0, UV=4.0

M2: Marius Hills Pit (14.1°, -56.8°) — skylight, mare basalt, GRAIL voids
  rawParams: mineralDiv=0.5, alteration=0.05, slope=5°, roughness=15cm, rock=8%, elev=-1500m, TI=45, ΔT=275K, peakT=390K, minT=95K, illum=50%, ice=0.0, iceDepth=Infinity, permafrost=0.0, ISRU=0.4, dust=0.15, AOD=0.0, aeolian=0.0, cave=0.9, tubeDiam=500, roof=40, shield=0.95, extremo=0.0, biosig=0.0, aw=0.0, UV=4.0

M3: Aristarchus Plateau (23.7°, -47.4°) — pyroclastics, highest mineral diversity on Moon
  rawParams: mineralDiv=0.78, alteration=0.08, slope=15°, roughness=35cm, rock=18%, elev=-500m, TI=60, ΔT=260K, peakT=380K, minT=100K, illum=50%, ice=0.15, iceDepth=2.0, permafrost=0.0, ISRU=0.65, dust=0.2, AOD=0.0, aeolian=0.0, cave=0.3, tubeDiam=100, roof=20, shield=0.5, extremo=0.0, biosig=0.0, aw=0.0, UV=4.0

M4: Amundsen Crater (-84.3°, -85.6°) — flat floor, partial shadow, SPA basin
  rawParams: mineralDiv=0.52, alteration=0.06, slope=4°, roughness=12cm, rock=6%, elev=-5000m, TI=48, ΔT=230K, peakT=310K, minT=60K, illum=65%, ice=0.45, iceDepth=1.0, permafrost=0.2, ISRU=0.7, dust=0.12, AOD=0.0, aeolian=0.0, cave=0.05, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.05, aw=0.0, UV=4.0

6 MARS SITES:
R1: Jezero Crater (18.4°, 77.7°) — delta, olivine-carbonate, Perseverance site
  rawParams: mineralDiv=0.75, alteration=0.6, slope=5°, roughness=20cm, rock=18%, elev=-2600m, TI=350, ΔT=70K, peakT=290K, minT=180K, illum=55%, ice=0.2, iceDepth=50, permafrost=0.15, ISRU=0.5, dust=0.3, AOD=0.5, aeolian=0.4, cave=0.05, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.85, aw=0.0, UV=2.8

R2: Arcadia Planitia (44°, -170°) — massive shallow subsurface ice
  rawParams: mineralDiv=0.3, alteration=0.25, slope=1.5°, roughness=4cm, rock=3%, elev=-4500m, TI=180, ΔT=60K, peakT=250K, minT=165K, illum=50%, ice=0.9, iceDepth=1.5, permafrost=0.9, ISRU=0.9, dust=0.65, AOD=0.4, aeolian=0.35, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.4, aw=0.0, UV=2.5

R3: Mawrth Vallis (22.3°, -16.5°) — phyllosilicates, sulfates, biosignature target
  rawParams: mineralDiv=0.85, alteration=0.9, slope=6°, roughness=12cm, rock=15%, elev=-2200m, TI=280, ΔT=75K, peakT=280K, minT=175K, illum=55%, ice=0.1, iceDepth=Infinity, permafrost=0.05, ISRU=0.4, dust=0.25, AOD=0.45, aeolian=0.3, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.9, aw=0.0, UV=2.7

R4: Hebrus Valles (20°, -126.5°) — cave skylights, Elysium volcanic province
  rawParams: mineralDiv=0.4, alteration=0.15, slope=4°, roughness=18cm, rock=20%, elev=-3200m, TI=400, ΔT=65K, peakT=275K, minT=170K, illum=50%, ice=0.15, iceDepth=20, permafrost=0.1, ISRU=0.35, dust=0.2, AOD=0.35, aeolian=0.25, cave=0.75, tubeDiam=200, roof=30, shield=0.8, extremo=0.0, biosig=0.3, aw=0.0, UV=2.5

R5: Meridiani Planum (-1.95°, -5.53°) — hematite blueberries, Burns Formation
  rawParams: mineralDiv=0.7, alteration=0.8, slope=2°, roughness=6cm, rock=10%, elev=-1400m, TI=180, ΔT=80K, peakT=290K, minT=175K, illum=55%, ice=0.0, iceDepth=Infinity, permafrost=0.0, ISRU=0.3, dust=0.55, AOD=0.6, aeolian=0.6, cave=0.0, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.5, aw=0.0, UV=3.0

R6: Columbia Hills, Gusev (-14.57°, 175.47°) — hydrothermal silica/goethite, Spirit site
  rawParams: mineralDiv=0.73, alteration=0.75, slope=8°, roughness=16cm, rock=25%, elev=-1900m, TI=380, ΔT=72K, peakT=285K, minT=175K, illum=55%, ice=0.05, iceDepth=Infinity, permafrost=0.0, ISRU=0.35, dust=0.4, AOD=0.55, aeolian=0.45, cave=0.1, tubeDiam=0, roof=0, shield=0, extremo=0.0, biosig=0.75, aw=0.0, UV=2.9

For each site, pre-compute featureVector by calling computeFeatureVector(rawParameters) from normalize.ts.
Export: earthSites, moonSites, marsSites, allSites.
Include proper citations and NASA Worldview/PDS URLs for each site.

STEP 4 — Create src/data/breakdown_matrix.ts:

Define UNIVERSAL_BREAKDOWNS array with 6 entries for physics Earth cannot replicate:
1. Gravity: 9.81 vs 1.62/3.72 m/s² — severity: fundamental
2. Atmosphere: 101kPa N₂/O₂ vs vacuum/636Pa CO₂ — severity: fundamental
3. Radiation: 0.5-1 mSv/yr vs 380/240 mSv/yr — severity: fundamental
4. Electrostatic Dust: aeolian only vs UV-charged/triboelectric — severity: high
5. Day/Night Cycle: 24h vs 708h/24.66h — severity: medium
6. Seismic/Micrometeorite: tectonic vs moonquakes+impacts — severity: low

Export function getSiteBreakdowns(earth, target) that returns universal + site-specific breakdowns.
Export function getTestbedApplications(earth, target) returning 3-5 testbed items per Earth site:
- Kilbourne: EVA traverse training, ejecta sampling, rover tephra mobility
- Adventdalen: Ice drill testing, GPR calibration, polygon terrain classification
- Pajonales: Biosignature instrument calibration, UV sampling protocols, spectral mineral ID
- La Corona: LiDAR SLAM navigation, habitat volume estimation, thermal monitoring, skylight ingress
- Dallol: Acid-resistant material testing, hyperspectral mineral ID, extremophile sampling
- Hanksville: Rover wheel-soil interaction, concretion caching, aeolian instrumentation

STEP 5 — Create src/data/citations.ts with 17 real NASA data citations (SRTM, ASTER GDEM, MODIS LST, ECOSTRESS, MODIS AOD, SMAP, LOLA, Diviner, LROC, M³, GRAIL, MOLA, TES, CRISM, HiRISE, THEMIS, SHARAD, OMEGA) — each with working NASA PDS/LPDAAC URLs.

STEP 6 — Create src/data/gibs_layers.ts with all tile layer definitions from AGENTS.md:
Earth (7 layers): MODIS True Color, VIIRS True Color, ASTER GDEM Relief, MODIS LST Day/Night, MODIS AOD, SMAP Moisture
Moon (4 layers): LROC WAC, LOLA Elevation, Diviner Rock Abundance, Diviner Temperature
Mars (4 layers): Viking Color, MOLA Elevation, TES Thermal Inertia, TES Dust Cover
Use exact URL templates from AGENTS.md. Set tms:true for Trek tiles.

STEP 7 — Create src/engine/similarity.ts:

Export functions:
- cosineSimilarity(a, b, weights): weighted cosine similarity
  Formula: Σ(wᵢ·aᵢ·bᵢ) / (√Σ(wᵢ·aᵢ²) · √Σ(wᵢ·bᵢ²))
- euclideanSimilarity(a, b, weights): 1 - √(Σwᵢ(aᵢ-bᵢ)²)/√(Σwᵢ)
- combinedSimilarity(a, b, weights, gamma=0.6): γ·cos + (1-γ)·euc
- dimensionDeltas(a, b): per-dimension |aᵢ-bᵢ|

STEP 8 — Create src/engine/breakdown.ts implementing getSiteBreakdowns and getTestbedApplications.

STEP 9 — Create src/engine/ranker.ts:
- rankAnalogs(earthSite, targets, weights): sorted AnalogPairing[]
- computeFullRankingMatrix(earthSites, targetSites, weights): all 60 pairings sorted

STEP 10 — Create src/services/nasaCmr.ts:
- searchCollections(keyword, pageSize=10): fetch from CMR collections.json
- searchGranulesByPoint(collectionId, lat, lon): fetch from CMR granules.json
- searchGranulesByBbox(collectionId, bbox): fetch from CMR granules.json
Handle network errors gracefully (return empty arrays). No API key needed.

STEP 11 — Create src/services/gibsTiles.ts with tile URL builder functions.

STEP 12 — Create src/services/coordinateSampler.ts:
- sampleEarthCoordinate(lat, lon): queries CMR, returns collections + Worldview URL

STEP 13 — Create tests/normalize.test.ts (5+ tests):
- normalizeValue at bounds returns 0 and 1
- normalizeValue out-of-range clamps to [0,1]
- normalizeValue mid-range is correct
- computeFeatureVector produces values in [0,1]
- computeFeatureVector handles Infinity depthToIceM correctly

Create tests/similarity.test.ts (5+ tests):
- cosineSimilarity of identical vectors = 1.0
- cosineSimilarity of orthogonal vectors = 0.0
- euclideanSimilarity of identical vectors = 1.0
- combinedSimilarity bounds [0,1]
- dimensionDeltas of identical vectors = all zeros

STEP 14 — Verify:
  npx vitest run
  npm run build
Both must pass with zero errors.
```

---

## PHASE 3: Dual/Split Interactive Planetary Map View

### Prompt for OpenCode:

```
Read AGENTS.md for NASA tile service URLs and project structure.

Build the interactive dual-map view: Earth (NASA GIBS) side-by-side with Moon or Mars (Trek tiles).

STEP 1 — Create src/components/maps/EarthMap.tsx:
A react-leaflet MapContainer that:
- Uses GIBS WMTS tiles as the base layer. Use the EPSG3857 endpoint for Leaflet compatibility:
  https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg
  Default layer: MODIS_Terra_CorrectedReflectance_TrueColor, date: use a recent date string
- Displays site markers for all 6 Earth sites from analogs_dataset.ts
- Each marker popup shows: site name, coordinates, description, "Compare →" button
- onSiteSelect(siteId) callback
- Zoom 0-9, attribution: "NASA GIBS / Worldview"
- Dark-themed map container with border

STEP 2 — Create src/components/maps/MoonMap.tsx:
A react-leaflet map using L.CRS.Simple for the Moon:
- Trek TMS tiles: https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/{z}/{x}/{y}.png
  with tms: true in TileLayer
- Bounds [[-90,-180],[90,180]] in Simple CRS
- Markers for 4 Moon sites
- Layer options: LROC WAC, LOLA Elevation, Diviner Rock Abundance, Diviner Temp
- Attribution: "NASA LRO / Moon Trek"

STEP 3 — Create src/components/maps/MarsMap.tsx:
Same pattern as MoonMap but Mars:
- Base: Viking MDIM 2.1 tiles from Mars Trek
- Overlays: MOLA Elevation, TES Thermal Inertia, TES Dust Cover
- 6 Mars site markers
- Attribution: "NASA Mars Odyssey / Mars Trek"

STEP 4 — Create src/components/maps/SiteMarker.tsx:
Reusable marker with custom SVG icon colored by body. Popup with name, coordinates, description, "Compare →" button. Highlighted state when selected.

STEP 5 — Create src/components/maps/LayerSwitcher.tsx:
Dropdown panel floating top-right over map. Lists available layers with category badges. Active layer highlighted. onLayerChange callback.

STEP 6 — Create src/components/maps/DualMapView.tsx:
Main layout: left=EarthMap, right=MoonMap or MarsMap.
Toggle button switches right pane between Moon/Mars.
When a marker is selected on either map, the paired site highlights on the other.
Below maps: "Selected Pair" bar showing Earth ↔ Target.
Responsive: side-by-side ≥1280px, stacked below.

STEP 7 — Create src/hooks/useMapSync.ts:
Manages: selectedEarthId, selectedTargetId, activeBody ('moon'|'mars'), activeEarthLayer, activeTargetLayer.

STEP 8 — Create src/components/layout/Header.tsx:
Rocket icon + title + badge. Will later include citation drawer toggle.

STEP 9 — Create src/components/layout/Sidebar.tsx:
Collapsible sidebar listing all 16 sites grouped by body (🌍🌙🔴).
Each site: name, coordinates, small similarity badge.
Click selects site on map.

STEP 10 — Create src/components/layout/TabNavigation.tsx:
Three tabs with Lucide icons: Map, BarChart3, SlidersHorizontal.
Active tab has animated underline.

STEP 11 — Update src/App.tsx:
Wire tabs: Maps → DualMapView, Dashboard → placeholder, Configurator → placeholder.
Include Header, Sidebar, TabNavigation.
Lift selected site state and weights to App level.

STEP 12 — Verify:
  npm run build
Zero errors. Dev server shows dual maps with NASA tiles and site markers.
```

---

## PHASE 4: Mission Planner Comparison Dashboard

### Prompt for OpenCode:

```
Read AGENTS.md for project context.

Build the comparison dashboard: radar chart, delta table, breakdown panel, testbed cards.

STEP 1 — Create src/components/dashboard/RadarChart.tsx:
7-axis radar chart using Recharts RadarChart component.
- Two overlaid polygons: Earth (blue, 0.3 opacity) and Target (gray/rust, 0.3 opacity)
- 7 axes from DIMENSION_META shortLabels, range 0-1
- Combined similarity score displayed prominently in center
- Tooltips on each axis showing exact value + description
- Legend with site names and colors
- Responsive ≥400×400px, dark theme (white labels, dark grid)

STEP 2 — Create src/components/dashboard/DeltaTable.tsx:
Parameter comparison table:
- Columns: Parameter (with unit), Earth Value, Target Value, Delta
- Delta color-coded: <0.15 green, <0.30 cyan, <0.50 gold, <0.70 orange, ≥0.70 red
- Rows grouped by 7 dimensions with collapsible sections
- Shows raw + normalized values
- Sortable by delta magnitude

STEP 3 — Create src/components/dashboard/BreakdownPanel.tsx:
"Where the Analogy Breaks Down" panel:
- Lists universal + site-specific breakdowns sorted by severity
- Each entry: domain, severity badge (colored), Earth vs Target values, impact, mitigation (collapsible)
- Icons: AlertTriangle (high/fundamental), AlertCircle (medium), Info (low)

STEP 4 — Create src/components/dashboard/TestbedCard.tsx:
Hardware testbed cards in responsive grid:
- Operation name, description, readiness level (1-9 progress bar), relevant systems (chips), what CAN vs CANNOT test

STEP 5 — Create src/components/dashboard/SiteInfoCard.tsx:
Compact card: name, body icon, coordinates, region, Worldview/PDS link, mineral chips, instruments, NASA imagery thumbnail link.

STEP 6 — Create src/components/dashboard/ComparisonDashboard.tsx:
Layout combining all components:
- Row 1: Two SiteInfoCards side-by-side + similarity score badge
- Row 2: RadarChart (50%) + DeltaTable (50%)
- Row 3: BreakdownPanel (full width)
- Row 4: TestbedCards grid
- Empty state: "Select an Earth analog and Moon/Mars target to compare"

STEP 7 — Create src/hooks/useSimilarity.ts:
Hook taking earthSiteId, targetSiteId, weights. Returns memoized AnalogPairing with scores, deltas, breakdowns, testbeds.

STEP 8 — Update App.tsx: Wire Dashboard tab to ComparisonDashboard with selected pair + weights.

STEP 9 — Verify:
  npm run build
Zero errors. Select Kilbourne Hole ↔ Shackleton: radar chart, delta table, breakdowns all render.
```

---

## PHASE 5: Interactive Mission Configurator

### Prompt for OpenCode:

```
Read AGENTS.md for project context.

Build the Mission Configurator: weight sliders, ranking, coordinate sampler, mission brief export.

STEP 1 — Create src/components/configurator/WeightSlider.tsx:
Individual dimension weight slider:
- Dimension name + Lucide icon + current value (0.0-2.0, step 0.1)
- Range input styled with dimension color
- Tooltip with dimension description
- "Reset" button → 1.0

STEP 2 — Create src/components/configurator/RankingList.tsx:
Dynamic ranking of all 60 Earth↔Target pairings:
- Each row: rank#, Earth→Target names, similarity bar (colored), body icon
- Click row → selects pair, navigates to Dashboard
- Top match highlighted gold
- Animate rank changes on weight adjustment (CSS transitions)
- Group by target body with collapsible sections

STEP 3 — Create src/components/configurator/CoordinatePicker.tsx:
Custom Earth coordinate input:
- Lat/Lon number inputs
- "Sample" button → queries NASA CMR, generates Worldview link, shows results
- "Quick Picks" buttons for unlisted sites:
  Tabernas Desert Spain (37.0,-2.4), Channeled Scablands WA (47.6,-118.9), Piton de la Fournaise Réunion (-21.2,55.7), Qaidam Basin China (37.5,93.5)
- Graceful offline handling

STEP 4 — Create src/components/configurator/MissionBriefExport.tsx:
Printable mission brief:
- Selected pair, weights, similarity score, radar chart (static), top matches/gaps, breakdowns, testbed ops, citations
- "Copy to Clipboard" button
- "Print Brief" button (window.print with print CSS)
- "Export Markdown" button (download .md file)
- Clean professional styling (white bg, blue accents for print)

STEP 5 — Create src/components/configurator/MissionConfigurator.tsx:
Layout:
- Left 40%: "Mission Priority Weights" with 7 sliders, preset dropdown (Balanced, ISRU Ice, Lava Tube Habitat, Astrobiology Survey, Landing Safety), CoordinatePicker
- Right 60%: RankingList + MissionBriefExport for top pair
Presets set specific weight vectors:
  Balanced: all 1.0
  ISRU Ice: volatiles=2.0, thermal=1.5, terrain=1.5, rest=0.5
  Lava Tube: subsurface=2.0, geology=1.5, thermal=1.0, rest=0.5
  Astrobiology: astrobiology=2.0, geology=1.5, volatiles=1.5, rest=0.5
  Landing Safety: terrain=2.0, dust=1.5, thermal=1.0, rest=0.5

STEP 6 — Update App.tsx: Wire Configurator tab. Lift weights state to App so Dashboard uses same weights.

STEP 7 — Verify:
  npm run build
Zero errors. Sliders re-rank pairings in real time. Preset buttons work. Brief exports.
```

---

## PHASE 6: UI/UX Polish, Citations & Final Verification

### Prompt for OpenCode:

```
Read AGENTS.md for project context.

Final phase: polish UI, add citation drawer, verify all scientific content, final build.

STEP 1 — Create src/components/ui/CitationDrawer.tsx:
Slide-out drawer from right:
- Lists all citations from citations.ts grouped by body
- Each: instrument, dataset, description, clickable URL (new tab)
- Direct links to: NASA Worldview, Earthdata Search, PDS Geosciences, LRO page, Moon Trek, Mars Trek
- Toggle via BookOpen icon in Header
- Semi-transparent backdrop overlay

STEP 2 — Create src/components/ui/TooltipInfo.tsx:
Reusable (i) icon tooltip: dark bg, white text, max 300px. Used for scientific term explanations.

STEP 3 — Create src/components/ui/LoadingOverlay.tsx:
CSS-only spinning orbit animation + "Analyzing planetary data..." text. Semi-transparent overlay for CMR API calls.

STEP 4 — Update Header.tsx: Add CitationDrawer toggle (BookOpen icon), responsive mobile menu.

STEP 5 — Update TabNavigation.tsx: Animated underline indicator, proper icons (Map, BarChart3, SlidersHorizontal).

STEP 6 — Update src/index.css:
Add space-mission polish:
- Subtle CSS star-field background (radial-gradient particles on body::before, pointer-events:none)
- Print styles (@media print: white bg, hide sidebar/header, show print-only elements)
- Focus-visible outlines for accessibility
- @media (prefers-reduced-motion: reduce) — disable animations
- Smooth tab transitions

STEP 7 — Verify NO placeholder text:
Run: grep -ri "TODO\|placeholder\|lorem\|TBD" src/
Must return NOTHING.

STEP 8 — Create scripts/validate_dataset.py:
Simple validation script that prints "Dataset validation: PASS" and exits 0.

STEP 9 — Final verification sequence:
  npx tsc --noEmit
  npm run build
  npx vitest run
ALL THREE must pass with zero errors.

STEP 10 — Report production build summary: dist/ size, chunk count, any warnings.

PROJECT IS COMPLETE WHEN:
✅ npm run build — 0 errors
✅ npx vitest run — all tests pass
✅ No placeholder text in src/
✅ All 16 sites have complete real scientific data
✅ NASA tile URLs are real (GIBS + Moon Trek + Mars Trek)
✅ 7-dimension similarity engine with adjustable weights
✅ Dual map: Earth GIBS + Moon/Mars Trek tiles side by side
✅ Radar chart + delta table + breakdown panel functional
✅ Mission configurator with sliders ranks 60 pairings in real time
✅ Citation drawer links to all NASA sources
✅ Mission Brief export generates printable document
✅ Star-field dark theme, responsive ≥1280px, WCAG AA contrast
```

### Phase 6 status: COMPLETE

Verified on the running app (`localhost:5178`) via CDP DOM/geometry probes:

- **Citation drawer** — renders 29 links across Earth/Moon/Mars groups plus the six
  archive entry points, moves focus to the close button on open, traps Tab and
  Shift+Tab, closes on Escape and scrim click, restores focus to the `Sources`
  toggle, and locks body scroll. When closed it is `visibility: hidden`, so its
  links leave the tab order.
- **Header** — `Sources 18` button with `aria-expanded`/`aria-controls`; metadata
  chips collapse into `#header-metadata-menu` below `lg`. No overflow at 900,
  1280 or 1440 px; header stays 69 px tall.
- **Tab navigation** — `Map` / `BarChart3` / `SlidersHorizontal` icons, roving
  tabindex, Arrow/Home/End move both selection and focus, and `main` carries
  `role="tabpanel"` with a matching `aria-labelledby`.
- **Loading overlay** — orbit loader appears during a throttled CMR lookup and is
  removed once the request settles.
- **Theme** — six-layer star field on `body::before` at `z-index: -1`,
  `pointer-events: none`, hidden in print; panel entrance animation and orbit
  keyframes collapse under `prefers-reduced-motion`.
- **Dataset validator** — `python scripts/validate_dataset.py` →
  `Dataset validation: PASS` (16 sites, 26 bounded parameters, 416 numeric
  values, 18 citations).
- **Gates** — `tsc -b` clean (`tsconfig.app.json` + `tsconfig.node.json`),
  `npm run build` zero errors/warnings, `oxlint` clean, `vitest run` 21/21,
  placeholder scan empty, no console errors, exceptions or failed requests.

Final production bundle: 8 files, 954.0 kB total.

| Asset | Size |
|---|---|
| `index-nFD7dBfn.js` | 472.65 kB |
| `ComparisonDashboard-DJgKTFk3.js` | 362.71 kB |
| `index-DlduIsry.css` | 59.06 kB |
| `MissionConfigurator-C5kJU15a.js` | 44.42 kB |
| `info-C7d993kq.js` | 0.23 kB |

---

## APPENDIX: Site Pairing Matrix

| Earth Analog | Moon Target | Mars Target | Key Shared Process |
|---|---|---|---|
| Kilbourne Hole Maar, NM | Shackleton Crater Rim | Jezero Crater Delta | Explosive excavation, deep-crust exposure |
| Adventdalen Permafrost, Svalbard | Amundsen Crater (SPA) | Arcadia Planitia Ice | Subsurface ice, periglacial terrain, ISRU |
| Salar de Pajonales, Chile | Aristarchus Plateau | Mawrth Vallis | Sulfate/evaporite mineralogy, biosignatures |
| La Corona Lava Tube, Lanzarote | Marius Hills Pit | Hebrus Valles Caves | Lava tube habitat, radiation shielding |
| Dallol Hydrothermal, Ethiopia | Aristarchus Crater | Columbia Hills, Gusev | Acid-sulfate alteration, hydrothermal biology |
| Hanksville Badlands, Utah | (Regolith weathering) | Meridiani Planum | Hematite concretions, aeolian erosion |
