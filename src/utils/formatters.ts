/**
 * Locale-aware formatters for scientific values.
 *
 * All functions are pure and defensive: non-finite inputs render as an em dash
 * so a missing instrument retrieval can never surface as "NaN" in the UI.
 */

import type { Coordinate } from '../types'

const EM_DASH = '—'

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function formatWithDigits(
  value: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}

/**
 * Locale-formatted number with a fixed decimal precision.
 *
 * @example formatNumber(1234.5678, 2) // "1,234.57"
 */
export function formatNumber(value: number, decimals = 2): string {
  if (!isFiniteNumber(value)) return EM_DASH
  return formatWithDigits(value, decimals, decimals)
}

/**
 * Fraction in the range [0, 1] rendered as a percentage.
 *
 * @example formatPercent(0.734) // "73.4%"
 */
export function formatPercent(value: number, decimals = 1): string {
  if (!isFiniteNumber(value)) return EM_DASH
  return `${formatWithDigits(value * 100, decimals, decimals)}%`
}

/**
 * Surface temperature expressed in kelvin with the Celsius equivalent.
 * Uses the IAU 2019 nominal conversion: T(°C) = T(K) − 273.15.
 *
 * @example formatTemperature(288.0) // "288 K (15 °C)"
 */
export function formatTemperature(kelvin: number): string {
  if (!isFiniteNumber(kelvin)) return EM_DASH
  const celsius = kelvin - 273.15
  return `${formatWithDigits(kelvin, 0, 0)} K (${formatWithDigits(celsius, 1, 1)} °C)`
}

/**
 * Combined similarity score in [0, 1] rendered as a percentage.
 *
 * @example formatSimilarityScore(0.842) // "84.2%"
 */
export function formatSimilarityScore(score: number): string {
  if (!isFiniteNumber(score)) return EM_DASH
  return `${formatWithDigits(score * 100, 1, 1)}%`
}

/**
 * Signed difference between a target and an Earth value, with its unit.
 * Sign convention: target − earth.
 *
 * @example formatDelta(0.32, 0.57, 'index') // "+0.25 index"
 */
export function formatDelta(earth: number, target: number, unit: string): string {
  if (!isFiniteNumber(earth) || !isFiniteNumber(target)) return EM_DASH
  const difference = target - earth
  const sign = difference >= 0 ? '+' : '-'
  const magnitude = formatWithDigits(Math.abs(difference), 2, 2)
  return unit.length > 0 ? `${sign}${magnitude} ${unit}` : `${sign}${magnitude}`
}

/**
 * Planetographic latitude with its hemisphere suffix.
 *
 * @example formatLatitude(31.97) // "31.97° N"
 */
export function formatLatitude(latitude: number, decimals = 2): string {
  if (!isFiniteNumber(latitude)) return EM_DASH
  const hemisphere = latitude >= 0 ? 'N' : 'S'
  return `${formatWithDigits(Math.abs(latitude), decimals, decimals)}° ${hemisphere}`
}

/**
 * East-positive longitude with its hemisphere suffix.
 *
 * @example formatLongitude(-106.97) // "106.97° W"
 */
export function formatLongitude(longitude: number, decimals = 2): string {
  if (!isFiniteNumber(longitude)) return EM_DASH
  const hemisphere = longitude >= 0 ? 'E' : 'W'
  return `${formatWithDigits(Math.abs(longitude), decimals, decimals)}° ${hemisphere}`
}

/**
 * Paired latitude/longitude string for map popups and site cards.
 *
 * @example formatCoordinate({ lat: 31.97, lon: -106.97 }) // "31.97° N, 106.97° W"
 */
export function formatCoordinate(
  coordinate: Coordinate,
  decimals = 2,
): string {
  return `${formatLatitude(coordinate.lat, decimals)}, ${formatLongitude(
    coordinate.lon,
    decimals,
  )}`
}
