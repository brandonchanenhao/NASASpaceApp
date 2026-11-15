import * as L from 'leaflet'
import { ChevronDown, ChevronUp, Compass, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { earthSites } from '../../data/analogs_dataset'
import { SITE_STORIES } from '../../data/story_dataset'
import type { AnalogSite } from '../../types'

interface EarthHomeViewProps {
  onOpenStory: (siteId: string) => void
}

/** Global extent enclosing all 6 verified benchmark analogue destinations */
const ALL_SITES_BOUNDS: L.LatLngBoundsExpression = [
  [-30, -120],
  [82, 45],
]

/** Hard boundary limits: map cannot be panned beyond real Earth territory */
const STRICT_WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-75, -180],
  [84, 180],
]

/** Get geological icon SVG for a site */
function getSiteIconSvg(siteId: string) {
  switch (siteId) {
    case 'la-corona':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V12a7 7 0 0 1 14 0v9"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`
    case 'kilbourne-hole':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="2"/></svg>`
    case 'pajonales':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/></svg>`
    case 'dallol':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
    case 'hanksville':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`
    case 'adventdalen':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`
    default:
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`
  }
}

/** Create custom HTML DivIcon with exact pixel-anchored tip */
function createEarthMarkerIcon(site: AnalogSite): L.DivIcon {
  const iconSvg = getSiteIconSvg(site.id)

  const html = `
    <div class="earth-marker-wrapper" data-site-id="${site.id}" title="Select ${site.name}">
      <!-- Precision Vector Pin Marker (Tip touches x=16, y=38) -->
      <div class="earth-marker-pin">
        <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
          <path d="M16 38 C16 38 28 23 28 14.5 C28 7.5 22.6 1.5 16 1.5 C9.4 1.5 4 7.5 4 14.5 C4 23 16 38 16 38 Z"
                fill="#ea580c" stroke="#ffffff" stroke-width="2" />
          <circle cx="16" cy="14.5" r="4.5" fill="#ffffff" />
        </svg>
      </div>

      <!-- Compact Clean Label Card -->
      <div class="earth-marker-card">
        <div style="display: grid; place-items: center; width: 22px; height: 22px; border-radius: 4px; background: rgba(30, 41, 59, 0.9); border: 1px solid #475569;">
          ${iconSvg}
        </div>
        <div style="text-align: left; line-height: 1.25;">
          <div style="font-size: 12px; font-weight: 600; color: #f8fafc; letter-spacing: -0.01em;">
            ${site.shortName}
          </div>
          <div style="font-size: 10px; font-weight: 500; color: #94a3b8;">
            ${site.region.split(',')[site.region.split(',').length - 1].trim()}
          </div>
        </div>
      </div>
    </div>
  `

  return L.divIcon({
    className: 'earth-analog-marker',
    html,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  })
}

/** Map Controller for smooth fly-to zoom in before switching */
function MapController({
  targetSite,
  onZoomComplete,
}: {
  targetSite: AnalogSite | null
  onZoomComplete: (site: AnalogSite) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!targetSite) return

    let isDone = false
    const handleComplete = () => {
      if (!isDone) {
        isDone = true
        onZoomComplete(targetSite)
      }
    }

    // Zoom smoothly into the site's geological features
    map.flyTo([targetSite.coordinate.lat, targetSite.coordinate.lon], 7.5, {
      duration: 1.25,
      easeLinearity: 0.25,
    })

    map.once('moveend', handleComplete)
    const timeout = setTimeout(handleComplete, 1400)

    return () => {
      map.off('moveend', handleComplete)
      clearTimeout(timeout)
    }
  }, [map, targetSite, onZoomComplete])

  return null
}

/** Dispatches move events to hide title text while moving */
function MapMoveListener({ onMoveStart }: { onMoveStart: () => void }) {
  useMapEvents({
    movestart: () => {
      onMoveStart()
    },
    dragstart: () => {
      onMoveStart()
    },
    zoomstart: () => {
      onMoveStart()
    },
  })
  return null
}

export function EarthHomeView({ onOpenStory }: EarthHomeViewProps) {
  const [trayOpen, setTrayOpen] = useState(false)
  const [focusedSite, setFocusedSite] = useState<AnalogSite | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [titleVisible, setTitleVisible] = useState(true)

  const handleSelectSite = useCallback(
    (site: AnalogSite) => {
      if (isNavigating) return
      setIsNavigating(true)
      setTrayOpen(false)
      setFocusedSite(site)
    },
    [isNavigating],
  )

  const handleZoomComplete = useCallback(
    (site: AnalogSite) => {
      onOpenStory(site.id)
    },
    [onOpenStory],
  )

  return (
    <div className="relative h-full w-full overflow-hidden bg-void select-none">
      {/* 1. Full-Screen Realistic Satellite Map of Earth (Strictly bounded) */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          bounds={ALL_SITES_BOUNDS}
          boundsOptions={{ padding: [80, 40] }}
          minZoom={2.4}
          maxZoom={12}
          scrollWheelZoom
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full bg-void"
          maxBounds={STRICT_WORLD_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          {/* Esri World Imagery: High-Resolution Photorealistic Satellite Photography */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={12}
            keepBuffer={4}
            noWrap={false}
          />

          {/* Interactive Clickable Location Pins */}
          {earthSites.map((site) => (
            <EarthSiteMarker
              key={site.id}
              site={site}
              onSelect={() => handleSelectSite(site)}
            />
          ))}

          <MapController
            targetSite={focusedSite}
            onZoomComplete={handleZoomComplete}
          />
          <MapMoveListener onMoveStart={() => setTitleVisible(false)} />
        </MapContainer>
      </div>

      {/* 2. Centered Editorial Heading Overlay (Disappears smoothly when map moves) */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-5 z-20 flex flex-col items-center px-4 text-center transition-all duration-300 ease-out ${
          titleVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="pointer-events-auto">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white drop-shadow">
            Earth Analogue Research Sites
          </h1>
          <p className="mt-1 max-w-lg text-xs sm:text-sm text-slate-300 drop-shadow">
            Selected terrestrial environments used for lunar and Martian scientific testing.
          </p>
        </div>
      </div>

      {/* 3. Bottom Control: Site Directory */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3">
        {/* Quick-Select Drawer */}
        {trayOpen && (
          <div className="pointer-events-auto mx-4 max-w-4xl w-full rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in duration-150">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Terrestrial Analogue Destinations ({earthSites.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTrayOpen(false)}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Close directory"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
              {earthSites.map((site) => {
                const story = SITE_STORIES[site.id]
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleSelectSite(site)}
                    className="group flex flex-col overflow-hidden rounded border border-slate-800 bg-slate-950/70 text-left transition-colors hover:border-slate-600 hover:bg-slate-900"
                  >
                    <div className="relative h-20 w-full overflow-hidden bg-slate-900">
                      <img
                        src={story?.heroImageUrl ?? site.imageUrl}
                        alt={site.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1.5 rounded bg-black/60 px-1 py-0.5 font-mono text-[0.5625rem] text-slate-200">
                        {site.coordinate.lat > 0
                          ? `${site.coordinate.lat.toFixed(1)}°N`
                          : `${Math.abs(site.coordinate.lat).toFixed(1)}°S`}
                      </span>
                    </div>
                    <div className="p-2">
                      <h4 className="truncate text-xs font-medium text-slate-100 group-hover:text-white">
                        {site.shortName}
                      </h4>
                      <p className="truncate text-[0.625rem] text-slate-400">
                        {site.region.split(',')[0]}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Clean Corporate Button */}
        <button
          type="button"
          onClick={() => setTrayOpen((prev) => !prev)}
          className="pointer-events-auto flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 shadow-lg backdrop-blur hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Compass className="size-4 text-slate-400" />
          <span>Select Analogue Site</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[0.6875rem] font-mono text-slate-400">
            {earthSites.length}
          </span>
          {trayOpen ? (
            <ChevronDown className="size-3.5 text-slate-400" />
          ) : (
            <ChevronUp className="size-3.5 text-slate-400" />
          )}
        </button>
      </div>

      {/* 4. Zoom-in Navigation Status */}
      {isNavigating && focusedSite && (
        <div className="pointer-events-none absolute bottom-8 inset-x-0 z-40 flex justify-center animate-in fade-in duration-150">
          <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/95 px-3.5 py-1.5 text-xs text-slate-200 shadow-lg">
            <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>Navigating to {focusedSite.name}...</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Leaflet Marker for an Earth Analogue Site */
function EarthSiteMarker({
  site,
  onSelect,
}: {
  site: AnalogSite
  onSelect: () => void
}) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)

  const icon = useMemo(() => createEarthMarkerIcon(site), [site])

  useEffect(() => {
    const marker = L.marker([site.coordinate.lat, site.coordinate.lon], {
      icon,
      zIndexOffset: 500,
    })

    marker.on('click', () => {
      onSelect()
    })

    marker.addTo(map)
    markerRef.current = marker

    return () => {
      marker.remove()
    }
  }, [map, site, icon, onSelect])

  return null
}
