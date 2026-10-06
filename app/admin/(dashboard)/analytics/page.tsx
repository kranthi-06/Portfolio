"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, TrendingUp, Globe, Clock, Monitor, Smartphone, Layout, 
  MapPin, Activity, Calendar, BarChart3, Cpu, Chrome, Smartphone as MobileIcon,
  ChevronLeft, RefreshCw, Download, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { TrafficAreaChart, AnalyticsPieChart, AnalyticsBarChart } from "@/components/admin/analytics/charts";
import VisitorMap from "@/components/admin/analytics/visitor-map";
import IndiaMap from "@/components/admin/analytics/india-map";
import CityMap from "@/components/admin/analytics/city-map";
import { LiveTimeline } from "@/components/admin/analytics/live-timeline";

type ViewLevel = "world" | "country" | "state" | "city";
type TimeRange = "today" | "yesterday" | "7" | "30" | "90" | "all";

interface CountryData { name: string; visitors: number; sessions: number; pageViews: number; }
interface StateData { name: string; visitors: number; sessions: number; pageViews: number; }
interface CityData { name: string; visitors: number; sessions: number; pageViews: number; }
interface DeviceData { name: string; brand?: string; visitors: number; sessions: number; pageViews: number; }
interface BrowserData { name: string; visitors: number; sessions: number; pageViews: number; }
interface OSData { name: string; visitors: number; sessions: number; pageViews: number; }
interface PageData { rank: number; path: string; uniqueVisitors: number; views: number; avgTimeOnPage: number; }
interface ReferrerData { source: string; visitors: number; sessions: number; }
interface TimelineEvent { id: string; event: string; data: any; time: string; location: string; path: string; device: any; }

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>("30");
  const [data, setData] = useState<any>(null);
  const [liveData, setLiveData] = useState<{ activeUsersCount: number; activeUsers: any[]; timeline: TimelineEvent[] }>({ activeUsersCount: 0, activeUsers: [], timeline: [] });
  
  // Drilldown state
  const [viewLevel, setViewLevel] = useState<ViewLevel>("world");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // Fetch overview data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/overview?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setCountryData(json.data.demographics?.countries || []);
      }
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Fetch live data periodically
  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/admin/analytics/active?window=5");
        if (res.ok) {
          const json = await res.json();
          setLiveData(json.data);
        }
      } catch (err) { console.error(err); }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 15000);
    return () => clearInterval(interval);
  }, []);

  // Drilldown handlers
  const handleCountryClick = useCallback(async (countryName: string) => {
    const country = countryData.find(c => c.name === countryName);
    if (!country) return;
    
    setSelectedCountry(countryName);
    setViewLevel("country");
    setDrilldownLoading(true);
    
    try {
      const res = await fetch(`/api/admin/analytics/country?code=${encodeURIComponent(countryName)}&range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setStateData(json.data.states || json.data.regions || []);
      }
    } catch (err) { console.error(err); }
    finally { setDrilldownLoading(false); }
  }, [countryData, range]);

  const handleStateClick = useCallback(async (stateName: string) => {
    if (!selectedCountry) return;
    
    setSelectedState(stateName);
    setViewLevel("state");
    setDrilldownLoading(true);
    
    try {
      const res = await fetch(`/api/admin/analytics/state?country=${encodeURIComponent(selectedCountry)}&state=${encodeURIComponent(stateName)}&range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setCityData(json.data.cities || []);
      }
    } catch (err) { console.error(err); }
    finally { setDrilldownLoading(false); }
  }, [selectedCountry, range]);

  const handleBack = useCallback(() => {
    if (viewLevel === "city") {
      setViewLevel("state");
      setSelectedState(null);
      setCityData([]);
    } else if (viewLevel === "state") {
      setViewLevel("country");
      setSelectedState(null);
    } else if (viewLevel === "country") {
      setViewLevel("world");
      setSelectedCountry(null);
      setStateData([]);
    }
  }, [viewLevel]);

  const handleReset = useCallback(() => {
    setViewLevel("world");
    setSelectedCountry(null);
    setSelectedState(null);
    setStateData([]);
    setCityData([]);
  }, []);

  // Format helpers
  const formatNumber = (n: number) => n.toLocaleString();
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Current view title
  const getViewTitle = () => {
    switch (viewLevel) {
      case "world": return "Global Distribution";
      case "country": return `${selectedCountry} — States`;
      case "state": return `${selectedState}, ${selectedCountry} — Cities`;
      case "city": return `${selectedState} — Details`;
      default: return "Global Distribution";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title flex items-center gap-2">
            Analytics Overview
            <span className="relative flex h-3 w-3 ml-2">
              {liveData.activeUsersCount > 0 ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
              )}
            </span>
          </h1>
          <p className="admin-page-subtitle">
            {liveData.activeUsersCount} users active now • {data?.overview?.totalVisitors || 0} total visitors
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-[#18181b] border border-white/10 rounded-lg p-1">
          {[
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" },
            { value: "7", label: "7 Days" },
            { value: "30", label: "30 Days" },
            { value: "90", label: "90 Days" },
            { value: "all", label: "All Time" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value as TimeRange)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === opt.value 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Unique Visitors", value: formatNumber(data?.overview?.totalVisitors ?? 0), icon: <Users size={16} />, color: "#6366f1", trend: data?.overview?.newVisitors ? `+${data.overview.newVisitors} new` : null },
          { label: "Sessions", value: formatNumber(data?.overview?.totalSessions ?? 0), icon: <Activity size={16} />, color: "#8b5cf6", trend: `${data?.overview?.avgSessionDuration ? formatDuration(data.overview.avgSessionDuration) : "—"} avg` },
          { label: "Page Views", value: formatNumber(data?.overview?.totalPageViews ?? 0), icon: <Layout size={16} />, color: "#ec4899", trend: `${data?.overview?.bounceRate ?? 0}% bounce` },
          { label: "Active Now", value: liveData.activeUsersCount, icon: <Monitor size={16} />, color: "#10b981", trend: "Last 5 min" },
          { label: "Today", value: formatNumber(data?.overview?.visitorsToday ?? 0), icon: <Calendar size={16} />, color: "#f59e0b", trend: "New today" },
          { label: "This Week", value: formatNumber(data?.overview?.visitorsThisWeek ?? 0), icon: <BarChart3 size={16} />, color: "#06b6d4", trend: "Last 7 days" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${stat.color}14`, color: stat.color }}>{stat.icon}</div>
            <div className="admin-stat-value">{loading ? "—" : stat.value}</div>
            <div className="admin-stat-label">{stat.label}</div>
            {stat.trend && <div className="text-[10px] text-green-400 mt-1">{stat.trend}</div>}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card flex flex-col">
          <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Activity size={14} /> Traffic Overview</h3></div>
          <div className="admin-card-body p-4 flex-1">
            {loading ? (
              <div className="w-full h-[300px] animate-pulse bg-white/5 rounded-lg"></div>
            ) : (
              <TrafficAreaChart data={data?.timeSeries || []} />
            )}
          </div>
        </div>
        
        <div className="admin-card flex flex-col">
          <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Smartphone size={14} /> Devices</h3></div>
          <div className="admin-card-body p-4 flex-1">
            {loading ? (
              <div className="w-full h-[250px] animate-pulse bg-white/5 rounded-full mx-auto" style={{ width: 200 }}></div>
            ) : (
              <AnalyticsPieChart data={data?.demographics?.devices || []} />
            )}
          </div>
        </div>
      </div>

      {/* Map & Drilldown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card flex flex-col">
          <div className="admin-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="admin-card-title flex items-center gap-2"><Globe size={14} /> {getViewTitle()}</h3>
            {(viewLevel !== "world") && (
              <div className="flex items-center gap-2">
                <button onClick={handleBack} className="admin-btn admin-btn-ghost admin-btn-sm flex items-center gap-1">
                  <ChevronLeft size={12} /> Back
                </button>
                <button onClick={handleReset} className="admin-btn admin-btn-ghost admin-btn-sm">
                  <RefreshCw size={12} /> Reset
                </button>
              </div>
            )}
          </div>
          <div className="admin-card-body p-0 relative bg-[#0a0a0c] overflow-hidden aspect-video min-h-[380px] max-h-[600px] lg:aspect-[16/9] lg:min-h-[420px] lg:max-h-[520px]">
            {drilldownLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]">
                <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {viewLevel === "world" && (
                <motion.div
                  key="world"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="absolute inset-0"
                >
                  {!loading && (
                    <VisitorMap 
                      data={countryData.map(c => ({ name: c.name, value: c.visitors }))} 
                      onCountryClick={handleCountryClick}
                    />
                  )}
                  {!loading && countryData.length > 0 && (
                    <div className="absolute bottom-4 left-4 bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-lg p-3 w-56 max-h-64 overflow-y-auto">
                      <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Top Countries</h4>
                      <div className="space-y-1">
                        {countryData.slice(0, 10).map((c: any) => (
                          <div key={c.name} className="flex items-center justify-between text-xs px-1 py-1 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleCountryClick(c.name)}>
                            <span className="text-gray-300 truncate pr-2">{c.name}</span>
                            <span className="font-semibold text-indigo-400 whitespace-nowrap">{formatNumber(c.visitors)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {viewLevel === "country" && selectedCountry && (
                <motion.div
                  key="country"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0"
                >
                  <IndiaMap 
                    data={stateData.map(s => ({ name: s.name, value: s.visitors }))} 
                    onStateClick={handleStateClick}
                    selectedState={selectedState || undefined}
                    onBack={handleBack}
                  />
                  {!drilldownLoading && stateData.length > 0 && (
                    <div className="absolute bottom-4 left-4 bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-lg p-3 w-64 max-h-64 overflow-y-auto">
                      <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">States in {selectedCountry}</h4>
                      <div className="space-y-1">
                        {stateData.slice(0, 15).map((s: any) => (
                          <div key={s.name} className="flex items-center justify-between text-xs px-1 py-1 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleStateClick(s.name)}>
                            <span className="text-gray-300 truncate pr-2">{s.name}</span>
                            <span className="font-semibold text-purple-400 whitespace-nowrap">{formatNumber(s.visitors)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {viewLevel === "state" && selectedState && selectedCountry && (
                <motion.div
                  key="state"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute inset-0"
                >
                  <CityMap 
                    stateName={selectedState}
                    cities={cityData}
                    onBack={handleBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Side Panel - Top Pages & Device Details */}
        <div className="space-y-6">
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Layout size={14} /> Top Pages</h3></div>
            <div className="admin-card-body p-0">
              {loading ? (
                <div className="p-4 space-y-3">{[1,2,3,4].map(i => <div key={i} className="admin-skeleton h-6 rounded" />)}</div>
              ) : !data?.topPages?.length ? (
                <p className="p-4 text-[13px] text-gray-500">No visitor data yet</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {data.topPages.slice(0, 10).map((p: PageData, i: number) => (
                    <div key={p.path} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-[11px] font-bold w-5 text-gray-500">{p.rank}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-medium flex-1 text-gray-200 truncate block">{p.path}</span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span>{formatNumber(p.uniqueVisitors)} unique</span>
                          <span>·</span>
                          <span>{formatNumber(p.views)} views</span>
                          {p.avgTimeOnPage > 0 && <span>· {formatDuration(p.avgTimeOnPage)} avg</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Cpu size={14} /> Device Types</h3></div>
            <div className="admin-card-body p-4">
              {data?.demographics?.devices && (
                <AnalyticsBarChart 
                  data={data.demographics.devices.map((d: any) => ({ name: d.name, value: d.visitors, sessions: d.sessions }))} 
                  color="#6366f1"
                />
              )}
            </div>
          </div>

          {/* Brand Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><MobileIcon size={14} /> Device Brands</h3></div>
            <div className="admin-card-body p-4">
              {data?.demographics?.deviceBrands && data.demographics.deviceBrands.length > 0 ? (
                <AnalyticsBarChart 
                  data={data.demographics.deviceBrands.slice(0, 8).map((d: any) => ({ name: d.name, value: d.visitors, sessions: d.sessions }))} 
                  color="#8b5cf6"
                />
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No brand data available</p>
              )}
            </div>
          </div>

          {/* OS Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Monitor size={14} /> Operating Systems</h3></div>
            <div className="admin-card-body p-4">
              {data?.demographics?.os && (
                <AnalyticsPieChart data={data.demographics.os.slice(0, 6).map((o: any) => ({ name: o.name, value: o.visitors }))} />
              )}
            </div>
          </div>

          {/* Browser Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Chrome size={14} /> Browsers</h3></div>
            <div className="admin-card-body p-4">
              {data?.demographics?.browsers && (
                <AnalyticsPieChart data={data.demographics.browsers.slice(0, 6).map((b: any) => ({ name: b.name, value: b.visitors }))} />
              )}
            </div>
          </div>

          {/* Referrer Sources */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><ArrowUpRight size={14} /> Traffic Sources</h3></div>
            <div className="admin-card-body p-4">
              {data?.demographics?.referrers && data.demographics.referrers.length > 0 ? (
                <AnalyticsBarChart 
                  data={data.demographics.referrers.map((r: any) => ({ name: r.name, value: r.visitors, sessions: r.sessions }))} 
                  color="#10b981"
                />
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No referrer data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Timeline Row */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" /> Live Event Timeline
          </h3>
        </div>
        <div className="admin-card-body p-6">
          <LiveTimeline events={liveData.timeline} />
        </div>
      </div>
      
    </div>
  );
}