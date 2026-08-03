"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Globe, Monitor, Clock, Users } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  topPages: { page: string; count: number }[];
  topDevices: { device: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  recentVisitors: { page: string; country: string; created_at: string }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const { data } = await res.json();
          setData(data);
        }
      } catch { /* silently handle */ }
      finally { setLoading(false); }
    }
    fetchAnalytics();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Analytics</h1>
        <p className="admin-page-subtitle">Track visitor activity on your portfolio</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Visitors", value: data?.totalVisitors ?? 0, icon: <Users size={16} />, color: "#6366f1" },
          { label: "Today", value: data?.todayVisitors ?? 0, icon: <TrendingUp size={16} />, color: "#10b981" },
          { label: "Top Pages", value: data?.topPages?.length ?? 0, icon: <Globe size={16} />, color: "#f59e0b" },
          { label: "Devices", value: data?.topDevices?.length ?? 0, icon: <Monitor size={16} />, color: "#ec4899" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${stat.color}14`, color: stat.color }}>{stat.icon}</div>
            <div className="admin-stat-value">{loading ? "—" : stat.value}</div>
            <div className="admin-stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <div className="admin-card">
          <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Globe size={14} /> Top Pages</h3></div>
          <div className="admin-card-body p-0">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="admin-skeleton h-6 rounded" />)}</div>
            ) : !data?.topPages?.length ? (
              <p className="p-4 text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>No visitor data yet</p>
            ) : (
              data.topPages.slice(0, 10).map((p, i) => (
                <div key={p.page} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                  <span className="text-[11px] font-bold w-5" style={{ color: "var(--admin-ink-muted)" }}>{i + 1}</span>
                  <span className="text-[13px] font-medium flex-1" style={{ color: "var(--admin-ink)" }}>{p.page}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--admin-accent)" }}>{p.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices & Browsers */}
        <div className="space-y-6">
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Monitor size={14} /> Devices</h3></div>
            <div className="admin-card-body p-0">
              {loading ? <div className="p-4"><div className="admin-skeleton h-6 rounded" /></div> : !data?.topDevices?.length ? (
                <p className="p-4 text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>No data</p>
              ) : data.topDevices.map(d => (
                <div key={d.device} className="flex items-center gap-3 px-5 py-2.5" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                  <span className="text-[13px] flex-1" style={{ color: "var(--admin-ink)" }}>{d.device || "Unknown"}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--admin-accent)" }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><BarChart3 size={14} /> Browsers</h3></div>
            <div className="admin-card-body p-0">
              {loading ? <div className="p-4"><div className="admin-skeleton h-6 rounded" /></div> : !data?.topBrowsers?.length ? (
                <p className="p-4 text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>No data</p>
              ) : data.topBrowsers.map(b => (
                <div key={b.browser} className="flex items-center gap-3 px-5 py-2.5" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                  <span className="text-[13px] flex-1" style={{ color: "var(--admin-ink)" }}>{b.browser || "Unknown"}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--admin-accent)" }}>{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="admin-card mt-6">
        <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Clock size={14} /> Recent Visitors</h3></div>
        <div className="admin-card-body p-0">
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="admin-skeleton h-6 rounded" />)}</div>
          ) : !data?.recentVisitors?.length ? (
            <p className="p-4 text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>No recent visitors</p>
          ) : (
            data.recentVisitors.slice(0, 20).map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                <span className="text-[13px] flex-1" style={{ color: "var(--admin-ink)" }}>{v.page}</span>
                <span className="text-[12px]" style={{ color: "var(--admin-ink-muted)" }}>{v.country || "—"}</span>
                <span className="text-[11px]" style={{ color: "var(--admin-ink-muted)" }}>{new Date(v.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
