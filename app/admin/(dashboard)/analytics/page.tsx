"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, TrendingUp, Globe, Clock, Monitor, Smartphone, Layout, 
  MapPin, Activity, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { TrafficAreaChart, AnalyticsPieChart } from "@/components/admin/analytics/charts";
import VisitorMap from "@/components/admin/analytics/visitor-map";
import { LiveTimeline } from "@/components/admin/analytics/live-timeline";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [data, setData] = useState<any>(null);
  
  const [liveData, setLiveData] = useState<any>({ activeUsersCount: 0, activeUsers: [], timeline: [] });

  // Fetch overview data
  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [range]);

  // Fetch live data periodically
  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/admin/analytics/live");
        if (res.ok) {
          const json = await res.json();
          setLiveData(json.data);
        }
      } catch (err) { console.error(err);}
    }
    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
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
            {liveData.activeUsersCount} users active right now
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#18181b] border border-white/10 rounded-lg p-1">
          {["7", "30", "90"].map(days => (
            <button
              key={days}
              onClick={() => setRange(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === days 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors", value: data?.overview?.totalVisitors ?? 0, icon: <Users size={16} />, color: "#6366f1" },
          { label: "Total Page Views", value: data?.overview?.totalPageViews ?? 0, icon: <Layout size={16} />, color: "#8b5cf6" },
          { label: "Bounce Rate", value: `${data?.overview?.bounceRate ?? 0}%`, icon: <TrendingUp size={16} />, color: "#ec4899" },
          { label: "Avg. Session", value: `${Math.floor((data?.overview?.avgSessionDuration ?? 0)/60)}m ${(data?.overview?.avgSessionDuration ?? 0)%60}s`, icon: <Clock size={16} />, color: "#10b981" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${stat.color}14`, color: stat.color }}>{stat.icon}</div>
            <div className="admin-stat-value">{loading ? "—" : stat.value}</div>
            <div className="admin-stat-label">{stat.label}</div>
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

      {/* Map and Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card flex flex-col">
          <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Globe size={14} /> Global Distribution</h3></div>
          <div className="admin-card-body p-0 flex-1 relative bg-[#0a0a0c] overflow-hidden min-h-[400px]">
            {loading ? (
               <div className="absolute inset-0 flex items-center justify-center"><div className="w-32 h-32 rounded-full border-t-2 border-indigo-500 animate-spin"></div></div>
            ) : (
              <VisitorMap data={data?.demographics?.countries || []} />
            )}
            
            {/* Top Countries Overlay */}
            {!loading && data?.demographics?.countries && data.demographics.countries.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-lg p-3 w-48">
                <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Top Countries</h4>
                <div className="space-y-2">
                  {data.demographics.countries.slice(0,5).map((c: any) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{c.name}</span>
                      <span className="font-semibold text-indigo-400">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
                  {data.topPages.map((p: any, i: number) => (
                    <div key={p.path} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-[11px] font-bold w-4 text-gray-500">{i + 1}</span>
                      <span className="text-[12px] font-medium flex-1 text-gray-200 truncate">{p.path}</span>
                      <span className="text-[12px] font-semibold text-indigo-400">{p.views}</span>
                    </div>
                  ))}
                </div>
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
