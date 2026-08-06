"use client";

import React, { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// TopoJSON for world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapProps {
  data: { name: string; value: number }[];
  onCountryClick?: (country: string) => void;
}

const MapChart = ({ data, onCountryClick }: MapProps) => {
  // Simple color scale based on max value
  const max = Math.max(...data.map(d => d.value), 1);
  
  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 120 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            // Find if this country is in our data
            const iso2 = getIso2FromName(geo.properties.name);
            const d = data.find(item => item.name === iso2 || item.name === geo.properties.name);
            
            const fill = d 
              ? `rgba(99, 102, 241, ${0.2 + (d.value / max) * 0.8})` // #6366f1 with opacity
              : "rgba(255,255,255,0.05)";

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={fill}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={0.5}
                onClick={() => {
                  if (onCountryClick) onCountryClick(iso2 || geo.properties.name);
                }}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#8b5cf6", outline: "none", cursor: "pointer" },
                  pressed: { fill: "#6366f1", outline: "none" },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
};

export default memo(MapChart);

// Helper to convert typical map names to ISO-2 (simplified for demo)
function getIso2FromName(name: string) {
  const map: Record<string, string> = {
    "India": "IN",
    "United States of America": "US",
    "United Kingdom": "GB",
    "Canada": "CA",
    "Australia": "AU",
    "Germany": "DE",
    "France": "FR",
    // Add more as needed
  };
  return map[name] || name;
}
