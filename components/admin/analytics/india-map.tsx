"use client";

import React, { memo, useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator, geoPath } from "d3-geo";
import indiaStates from "@/public/geojson/india-telangana.json";
import { AlertCircle, ChevronLeft } from "lucide-react";

interface IndiaMapProps {
  data: { name: string; value: number }[];
  onStateClick?: (state: string) => void;
  selectedState?: string | null;
  onBack?: () => void;
}

// Calculate proper projection config that fits the GeoJSON to the container
function calculateProjectionConfig(
  geojson: any,
  width: number,
  height: number,
  padding = 20
): { scale: number; center: [number, number] } {
  // Create a path generator with default projection to get bounds
  const projection = geoMercator().scale(1).translate([0, 0]);
  const path = geoPath().projection(projection);
  
  // Get bounds of the GeoJSON in projection units
  const bounds = path.bounds(geojson);
  if (!bounds) return { scale: 1000, center: [82.85, 21.75] };
  
  const [[x0, y0], [x1, y1]] = bounds;
  const geoWidth = x1 - x0;
  const geoHeight = y1 - y0;
  
  // Calculate scale to fit with padding
  const scale = Math.min(
    (width - padding * 2) / geoWidth,
    (height - padding * 2) / geoHeight
  ) * 0.95; // Slight margin
  
  // Calculate center to center the map
  const centerX = (x0 + x1) / 2;
  const centerY = (y0 + y1) / 2;
  
  // Create new projection with calculated scale and get the geographic center
  const centeredProjection = geoMercator()
    .scale(scale)
    .translate([width / 2, height / 2])
    .center([0, 0]); // Will be set via invert
  
  // Convert pixel center back to geographic coordinates
  // Use the geographic center directly since we know India's bounds
  // The projection center for Mercator should be the geographic center of the bounds
  const centerLon = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
  
  return {
    scale,
    center: [centerLon, centerLat] as [number, number],
  };
}

const MapChart = ({ data, onStateClick, selectedState, onBack }: IndiaMapProps) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectionConfig, setProjectionConfig] = useState<{ scale: number; center: [number, number] } | null>(null);
  const [geoJsonLoaded, setGeoJsonLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const max = Math.max(...data.map(d => d.value), 1);

  // Provide a sensible default projection immediately (will be refined on resize)
  const [defaultProjectionConfig] = useState(() => {
    // India bounds: ~68-98 lon, 6-38 lat, center ~83, 22
    // For a typical 16:9 container (~800x450), scale ~1000 works
    return { scale: 1000, center: [82.85, 21.75] as [number, number] };
  });

  // Normalize state names for matching (must be before early returns for hook rules)
  const normalizeName = (name: string) => name.toLowerCase().trim();
  
  // Map GeoJSON state names to analytics state names
  const geoToAnalyticsMap: Record<string, string> = {
    "Andaman and Nicobar": "Andaman and Nicobar Islands",
    "Orissa": "Odisha",
    "Uttaranchal": "Uttarakhand",
    "Telangana": "Telangana", // may not exist in older dataset
  };
  
  const analyticsToGeoMap: Record<string, string> = {
    "Andaman and Nicobar Islands": "Andaman and Nicobar",
    "Odisha": "Orissa",
    "Uttarakhand": "Uttaranchal",
    "TS": "Telangana",
  };

  const getGeoName = (analyticsName: string) => analyticsToGeoMap[analyticsName] || analyticsName;
  const getAnalyticsName = (geoName: string) => geoToAnalyticsMap[geoName] || geoName;

  const dataByNorm = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    data.forEach(item => {
      map.set(normalizeName(item.name), item);
    });
    return map;
  }, [data]);

  const getDataForState = (geoStateName: string) => {
    const analyticsName = getAnalyticsName(geoStateName);
    return dataByNorm.get(normalizeName(analyticsName));
  };

  // Synchronous initial dimension measurement
  useLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  // Handle resize to recalculate projection
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Validate the imported GeoJSON once on mount
  useEffect(() => {
    if (!indiaStates || !indiaStates.features || indiaStates.features.length === 0) {
      setLoadError("India geographic data is missing or empty");
      if (process.env.NODE_ENV === 'development') {
        console.error('[IndiaMap] GeoJSON validation failed:', indiaStates);
      }
      return;
    }
    
    setGeoJsonLoaded(true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[IndiaMap] GeoJSON loaded:', {
        featureCount: indiaStates.features.length,
        sampleFeature: indiaStates.features[0]?.properties,
        dataKeys: data.slice(0, 3).map(d => d.name),
      });
    }
  }, [data]);

  // Calculate projection when dimensions are available
  useEffect(() => {
    if (geoJsonLoaded && dimensions.width > 0 && dimensions.height > 0) {
      const config = calculateProjectionConfig(indiaStates, dimensions.width, dimensions.height);
      setProjectionConfig(config);
      if (process.env.NODE_ENV === 'development') {
        console.log('[IndiaMap] Calculated projection:', config);
      }
    }
  }, [dimensions.width, dimensions.height, geoJsonLoaded]);

  // Use default projection until calculated one is ready
  const effectiveProjectionConfig = projectionConfig || defaultProjectionConfig;

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <p className="text-gray-400 mb-2">India map unavailable</p>
        <p className="text-xs text-gray-500 mb-4">{loadError}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ChevronLeft size={16} /> Back to World
          </button>
        )}
      </div>
    );
  }

  if (!geoJsonLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading India map...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      style={{ background: "transparent" }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-2 left-2 z-10 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-md px-2 py-1"
        >
          <ChevronLeft size={12} /> Back to World
        </button>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={effectiveProjectionConfig}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Geographies geography={indiaStates as any}>
          {({ geographies }) =>
            geographies.map((geo: any) => {
              const geoStateName = geo.properties?.NAME_1 || geo.properties?.name;
              
              const d = getDataForState(geoStateName || '');
              const analyticsName = getAnalyticsName(geoStateName || '');
              const isSelected = selectedState && (
                normalizeName(selectedState) === normalizeName(analyticsName) || 
                normalizeName(selectedState) === normalizeName(geoStateName || '')
              );

              const fill = d
                ? `rgba(99, 102, 241, ${0.35 + (d.value / max) * 0.65})`
                : "rgba(255,255,255,0.05)";

              const stroke = isSelected ? "#fbbf24" : "rgba(255,255,255,0.15)";
              const strokeWidth = isSelected ? 2 : 0.75;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onClick={() => {
                    if (onStateClick && geoStateName) onStateClick(getAnalyticsName(geoStateName));
                  }}
                  style={{
                    default: { outline: "none", cursor: "pointer" },
                    hover: { fill: isSelected ? "#fbbf24" : "#a5b4fc", outline: "none", cursor: "pointer" },
                    pressed: { fill: "#6366f1", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(MapChart);