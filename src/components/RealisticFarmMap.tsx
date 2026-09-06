'use client';

import React, { useEffect, useRef, useState } from 'react';
import { reverseGeocodeCoords, type PreciseGeocodeResult } from '@/lib/geo-india';
import { I18N } from '@/lib/i18n';
import { type Language } from '@/context/AppContext';
import {
  MapPin,
  Navigation,
  Layers,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface RealisticFarmMapProps {
  initialLat?: number;
  initialLon?: number;
  selectedState: string;
  selectedDistrict: string;
  onLocationSelect: (result: PreciseGeocodeResult) => void;
  language: Language;
  className?: string;
}

// Tile layers configurations
const TILE_LAYERS = {
  googleHybrid: {
    name: 'Google Satellite',
    name_hi: 'उपग्रह दृश्य (Satellite)',
    name_bn: 'স্যাটেলাইট দৃশ্য (Satellite)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  googleRoad: {
    name: 'Google Roadmap',
    name_hi: 'गूगल मैप्स (Roadmap)',
    name_bn: 'গুগল ম্যাপস (Roadmap)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  osm: {
    name: 'OpenStreetMap',
    name_hi: 'ओपन स्ट्रीट मैप',
    name_bn: 'ওপেন স্ট্রিট ম্যাপ',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

export default function RealisticFarmMap({
  initialLat = 20.5937,
  initialLon = 78.9629,
  selectedState,
  selectedDistrict,
  onLocationSelect,
  language,
  className = '',
}: RealisticFarmMapProps) {
  const t = I18N[language] || I18N.hi;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number }>({
    lat: initialLat,
    lon: initialLon,
  });
  const [activeLayer, setActiveLayer] = useState<'googleHybrid' | 'googleRoad'>('googleHybrid');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geocodeInfo, setGeocodeInfo] = useState<PreciseGeocodeResult | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Default center: initialCoords or Central India
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lon],
        zoom: currentCoords.lat === 20.5937 ? 5 : 12,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add Base Tile Layer (Google Hybrid Satellite default)
      const selectedTileConfig = TILE_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(selectedTileConfig.url, {
        maxZoom: selectedTileConfig.maxZoom,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Custom Agricultural Pin Icon with Radar Glow
      const customPinIcon = L.divIcon({
        className: 'custom-leaflet-farm-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(34, 197, 94, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <svg width="34" height="42" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
              <path d="M12 0C5.37 0 0 5.37 0 12C0 20 12 30 12 30S24 20 24 12C24 5.37 18.63 0 12 0Z" fill="#14532d"/>
              <circle cx="12" cy="11" r="5" fill="#22c55e"/>
              <circle cx="12" cy="11" r="2.5" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Add Draggable Marker
      const marker = L.marker([currentCoords.lat, currentCoords.lon], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Handle map click: move marker and reverse geocode
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCurrentCoords({ lat, lon: lng });
        await handleCoordsSelected(lat, lng);
      });

      // Handle marker dragend
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        setCurrentCoords({ lat: position.lat, lon: position.lng });
        await handleCoordsSelected(position.lat, position.lng);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when user toggles Satellite / Road
  const handleLayerChange = async (layerKey: 'googleHybrid' | 'googleRoad') => {
    setActiveLayer(layerKey);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const L = (await import('leaflet')).default;
    const config = TILE_LAYERS[layerKey];

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: ['a', 'b', 'c'],
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

  // Reverse Geocoding handler
  const handleCoordsSelected = async (lat: number, lon: number) => {
    setIsReverseGeocoding(true);
    try {
      const result = await reverseGeocodeCoords(lat, lon);
      setGeocodeInfo(result);
      onLocationSelect(result);
    } catch (err) {
      console.warn('Geocoding failed:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Auto GPS Location Handler
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      alert(t.advisory.geoDenied);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lon: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, {
            duration: 1.2,
          });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        await handleCoordsSelected(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Location error:', err);
        setIsLocating(false);
        alert(t.advisory.geoDenied);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([20.5937, 78.9629], 5);
      markerRef.current.setLatLng([20.5937, 78.9629]);
      setCurrentCoords({ lat: 20.5937, lon: 78.9629 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl border-2 border-emerald-300 dark:border-[#1e3327] bg-white dark:bg-[#0c1611] p-2.5 overflow-hidden shadow-sm transition-colors ${className}`}
    >
      {/* Top Map Action Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Layer Switcher: Satellite vs Street */}
        <div className="flex items-center bg-stone-100 dark:bg-[#131f18] p-1 rounded-xl border border-stone-200 dark:border-stone-800">
          <button
            type="button"
            id="map-layer-satellite-btn"
            onClick={() => handleLayerChange('googleHybrid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px] ${
              activeLayer === 'googleHybrid'
                ? 'bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'স্যাটেলাইট' : language === 'hi' ? 'उपग्रह (Satellite)' : 'Satellite'}</span>
          </button>
          <button
            type="button"
            id="map-layer-road-btn"
            onClick={() => handleLayerChange('googleRoad')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[36px] ${
              activeLayer === 'googleRoad'
                ? 'bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <span>{language === 'bn' ? 'গুগল ম্যাপ' : language === 'hi' ? 'गूगल मैप्स' : 'Google Maps'}</span>
          </button>
        </div>

        {/* GPS Locate Button & Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="map-locate-btn"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 min-h-[36px] shadow-xs"
            title="Locate my farm"
          >
            <Navigation
              className={`w-3.5 h-3.5 ${isLocating ? 'motion-safe:animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">GPS</span>
          </button>

          <div className="flex items-center bg-stone-100 dark:bg-[#131f18] rounded-lg border border-stone-200 dark:border-stone-800 p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-700"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Realistic Map Canvas Container */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-xl overflow-hidden border border-stone-200 dark:border-[#1e3327] shadow-inner">
        <div
          ref={mapContainerRef}
          id="realistic-leaflet-map"
          className="w-full h-full z-0 cursor-crosshair"
          style={{ minHeight: '260px' }}
        />

        {/* Loading Overlay when Reverse Geocoding */}
        {isReverseGeocoding && (
          <div className="absolute top-2 left-2 z-10 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 motion-safe:animate-spin" />
            <span>{t.advisory.detectingLocation}</span>
          </div>
        )}

        {/* Drag Hint Pin Banner */}
        <div className="absolute bottom-2 left-2 z-10 bg-black/75 text-white text-[11px] px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5 font-medium shadow">
          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>{t.advisory.mapHint}</span>
        </div>

        {/* External Google Maps Link */}
        <a
          href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-10 bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 text-[11px] font-bold px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-white flex items-center gap-1 shadow transition-colors"
          title="Open in Google Maps"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Detected Location Status Bar */}
      <div className="mt-2.5 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-[#f9fafb]">
          <span className="text-emerald-700 dark:text-emerald-400">
            {t.advisory.locationDetected}
          </span>
          <span>
            {geocodeInfo?.block ? `${geocodeInfo.block}, ` : ''}
            {geocodeInfo?.district || selectedDistrict},{' '}
            {geocodeInfo?.state || selectedState}
          </span>
        </div>

        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
          Lat: {currentCoords.lat.toFixed(4)}° | Lon: {currentCoords.lon.toFixed(4)}°
        </span>
      </div>
    </div>
  );
}
