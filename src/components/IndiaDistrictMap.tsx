'use client';

import React, { useState, useRef, useMemo } from 'react';
import { INDIAN_STATES, findNearestDistrict, type DistrictCoord } from '@/lib/geo-india';
import { I18N } from '@/lib/i18n';
import { type Language } from '@/context/AppContext';
import { getLang } from '@/lib/languages';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Navigation } from 'lucide-react';

interface IndiaDistrictMapProps {
  selectedState: string;
  selectedDistrict: string;
  onSelectDistrict: (state: string, district: string, distanceKm?: number) => void;
  userCoords?: { lat: number; lon: number } | null;
  language: Language;
  className?: string;
}

// Coordinate bounding box for India projection
const MIN_LON = 68.0;
const MAX_LON = 96.5;
const MIN_LAT = 8.0;
const MAX_LAT = 36.5;

const SVG_WIDTH = 440;
const SVG_HEIGHT = 480;

function projectCoords(lat: number, lon: number, width = SVG_WIDTH, height = SVG_HEIGHT) {
  const clampedLon = Math.max(MIN_LON, Math.min(MAX_LON, lon));
  const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));

  const x = ((clampedLon - MIN_LON) / (MAX_LON - MIN_LON)) * (width - 70) + 35;
  const y = ((MAX_LAT - clampedLat) / (MAX_LAT - MIN_LAT)) * (height - 60) + 30;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function invertCoords(x: number, y: number, width = SVG_WIDTH, height = SVG_HEIGHT) {
  const clampedX = Math.max(35, Math.min(width - 35, x));
  const clampedY = Math.max(30, Math.min(height - 30, y));

  const lon = MIN_LON + ((clampedX - 35) / (width - 70)) * (MAX_LON - MIN_LON);
  const lat = MAX_LAT - ((clampedY - 30) / (height - 60)) * (MAX_LAT - MIN_LAT);
  return { lat, lon };
}

