"use client";

import React, { memo, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

interface IndiaMapProps {
  data: { name: string; value: number }[];
  onStateClick?: (state: string) => void;
  selectedState?: string | null;
}

const geoUrl = "/geojson/india-states.json";

const MapChart = ({ data, onStateClick, selectedState }: IndiaMapProps) => {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        scale: 800,
        center: [78.9629, 20.5937],
      }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const stateName = geo.properties.name;
            const stateCode = geo.properties.code;
            const d = data.find(item => item.name === stateName || item.name === stateCode);
            const isSelected = selectedState === stateName || selectedState === stateCode;

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
                  if (onStateClick) onStateClick(stateName);
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
  );
};

export default memo(MapChart);