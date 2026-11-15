import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { AnalogSite } from '../../types'

interface MapFocusProps {
  site: AnalogSite
  /** Zoom floor used when centring on a newly selected site. */
  zoom: number
}

/**
 * Keeps the selected site in view when selection changes from a popup, the
 * sidebar or the opposite map. The first render is deliberately ignored so
 * the initial curated overview is not replaced by a close-up.
 */
export function MapFocus({ site, zoom }: MapFocusProps) {
  const map = useMap()
  const previousSiteId = useRef(site.id)

  useEffect(() => {
    if (previousSiteId.current === site.id) return
    previousSiteId.current = site.id

    const targetZoom = Math.max(map.getZoom(), zoom)
    map.flyTo([site.coordinate.lat, site.coordinate.lon], targetZoom, {
      duration: 0.6,
    })
  }, [map, site, zoom])

  return null
}
