import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from 'recharts'
import { SITE_STORIES } from '../../data/story_dataset'
import type { AnalogPairing, DimensionKey, DimensionWeights } from '../../types'

interface PlanetaryAnalogCardProps {
  pairing: AnalogPairing
  weights: DimensionWeights
}

interface DimensionRow {
  key: DimensionKey
  dimension: string
  fullName: string
  siteScore: number
  targetScore: number
  weightPct: number
}

const SITE_METADATA_EXTRAS: Record<
  string,
  { access: string; usage: string }
> = {
  'kilbourne-hole': {
    access: 'Accessible',
    usage: 'Apollo & Artemis testbed',
  },
  adventdalen: {
    access: 'Polar / Remote',
    usage: 'Heavily used',
  },
  pajonales: {
    access: 'High altitude (3537 m)',
    usage: 'Active research',
  },
  'la-corona': {
    access: 'Moderate',
    usage: 'ESA CAVES & PANGAEA',
  },
  dallol: {
    access: 'Extreme heat',
    usage: 'Astrobiology field site',
  },
  hanksville: {
    access: 'Road accessible',
    usage: 'MDRS Mars habitat',
  },
}

export function PlanetaryAnalogCard({
  pairing,
  weights,
}: PlanetaryAnalogCardProps) {
  const { earthSite, targetSite } = pairing
  const matchPct = Math.round(pairing.similarityScore * 100)

  // Extra metadata badges
  const extra = SITE_METADATA_EXTRAS[earthSite.id] ?? {
    access: 'Remote field site',
    usage: 'Active analog',
  }

  // Dimension rows configuration
  const totalWeight =
    Object.values(weights).reduce((sum, w) => sum + w, 0) || 1

  const rows: DimensionRow[] = [
    {
      key: 'geology',
      dimension: 'Geology',
      fullName: 'Geology & minerals',
      siteScore: Math.round(earthSite.featureVector.geology * 5),
      targetScore: Math.round(targetSite.featureVector.geology * 5),
      weightPct: Math.round((weights.geology / totalWeight) * 100),
    },
    {
      key: 'terrain',
      dimension: 'Terrain',
      fullName: 'Terrain & topography',
      siteScore: Math.round(earthSite.featureVector.terrain * 5),
      targetScore: Math.round(targetSite.featureVector.terrain * 5),
      weightPct: Math.round((weights.terrain / totalWeight) * 100),
    },
    {
      key: 'thermal',
      dimension: 'Thermal',
      fullName: 'Thermal & illumination',
      siteScore: Math.round(earthSite.featureVector.thermal * 5),
      targetScore: Math.round(targetSite.featureVector.thermal * 5),
      weightPct: Math.round((weights.thermal / totalWeight) * 100),
    },
    {
      key: 'volatiles',
      dimension: 'Ice & Volatiles',
      fullName: 'Ground ice & volatiles',
      siteScore: Math.round(earthSite.featureVector.volatiles * 5),
      targetScore: Math.round(targetSite.featureVector.volatiles * 5),
      weightPct: Math.round((weights.volatiles / totalWeight) * 100),
    },
    {
      key: 'dust',
      dimension: 'Dust & wind',
      fullName: 'Dust & wind processes',
      siteScore: Math.round(earthSite.featureVector.dust * 5),
      targetScore: Math.round(targetSite.featureVector.dust * 5),
      weightPct: Math.round((weights.dust / totalWeight) * 100),
    },
    {
      key: 'subsurface',
      dimension: 'Subsurface',
      fullName: 'Caves & subsurface',
      siteScore: Math.round(earthSite.featureVector.subsurface * 5),
      targetScore: Math.round(targetSite.featureVector.subsurface * 5),
      weightPct: Math.round((weights.subsurface / totalWeight) * 100),
    },
    {
      key: 'astrobiology',
      dimension: 'Habitability',
      fullName: 'Habitability & biosignatures',
      siteScore: Math.round(earthSite.featureVector.astrobiology * 5),
      targetScore: Math.round(targetSite.featureVector.astrobiology * 5),
      weightPct: Math.round((weights.astrobiology / totalWeight) * 100),
    },
  ]

  // Concise single-sentence scientific summaries
  const story = SITE_STORIES[earthSite.id]

  const analogHolds =
    story?.comparison.keySimilarities[0] ||
    `${earthSite.name} provides high fidelity mineralogical and morphological correspondence with ${targetSite.name}.`

  const breaksDown =
    story?.comparison.criticalDivergences[0] ||
    pairing.breakdowns[0]?.deltaDescription ||
    `Terrestrial surface gravity (1.00 g) and dense atmospheric pressure diverge from ${targetSite.shortName} surface conditions.`

  const preparesExploration =
    story?.testbedApplications[0]?.description ||
    pairing.testbedApplications[0]?.specificTest ||
    `Rehearse surface instrumentation deployment, EVA traverse timing, and remote sampling protocols.`

  return (
    <article
      aria-labelledby="analog-card-title"
      className="rounded-2xl border border-slate-800 bg-[#0c1322] p-6 sm:p-8 lg:p-9 shadow-2xl"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        {/* Left: Site Title & Target Pairing */}
        <div>
          <h2
            id="analog-card-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
          >
            {earthSite.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {earthSite.region} · against {targetSite.name}
          </p>
        </div>

        {/* Center: Match Percentage */}
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#38bdf8]">
            {matchPct}
          </span>
          <span className="text-sm font-medium text-slate-400">% match</span>
        </div>

        {/* Right: Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-700/70 bg-slate-800/50 px-3.5 py-1 font-mono text-[11px] text-slate-300">
            Field access: {extra.access}
          </span>
          <span className="rounded-full border border-slate-700/70 bg-slate-800/50 px-3.5 py-1 font-mono text-[11px] text-slate-300">
            As an analog: {extra.usage}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Radar vs Right Scientific Insights & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-6">
        {/* Left: Spider / Radar Chart (0 to 5 scale) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="h-72 sm:h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadarChart data={rows} outerRadius="75%">
                <PolarGrid stroke="#1e293b" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tickCount={6}
                  axisLine={false}
                  tick={false}
                />
                <Radar
                  name="Site (0 to 5)"
                  dataKey="siteScore"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.25}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Radar
                  name="What the target needs"
                  dataKey="targetScore"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.03}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              </RechartsRadarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-400 mt-2">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 bg-[#38bdf8] inline-block rounded-full" />
              <span>Site (0 to 5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 border-t border-dashed border-slate-400 inline-block" />
              <span>What the target needs</span>
            </div>
          </div>
        </div>

        {/* Right: Key Takeaways & Tabular Breakdown */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                WHERE THE ANALOG HOLDS
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                {analogHolds}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono font-semibold tracking-wider text-[#f59e0b] uppercase">
                WHERE IT BREAKS DOWN
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                {breaksDown}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                HOW IT PREPARES EXPLORATION
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                {preparesExploration}
              </p>
            </div>
          </div>

          {/* Dimension Table */}
          <div className="pt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="pb-2 font-medium">DIMENSION</th>
                  <th className="pb-2 text-right font-medium">WEIGHT</th>
                  <th className="pb-2 text-right font-medium">SITE SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-slate-300">
                      {row.fullName}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-400">
                      {row.weightPct}%
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-200">
                      {row.siteScore} / 5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </article>
  )
}

