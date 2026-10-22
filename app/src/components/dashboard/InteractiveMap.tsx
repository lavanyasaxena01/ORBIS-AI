import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RegionData } from '../../types/climate';
import { Layers, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { ClimateRiskBadge } from '../common/ClimateRiskBadge';

interface InteractiveMapProps {
  region: RegionData;
  onSelectRegion?: (region: RegionData) => void;
  className?: string;
  initialLayers?: {
    satellite?: boolean;
    change?: boolean;
    flood?: boolean;
    vegetation?: boolean;
    water?: boolean;
    risk?: boolean;
  };
}

const LAYER_LABELS: { key: keyof Required<NonNullable<InteractiveMapProps['initialLayers']>>; label: string; swatch?: string }[] = [
  { key: 'satellite', label: 'Satellite basemap' },
  { key: 'change', label: 'Detected change', swatch: '#D97706' },
  { key: 'flood', label: 'Flood extent', swatch: '#2563EB' },
  { key: 'vegetation', label: 'Vegetation stress', swatch: '#B3261E' },
  { key: 'water', label: 'Surface water anomaly', swatch: '#3B82F6' },
  { key: 'risk', label: 'Risk zone', swatch: '#1E5641' },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  region,
  className = '',
  initialLayers = {
    satellite: true,
    change: true,
    flood: true,
    vegetation: false,
    water: false,
    risk: true,
  },
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    satellite: initialLayers.satellite ?? true,
    change: initialLayers.change ?? true,
    flood: initialLayers.flood ?? true,
    vegetation: initialLayers.vegetation ?? false,
    water: initialLayers.water ?? false,
    risk: initialLayers.risk ?? true,
  });

  const [layersOpen, setLayersOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(region.zoom);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: region.center,
      zoom: region.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Basemaps: Esri World Imagery (satellite) & Carto Positron (light)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Esri, Maxar, Earthstar Geographics',
      }
    );

    const lightLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: 'CartoDB, OpenStreetMap contributors',
      }
    );

    if (activeLayers.satellite) {
      satelliteLayer.addTo(map);
    } else {
      lightLayer.addTo(map);
    }

    const overlayGroup = L.layerGroup().addTo(map);
    overlayGroupRef.current = overlayGroup;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center, bounds & layers when region or activeLayers changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView(region.center, region.zoom);

    if (overlayGroupRef.current) {
      overlayGroupRef.current.clearLayers();
    }

    // 1. Region boundary
    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
    }

    const aoiPolygon = L.polygon(region.coordinatesPolygon, {
      color: '#1E5641',
      weight: 2,
      opacity: 0.85,
      fillColor: '#1E5641',
      fillOpacity: 0.06,
      dashArray: '5, 5',
    }).addTo(map);

    polygonLayerRef.current = aoiPolygon;

    aoiPolygon.bindPopup(`
      <div style="font-family: Inter, system-ui, sans-serif; color: #1B2520; padding: 4px; font-size: 13px; min-width: 210px;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${region.name}</div>
        <div style="color: #5D6E64; font-size: 12px; margin-bottom: 8px;">${region.country}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 12px;">
          <div><span style="color: #5D6E64;">Area:</span> <strong>${region.metrics.totalAreaKm2.toLocaleString()} km²</strong></div>
          <div><span style="color: #5D6E64;">Risk:</span> <strong>${region.metrics.riskScore}/100</strong></div>
          <div><span style="color: #5D6E64;">Flood:</span> <strong>${region.metrics.floodAreaKm2.toLocaleString()} km²</strong></div>
          <div><span style="color: #5D6E64;">Vegetation:</span> <strong>${region.metrics.ndviChangePercent}%</strong></div>
        </div>
      </div>
    `);

    // 2. Anomaly overlays
    const [cLat, cLng] = region.center;

    if (activeLayers.flood && region.metrics.floodAreaKm2 > 50) {
      const floodCluster = L.circle([cLat + 0.08, cLng + 0.05], {
        radius: 14000,
        color: '#2563EB',
        weight: 1.5,
        fillColor: '#3B82F6',
        fillOpacity: 0.32,
      });
      floodCluster.bindTooltip(`Flood extent: ${region.metrics.floodAreaKm2.toLocaleString()} km²`, {
        className: 'aeris-map-tooltip',
      });
      overlayGroupRef.current?.addLayer(floodCluster);
    }

    if (activeLayers.change) {
      const changeCluster = L.circle([cLat - 0.06, cLng - 0.04], {
        radius: 11000,
        color: '#B45309',
        weight: 1.5,
        fillColor: '#D97706',
        fillOpacity: 0.28,
      });
      changeCluster.bindTooltip(`Detected change: ${region.metrics.changedAreaKm2.toLocaleString()} km²`, {
        className: 'aeris-map-tooltip',
      });
      overlayGroupRef.current?.addLayer(changeCluster);
    }

    if (activeLayers.vegetation) {
      const vegCluster = L.circle([cLat + 0.12, cLng - 0.08], {
        radius: 9500,
        color: '#B3261E',
        weight: 1.5,
        fillColor: '#C2410C',
        fillOpacity: 0.3,
      });
      vegCluster.bindTooltip(`Vegetation stress: ${region.metrics.ndviChangePercent}% NDVI`, {
        className: 'aeris-map-tooltip',
      });
      overlayGroupRef.current?.addLayer(vegCluster);
    }

    if (activeLayers.water) {
      const waterCluster = L.circle([cLat - 0.11, cLng + 0.09], {
        radius: 8000,
        color: '#3B82F6',
        weight: 1.5,
        fillColor: '#60A5FA',
        fillOpacity: 0.32,
      });
      waterCluster.bindTooltip(`Water anomaly: ${region.metrics.ndwiChangePercent}% NDWI`, {
        className: 'aeris-map-tooltip',
      });
      overlayGroupRef.current?.addLayer(waterCluster);
    }

    if (activeLayers.risk) {
      const riskRing = L.circle(region.center, {
        radius: 18000,
        color: region.metrics.riskScore >= 75 ? '#B3261E' : '#B45309',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: region.metrics.riskScore >= 75 ? '#B3261E' : '#D97706',
        fillOpacity: 0.08,
      });
      riskRing.bindTooltip(`Assessed risk zone — ${region.metrics.riskScore}/100`, {
        className: 'aeris-map-tooltip',
      });
      overlayGroupRef.current?.addLayer(riskRing);
    }
  }, [region, activeLayers]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => mapInstanceRef.current?.setView(region.center, region.zoom);
  const handleFullscreen = () => {
    const el = mapContainerRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <div
      className={`relative w-full h-[540px] rounded-2xl overflow-hidden border border-[#E3E9E3] bg-[#E9EDE7] shadow-[0_1px_3px_rgba(27,37,32,0.06)] ${className}`}
    >
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top-left: region chip */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-white/95 border border-[#E3E9E3] rounded-lg px-3 py-1.5 pointer-events-auto flex items-center gap-2 shadow-sm">
          <span className="text-[13px] font-semibold text-[#1B2520]">
            {region.name}
          </span>
          <span className="text-[12px] text-[#5D6E64] border-l border-[#EDF1EC] pl-2">
            {region.country}
          </span>
        </div>
        <ClimateRiskBadge level={region.metrics.riskLevel} score={region.metrics.riskScore} size="sm" />
      </div>

      {/* Top-right: compact layers control */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1 bg-white/95 border border-[#E3E9E3] rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            aria-expanded={layersOpen}
            aria-label="Toggle map layers"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
              layersOpen ? 'bg-[#E9F2EC] text-[#15402F]' : 'text-[#5D6E64] hover:text-[#1B2520]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Layers</span>
          </button>
        </div>

        {layersOpen && (
          <div className="bg-white/95 border border-[#E3E9E3] rounded-xl p-3 shadow-lg w-52">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5D6E64]">
                Map layers
              </span>
              <button
                onClick={() => setLayersOpen(false)}
                aria-label="Close layers"
                className="p-0.5 text-[#93A398] hover:text-[#1B2520] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {LAYER_LABELS.map((layer) => (
                <label
                  key={layer.key}
                  className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1B2520] hover:bg-[#F4F7F3] rounded-md px-1.5 py-1 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeLayers[layer.key]}
                    onChange={() => toggleLayer(layer.key)}
                    className="accent-[#1E5641] cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    {layer.swatch && (
                      <span
                        className="w-2.5 h-2.5 rounded-sm inline-block"
                        style={{ backgroundColor: layer.swatch }}
                        aria-hidden="true"
                      />
                    )}
                    {layer.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom-left: compact legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 border border-[#E3E9E3] rounded-lg px-3 py-1.5 shadow-sm flex items-center gap-3 text-[11px] text-[#5D6E64]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#1E5641] bg-[#1E5641]/10 inline-block" aria-hidden="true" />
          Region boundary
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]/60 inline-block" aria-hidden="true" />
          Flood
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]/60 inline-block" aria-hidden="true" />
          Change
        </span>
        <span className="text-[#B9C6BC]">·</span>
        <span className="tabular-nums">Zoom {currentZoom}</span>
      </div>

      {/* Bottom-right: zoom & fullscreen controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/95 border border-[#E3E9E3] rounded-lg p-1 shadow-sm">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
          className="p-1.5 text-[#5D6E64] hover:text-[#15402F] hover:bg-[#F0F4EF] rounded-md transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
          className="p-1.5 text-[#5D6E64] hover:text-[#15402F] hover:bg-[#F0F4EF] rounded-md transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Return to region"
          aria-label="Return to region"
          className="p-1.5 text-[#5D6E64] hover:text-[#15402F] hover:bg-[#F0F4EF] rounded-md transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          aria-label="Fullscreen"
          className="p-1.5 text-[#5D6E64] hover:text-[#15402F] hover:bg-[#F0F4EF] rounded-md transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" />
            <path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
