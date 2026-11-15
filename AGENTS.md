# AGENTS.md — OpenCode Project Memory File
# NASA Space Apps 2026: Earth Analogs for Moon & Mars Base Sites
# ════════════════════════════════════════════════════════════════

## PROJECT IDENTITY
- **Name:** LunaTerraMars Analog Explorer
- **Tagline:** "Quantitative Earth Analog Discovery for Permanent Lunar & Martian Base Siting"
- **Challenge:** 2026 NASA Space Apps — Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars

---

## REPOSITORY STRUCTURE

```
nasa-analog-explorer/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html
├── .env                          # NASA API keys (DEMO_KEY default)
├── AGENTS.md                     # ← This file (OpenCode memory)
├── PLAN.md                       # Phased execution plan
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                 # Tailwind base + custom space theme
│   │
│   ├── data/
│   │   ├── analogs_dataset.ts          # Curated benchmark dataset (6 Earth, 4 Moon, 6 Mars sites)
│   │   ├── parameter_bounds.ts         # Physical normalization bounds for all 7 dimensions
│   │   ├── breakdown_matrix.ts         # "Where analogy breaks down" physics delta matrix
│   │   ├── citations.ts               # NASA data source citations with URLs
│   │   └── gibs_layers.ts             # GIBS/Trek tile layer definitions
│   │
│   ├── engine/
│   │   ├── similarity.ts              # Multi-dimensional similarity calculator
│   │   ├── normalize.ts               # Min-max normalization with physical bounds
│   │   ├── breakdown.ts               # Breakdown penalty & engineering delta calculator
│   │   └── ranker.ts                  # Site ranking & sorting engine
│   │
│   ├── services/
│   │   ├── nasaCmr.ts                 # NASA CMR API client (collection/granule search)
│   │   ├── gibsTiles.ts               # GIBS WMTS tile URL builder
│   │   └── coordinateSampler.ts       # Custom lat/lon Earth coordinate lookup
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TabNavigation.tsx
│   │   │
│   │   ├── maps/
│   │   │   ├── DualMapView.tsx         # Side-by-side Earth + Moon/Mars map
│   │   │   ├── EarthMap.tsx            # Leaflet + NASA GIBS WMTS layers
│   │   │   ├── MoonMap.tsx             # Leaflet + LRO WAC tiles
│   │   │   ├── MarsMap.tsx             # Leaflet + Viking/MOLA tiles
│   │   │   ├── SiteMarker.tsx          # Coordinate pin with popup
│   │   │   └── LayerSwitcher.tsx       # GIBS layer toggle panel
│   │   │
│   │   ├── dashboard/
│   │   │   ├── ComparisonDashboard.tsx # Main comparison view
│   │   │   ├── RadarChart.tsx          # 7-dimension spider/radar chart
│   │   │   ├── DeltaTable.tsx          # Parameter-by-parameter delta table
│   │   │   ├── BreakdownPanel.tsx      # "Where analogy breaks down" panel
│   │   │   ├── TestbedCard.tsx         # Hardware/rover testbed readiness card
│   │   │   └── SiteInfoCard.tsx        # Site detail card with NASA imagery
│   │   │
│   │   ├── configurator/
│   │   │   ├── MissionConfigurator.tsx # Interactive weight tuner
│   │   │   ├── WeightSlider.tsx        # Individual dimension weight slider
│   │   │   ├── RankingList.tsx         # Dynamic ranking results
│   │   │   ├── CoordinatePicker.tsx    # Custom Earth coordinate input
│   │   │   └── MissionBriefExport.tsx  # Export/print mission brief
│   │   │
│   │   └── ui/
│   │       ├── CitationDrawer.tsx      # Scientific data citation panel
│   │       ├── TooltipInfo.tsx         # Contextual tooltip component
│   │       └── LoadingOverlay.tsx      # Loading state component
│   │
│   ├── hooks/
│   │   ├── useSimilarity.ts           # Similarity calculation hook
│   │   ├── useNasaCmr.ts              # NASA CMR API hook
│   │   └── useMapSync.ts              # Map interaction synchronization
│   │
│   ├── types/
│   │   └── index.ts                   # All TypeScript interfaces
│   │
│   └── utils/
│       ├── constants.ts               # App-wide constants
│       ├── formatters.ts              # Number/unit formatting
│       └── colors.ts                  # Color palette & scales
│
├── scripts/
│   └── validate_dataset.py            # Python script to verify dataset parameter ranges
│
└── tests/
    ├── similarity.test.ts             # Similarity engine unit tests
    └── normalize.test.ts              # Normalization unit tests
```

