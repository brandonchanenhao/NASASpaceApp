import * as L from 'leaflet'
import { Check, ChevronDown, Layers } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { TileLayer } from '../../types'

interface LayerSwitcherProps {
  layers: readonly TileLayer[]
  activeLayerId: string
  /** Body name used in accessible labels, e.g. "Moon". */
  bodyLabel: string
  onLayerChange: (layerId: string) => void
}

const CATEGORY_LABELS: Record<TileLayer['category'], string> = {
  basemap: 'Basemap',
  elevation: 'Elevation',
  thermal: 'Thermal',
  composition: 'Composition',
  other: 'Geophysical',
}

const CATEGORY_STYLES: Record<TileLayer['category'], string> = {
  basemap: 'border-plasma/40 bg-plasma/10 text-plasma',
  elevation: 'border-solar/40 bg-solar/10 text-solar',
  thermal: 'border-signal-orange/40 bg-signal-orange/10 text-signal-orange',
  composition: 'border-lunar/40 bg-lunar/10 text-lunar',
  other: 'border-hairline-strong bg-elevated text-ink-muted',
}

/**
 * Floating imagery selector that sits above Leaflet's control pane.
 * Clicks inside the panel are stopped from reaching the map so opening the
 * menu never starts a drag or a zoom gesture.
 */
export function LayerSwitcher({
  layers,
  activeLayerId,
  bodyLabel,
  onLayerChange,
}: LayerSwitcherProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const activeLayer =
    layers.find((layer) => layer.id === activeLayerId) ?? layers[0]

  useEffect(() => {
    const element = containerRef.current
    if (element) {
      L.DomEvent.disableClickPropagation(element)
      L.DomEvent.disableScrollPropagation(element)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="absolute right-3 top-3 z-[1000] w-72 max-w-[calc(100%-1.5rem)]"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${bodyLabel} imagery layers`}
        className="flex w-full items-center gap-2 rounded-lg border border-hairline-strong bg-panel/95 px-2.5 py-2 text-left shadow-lg backdrop-blur transition-colors hover:border-plasma/50"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md border border-hairline bg-elevated text-plasma">
          <Layers className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
            Imagery layer
          </span>
          <span className="block truncate text-xs font-medium text-ink">
            {activeLayer?.name ?? 'Layer catalog unavailable'}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-ink-dim transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-hairline-strong bg-panel/95 p-1.5 shadow-2xl backdrop-blur"
          role="group"
          aria-label={`${bodyLabel} imagery products`}
        >
          {layers.map((layer) => {
            const isActive = layer.id === activeLayerId
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => {
                  onLayerChange(layer.id)
                  setOpen(false)
                }}
                aria-pressed={isActive}
                className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  isActive
                    ? 'bg-plasma/10 text-ink'
                    : 'text-ink-muted hover:bg-elevated/70 hover:text-ink'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium leading-snug">
                    {layer.name}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex rounded border px-1.5 py-px text-[0.5625rem] font-semibold uppercase tracking-[0.1em] ${
                        CATEGORY_STYLES[layer.category]
                      }`}
                    >
                      {CATEGORY_LABELS[layer.category]}
                    </span>
                    <span className="font-mono text-[0.5625rem] text-ink-dim">
                      LOD {layer.maxZoom}
                    </span>
                  </span>
                </span>
                {isActive ? (
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-plasma"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
