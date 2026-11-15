import { MapContainer, TileLayer } from 'react-leaflet'
import { moonSites } from '../../data/analogs_dataset'
import { MOON_LAYERS } from '../../data/gibs_layers'
import { TARGET_MAP_MAX_ZOOM } from '../../utils/constants'
import { LayerSwitcher } from './LayerSwitcher'
import { MapFocus } from './MapFocus'
import { SiteMarker } from './SiteMarker'
import {
  PLANETARY_CRS,
  PLANETARY_MAP_BOUNDS,
} from './planetaryCrs'

interface MoonMapProps {
  selectedSiteId: string
  activeLayerId: string
  onSiteSelect: (siteId: string) => void
  onLayerChange: (layerId: string) => void
  onCompare: (siteId: string) => void
}

/**
 * Global lunar survey map on NASA Moon Trek WMTS imagery.
 *
 * Trek publishes a 2:1 equirectangular tile matrix starting at level 0, so
 * `PLANETARY_CRS` maps [lat, lon] directly onto TileRow/TileCol and the tile
 * layer is requested with `tms: false` (standard north-west origin). The initial
 * view uses integer zoom 0 (2 × 1 tiles = 512 × 256 px) because the WMTS tree
 * has no negative levels and Leaflet does not resolve sub-level tile ranges.
 * All four curated lunar sites stay visible; `MapFocus` flies in on selection.
 */
export function MoonMap({
  selectedSiteId,
  activeLayerId,
  onSiteSelect,
  onLayerChange,
  onCompare,
}: MoonMapProps) {
  const activeLayer =
    MOON_LAYERS.find((layer) => layer.id === activeLayerId) ?? MOON_LAYERS[0]
  const selectedSite =
    moonSites.find((site) => site.id === selectedSiteId) ?? moonSites[0]

  return (
    <div
      role="region"
      aria-label="Moon base-site map with NASA Moon Trek imagery"
      className="relative h-full w-full"
    >
      <MapContainer
        crs={PLANETARY_CRS}
        center={[0, 0]}
        zoom={0}
        minZoom={0}
        maxZoom={TARGET_MAP_MAX_ZOOM}
        maxBounds={PLANETARY_MAP_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="h-full w-full bg-abyss"
      >
        <TileLayer
          key={activeLayer.id}
          url={activeLayer.urlTemplate}
          attribution={activeLayer.attribution}
          maxNativeZoom={activeLayer.maxZoom}
          maxZoom={TARGET_MAP_MAX_ZOOM}
          tms={false}
          noWrap
        />
        {moonSites.map((site) => (
          <SiteMarker
            key={site.id}
            site={site}
            selected={site.id === selectedSiteId}
            onSelect={onSiteSelect}
            onCompare={onCompare}
          />
        ))}
        <MapFocus site={selectedSite} zoom={2} />
      </MapContainer>
      <LayerSwitcher
        layers={MOON_LAYERS}
        activeLayerId={activeLayer.id}
        bodyLabel="Moon"
        onLayerChange={onLayerChange}
      />
    </div>
  )
}
