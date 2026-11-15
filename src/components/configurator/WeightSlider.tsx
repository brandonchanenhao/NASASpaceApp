import {
  Droplets,
  Gem,
  Layers,
  Microscope,
  Mountain,
  RotateCcw,
  Thermometer,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import { useId } from 'react'
import type { DimensionKey, DimensionMeta } from '../../types'
import { TooltipInfo } from '../ui/TooltipInfo'

interface WeightSliderProps {
  meta: DimensionMeta
  /** Current weight in the closed interval [0.0, 2.0]. */
  value: number
  onChange: (value: number) => void
  /** Restores this dimension to the neutral 1.0 weight. */
  onReset: () => void
}

/** Lucide glyph per dimension, mirroring the seven radar axes. */
const DIMENSION_ICONS: Record<DimensionKey, LucideIcon> = {
  geology: Gem,
  terrain: Mountain,
  thermal: Thermometer,
  volatiles: Droplets,
  dust: Wind,
  subsurface: Layers,
  astrobiology: Microscope,
}

const MIN_WEIGHT = 0
const MAX_WEIGHT = 2

/**
 * One mission-priority weight control.
 *
 * The range input is dimension-colored so the seven sliders stay identifiable
 * beside their radar axes, and exposes `aria-valuetext` because a bare number
 * between 0 and 2 is not self-describing to assistive technology.
 */
export function WeightSlider({
  meta,
  value,
  onChange,
  onReset,
}: WeightSliderProps) {
  const inputId = useId()
  const Icon = DIMENSION_ICONS[meta.key]
  const isNeutral = Math.abs(value - 1) < 1e-9
  const percent = ((value - MIN_WEIGHT) / (MAX_WEIGHT - MIN_WEIGHT)) * 100

  return (
    <div className="rounded-lg border border-hairline bg-panel/60 px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <span
          className="grid size-5 shrink-0 place-items-center rounded border"
          style={{
            color: meta.color,
            borderColor: `${meta.color}59`,
            backgroundColor: `${meta.color}14`,
          }}
        >
          <Icon className="size-3" strokeWidth={2} aria-hidden="true" />
        </span>

        <label
          htmlFor={inputId}
          className="min-w-0 flex-1 truncate text-[0.6875rem] font-semibold text-ink"
        >
          {meta.shortLabel}
        </label>

        <TooltipInfo label={`About the ${meta.label} dimension`}>
          {meta.description}
        </TooltipInfo>

        <output
          htmlFor={inputId}
          className="w-7 shrink-0 text-right font-mono text-[0.6875rem] font-semibold"
          style={{ color: meta.color }}
        >
          {value.toFixed(1)}
        </output>

        <button
          type="button"
          onClick={onReset}
          disabled={isNeutral}
          aria-label={`Reset ${meta.shortLabel} weight to 1.0`}
          title={`Reset ${meta.shortLabel} weight to 1.0`}
          className="grid size-5 shrink-0 place-items-center rounded border border-hairline bg-elevated text-ink-dim transition-colors hover:border-plasma/40 hover:text-plasma"
        >
          <RotateCcw className="size-2.5" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>

      <label htmlFor={inputId} className="sr-only">
        {meta.label} mission priority weight, from 0.0 (ignore) to 2.0
        (critical)
      </label>
      <input
        id={inputId}
        type="range"
        min={MIN_WEIGHT}
        max={MAX_WEIGHT}
        step={0.1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={`${value.toFixed(1)} of 2.0`}
        className="mt-1.5 w-full"
        style={{
          accentColor: meta.color,
          background: `linear-gradient(to right, ${meta.color} ${percent}%, var(--color-hairline-strong) ${percent}%)`,
          borderRadius: '999px',
        }}
      />

      <div className="flex justify-between text-[0.5rem] text-ink-dim">
        <span>Ignore 0.0</span>
        <span>Neutral 1.0</span>
        <span>Critical 2.0</span>
      </div>
    </div>
  )
}
