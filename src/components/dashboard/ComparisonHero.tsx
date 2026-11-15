import {
  Compass,
  ExternalLink,
  Flame,
  Globe,
  Mars,
  Moon,
  Radio,
  Wind,
} from 'lucide-react'
import type { AnalogPairing } from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'
import { formatCoordinate, formatNumber, formatSimilarityScore } from '../../utils/formatters'

interface ComparisonHeroProps {
  pairing: AnalogPairing
}

export function ComparisonHero({ pairing }: ComparisonHeroProps) {
  const { earthSite, targetSite } = pairing
  const isMoon = targetSite.body === 'moon'
  const TargetIcon = isMoon ? Moon : Mars
  const targetColor = bodyColors[targetSite.body]
  const scoreColor = similarityColorScale(pairing.similarityScore)
  const scorePct = Math.round(pairing.similarityScore * 100)

  const verdict =
    pairing.similarityScore >= 0.8
      ? 'High-Fidelity Match'
      : pairing.similarityScore >= 0.6
        ? 'Good Analogue'
        : pairing.similarityScore >= 0.4
          ? 'Partial Analogue'
          : 'Weak Proxy'

  return (
    <div className="space-y-3">
      {/* Visual Environment Cards & Central Score */}
      <div className="relative overflow-hidden rounded-2xl border border-hairline-strong bg-panel/70 p-4 sm:p-5 shadow-xl">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-12 sm:items-center">
          {/* Earth Analogue Card */}
          <div className="sm:col-span-5">
            <div className="overflow-hidden rounded-xl border border-sky-500/30 bg-abyss">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={earthSite.imageUrl}
                  alt={earthSite.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-transparent" />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-sky-950/90 px-2 py-0.5 text-[0.625rem] font-semibold text-sky-300 border border-sky-400/30">
                  <Globe className="size-3 text-sky-400" />
                  Earth Analogue
                </span>

                {earthSite.worldviewUrl && (
                  <a
                    href={earthSite.worldviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open orbital imagery for ${earthSite.name}`}
                    className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-sky-600 transition-colors"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                )}

                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <p className="font-mono text-[0.625rem] text-sky-300">
                    {formatCoordinate(earthSite.coordinate, 2)}
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {earthSite.name}
                  </h3>
                </div>
              </div>
              <div className="p-2.5 text-xs text-ink-muted truncate">
                {earthSite.region}
              </div>
            </div>
          </div>

          {/* Central Score */}
          <div className="sm:col-span-2 flex flex-col items-center justify-center text-center py-2">
            <div className="relative flex size-24 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="none"
                  className="text-hairline"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={scoreColor}
                  strokeWidth="7"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * scorePct) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-mono text-2xl font-bold leading-none"
                  style={{ color: scoreColor }}
                >
                  {formatSimilarityScore(pairing.similarityScore)}
                </span>
                <span className="text-[0.5rem] font-semibold uppercase tracking-wider text-ink-dim mt-0.5">
                  Match
                </span>
              </div>
            </div>

            <span
              className="mt-2 rounded-full border px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider"
              style={{
                color: scoreColor,
                borderColor: `${scoreColor}55`,
                backgroundColor: `${scoreColor}15`,
              }}
            >
              {verdict}
            </span>
          </div>

          {/* Planetary Target Card */}
          <div className="sm:col-span-5">
            <div
              className="overflow-hidden rounded-xl border bg-abyss"
              style={{ borderColor: `${targetColor}40` }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={targetSite.imageUrl}
                  alt={targetSite.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-transparent" />
                <span
                  className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold border"
                  style={{
                    color: targetColor,
                    borderColor: `${targetColor}55`,
                    backgroundColor: 'rgba(5, 7, 15, 0.85)',
                  }}
                >
                  <TargetIcon className="size-3" style={{ color: targetColor }} />
                  {BODY_LABELS[targetSite.body]} Target
                </span>

                {targetSite.pdsUrl && (
                  <a
                    href={targetSite.pdsUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open orbital data for ${targetSite.name}`}
                    className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-orange-600 transition-colors"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                )}

                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <p className="font-mono text-[0.625rem]" style={{ color: targetColor }}>
                    {formatCoordinate(targetSite.coordinate, 2)}
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {targetSite.name}
                  </h3>
                </div>
              </div>
              <div className="p-2.5 text-xs text-ink-muted truncate">
                {targetSite.region}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planetary Baseline Physics Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
        <div className="rounded-xl border border-hairline bg-panel/70 p-2.5">
          <div className="flex items-center gap-1.5 text-ink-dim text-[0.625rem] font-semibold uppercase tracking-wider">
            <Compass className="size-3 text-plasma" />
            <span>Gravity</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between font-mono font-bold">
            <span className="text-white">1.00 g</span>
            <span className="text-ink-dim text-[0.625rem]">vs</span>
            <span style={{ color: targetColor }}>{isMoon ? '0.17 g' : '0.38 g'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-panel/70 p-2.5">
          <div className="flex items-center gap-1.5 text-ink-dim text-[0.625rem] font-semibold uppercase tracking-wider">
            <Wind className="size-3 text-cyan-400" />
            <span>Atmosphere</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between font-mono font-bold">
            <span className="text-white">101.3 kPa</span>
            <span className="text-ink-dim text-[0.625rem]">vs</span>
            <span style={{ color: targetColor }}>{isMoon ? 'Vacuum' : '0.6 kPa'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-panel/70 p-2.5">
          <div className="flex items-center gap-1.5 text-ink-dim text-[0.625rem] font-semibold uppercase tracking-wider">
            <Radio className="size-3 text-amber-400" />
            <span>Radiation</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between font-mono font-bold">
            <span className="text-white">0.27 μSv/h</span>
            <span className="text-ink-dim text-[0.625rem]">vs</span>
            <span style={{ color: targetColor }}>{isMoon ? '~30 μSv/h' : '~25 μSv/h'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-panel/70 p-2.5">
          <div className="flex items-center gap-1.5 text-ink-dim text-[0.625rem] font-semibold uppercase tracking-wider">
            <Flame className="size-3 text-rose-400" />
            <span>Thermal Delta</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between font-mono font-bold">
            <span className="text-white">{formatNumber(earthSite.rawParameters.diurnalDeltaTK, 0)} K</span>
            <span className="text-ink-dim text-[0.625rem]">vs</span>
            <span style={{ color: targetColor }}>{formatNumber(targetSite.rawParameters.diurnalDeltaTK, 0)} K</span>
          </div>
        </div>
      </div>
    </div>
  )
}
