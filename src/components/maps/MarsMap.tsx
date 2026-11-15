import { MapContainer, TileLayer } from 'react-leaflet'
import { marsSites } from '../../data/analogs_dataset'
import { MARS_LAYERS } from '../../data/gibs_layers'
import { TARGET_MAP_MAX_ZOOM } from '../../utils/constants'
import { LayerSwitcher } from './LayerSwitcher'
import { MapFocus } from './MapFocus'
import { SiteMarker } from './SiteMarker'
import {
  PLANETARY_CRS,
  PLANETARY_MAP_BOUNDS,
} from './planetaryCrs'

interface MarsMapProps {
  selectedSiteId: string
  activeLayerId: string
  onSiteSelect: (siteId: string) => void
  onLayerChange: (layerId: string) => void
  onCompare: (siteId: string) => void
}

/**
 * Global Mars survey map on NASA Mars Trek WMTS imagery.
 *
 * Shares the 2:1 equirectangular tile matrix used by the Moon, including the
 * integer-only level ladder: the mosaic starts at level 0 and has no negative
 * zoom, so the initial view is whole-planet level 0 and all six curated sites
 * remain visible until `MapFocus` flies to a selection. TES thermal inertia
 * (LOD 1) and dust cover (LOD 2) are deliberately capped so the base map is
 * upsampled rather than requesting tiles the products never published.
 */
export function MarsMap({
  selectedSiteId,
  activeLayerId,
  onSiteSelect,
  onLayerChange,
  onCompare,
}: MarsMapProps) {
  const activeLayer =
    MARS_LAYERS.find((layer) => layer.id === activeLayerId) ?? MARS_LAYERS[0]
  const selectedSite =
    marsSites.find((site) => site.id === selectedSiteId) ?? marsSites[0]

  return (
    <div
      role="region"
      aria-label="Mars base-site map with NASA Mars Trek imagery"
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
        {marsSites.map((site) => (
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
        layers={MARS_LAYERS}
        activeLayerId={activeLayer.id}
        bodyLabel="Mars"
        onLayerChange={onLayerChange}
      />
    </div>
  )
}
