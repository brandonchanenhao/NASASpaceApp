import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { AnalogPairing } from '../../types'
import { bodyColors, similarityColorScale } from '../../utils/colors'
import { BODY_LABELS, DIMENSION_META } from '../../utils/constants'
import { formatNumber, formatSimilarityScore } from '../../utils/formatters'

interface RadarChartProps {
  pairing: AnalogPairing
}

/** One spoke of the seven-axis radar: both normalized scores plus metadata. */
interface RadarDatum {
  /** Compact axis label rendered by PolarAngleAxis. */
  dimension: string
  /** Full scientific dimension label shown in the tooltip. */
  fullLabel: string
  /** Physical definition of the dimension shown in the tooltip. */
  description: string
  /** Normalized Earth score, 0–1. */
  earth: number
  /** Normalized Moon/Mars score, 0–1. */
  target: number
}

/**
 * Seven-axis normalized signature chart.
 *
 * Both polygons share the 0–1 radial domain so the visual area is directly
 * comparable between the Earth analog and its planetary target. The combined
 * similarity score is mirrored in the chart centre, where it reads as a single
 * headline number without occluding either polygon's vertices.
 */
export function RadarChart({ pairing }: RadarChartProps) {
  const { earthSite, targetSite } = pairing
  const targetColor = bodyColors[targetSite.body]
  const scoreColor = similarityColorScale(pairing.similarityScore)

  const data: RadarDatum[] = DIMENSION_META.map((meta) => ({
    dimension: meta.shortLabel,
    fullLabel: meta.label,
    description: meta.description,
    earth: earthSite.featureVector[meta.key],
    target: targetSite.featureVector[meta.key],
  }))

  return (
    <section
      aria-labelledby="radar-chart-heading"
      className="rounded-xl border border-hairline bg-panel/70 p-3.5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="radar-chart-heading" className="text-sm font-semibold">
          Seven-dimension signature
        </h3>
        <span className="font-mono text-[0.625rem] text-ink-dim">
          normalized 0–1
        </span>
      </div>
      <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
        Overlaid normalized feature vectors. Where the two polygons separate,
        the analog no longer predicts target behaviour for that dimension.
      </p>

      <div className="relative mx-auto mt-2 h-[26rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#1e2b45" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#aab8cf', fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tickCount={5}
              axisLine={false}
              tick={{ fill: '#8194b2', fontSize: 8 }}
            />
            <Radar
              name={earthSite.shortName}
              dataKey="earth"
              stroke={bodyColors.earth}
              fill={bodyColors.earth}
              fillOpacity={0.3}
              strokeWidth={1.75}
              isAnimationActive={false}
            />
            <Radar
              name={targetSite.shortName}
              dataKey="target"
              stroke={targetColor}
              fill={targetColor}
              fillOpacity={0.3}
              strokeWidth={1.75}
              isAnimationActive={false}
            />
            <Tooltip
              content={(props) => {
                if (!props.active) return null
                const datum = props.payload?.[0]?.payload as
                  | RadarDatum
                  | undefined
                if (!datum) return null
                return (
                  <div className="max-w-72 rounded-lg border border-hairline-strong bg-panel/95 px-3 py-2 shadow-2xl backdrop-blur">
                    <p className="text-xs font-semibold text-ink">
                      {datum.fullLabel}
                    </p>
                    <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-muted">
                      {datum.description}
                    </p>
                    <dl className="mt-1.5 space-y-0.5 font-mono text-[0.625rem]">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-ink-dim">{earthSite.shortName}</dt>
                        <dd style={{ color: bodyColors.earth }}>
                          {formatNumber(datum.earth, 2)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-ink-dim">{targetSite.shortName}</dt>
                        <dd style={{ color: targetColor }}>
                          {formatNumber(datum.target, 2)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-hairline pt-0.5">
                        <dt className="text-ink-dim">Δ normalized</dt>
                        <dd className="text-ink">
                          {formatNumber(Math.abs(datum.earth - datum.target), 2)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )
              }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center rounded-full border border-hairline-strong bg-void/80 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
            <span
              className="font-mono text-lg font-semibold leading-none"
              style={{ color: scoreColor }}
            >
              {formatSimilarityScore(pairing.similarityScore)}
            </span>
            <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
              similarity
            </span>
          </div>
        </div>
      </div>

      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.6875rem]">
        <li className="flex items-center gap-1.5 text-ink-muted">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: bodyColors.earth }}
            aria-hidden="true"
          />
          <span className="font-medium text-ink">{earthSite.name}</span>
          <span className="text-ink-dim">Earth analog</span>
        </li>
        <li className="flex items-center gap-1.5 text-ink-muted">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: targetColor }}
            aria-hidden="true"
          />
          <span className="font-medium text-ink">{targetSite.name}</span>
          <span className="text-ink-dim">
            {BODY_LABELS[targetSite.body]} target
          </span>
        </li>
      </ul>
    </section>
  )
}
