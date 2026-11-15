import type { BreakdownSeverity, CelestialBody } from '../types'
import { DIMENSION_META } from './constants'

/** Body identity colors, reused by map markers, legends and site cards. */
export const bodyColors: Record<CelestialBody, string> = {
  earth: '#3b82f6',
  moon: '#9ca3af',
  mars: '#c1440e',
}

/** Accessible body labels paired with their colors for chart legends. */
export const bodyLegend: ReadonlyArray<{
  body: CelestialBody
  label: string
  color: string
}> = [
  { body: 'earth', label: 'Earth', color: bodyColors.earth },
  { body: 'moon', label: 'Moon', color: bodyColors.moon },
  { body: 'mars', label: 'Mars', color: bodyColors.mars },
]

/**
 * Similarity score (0–1) to display color.
 * Thresholds: ≥0.80 green, ≥0.60 cyan, ≥0.40 gold, ≥0.20 orange, <0.20 red.
 */
export function similarityColorScale(score: number): string {
  if (score >= 0.8) return '#34d399'
  if (score >= 0.6) return '#22d3ee'
  if (score >= 0.4) return '#f5c451'
  if (score >= 0.2) return '#fb923c'
  return '#f87171'
}

/** Contrast-safe text color to place on top of a similarity swatch. */
export function similarityTextOn(score: number): string {
  // Amber, cyan and green swatches need dark ink; orange and red carry white.
  return score >= 0.4 ? '#05070f' : '#f8fafc'
}

/** Breakdown severity colors, ordered from benign to physics-limited. */
export const severityColors: Record<BreakdownSeverity, string> = {
  low: '#34d399',
  medium: '#f5c451',
  high: '#fb923c',
  fundamental: '#f87171',
}

/** Dimension colors, index-aligned with DIMENSION_META and DIMENSION_KEYS. */
export const dimensionColors: readonly string[] = DIMENSION_META.map(
  (meta) => meta.color,
)

/** Hex color for one dimension key, falling back to plasma cyan. */
export function dimensionColor(key: string): string {
  const meta = DIMENSION_META.find((entry) => entry.key === key)
  return meta?.color ?? '#38bdf8'
}
