import * as L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import { earthSites } from '../../data/analogs_dataset'
import { EARTH_LAYERS } from '../../data/gibs_layers'
import { EARTH_MAP_MAX_ZOOM } from '../../utils/constants'
import { LayerSwitcher } from './LayerSwitcher'
import { MapFocus } from './MapFocus'
import { SiteMarker } from './SiteMarker'

interface EarthMapProps {
  selectedSiteId: string
  activeLayerId: string
  onSiteSelect: (siteId: string) => void
  onLayerChange: (layerId: string) => void
  onCompare: (siteId: string) => void
}

/**
 * Web Mercator extent of the curated Earth analogs, with padding supplied by
 * `boundsOptions`. Leaflet clamps panning to the Web Mercator world.
 */
const EARTH_SITE_BOUNDS: L.LatLngBoundsExpression = [
  [-32, -118],
  [82, 44],
]

const EARTH_WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85.0511, -180],
  [85.0511, 180],
]

/**
 * Earth analog map backed by NASA GIBS EPSG:3857 WMTS imagery.
 *
 * The active GIBS product is selected in the layer switcher; `maxNativeZoom`
 * is taken from the product's GoogleMapsCompatible matrix set so Leaflet
 * upsamples low-resolution layers instead of requesting 404 tiles. Horizontal
 * wrapping stays enabled: at whole-world zooms the 512 px level-1 mosaic is
 * narrower than a wide map pane, so Leaflet repeats the valid GIBS columns
 * instead of requesting the out-of-range columns a `noWrap` grid would ask for.
 */
export function EarthMap({
  selectedSiteId,
  activeLayerId,
  onSiteSelect,
  onLayerChange,
  onCompare,
}: EarthMapProps) {
  const activeLayer =
    EARTH_LAYERS.find((layer) => layer.id === activeLayerId) ?? EARTH_LAYERS[0]
  const selectedSite =
    earthSites.find((site) => site.id === selectedSiteId) ?? earthSites[0]

  return (
    <div
      role="region"
      aria-label="Earth analog map with GIBS imagery"
      className="relative h-full w-full"
    >
      <MapContainer
        bounds={EARTH_SITE_BOUNDS}
        boundsOptions={{ padding: [18, 18] }}
        minZoom={0}
        maxZoom={EARTH_MAP_MAX_ZOOM}
        maxBounds={EARTH_WORLD_BOUNDS}
        maxBoundsViscosity={0.9}
        scrollWheelZoom
        className="h-full w-full bg-abyss"
      >
        <TileLayer
          key={activeLayer.id}
          url={activeLayer.urlTemplate}
          attribution={activeLayer.attribution}
          maxNativeZoom={activeLayer.maxZoom}
          maxZoom={EARTH_MAP_MAX_ZOOM}
          tms={activeLayer.tms}
          noWrap={false}
        />
        {earthSites.map((site) => (
          <SiteMarker
            key={site.id}
            site={site}
            selected={site.id === selectedSiteId}
            onSelect={onSiteSelect}
            onCompare={onCompare}
          />
        ))}
        <MapFocus site={selectedSite} zoom={4} />
      </MapContainer>
      <LayerSwitcher
        layers={EARTH_LAYERS}
        activeLayerId={activeLayer.id}
        bodyLabel="Earth"
        onLayerChange={onLayerChange}
      />
    </div>
  )
}