export default function IndiaDistrictMap({
  selectedState,
  selectedDistrict,
  onSelectDistrict,
  userCoords,
  language,
  className = '',
}: IndiaDistrictMapProps) {
  const t = I18N[language] || I18N.hi;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredDistrict, setHoveredDistrict] = useState<{
    name: string;
    state: string;
    label: string;
  } | null>(null);

  // Flatten all districts with projection
  const allProjectedDistricts = useMemo(() => {
    const nameKey = getLang(language).districtNameKey;
    const list: Array<{
      state: string;
      district: DistrictCoord;
      x: number;
      y: number;
      label: string;
      isSelected: boolean;
    }> = [];

    for (const state of INDIAN_STATES) {
      for (const dist of state.districts) {
        const { x, y } = projectCoords(dist.lat, dist.lon);
        // Use the language-specific district name from config; fall back to English
        const label = (dist as unknown as Record<string, string>)[nameKey] ?? dist.name;

        const isSelected =
          state.name.toLowerCase() === selectedState.toLowerCase() &&
          dist.name.toLowerCase() === selectedDistrict.toLowerCase();

        list.push({
          state: state.name,
          district: dist,
          x,
          y,
          label,
          isSelected,
        });
      }
    }
    return list;
  }, [selectedState, selectedDistrict, language]);

  // Selected district coords
  const selectedProj = useMemo(() => {
    return allProjectedDistricts.find((d) => d.isSelected) || allProjectedDistricts[0];
  }, [allProjectedDistricts]);

  // Projected User GPS beacon coords
  const userProj = useMemo(() => {
    if (!userCoords) return null;
    return projectCoords(userCoords.lat, userCoords.lon);
  }, [userCoords]);

  // Handle click on map surface to select closest district
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;

    const { lat, lon } = invertCoords(clickX, clickY);
    const nearest = findNearestDistrict(lat, lon);

    onSelectDistrict(nearest.state.name, nearest.district.name, nearest.distanceKm);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.9));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      className={`relative w-full rounded-2xl border-2 border-emerald-200 dark:border-[#1e3327] bg-emerald-50/40 dark:bg-[#0c1611] p-3 overflow-hidden shadow-xs select-none transition-colors ${className}`}
    >
      {/* Top Map Header & Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-300">
          <MapPin className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
          <span>{t.advisory.mapHint}</span>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#131f18] rounded-lg border border-emerald-200 dark:border-[#1e3327] p-0.5 shadow-xs">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-[#22c55e] rounded"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-[#22c55e] rounded"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-[#22c55e] rounded"
            title={t.advisory.resetMap}
            aria-label={t.advisory.resetMap}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-4/4.4 overflow-hidden rounded-xl bg-white/70 dark:bg-[#0b140f] border border-emerald-100 dark:border-[#1a2c21] flex items-center justify-center">
        <svg
          id="india-district-map-svg"
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full cursor-crosshair transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={handleMapClick}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                className="text-emerald-500/10 dark:text-emerald-400/5"
                strokeWidth="0.75"
              />
            </pattern>
            {/* Pulsing Beacon Gradient */}
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#grid-pattern)" />

          {/* Calibrated India Landmass Silhouette Contour */}
          <g className="transition-opacity duration-300">
            {/* Mainland Outline Path */}
            <path
              d="
                M 125 35
                C 145 25, 175 22, 195 45
                C 215 68, 205 92, 215 105
                C 225 118, 260 135, 290 142
                C 310 146, 350 148, 385 155
                C 410 162, 420 185, 395 200
                C 370 215, 335 205, 310 210
                C 295 225, 305 245, 300 270
                C 290 295, 275 325, 255 355
                C 235 385, 215 420, 190 455
                C 180 468, 170 460, 160 435
                C 145 405, 140 370, 130 330
                C 120 290, 95 260, 70 245
                C 55 235, 50 215, 75 205
                C 95 195, 110 180, 115 150
                C 120 120, 110 70, 125 35
                Z
              "
              className="fill-emerald-100/50 dark:fill-[#122319] stroke-emerald-400/60 dark:stroke-emerald-700/60 transition-colors"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Regional Zone Guides */}
            <text x="145" y="85" className="fill-stone-400 dark:fill-stone-600 text-[10px] font-bold">
              उत्तर (North)
            </text>
            <text x="80" y="215" className="fill-stone-400 dark:fill-stone-600 text-[10px] font-bold">
              पश्चिम (West)
            </text>
            <text x="175" y="235" className="fill-stone-400 dark:fill-stone-600 text-[10px] font-bold">
              मध्य (Central)
            </text>
            <text x="290" y="240" className="fill-stone-400 dark:fill-stone-600 text-[10px] font-bold">
              पूर्व (East)
            </text>
            <text x="150" y="380" className="fill-stone-400 dark:fill-stone-600 text-[10px] font-bold">
              दक्षिण (South)
            </text>
            <text x="345" y="180" className="fill-stone-400 dark:fill-stone-600 text-[9px] font-bold">
              पूर्वोत्तर (NE)
            </text>
          </g>

          {/* District Pins / Markers */}
          {allProjectedDistricts.map((item) => {
            const isTarget = item.isSelected;
            return (
              <g
                key={`${item.state}-${item.district.name}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDistrict(item.state, item.district.name, 0);
                }}
                onMouseEnter={() =>
                  setHoveredDistrict({
                    name: item.district.name,
                    state: item.state,
                    label: item.label,
                  })
                }
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* District halo */}
                <circle
                  cx={item.x}
                  cy={item.y}
                  r={isTarget ? '9' : '4.5'}
                  className={
                    isTarget
                      ? 'fill-emerald-500/30 stroke-emerald-600 dark:stroke-emerald-400 motion-safe:animate-pulse'
                      : 'fill-emerald-600 dark:fill-emerald-500 hover:fill-emerald-800 dark:hover:fill-emerald-300'
                  }
                  strokeWidth={isTarget ? '2' : '1'}
                />

                {/* District Core Point */}
                <circle
                  cx={item.x}
                  cy={item.y}
                  r={isTarget ? '4' : '2'}
                  className={
                    isTarget
                      ? 'fill-[#14532d] dark:fill-[#22c55e]'
                      : 'fill-white dark:fill-stone-900'
                  }
                />
              </g>
            );
          })}

          {/* Live User GPS Location Beacon (if available) */}
          {userProj && (
            <g>
              {/* Concentric Radar Wave 1 */}
              <circle
                cx={userProj.x}
                cy={userProj.y}
                r="18"
                className="fill-sky-400/20 stroke-sky-500 motion-safe:animate-ping"
                strokeWidth="1.5"
              />
              {/* Concentric Radar Wave 2 */}
              <circle
                cx={userProj.x}
                cy={userProj.y}
                r="10"
                className="fill-sky-500/40"
              />
              {/* GPS Point Core */}
              <circle
                cx={userProj.x}
                cy={userProj.y}
                r="4.5"
                className="fill-sky-600 dark:fill-sky-400 stroke-white dark:stroke-stone-900"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Target Selected Pin with Animated Dropper */}
          {selectedProj && (
            <g
              transform={`translate(${selectedProj.x}, ${selectedProj.y})`}
              className="pointer-events-none transition-all duration-300"
            >
              {/* Radar pulse under pin */}
              <circle
                cx="0"
                cy="0"
                r="14"
                className="fill-emerald-400/30 dark:fill-emerald-400/20 motion-safe:animate-ping"
              />

              {/* Pin Icon Shape */}
              <path
                d="M 0 0 C -4 -5, -8 -12, -8 -18 C -8 -24, -4 -28, 0 -28 C 4 -28, 8 -24, 8 -18 C 8 -12, 4 -5, 0 0 Z"
                className="fill-[#14532d] dark:fill-[#22c55e] stroke-white dark:stroke-stone-950"
                strokeWidth="1.5"
                filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))"
              />
              <circle cx="0" cy="-18" r="3" className="fill-white dark:fill-stone-950" />

              {/* District Label Callout */}
              <g transform="translate(0, -34)">
                <rect
                  x={-((selectedProj.label.length * 7 + 16) / 2)}
                  y="-14"
                  width={selectedProj.label.length * 7 + 16}
                  height="18"
                  rx="4"
                  className="fill-[#111827] dark:fill-[#1e3327] stroke-emerald-400"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-1"
                  textAnchor="middle"
                  className="fill-white dark:text-emerald-100 text-[11px] font-bold"
                >
                  {selectedProj.label}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Hover / Active District Floating Chip */}
        {hoveredDistrict && (
          <div className="absolute top-2 left-2 bg-stone-900/90 dark:bg-stone-950/90 text-white text-xs px-2.5 py-1 rounded-md shadow-md border border-stone-700 pointer-events-none flex items-center gap-1.5">
            <span className="font-bold">{hoveredDistrict.label}</span>
            <span className="text-stone-400 text-[10px]">({hoveredDistrict.state})</span>
          </div>
        )}

        {/* Live GPS Badge indicator in corner */}
        {userCoords && (
          <div className="absolute bottom-2 right-2 bg-sky-100/90 dark:bg-sky-950/90 text-sky-900 dark:text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-300 dark:border-sky-800 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>GPS Active</span>
          </div>
        )}
      </div>

      {/* Footer Info: Current Pin Location */}
      <div className="mt-2.5 flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-[#f9fafb]">
          <span className="text-emerald-800 dark:text-emerald-400">
            {t.advisory.locationDetected}
          </span>
          <span>
            {selectedProj.label}, {selectedProj.state}
          </span>
        </div>

        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
          Lat: {selectedProj.district.lat.toFixed(2)}°N | Lon: {selectedProj.district.lon.toFixed(2)}°E
        </span>
      </div>
    </div>
  );
}
