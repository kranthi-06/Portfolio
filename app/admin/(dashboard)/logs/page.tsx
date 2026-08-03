"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollText, Activity, Upload, Pencil, Trash2, Globe, Sparkles, Settings, LogIn, Filter } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/empty-state";

interface LogEntry {
  id: string; action: string; entity_type: string; entity_title: string; metadata: Record<string, unknown>; created_at: string;
}

const actionIcons: Record<string, typeof Activity> = {
  create: Upload, update: Pencil, delete: Trash2, publish: Globe, unpublish: Globe,
  archive: Filter, upload: Upload, ai_generate: Sparkles, settings_update: Settings, login: LogIn,
};

const actionColors: Record<string, string> = {
  create: "#10b981", update: "#3b82f6", delete: "#ef4444", publish: "#6366f1",
  unpublish: "#f59e0b", archive: "#64748b", upload: "#06b6d4", ai_generate: "#a855f7",
  settings_update: "#f97316", login: "#10b981",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/admin/logs");
        if (res.ok) { const { data } = await res.json(); setLogs(data || []); }
      } catch { /* silently handle */ }
      finally { setLoading(false); }
    }
    fetchLogs();
  }, []);

  const filtered = filter ? logs.filter(l => l.action === filter) : logs;
  const actions = [...new Set(logs.map(l => l.action))];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Activity Logs</h1>
        <p className="admin-page-subtitle">Complete audit trail of all admin actions</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button className={`admin-btn admin-btn-sm ${!filter ? "admin-btn-primary" : "admin-btn-secondary"}`} onClick={() => setFilter("")}>All</button>
        {actions.map(a => (
          <button key={a} className={`admin-btn admin-btn-sm ${filter === a ? "admin-btn-primary" : "admin-btn-secondary"}`} onClick={() => setFilter(a)}>{a}</button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="admin-skeleton h-10 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<ScrollText size={36} />} title="No activity logs" description="Actions like creating, updating, and deleting content will be logged here." />
        ) : (
          <div>
            {filtered.map((log, i) => {
              const Icon = actionIcons[log.action] || Activity;
              const color = actionColors[log.action] || "var(--admin-ink-muted)";
              return (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}14`, color }}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px]">
                      <span className="font-semibold capitalize" style={{ color }}>{log.action}</span>
                      <span style={{ color: "var(--admin-ink-secondary)" }}> {log.entity_type}</span>
                    </p>
                    {log.entity_title && <p className="text-[11px] truncate" style={{ color: "var(--admin-ink-muted)" }}>{log.entity_title}</p>}
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: "var(--admin-ink-muted)" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