---

## CODING CONVENTIONS

### TypeScript / React
- **React 19** functional components with hooks only. No class components.
- **Strict TypeScript** — `strict: true` in tsconfig. No `any` types. All props interfaces defined in `src/types/index.ts`.
- **Named exports** only (no default exports except `App.tsx`).
- **Tailwind CSS** for all styling. No CSS modules, no styled-components. Use `@apply` sparingly.
- **Lucide React** for all icons. No other icon libraries.
- **Component file naming:** PascalCase (e.g., `RadarChart.tsx`).
- **Data file naming:** camelCase (e.g., `analogs_dataset.ts`).
- **No placeholder/mock text.** Every string shown in the UI must contain real scientific content, real NASA parameter names, real units, and real citations.
- **No `console.log` in production code.** Use `console.warn` or `console.error` only for actual issues.

### Data & Science
- All physical values must include SI units in comments and UI display.
- All parameter ranges must be physically reasonable and sourced from published NASA instrument data.
- The curated dataset (`analogs_dataset.ts`) is the **single source of truth** — no duplicated hardcoded values elsewhere.
- Normalization bounds in `parameter_bounds.ts` must span the full physically plausible range for each parameter.

### Build & Verification
- `npm run build` must complete with **zero errors and zero warnings**.
- `npm run lint` must pass.
- `npx vitest run` must pass all unit tests.
- All NASA GIBS tile URLs must be functional (no API key required for GIBS).

---

## NASA API ENDPOINTS & TILE SERVICES

### Earth — NASA GIBS WMTS (No API Key Required)
```
Base URL: https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/
GetCapabilities: https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetCapabilities

Tile URL Pattern:
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{LayerIdentifier}/default/{Time}/{TileMatrixSet}/{ZoomLevel}/{TileRow}/{TileCol}.{Format}

Key Layers for This Project:
┌─────────────────────────────────────────────────────────────────┬────────────┬──────────┐
│ Layer Identifier                                                │ MatrixSet  │ Format   │
├─────────────────────────────────────────────────────────────────┼────────────┼──────────┤
│ MODIS_Terra_CorrectedReflectance_TrueColor                      │ 250m       │ jpg      │
│ VIIRS_SNPP_CorrectedReflectance_TrueColor                       │ 250m       │ jpg      │
│ ASTER_GDEM_Color_Shaded_Relief                                  │ 500m       │ png      │
│ MODIS_Terra_Land_Surface_Temp_Day                                │ 1km        │ png      │
│ MODIS_Terra_Land_Surface_Temp_Night                              │ 1km        │ png      │
│ MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth                    │ 1km        │ png      │
│ SMAP_L4_Analyzed_Root_Zone_Soil_Moisture                        │ 9km        │ png      │
└─────────────────────────────────────────────────────────────────┴────────────┴──────────┘

GIBS TileMatrixSet Names → Zoom Levels:
- "250m" → levels 0–8 (Mercator: epsg3857, Geographic: epsg4326)
- "500m" → levels 0–7
- "1km"  → levels 0–6
- "2km"  → levels 0–5
```

