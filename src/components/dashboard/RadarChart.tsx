import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { AnalogPairing, DimensionKey } from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { BODY_LABELS, DIMENSION_META } from '../../utils/constants'
import { formatNumber, formatSimilarityScore } from '../../utils/formatters'

interface RadarChartProps {
  pairing: AnalogPairing
}

interface RadarDatum {
  key: DimensionKey
  dimension: string
  fullLabel: string
  earth: number
  target: number
}

export function RadarChart({ pairing }: RadarChartProps) {
  const { earthSite, targetSite } = pairing
  const targetColor = bodyColors[targetSite.body]
  const scoreColor = similarityColorScale(pairing.similarityScore)

  const data: RadarDatum[] = DIMENSION_META.map((meta) => ({
    key: meta.key,
    dimension: meta.shortLabel,
    fullLabel: meta.label,
    earth: earthSite.featureVector[meta.key],
    target: targetSite.featureVector[meta.key],
  }))

  return (
    <section
      aria-labelledby="radar-chart-heading"
      className="rounded-2xl border border-hairline-strong bg-panel/70 p-4 sm:p-5 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div>
          <h3 id="radar-chart-heading" className="text-sm font-semibold text-white">
            7-Dimension Similarity Signature
          </h3>
          <p className="text-[0.6875rem] text-ink-muted">
            Overlaid feature vectors (0–1 normalized).
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-ink-dim">
          Score: <strong style={{ color: scoreColor }}>{formatSimilarityScore(pairing.similarityScore)}</strong>
        </span>
      </div>

      <div className="relative mx-auto h-72 sm:h-80 w-full min-w-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#1e2b45" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#aab8cf', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tickCount={5}
              axisLine={false}
              tick={{ fill: '#8194b2', fontSize: 9 }}
            />
            <Radar
              name={earthSite.shortName}
              dataKey="earth"
              stroke={bodyColors.earth}
              fill={bodyColors.earth}
              fillOpacity={0.25}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Radar
              name={targetSite.shortName}
              dataKey="target"
              stroke={targetColor}
              fill={targetColor}
              fillOpacity={0.25}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Tooltip
              content={(props) => {
                if (!props.active) return null
                const datum = props.payload?.[0]?.payload as RadarDatum | undefined
                if (!datum) return null
                const delta = Math.abs(datum.earth - datum.target)
                return (
                  <div className="rounded-lg border border-hairline-strong bg-panel/95 p-2 shadow-xl text-xs backdrop-blur">
                    <p className="font-semibold text-white">{datum.fullLabel}</p>
                    <div className="mt-1 space-y-0.5 font-mono text-[0.6875rem]">
                      <div className="flex justify-between gap-4">
                        <span className="text-sky-400">{earthSite.shortName}:</span>
                        <span>{formatNumber(datum.earth, 2)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: targetColor }}>{targetSite.shortName}:</span>
                        <span>{formatNumber(datum.target, 2)}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-hairline pt-0.5 font-bold text-white">
                        <span>Delta (Δ):</span>
                        <span>{formatNumber(delta, 2)}</span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-sky-400" />
          <strong className="text-white">{earthSite.shortName}</strong> (Earth Analogue)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: targetColor }} />
          <strong className="text-white">{targetSite.shortName}</strong> ({BODY_LABELS[targetSite.body]} Target)
        </span>
      </div>
    </section>
  )
}
