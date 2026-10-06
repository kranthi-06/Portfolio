"use client";

import React, { memo, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import indiaStates from "@/public/geojson/india-states.json";
import { AlertCircle, ChevronLeft } from "lucide-react";

interface IndiaMapProps {
  data: { name: string; value: number }[];
  onStateClick?: (state: string) => void;
  selectedState?: string | null;
  onBack?: () => void;
}

const MapChart = ({ data, onStateClick, selectedState, onBack }: IndiaMapProps) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectionConfig, setProjectionConfig] = useState<{ scale: number; center: [number, number] } | null>(null);
  const [geoJsonLoaded, setGeoJsonLoaded] = useState(false);
  
  const max = Math.max(...data.map(d => d.value), 1);

  // Validate the imported GeoJSON once on mount
  useEffect(() => {
    if (!indiaStates || !indiaStates.features || indiaStates.features.length === 0) {
      setLoadError("India geographic data is missing or empty");
      if (process.env.NODE_ENV === 'development') {
        console.error('[IndiaMap] GeoJSON validation failed:', indiaStates);
      }
    } else {
      setGeoJsonLoaded(true);
      // Calculate proper projection for India using the GeoJSON bounds
      // India bounds approximately: [68.1, 6.5] to [97.4, 37.6]
      // Center: [78.96, 22.0], Scale: ~1000 for mercator
      setProjectionConfig({
        scale: 1000,
        center: [78.96, 22.0],
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[IndiaMap] GeoJSON loaded:', {
          featureCount: indiaStates.features.length,
          sampleFeature: indiaStates.features[0]?.properties,
          dataKeys: data.slice(0, 3).map(d => d.name),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!projectionConfig || !geoJsonLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading India map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
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
        projectionConfig={projectionConfig}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Geographies geography={indiaStates as any}>
          {({ geographies }) =>
            geographies.map((geo: any) => {
              const stateName = geo.properties?.name;
              const stateCode = geo.properties?.code;
              
              // Match against both name and code, case-insensitive
              const d = data.find(item => 
                item.name.toLowerCase() === stateName?.toLowerCase() || 
                item.name.toLowerCase() === stateCode?.toLowerCase()
              );
              const isSelected = selectedState?.toLowerCase() === stateName?.toLowerCase() || 
                                 selectedState?.toLowerCase() === stateCode?.toLowerCase();

              const fill = d
                ? `rgba(99, 102, 241, ${0.2 + (d.value / max) * 0.7})`
                : "rgba(255,255,255,0.03)";

              const stroke = isSelected ? "#fbbf24" : "rgba(255,255,255,0.1)";
              const strokeWidth = isSelected ? 2 : 0.5;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onClick={() => {
                    if (onStateClick && stateName) onStateClick(stateName);
                  }}
                  style={{
                    default: { outline: "none", cursor: "pointer" },
                    hover: { fill: isSelected ? "#fbbf24" : "#8b5cf6", outline: "none", cursor: "pointer" },
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