### Moon — NASA Moon Trek Tile Service (No API Key Required)
```
LROC WAC Global Mosaic (100m/px):
https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/{z}/{x}/{reverseY}.png

LRO LOLA Elevation Color (Hillshade):
https://trek.nasa.gov/tiles/Moon/EQ/LRO_LOLA_ClrShade_Global_128ppd_v04/{z}/{x}/{reverseY}.png

Diviner Rock Abundance:
https://trek.nasa.gov/tiles/Moon/EQ/LRO_Diviner_RockAbundance_Global_32ppd/{z}/{x}/{reverseY}.png

Diviner Bolometric Temperature (Day):
https://trek.nasa.gov/tiles/Moon/EQ/LRO_Diviner_CFtemp300_Global_32ppd/{z}/{x}/{reverseY}.png

Note: Moon Trek uses TMS tiling (Y-axis flipped). In Leaflet, set `tms: true`.
Coordinate system: Simple CRS with bounds [[-90, -180], [90, 180]] mapped to lunar lat/lon.
```

### Mars — NASA Mars Trek Tile Service (No API Key Required)
```
Viking MDIM 2.1 Color Mosaic (Global):
https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/{z}/{x}/{reverseY}.png

MOLA Elevation Color (Hillshade):
https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/{z}/{x}/{reverseY}.png

TES Thermal Inertia:
https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_TES_ThermalInertia_Putzig_global_7410m/{z}/{x}/{reverseY}.png

TES Dust Cover Index:
https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_TES_DustCoverIndex_Global_7410m/{z}/{x}/{reverseY}.png

Note: Same TMS tiling as Moon Trek. Use `tms: true` in Leaflet.
```

### NASA CMR (Common Metadata Repository) API
```
Base URL: https://cmr.earthdata.nasa.gov/search/

Collection Search:
GET https://cmr.earthdata.nasa.gov/search/collections.json?keyword={term}&page_size=10

Granule Search (by bounding box):
GET https://cmr.earthdata.nasa.gov/search/granules.json?collection_concept_id={id}&bounding_box={west},{south},{east},{north}&page_size=5

Granule Search (by point):
GET https://cmr.earthdata.nasa.gov/search/granules.json?collection_concept_id={id}&point={lon},{lat}&page_size=5

No API key required for search. Some data downloads require Earthdata Login.

Key Collection Concept IDs for this project:
- SRTM 30m DEM: C1711961296-LPCLOUD
- ASTER GDEM v3: C1711961296-LPCLOUD  
- MODIS LST (MOD11A1): C1646609808-LPDAAC_ECS
- ECOSTRESS LST: C2076090826-LPCLOUD
```

### NASA Earthdata / Worldview Direct Links
```
Worldview (interactive):
https://worldview.earthdata.nasa.gov/?v={west},{south},{east},{north}&l={layers}

Earthdata Search:
https://search.earthdata.nasa.gov/search?q={query}&sb[0]={west},{south},{east},{north}
```

---

## STRICT RULES FOR OPENCODE

1. **NO MOCK DATA.** Every value in `analogs_dataset.ts` must be a real physical measurement with a real unit. If a value is uncertain, provide a best-estimate range with a citation note.

2. **NO PLACEHOLDER UI TEXT.** Every heading, label, tooltip, and description must contain actual scientific content. Never write "Lorem ipsum", "Sample text", "TODO", or "[placeholder]".

3. **ALL NASA TILE URLs MUST BE REAL.** Use only the exact tile service URLs documented above. Do not invent tile endpoints.

4. **VERIFY AFTER EVERY PHASE.** Run `npm run build` after every phase. Fix all errors before proceeding.

5. **USE EXACT FILE PATHS.** Create files in exactly the locations specified in the repository structure above. Do not reorganize.

6. **SCIENTIFIC ACCURACY.** If implementing a formula, include the mathematical definition as a code comment above the function. Include SI units in all variable names or comments.

7. **RESPONSIVE LAYOUT.** The app must be usable at 1280px wide minimum. Use Tailwind responsive utilities.

8. **ACCESSIBLE COLORS.** All text must meet WCAG AA contrast ratio (4.5:1 minimum). Radar chart colors must be distinguishable by colorblind users.

9. **CITATION LINKS.** Every data parameter displayed in the UI must link to its NASA source URL via the CitationDrawer component.

10. **ZERO `any` TYPES.** Every variable, parameter, and return type must be explicitly typed. Use union types and generics where appropriate.
