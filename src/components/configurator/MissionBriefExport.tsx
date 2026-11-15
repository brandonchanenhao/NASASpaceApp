import {
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Printer,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { dominantGap } from '../../engine/similarity'
import type {
  AnalogPairing,
  BreakdownItem,
  BreakdownSeverity,
  Citation,
  DimensionWeights,
} from '../../types'
import {
  bodyColors,
  severityColors,
  similarityColorScale,
} from '../../utils/colors'
import {
  BODY_LABELS,
  DIMENSION_KEYS,
  DIMENSION_META,
} from '../../utils/constants'
import { formatNumber, formatSimilarityScore } from '../../utils/formatters'

interface MissionBriefExportProps {
  /** Pairing the brief is generated for (the current top-ranked pairing). */
  pairing: AnalogPairing
  /** Mission weights that produced the ranking. */
  weights: DimensionWeights
  /** Full ranked pairing list used for the "top matches" table. */
  rankings: readonly AnalogPairing[]
}

type CopyState = 'idle' | 'copied' | 'failed'

const SEVERITY_ORDER: Record<BreakdownSeverity, number> = {
  fundamental: 0,
  high: 1,
  medium: 2,
  low: 3,
}

/**
 * Session generation date, resolved once when the module loads so the rendered
 * date is stable across re-renders and lint-clean during render.
 */
const GENERATED_ON = new Date().toISOString().slice(0, 10)

const RADAR_SIZE = 280
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_RADIUS = 96
const RADAR_RINGS = [0.25, 0.5, 0.75, 1]

function radarPoint(
  value: number,
  angle: number,
): [number, number] {
  return [
    RADAR_CENTER + Math.cos(angle) * RADAR_RADIUS * value,
    RADAR_CENTER + Math.sin(angle) * RADAR_RADIUS * value,
  ]
}

function polygonPoints(values: readonly number[]): string {
  return values
    .map((value, index) => {
      const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2
      const [x, y] = radarPoint(value, angle)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

/** Unique citations across both sites, preserving dataset-level provenance. */
function collectCitations(pairing: AnalogPairing): readonly Citation[] {
  const byId = new Map<string, Citation>()
  for (const site of [pairing.earthSite, pairing.targetSite]) {
    for (const citation of site.citations) {
      byId.set(citation.id, citation)
    }
  }
  return [...byId.values()]
}

/** Deterministic Markdown rendering of the same data shown on screen. */
function buildMarkdown(
  pairing: AnalogPairing,
  weights: DimensionWeights,
  rankings: readonly AnalogPairing[],
  generatedOn: string,
): string {
  const { earthSite, targetSite } = pairing
  const bodyLabel = BODY_LABELS[targetSite.body]
  const lines: string[] = [
    `# LunaTerraMars Mission Brief — ${earthSite.name} ↔ ${targetSite.name}`,
    '',
    `Generated ${generatedOn} · Earth analogs for permanent lunar and Martian base siting.`,
    '',
    '## Pairing',
    '',
    `- Earth analog: ${earthSite.name} (${earthSite.region}) — ${earthSite.coordinate.lat.toFixed(2)}°, ${earthSite.coordinate.lon.toFixed(2)}°`,
    `- ${bodyLabel} target: ${targetSite.name} (${targetSite.region}) — ${targetSite.coordinate.lat.toFixed(2)}°, ${targetSite.coordinate.lon.toFixed(2)}°`,
    `- Combined similarity: ${formatSimilarityScore(pairing.similarityScore)} (cosine ${formatSimilarityScore(pairing.cosineSimilarity)}, Euclidean ${formatSimilarityScore(pairing.euclideanSimilarity)})`,
    '',
    '## Mission priority weights',
    '',
    '| Dimension | Weight (0.0–2.0) |',
    '| --- | --- |',
    ...DIMENSION_META.map(
      (meta) => `| ${meta.label} | ${weights[meta.key].toFixed(1)} |`,
    ),
    '',
    '## Normalized signature',
    '',
    '| Dimension | Earth | ' + bodyLabel + ' | Delta |',
    '| --- | --- | --- | --- |',
    ...DIMENSION_KEYS.map((key) => {
      const meta = DIMENSION_META.find((entry) => entry.key === key)
      const label = meta?.shortLabel ?? key
      return `| ${label} | ${formatNumber(earthSite.featureVector[key], 2)} | ${formatNumber(targetSite.featureVector[key], 2)} | ${formatNumber(pairing.dimensionDeltas[key], 2)} |`
    }),
    '',
    '## Top-ranked pairings under these weights',
    '',
    ...rankings.slice(0, 3).map(
      (candidate, index) =>
        `${index + 1}. ${candidate.earthSite.name} ↔ ${candidate.targetSite.name} — ${formatSimilarityScore(candidate.similarityScore)}`,
    ),
    '',
    '## Largest normalized gaps',
    '',
    ...DIMENSION_KEYS.map((key) => ({
      meta: DIMENSION_META.find((entry) => entry.key === key),
      delta: pairing.dimensionDeltas[key],
    }))
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 3)
      .map(
        (gap, index) =>
          `${index + 1}. ${gap.meta?.shortLabel ?? 'Dimension'} — Δ ${formatNumber(gap.delta, 2)} (${gap.meta?.unit ?? 'unitless'})`,
      ),
    '',
    '## Where the analogy breaks down',
    '',
    ...[...pairing.breakdowns]
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
      .slice(0, 4)
      .map(
        (item) =>
          `### ${item.domain} — ${item.severity.toUpperCase()}\n\n- Earth: ${item.earthValue}\n- ${bodyLabel}: ${item.targetValue}\n- Impact: ${item.deltaDescription}\n- Mitigation: ${item.mitigationStrategy}`,
      ),
    '',
    '## Testbed operations',
    '',
    ...(pairing.testbedApplications.length > 0
      ? pairing.testbedApplications.map(
          (application) =>
            `- ${application.operation} (TRL ${application.readinessLevel}): ${application.specificTest} — systems: ${application.relevantSystems.join(', ')}.`,
        )
      : ['No curated testbed campaign is catalogued for this pairing.']),
    '',
    '## Citations',
    '',
    ...collectCitations(pairing).map(
      (citation) =>
        `- ${citation.instrument} · ${citation.dataset} — ${citation.description} ${citation.url}`,
    ),
    '',
    '---',
    'All planetary data courtesy of planetary science missions and archives: GIBS, Moon Trek, Mars Trek and the Common Metadata Repository.',
    '',
  ]
  return lines.join('\n')
}

/** Copy helper with a legacy fallback for non-secure demo origins. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the textarea path.
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(area)
    return copied
  } catch {
    return false
  }
}

function BreakdownRow({ item }: { item: BreakdownItem }) {
  return (
    <li className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.6875rem] font-semibold text-ink">{item.domain}</p>
        <span
          className="rounded-full border px-1.5 py-px text-[0.5rem] font-bold uppercase tracking-[0.08em]"
          style={{
            color: severityColors[item.severity],
            borderColor: `${severityColors[item.severity]}66`,
            backgroundColor: `${severityColors[item.severity]}14`,
          }}
        >
          {item.severity}
        </span>
      </div>
      <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-dim">
        Earth {item.earthValue} → {item.targetValue}
      </p>
      <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-muted">
        {item.deltaDescription}
      </p>
      <p className="mt-0.5 text-[0.625rem] leading-relaxed text-plasma">
        Mitigation: {item.mitigationStrategy}
      </p>
    </li>
  )
}

/**
 * Printable mission brief for the top-ranked pairing.
 *
 * The brief intentionally avoids the charting stack: the radar is a hand-rolled
 * SVG so the component stays out of the Recharts chunk, and the Markdown export
 * is generated from the same pairing data as the on-screen document.
 */
export function MissionBriefExport({
  pairing,
  weights,
  rankings,
}: MissionBriefExportProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const resetTimer = useRef<number | null>(null)
  const generatedOn = GENERATED_ON

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    },
    [],
  )

  const markdown = useMemo(
    () => buildMarkdown(pairing, weights, rankings, generatedOn),
    [pairing, weights, rankings, generatedOn],
  )

  const { earthSite, targetSite } = pairing
  const bodyLabel = BODY_LABELS[targetSite.body]
  const earthColor = bodyColors.earth
  const targetColor = bodyColors[targetSite.body]
  const scoreColor = similarityColorScale(pairing.similarityScore)
  const gap = dominantGap(pairing.dimensionDeltas)
  const gapMeta =
    DIMENSION_META.find((meta) => meta.key === gap.key) ?? DIMENSION_META[0]

  const earthValues = DIMENSION_KEYS.map((key) => earthSite.featureVector[key])
  const targetValues = DIMENSION_KEYS.map((key) => targetSite.featureVector[key])

  const topMatches = rankings.slice(0, 3)
  const largestGaps = DIMENSION_KEYS.map((key) => {
    const meta = DIMENSION_META.find((entry) => entry.key === key)
    return { meta, delta: pairing.dimensionDeltas[key] }
  })
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)

  const breakdowns = [...pairing.breakdowns]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 3)

  const testbeds = pairing.testbedApplications.slice(0, 3)
  const citations = collectCitations(pairing)

  function flashCopy(state: CopyState) {
    setCopyState(state)
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 3200)
  }

  async function handleCopy() {
    flashCopy((await copyText(markdown)) ? 'copied' : 'failed')
  }

  function handleDownload() {
    const blob = new Blob([markdown], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `lunaterramars-brief-${earthSite.id}__${targetSite.id}.md`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <section
      aria-labelledby="mission-brief-heading"
      data-mission-brief
      className="rounded-xl border border-hairline bg-panel/70 p-3 print:border-0 print:bg-white print:p-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-plasma/40 bg-plasma/10 text-plasma">
            <FileText className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
              Mission brief
            </p>
            <h3
              id="mission-brief-heading"
              className="mt-0.5 text-sm font-semibold print:text-slate-900"
            >
              {earthSite.shortName} ↔ {targetSite.shortName} · top-ranked
              pairing
            </h3>
            <p className="mt-0.5 text-[0.625rem] text-ink-dim print:text-slate-600">
              Generated {generatedOn} · Planetary Base Siting
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 print:hidden">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline-strong bg-panel px-2 py-1 text-[0.625rem] font-semibold text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
          >
            {copyState === 'copied' ? (
              <Check
                className="size-3 text-signal-green"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            ) : (
              <ClipboardCopy
                className="size-3"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
            {copyState === 'copied'
              ? 'Copied'
              : copyState === 'failed'
                ? 'Copy failed'
                : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline-strong bg-panel px-2 py-1 text-[0.625rem] font-semibold text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
          >
            <Printer className="size-3" strokeWidth={2} aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 rounded-lg border border-plasma/40 bg-plasma/10 px-2 py-1 text-[0.625rem] font-semibold text-plasma transition-colors hover:bg-plasma/20"
          >
            <Download className="size-3" strokeWidth={2} aria-hidden="true" />
            Markdown
          </button>
        </div>
      </div>

      {copyState === 'failed' ? (
        <p
          role="status"
          className="mt-1.5 rounded-lg border border-signal-orange/40 bg-signal-orange/10 px-2 py-1 text-[0.625rem] text-signal-orange print:hidden"
        >
          Clipboard access was blocked. Use the Markdown export instead.
        </p>
      ) : null}

      <div className="mt-2 rounded-lg border border-hairline bg-abyss/60 px-2.5 py-2 print:border-slate-300 print:bg-white">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
          <span style={{ color: earthColor }} className="print:text-slate-900">
            {earthSite.name}
          </span>
          <span className="text-ink-dim print:text-slate-500">↔</span>
          <span style={{ color: targetColor }} className="print:text-slate-900">
            {targetSite.name}
          </span>
          <span className="rounded-full border border-hairline bg-elevated px-1.5 py-px text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-ink-muted print:border-slate-300 print:bg-white print:text-slate-700">
            {bodyLabel} target
          </span>
          <span
            className="ml-auto rounded-full border px-2 py-0.5 font-mono text-xs font-semibold"
            style={{
              color: scoreColor,
              borderColor: `${scoreColor}66`,
              backgroundColor: `${scoreColor}14`,
            }}
          >
            {formatSimilarityScore(pairing.similarityScore)}
          </span>
        </div>
        <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-muted print:text-slate-700">
          Combined score from weighted cosine (
          {formatSimilarityScore(pairing.cosineSimilarity)}) and weighted
          Euclidean ({formatSimilarityScore(pairing.euclideanSimilarity)})
          similarity. Largest normalized gap: {gapMeta.shortLabel} · Δ{' '}
          {formatNumber(gap.delta, 2)}.
        </p>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-abyss/60 px-2 py-1.5 print:border-slate-300 print:bg-white">
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
            Normalized signature
          </p>
          <svg
            viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
            role="img"
            aria-label={`Seven-axis signature comparison between ${earthSite.name} and ${targetSite.name}`}
            className="mx-auto block h-auto w-full max-w-[280px]"
          >
            <title>
              {earthSite.shortName} and {targetSite.shortName} normalized
              seven-dimension signatures
            </title>
            {RADAR_RINGS.map((ring) => (
              <polygon
                key={ring}
                points={polygonPoints(
                  DIMENSION_KEYS.map(() => ring),
                )}
                fill="none"
                stroke="#1e2b45"
                strokeWidth={0.8}
              />
            ))}
            {DIMENSION_KEYS.map((key, index) => {
              const angle =
                (Math.PI * 2 * index) / DIMENSION_KEYS.length - Math.PI / 2
              const [x, y] = radarPoint(1, angle)
              const [labelX, labelY] = radarPoint(1.14, angle)
              const meta = DIMENSION_META.find((entry) => entry.key === key)
              const anchor =
                Math.cos(angle) > 0.35
                  ? 'end'
                  : Math.cos(angle) < -0.35
                    ? 'start'
                    : 'middle'
              return (
                <g key={key}>
                  <line
                    x1={RADAR_CENTER}
                    y1={RADAR_CENTER}
                    x2={x}
                    y2={y}
                    stroke="#1e2b45"
                    strokeWidth={0.8}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    fontSize={7}
                    fill="#8194b2"
                  >
                    {meta?.shortLabel ?? key}
                  </text>
                </g>
              )
            })}
            <polygon
              points={polygonPoints(targetValues)}
              fill={targetColor}
              fillOpacity={0.2}
              stroke={targetColor}
              strokeWidth={1.6}
            />
            <polygon
              points={polygonPoints(earthValues)}
              fill={earthColor}
              fillOpacity={0.18}
              stroke={earthColor}
              strokeWidth={1.6}
            />
          </svg>
          <div className="mt-1 flex flex-wrap justify-center gap-2 text-[0.5625rem] text-ink-muted print:text-slate-700">
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: earthColor }}
                aria-hidden="true"
              />
              {earthSite.shortName} (Earth)
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: targetColor }}
                aria-hidden="true"
              />
              {targetSite.shortName} ({bodyLabel})
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-abyss/60 px-2 py-1.5 print:border-slate-300 print:bg-white">
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
            Mission priority weights
          </p>
          <ul className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
            {DIMENSION_META.map((meta) => (
              <li
                key={meta.key}
                className="flex items-center justify-between gap-1 text-[0.625rem] text-ink-muted print:text-slate-700"
              >
                <span className="inline-flex min-w-0 items-center gap-1">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{meta.shortLabel}</span>
                </span>
                <span className="font-mono font-semibold text-ink print:text-slate-900">
                  {weights[meta.key].toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5 print:border-slate-300 print:bg-white">
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
            Top-ranked pairings
          </p>
          <ol className="mt-1 space-y-0.5">
            {topMatches.map((candidate, index) => (
              <li
                key={candidate.id}
                className="flex items-baseline justify-between gap-2 text-[0.625rem] text-ink-muted print:text-slate-700"
              >
                <span className="min-w-0 truncate">
                  {index + 1}. {candidate.earthSite.shortName} ↔{' '}
                  {candidate.targetSite.shortName}
                </span>
                <span
                  className="shrink-0 font-mono font-semibold"
                  style={{ color: similarityColorScale(candidate.similarityScore) }}
                >
                  {formatSimilarityScore(candidate.similarityScore)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5 print:border-slate-300 print:bg-white">
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
            Largest normalized gaps
          </p>
          <ol className="mt-1 space-y-0.5">
            {largestGaps.map((entry, index) => (
              <li
                key={entry.meta?.key ?? index}
                className="flex items-baseline justify-between gap-2 text-[0.625rem] text-ink-muted print:text-slate-700"
              >
                <span className="min-w-0 truncate">
                  {index + 1}. {entry.meta?.shortLabel ?? 'Dimension'}
                </span>
                <span className="shrink-0 font-mono font-semibold text-ink print:text-slate-900">
                  Δ {formatNumber(entry.delta, 2)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
          Where the analogy breaks down
        </p>
        <ul className="mt-1 space-y-1">
          {breakdowns.map((item) => (
            <BreakdownRow key={`${item.domain}-${item.severity}`} item={item} />
          ))}
        </ul>
      </div>

      <div className="mt-2">
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
          Testbed operations hosted by {earthSite.shortName}
        </p>
        {testbeds.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {testbeds.map((application) => (
              <li
                key={application.operation}
                className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5 print:border-slate-300 print:bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.6875rem] font-semibold text-ink print:text-slate-900">
                    {application.operation}
                  </p>
                  <span className="shrink-0 font-mono text-[0.5625rem] font-semibold text-signal-green print:text-slate-700">
                    TRL {application.readinessLevel}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-muted print:text-slate-700">
                  {application.specificTest}
                </p>
                <p className="mt-0.5 text-[0.5625rem] text-ink-dim print:text-slate-600">
                  Systems: {application.relevantSystems.join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 rounded-lg border border-hairline bg-panel/60 px-2 py-1.5 text-[0.625rem] text-ink-muted print:border-slate-300 print:bg-white print:text-slate-700">
            No curated testbed campaign is catalogued for this pairing.
          </p>
        )}
      </div>

      <div className="mt-2">
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-dim print:text-slate-500">
          Citations · {citations.length} datasets
        </p>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">
          {citations.map((citation) => (
            <li
              key={citation.id}
              className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5 print:border-slate-300 print:bg-white"
            >
              <p className="text-[0.625rem] font-semibold text-ink print:text-slate-900">
                {citation.instrument} · {citation.dataset}
              </p>
              <p className="mt-0.5 text-[0.5625rem] leading-relaxed text-ink-muted print:text-slate-700">
                {citation.description}
              </p>
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block truncate text-[0.5625rem] text-plasma hover:text-ink print:text-blue-800"
              >
                {citation.url}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2 border-t border-hairline pt-1.5 text-[0.5625rem] leading-relaxed text-ink-dim print:border-slate-300 print:text-slate-600">
        Scores combine the seven normalized dimensions with the mission weights
        above. All planetary values derive from GIBS, Moon Trek, Mars Trek
        and CMR products; breakdown physics and mitigations are cited in the
        comparison dashboard.
      </p>
    </section>
  )
}
