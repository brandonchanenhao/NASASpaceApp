import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Radio,
  ShieldCheck,
  Thermometer,
  Zap,
} from 'lucide-react'

interface SiteAnimationDiagramProps {
  type:
    | 'lava-tube'
    | 'maar-impact'
    | 'evaporite-uv'
    | 'hydrothermal'
    | 'inverted-channel'
    | 'permafrost'
  title: string
  description: string
}

export function SiteAnimationDiagram({
  type,
  title,
  description,
}: SiteAnimationDiagramProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 bg-slate-950/90 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-sky-400">
              <Activity className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">{description}</p>
            </div>
          </div>
          <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-wider text-slate-400">
            Interactive Cross-Section
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {type === 'lava-tube' && <LavaTubeDiagram />}
        {type === 'maar-impact' && <MaarImpactDiagram />}
        {type === 'evaporite-uv' && <EvaporiteUvDiagram />}
        {type === 'hydrothermal' && <HydrothermalDiagram />}
        {type === 'inverted-channel' && <InvertedChannelDiagram />}
        {type === 'permafrost' && <PermafrostDiagram />}
      </div>
    </div>
  )
}

/** 1. Lava Tube Cross Section: Radiation Attenuation & Thermal Stability */
function LavaTubeDiagram() {
  const [viewMode, setViewMode] = useState<'radiation' | 'thermal'>('radiation')
  const [roofDepth, setRoofDepth] = useState<number>(8.0) // meters: 1m to 15m

  // Radiation physics (Lunar vacuum GCR baseline ~380 mSv/yr, basalt density ~2.9 g/cm³)
  // Basalt attenuation coefficient μ ≈ 0.65 m^-1
  const surfaceDose = 380 // mSv/year
  const doseInside = Math.max(
    0.05,
    Math.round(surfaceDose * Math.exp(-0.65 * roofDepth) * 10) / 10,
  )
  const attenuationPct = Math.min(
    99.9,
    Math.round((1 - doseInside / surfaceDose) * 1000) / 10,
  )
  const isRadiationSafe = roofDepth >= 5.0

  // Thermal physics (diurnal surface swing: -130°C to +120°C, ΔT = 250°C)
  // Basalt skin depth ~1.5m -> amplitude decays as exp(-z / 1.5)
  const thermalSwing = Math.round(125 * Math.exp(-roofDepth / 1.5) * 10) / 10
  const isThermalSafe = roofDepth >= 2.5
  const cavernTemp = isThermalSafe ? 18.0 : Math.round(18 + (roofDepth < 2 ? 14 : 7))

  // SVG Dynamic Geometry:
  // Surface at y = 70.
  // Basalt overburden thickness scales with roofDepth: 35px at 1m to 160px at 15m
  const rockThickness = Math.round(30 + roofDepth * 8.8)
  const ceilingY = 70 + rockThickness // ranges from 108 (at 1m) to 232 (at 15m)
  const floorY = 350

  // Quick preset depth setter
  const presets = [
    { label: '1.5 m · Skylight Rim', depth: 1.5 },
    { label: '5.0 m · Shield Threshold', depth: 5.0 },
    { label: '8.0 m · Cueva de los Verdes', depth: 8.0 },
    { label: '14.0 m · Deep Gallery', depth: 14.0 },
  ]

  // 7 Ray X coordinates across the 720px viewBox
  const rayCoords = [100, 180, 260, 360, 460, 540, 620]

  return (
    <div className="space-y-4">
      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setViewMode('radiation')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'radiation'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="size-3.5" />
            Radiation Attenuation
          </button>
          <button
            type="button"
            onClick={() => setViewMode('thermal')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'thermal'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="size-3.5" />
            Thermal Stabilization
          </button>
        </div>

        {/* Dynamic Overburden Slider */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-slate-400">
            Overburden Depth:
          </span>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={roofDepth}
            onChange={(e) => setRoofDepth(Number(e.target.value))}
            className="w-28 sm:w-36 accent-sky-400 cursor-pointer"
            aria-label="Basalt Overburden Depth"
          />
          <span className="min-w-[4.5rem] rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-center font-mono text-xs font-bold text-sky-400">
            {roofDepth.toFixed(1)} m
          </span>
        </div>
      </div>

      {/* Quick Depth Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[0.6875rem] font-medium text-slate-400">
          Geological Benchmarks:
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setRoofDepth(p.depth)}
            className={`rounded-full border px-2.5 py-0.5 text-[0.6875rem] transition-colors ${
              roofDepth === p.depth
                ? 'border-sky-500/60 bg-sky-500/10 text-sky-300 font-semibold'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Museum-Exhibit Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 sm:p-4">
        <svg viewBox="0 0 720 390" className="w-full select-none font-sans text-xs">
          <defs>
            {/* Space Sky Gradient */}
            <linearGradient id="spaceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#0b1329" />
            </linearGradient>

            {/* Basalt Overburden Pattern */}
            <pattern id="basaltJoints" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M0 24 L24 0 M0 0 L24 24 M12 0 L12 24"
                stroke="#334155"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
            </pattern>

            {/* Radiation Attenuation Gradient in Rock */}
            <linearGradient id="radiationFadeInRock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#fb923c" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>

            {/* Thermal Decay Gradient in Rock */}
            <linearGradient id="thermalDecayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#10b981" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 1. Deep Space Sky Layer */}
          <rect x="20" y="15" width="680" height="55" fill="url(#spaceGrad)" rx="6" />

          {/* Incoming Flux Indicators in Sky */}
          {viewMode === 'radiation' && (
            <g>
              {rayCoords.map((rx) => (
                <line
                  key={`sky-ray-${rx}`}
                  x1={rx}
                  y1={20}
                  x2={rx}
                  y2={70}
                  stroke="#f87171"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
              ))}
              <text x="360" y="38" fill="#fca5a5" textAnchor="middle" fontWeight="bold" fontSize="11">
                Galactic Cosmic Rays (GCR) & Solar Protons — {surfaceDose} mSv/yr (Planetary Surface)
              </text>
            </g>
          )}

          {viewMode === 'thermal' && (
            <g>
              <path
                d="M 60 42 Q 135 22, 210 42 T 360 42 T 510 42 T 660 42"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                className="animate-pulse"
              />
              <text x="360" y="34" fill="#fbbf24" textAnchor="middle" fontWeight="bold" fontSize="11">
                Diurnal Surface Temperature Swing: -130°C (Night) ↔ +120°C (Noon)
              </text>
            </g>
          )}

          {/* Surface Boundary Ground Line */}
          <line x1="20" y1="70" x2="700" y2="70" stroke="#94a3b8" strokeWidth="2.5" />
          <text x="35" y="64" fill="#94a3b8" fontSize="9.5" fontWeight="bold" letterSpacing="0.05em">
            PLANETARY SURFACE
          </text>

          {/* 2. Basalt Crust Overburden Layer (Scales dynamically with ceilingY) */}
          <rect x="20" y="70" width="680" height={floorY - 70} fill="#0f172a" />
          <rect x="20" y="70" width="680" height={floorY - 70} fill="url(#basaltJoints)" />

          {/* Dynamic Rock Layer Shading */}
          {viewMode === 'radiation' && (
            <rect
              x="20"
              y="70"
              width="680"
              height={Math.min(rockThickness, 130)}
              fill="url(#radiationFadeInRock)"
              opacity="0.35"
            />
          )}

          {viewMode === 'thermal' && (
            <rect
              x="20"
              y="70"
              width="680"
              height={Math.min(rockThickness, 95)}
              fill="url(#thermalDecayGrad)"
            />
          )}

          {/* 3. Subterranean Lava Tube Cavern Void */}
          {/* Arch curves up to dynamic ceilingY based on roofDepth */}
          <path
            d={`M 40 ${floorY} Q 40 ${ceilingY}, 360 ${ceilingY} Q 680 ${ceilingY}, 680 ${floorY} Z`}
            fill="#020617"
            stroke={isRadiationSafe ? '#38bdf8' : '#f87171'}
            strokeWidth="2"
          />

          {/* Cavern Arch Geological Outline Details */}
          <path
            d={`M 55 ${floorY} Q 55 ${ceilingY + 10}, 360 ${ceilingY + 8} Q 665 ${ceilingY + 10}, 665 ${floorY}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />

          {/* Dynamic Rock Thickness Metric Annotation on the Wall */}
          <g transform={`translate(45, ${70 + rockThickness / 2})`}>
            <rect x="0" y="-12" width="160" height="24" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <text x="80" y="4" fill="#e2e8f0" textAnchor="middle" fontSize="10" fontWeight="bold">
              Basalt Roof: {roofDepth.toFixed(1)} m thick
            </text>
          </g>

          {/* Rays Penetrating Rock */}
          {viewMode === 'radiation' && (
            <g>
              {rayCoords.map((rx) => {
                // In basalt, rays penetrate up to ~110px depth equivalent to ~5m
                const rayPenetratesTo = Math.min(ceilingY + (roofDepth < 5.0 ? 55 : 0), 70 + 115)
                const reachesCave = roofDepth < 5.0

                return (
                  <g key={`rock-ray-${rx}`}>
                    {/* Ray track in rock */}
                    <line
                      x1={rx}
                      y1={70}
                      x2={rx}
                      y2={Math.min(rayPenetratesTo, ceilingY)}
                      stroke="#fb923c"
                      strokeWidth="1.8"
                      strokeOpacity="0.75"
                    />

                    {/* If roof is thin (<5m), rays breakthrough into the cavern! */}
                    {reachesCave && (
                      <line
                        x1={rx}
                        y1={ceilingY}
                        x2={rx}
                        y2={ceilingY + 45}
                        stroke="#f87171"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                )
              })}
            </g>
          )}

          {/* 4. Pressurized Habitat Module inside Lava Tube */}
          <g transform="translate(260, 275)">
            {/* Habitat Hull */}
            <rect
              x="0"
              y="0"
              width="200"
              height="65"
              rx="12"
              fill="#0f172a"
              stroke={isRadiationSafe ? '#38bdf8' : '#f87171'}
              strokeWidth="2"
            />

            {/* Airlock and Port */}
            <rect x="80" y="12" width="40" height="24" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <circle cx="100" cy="24" r="5" fill={isRadiationSafe ? '#34d399' : '#f87171'} />

            {/* Habitat Name */}
            <text x="100" y="48" fill="#f8fafc" textAnchor="middle" fontWeight="bold" fontSize="11">
              Artemis Base Alpha · Habitat Core
            </text>

            {/* Antenna on roof */}
            <line x1="30" y1="0" x2="30" y2="-16" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="30" cy="-16" r="3" fill="#38bdf8" />
            <line x1="170" y1="0" x2="170" y2="-12" stroke="#94a3b8" strokeWidth="2" />
          </g>

          {/* 5. Geological Habitat Telemetry in Cavern */}
          {viewMode === 'radiation' ? (
            isRadiationSafe ? (
              <g transform={`translate(360, ${ceilingY + 36})`}>
                <rect x="-170" y="-14" width="340" height="28" rx="14" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <text x="0" y="4" fill="#a7f3d0" textAnchor="middle" fontWeight="bold" fontSize="11">
                  ✓ FULL RADIATION SHIELDING ({attenuationPct}% Attenuated · {doseInside} mSv/yr)
                </text>
              </g>
            ) : (
              <g transform={`translate(360, ${ceilingY + 36})`}>
                <rect x="-185" y="-14" width="370" height="28" rx="14" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="0" y="4" fill="#fecdd3" textAnchor="middle" fontWeight="bold" fontSize="11">
                  ⚠ RADIATION BREAKTHROUGH: {doseInside} mSv/yr (Minimum 5m Basalt Needed)
                </text>
              </g>
            )
          ) : (
            isThermalSafe ? (
              <g transform={`translate(360, ${ceilingY + 36})`}>
                <rect x="-175" y="-14" width="350" height="28" rx="14" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <text x="0" y="4" fill="#a7f3d0" textAnchor="middle" fontWeight="bold" fontSize="11">
                  ✓ THERMAL STABILITY: Constant +{cavernTemp}°C (±{thermalSwing}°C Diurnal Damping)
                </text>
              </g>
            ) : (
              <g transform={`translate(360, ${ceilingY + 36})`}>
                <rect x="-180" y="-14" width="360" height="28" rx="14" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="0" y="4" fill="#fef3c7" textAnchor="middle" fontWeight="bold" fontSize="11">
                  ⚠ DIURNAL THERMAL LEAK: ±{thermalSwing}°C Oscillation (Thermal Stress)
                </text>
              </g>
            )
          )}

          {/* Cavern Floor Flat Line */}
          <line x1="20" y1={floorY} x2="700" y2={floorY} stroke="#334155" strokeWidth="2" />
          <text x="75" y={floorY + 22} fill="#64748b" fontSize="9">
            Subterranean Floor · Solid A'a / Pahoehoe Basalt Flow
          </text>
          <text x="645" y={floorY + 22} fill="#64748b" fontSize="9" textAnchor="end">
            Zero Micrometeorite Threat
          </text>
        </svg>

        {/* Real-Time Telemetry Matrix */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
              Surface Planetary Flux
            </span>
            <span className="mt-1 block text-sm font-bold text-rose-400">
              {viewMode === 'radiation' ? '380 mSv/yr' : '-130°C to +120°C'}
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
              Basalt Overburden
            </span>
            <span className="mt-1 block text-sm font-bold text-sky-400">
              {roofDepth.toFixed(1)} meters (ρ = 2.9 g/cm³)
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
              Cavern Interior Telemetry
            </span>
            <span
              className={`mt-1 block text-sm font-bold ${
                viewMode === 'radiation'
                  ? isRadiationSafe
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : isThermalSafe
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {viewMode === 'radiation'
                ? `${doseInside} mSv/yr (${attenuationPct}% Attenuation)`
                : `+${cavernTemp}°C (±${thermalSwing}°C)`}
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
              Habitability Clearance
            </span>
            <span
              className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${
                (viewMode === 'radiation' ? isRadiationSafe : isThermalSafe)
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {(viewMode === 'radiation' ? isRadiationSafe : isThermalSafe) ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Artemis Safe Habitat</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-3.5" />
                  <span>Hazard: Need &gt;5m Basalt</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Scientific Ground-Truth Callout */}
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-400">
          <Zap className="mt-0.5 size-4 shrink-0 text-sky-400" />
          <p>
            <strong className="text-slate-200">Terrestrial Analogue Ground Truth:</strong> At Lanzarote’s La Corona volcanic system (Cueva de los Verdes), basaltic roof rock reaches 8 to 15 meters in thickness. ESA PANGAEA and PSTAR research teams use this subterranean labyrinth to demonstrate that pyroxene-rich basalt stops 99.9% of ionizing radiation while dampening surface temperature extremes into an ultra-stable 18°C subterranean microclimate.
          </p>
        </div>
      </div>
    </div>
  )
}

/** 2. Maar Crater vs Impact Crater Stratigraphy */
function MaarImpactDiagram() {
  const [step, setStep] = useState<1 | 2 | 3>(3)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <span className="text-xs font-semibold text-slate-200">
          Excavation & Stratigraphy Sequence:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 1 ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            1 · Pre-Explosion
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 2 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            2 · Excavation Blast
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 3 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            3 · Inverted Ejecta Rim
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
        <svg viewBox="0 0 700 320" className="w-full font-sans text-xs">
          {/* Strata background */}
          <rect x="20" y="80" width="660" height="70" fill="#334155" opacity="0.6" />
          <text x="40" y="120" fill="#94a3b8" fontWeight="600">
            Upper Crust / Regolith (Surface Layer)
          </text>

          <rect x="20" y="150" width="660" height="70" fill="#1e293b" opacity="0.8" />
          <text x="40" y="190" fill="#cbd5e1" fontWeight="600">
            Intermediate Basaltic Bedrock
          </text>

          <rect x="20" y="220" width="660" height="90" fill="#064e3b" opacity="0.7" />
          <text x="40" y="270" fill="#34d399" fontWeight="bold">
            Deep Mantle Peridotite & Xenolith Zone (40-60 km Depth)
          </text>

          {/* Crater Basin */}
          {step >= 2 && (
            <path
              d="M 180 80 Q 350 260, 520 80 Z"
              fill="#020617"
              stroke="#fb923c"
              strokeWidth="2"
            />
          )}

          {/* Blast Ejection */}
          {step === 2 && (
            <g className="animate-pulse">
              <path d="M 350 200 L 220 50 M 350 200 L 480 50 M 350 200 L 350 30" stroke="#f5c451" strokeWidth="3" />
              <text x="350" y="30" fill="#f5c451" textAnchor="middle" fontWeight="bold" fontSize="13">
                Phreatomagmatic Blast Dredging Up Mantle Xenoliths!
              </text>
            </g>
          )}

          {/* Inverted Rim */}
          {step === 3 && (
            <g>
              {/* Ejecta mound West */}
              <polygon points="120,80 180,40 230,80" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
              {/* Ejecta mound East */}
              <polygon points="470,80 520,40 580,80" fill="#064e3b" stroke="#34d399" strokeWidth="2" />

              <text x="180" y="30" fill="#34d399" textAnchor="middle" fontWeight="bold" fontSize="11">
                ★ Inverted Mantle Ejecta
              </text>
              <text x="520" y="30" fill="#34d399" textAnchor="middle" fontWeight="bold" fontSize="11">
                ★ Mantle Peridotite Xenoliths
              </text>

              <line x1="350" y1="210" x2="350" y2="280" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="350" y="170" fill="#fb923c" textAnchor="middle" fontWeight="bold">
                Kilbourne Crater Floor (100 m Deep)
              </text>
              <text x="350" y="190" fill="#94a3b8" textAnchor="middle" fontSize="10">
                Astronauts sample deep planetary mantle without drilling deep wells
              </text>
            </g>
          )}
        </svg>

        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-400">
          <strong className="text-slate-200">Scientific Analogy:</strong> Inverted stratigraphy means explosive excavation
          flips geological layers upside down. The deepest rock (mantle xenoliths and deep basalts) lands right on top of
          the crater rim—allowing Apollo and Artemis astronauts to collect deep planetary samples from the rim without
          expensive deep drilling hardware.
        </div>
      </div>
    </div>
  )
}

/** 3. Evaporite Playa & UV Protection */
function EvaporiteUvDiagram() {
  const [depthMm, setDepthMm] = useState<number>(3)

  // UV-C drops exponentially in halite/gypsum
  const uvIntensity = Math.max(1, Math.round(100 * Math.exp(-1.2 * depthMm)))
  // PAR (photosynthetic light) penetrates deeper
  const parIntensity = Math.max(15, Math.round(100 * Math.exp(-0.25 * depthMm)))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <span className="text-xs font-semibold text-slate-200">Translucent Mineral Depth:</span>
        <div className="flex items-center gap-3 text-xs">
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={depthMm}
            onChange={(e) => setDepthMm(Number(e.target.value))}
            className="w-36 accent-sky-400 cursor-pointer"
          />
          <span className="font-mono font-semibold text-sky-400">{depthMm} mm below surface</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
        <svg viewBox="0 0 700 300" className="w-full font-sans text-xs">
          {/* Surface UV Ray arrows */}
          <rect x="20" y="10" width="660" height="50" fill="#1e1b4b" opacity="0.6" />
          <text x="350" y="35" fill="#f87171" textAnchor="middle" fontWeight="bold">
            Solar UV-C & UV-B Radiation (Lethal Surface Flux)
          </text>

          {/* Halite crystal crust */}
          <rect x="20" y="60" width="660" height="220" fill="#1e293b" />

          {/* Simulated Salt Crystals */}
          <polygon points="50,60 120,60 140,120 70,140" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <polygon points="150,60 260,60 280,150 170,140" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="290,60 410,60 430,160 310,150" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <polygon points="440,60 550,60 570,140 460,130" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="580,60 670,60 660,130 590,140" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Depth indicator line */}
          <line
            x1="20"
            y1={60 + depthMm * 20}
            x2="680"
            y2={60 + depthMm * 20}
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text x="660" y={55 + depthMm * 20} fill="#38bdf8" textAnchor="end" fontWeight="bold">
            Current Probe Depth: {depthMm} mm
          </text>

          {/* Microbe Colony */}
          <g transform={`translate(280, ${60 + depthMm * 20 - 15})`}>
            <circle cx="10" cy="15" r="7" fill="#34d399" />
            <circle cx="28" cy="12" r="6" fill="#34d399" />
            <circle cx="45" cy="18" r="8" fill="#34d399" />
            <text x="65" y="19" fill="#34d399" fontWeight="bold" fontSize="12">
              Endolithic Halophilic Microbes (Fluid Inclusions)
            </text>
          </g>
        </svg>

        <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
            <span className="block text-[0.625rem] text-slate-400">UV-C Penetration</span>
            <span className="text-sm font-bold text-rose-400">{uvIntensity}%</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
            <span className="block text-[0.625rem] text-slate-400">Photosynthetic Light (PAR)</span>
            <span className="text-sm font-bold text-amber-400">{parIntensity}%</span>
          </div>
          <div className="col-span-2 rounded-lg border border-slate-800 bg-slate-900/60 p-2 sm:col-span-1">
            <span className="block text-[0.625rem] text-slate-400">Habitability Verdict</span>
            <span
              className={`text-sm font-bold ${
                depthMm >= 2.5 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {depthMm >= 2.5 ? '✓ Protected Shelter Zone' : '✗ Lethal UV Surface'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 4. Hydrothermal Acid-Sulfate Venting */
function HydrothermalDiagram() {
  const [activeTab, setActiveTab] = useState<'dallol' | 'mars'>('dallol')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
        <button
          type="button"
          onClick={() => setActiveTab('dallol')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'dallol' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          Dallol Hot Springs (Earth)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mars')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'mars' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          Columbia Hills / Home Plate (Mars)
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
        <svg viewBox="0 0 700 280" className="w-full font-sans text-xs">
          {/* Surface */}
          <rect x="20" y="100" width="660" height="170" fill="#1e293b" />

          {/* Acid Lake / Terraces */}
          <path
            d="M 120 100 Q 220 80, 320 100 Q 420 85, 550 100 Z"
            fill="#eab308"
            opacity="0.8"
          />

          {/* Vents Chimneys */}
          <path d="M 220 100 L 235 60 L 250 100 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          <path d="M 400 100 L 415 50 L 430 100 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />

          {/* Bubble steam */}
          <circle cx="235" cy="45" r="6" fill="#fef08a" opacity="0.6" className="animate-ping" />
          <circle cx="415" cy="35" r="8" fill="#fef08a" opacity="0.6" className="animate-ping" />

          {/* Magma Chamber */}
          <ellipse cx="350" cy="250" rx="200" ry="35" fill="#7f1d1d" opacity="0.7" />
          <text x="350" y="255" fill="#fca5a5" textAnchor="middle" fontWeight="bold">
            Magmatic Heat Source & Sulfur Gas Degassing
          </text>

          {/* Mineral annotations */}
          <text x="240" y="30" fill="#f59e0b" textAnchor="middle" fontWeight="bold">
            Jarosite + Goethite Chimney
          </text>
          <text x="420" y="20" fill="#38bdf8" textAnchor="middle" fontWeight="bold">
            Opaline Silica Sinter (SiO₂·nH₂O)
          </text>
          <text x="350" y="130" fill="#e2e8f0" textAnchor="middle" fontSize="11">
            Boiling Hyper-Acidic Fluid (pH &lt; 0 · 108°C)
          </text>
        </svg>

        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-400">
          {activeTab === 'dallol' ? (
            <p>
              <strong className="text-amber-400">Dallol Terrestrial Reality:</strong> Magma heats marine evaporite brines,
              spewing acidic iron-rich fluids. As sulfur oxidizes, it precipitates bright yellow jarosite, goethite, and
              silica towers identical in chemical assemblage to ancient Martian hydrothermal fields.
            </p>
          ) : (
            <p>
              <strong className="text-orange-400">Martian Planetary Counterpart:</strong> Spirit rover discovered 90%
              pure opaline silica at Home Plate in Gusev Crater. Dallol is the leading ground-truth site for proving that
              nodular silica &quot;cauliflowers&quot; can form abiotically through hydrothermal geysers.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/** 5. Inverted River Paleochannel Evolution */
function InvertedChannelDiagram() {
  const [step, setStep] = useState<1 | 2 | 3>(3)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <span className="text-xs font-semibold text-slate-200">3-Stage Inversion Process:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 1 ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Stage 1: River Flow
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 2 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Stage 2: Cementation
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              step === 3 ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Stage 3: Wind Inversion
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
        <svg viewBox="0 0 700 260" className="w-full font-sans text-xs">
          {step === 1 && (
            <g>
              {/* Flat plain */}
              <rect x="20" y="100" width="660" height="140" fill="#334155" />
              {/* Channel */}
              <ellipse cx="350" cy="110" rx="90" ry="25" fill="#0284c7" />
              <text x="350" y="115" fill="#e0f2fe" textAnchor="middle" fontWeight="bold">
                Active River Flow (Gravel & Sand Deposition)
              </text>
              <text x="350" y="70" fill="#38bdf8" textAnchor="middle">
                Stage 1: River cuts into soft floodplain mudstones, laying down dense channel gravels
              </text>
            </g>
          )}

          {step === 2 && (
            <g>
              <rect x="20" y="100" width="660" height="140" fill="#334155" />
              {/* Hardened Channel */}
              <ellipse cx="350" cy="110" rx="90" ry="25" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
              <text x="350" y="115" fill="#fef3c7" textAnchor="middle" fontWeight="bold">
                Indurated Sandstone Channel
              </text>
              <text x="350" y="70" fill="#f5c451" textAnchor="middle">
                Stage 2: Fluvial activity ceases. Carbonate & iron minerals cement channel sediments into rock
              </text>
            </g>
          )}

          {step === 3 && (
            <g>
              {/* Eroded lowlands */}
              <rect x="20" y="170" width="220" height="70" fill="#1e293b" />
              <rect x="460" y="170" width="220" height="70" fill="#1e293b" />

              {/* Elevated Ridge (Inverted Channel) */}
              <polygon points="220,170 260,110 440,110 480,170" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
              <rect x="260" y="170" width="180" height="70" fill="#78350f" />

              {/* Wind arrows */}
              <g className="animate-pulse">
                <path d="M 80 140 L 160 140 M 520 140 L 600 140" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                <text x="120" y="130" fill="#94a3b8" textAnchor="middle">
                  Wind Deflation
                </text>
                <text x="560" y="130" fill="#94a3b8" textAnchor="middle">
                  Wind Deflation
                </text>
              </g>

              <text x="350" y="90" fill="#f59e0b" textAnchor="middle" fontWeight="bold" fontSize="13">
                Elevated Inverted Paleochannel Ridge!
              </text>
              <text x="350" y="145" fill="#fef3c7" textAnchor="middle" fontWeight="600">
                Resistant Cemented River Bed
              </text>
              <text x="350" y="210" fill="#94a3b8" textAnchor="middle" fontSize="10">
                HiRISE orbital cameras trace ancient Martian water pathways across crater floors using this topography
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

/** 6. Permafrost & Ground Ice Radar Sounding */
function PermafrostDiagram() {
  const [pulseActive, setPulseActive] = useState<boolean>(true)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <span className="text-xs font-semibold text-slate-200">
          Ground-Penetrating Radar (RIMFAX Simulation):
        </span>
        <button
          type="button"
          onClick={() => setPulseActive((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            pulseActive ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Radio className="size-3.5" />
          {pulseActive ? 'Radar Sounding Active' : 'Radar Paused'}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
        <svg viewBox="0 0 700 300" className="w-full font-sans text-xs">
          {/* Surface line */}
          <rect x="20" y="20" width="660" height="60" fill="#0b172a" />
          <line x1="20" y1="80" x2="680" y2="80" stroke="#8194b2" strokeWidth="2" />
          <text x="40" y="70" fill="#8194b2" fontWeight="600">
            TUNDRA / MARTIAN SURFACE
          </text>

          {/* Rover icon representation */}
          <rect x="280" y="55" width="80" height="25" rx="4" fill="#38bdf8" />
          <circle cx="295" cy="80" r="7" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="345" cy="80" r="7" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="320" y="72" fill="#05070f" textAnchor="middle" fontWeight="bold">
            ROVER
          </text>

          {/* Radar waves */}
          {pulseActive && (
            <g className="animate-pulse">
              <path d="M 320 85 L 260 140 M 320 85 L 380 140" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M 320 85 L 230 180 M 320 85 L 410 180" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
            </g>
          )}

          {/* Active Layer / Dry Regolith */}
          <rect x="20" y="80" width="660" height="70" fill="#334155" opacity="0.6" />
          <text x="60" y="120" fill="#cbd5e1" fontWeight="600">
            Active Soil Layer / Dry Desiccated Regolith (Dielectric Constant ε ≈ 3.0)
          </text>

          {/* Ice Interface Boundary */}
          <line x1="20" y1="150" x2="680" y2="150" stroke="#38bdf8" strokeWidth="3" />
          <text x="500" y="142" fill="#38bdf8" fontWeight="bold">
            ★ Strong Radar Reflection Echo (Dielectric Jump ε: 3.0 → 8.0)
          </text>

          {/* Massive Ice Wedge / Ground Ice */}
          <rect x="20" y="150" width="660" height="130" fill="#0c4a6e" opacity="0.8" />
          <polygon points="320,150 290,260 350,260" fill="#38bdf8" opacity="0.4" stroke="#7dd3fc" strokeWidth="1" />
          <polygon points="180,150 160,240 200,240" fill="#38bdf8" opacity="0.4" stroke="#7dd3fc" strokeWidth="1" />
          <polygon points="480,150 460,250 500,250" fill="#38bdf8" opacity="0.4" stroke="#7dd3fc" strokeWidth="1" />

          <text x="350" y="210" fill="#e0f2fe" textAnchor="middle" fontWeight="bold" fontSize="13">
            Massive Subsurface Ground Ice / Ice Wedge Polygons
          </text>
          <text x="350" y="235" fill="#7dd3fc" textAnchor="middle" fontSize="11">
            Target for Future In-Situ Resource Utilization (ISRU) Rocket Fuel Production
          </text>
        </svg>

        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-400">
          <strong className="text-sky-400">Radar Ground-Truthing:</strong> Adventdalen lets scientists verify that
          subsurface radar antennas (such as RIMFAX on Mars 2020) can accurately determine the depth to pure ground ice
          without false reflections from gravel beds.
        </div>
      </div>
    </div>
  )
}
