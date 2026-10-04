"use client";

import React, { memo } from "react";
import { MapPin, Users, Activity, ChevronLeft } from "lucide-react";

interface CityMapProps {
  stateName: string;
  cities: { name: string; visitors: number; sessions: number; pageViews: number }[];
  onBack: () => void;
  onCityClick?: (city: string) => void;
}

const MapChart = ({ stateName, cities, onBack, onCityClick }: CityMapProps) => {
  if (!cities || cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MapPin size={48} className="text-gray-500 mb-4" />
        <p className="text-gray-400">No city data available for {stateName}</p>
      </div>
    );
  }

  const maxVisitors = Math.max(...cities.map(c => c.visitors), 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Back to India
        </button>
        <h3 className="text-lg font-semibold" style={{ color: "var(--admin-ink)" }}>
          {stateName} — Cities
        </h3>
        <div className="w-20" /> {/* spacer */}
      </div>

      {/* City List Visualization */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {cities.map((city, index) => {
          const intensity = 0.15 + (city.visitors / maxVisitors) * 0.85;
          return (
            <button
              key={city.name}
              onClick={() => onCityClick?.(city.name)}
              className="w-full text-left p-3 rounded-lg transition-all hover:shadow-lg"
              style={{
                background: `rgba(99, 102, 241, ${intensity})`,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-[11px] font-bold text-gray-400 w-6 text-right">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--admin-ink)" }}>{city.name}</p>
                    <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--admin-ink-muted)" }}>
                      <MapPin size={10} /> ~{city.visitors} visitors
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-400 text-sm">{city.visitors}</p>
                  <p className="text-[10px]" style={{ color: "var(--admin-ink-muted)" }}>{city.sessions} sessions</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-white/5">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(city.visitors / maxVisitors) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-2xl font-bold text-indigo-400">{cities.reduce((sum, c) => sum + c.visitors, 0)}</p>
          <p className="text-[11px] text-gray-400">Total Visitors</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-2xl font-bold text-purple-400">{cities.reduce((sum, c) => sum + c.sessions, 0)}</p>
          <p className="text-[11px] text-gray-400">Total Sessions</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-2xl font-bold text-emerald-400">{cities.reduce((sum, c) => sum + c.pageViews, 0)}</p>
          <p className="text-[11px] text-gray-400">Page Views</p>
        </div>
      </div>
    </div>
  );
};

export default memo(MapChart);