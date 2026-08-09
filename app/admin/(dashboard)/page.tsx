"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban, Award, CalendarDays, Trophy, ImageIcon,
  Briefcase, BarChart3, Github, HardDrive, MessageSquare,
  Upload, Activity, Clock, ArrowUpRight, Sparkles,
  BookOpen, Presentation, GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/admin/ui/stat-card";
import { StatCardSkeleton } from "@/components/admin/loading-skeleton";
import { formatFileSize } from "@/lib/admin/constants";

interface DashboardData {
  stats: {
    projects: number;
    certificates: number;
    internships: number;
    workshops: number;
    courses: number;
    events: number;
    achievements: number;
    gallery: number;
    skills: number;
    experience: number;
    visitors: number;
    unreadMessages: number;
    totalMessages: number;
    storageUsed: number;
    githubCommits: number;
    githubRepos: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_title: string;
    created_at: string;
  }>;
}

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  publish: "Published",
  unpublish: "Unpublished",
  archive: "Archived",
  upload: "Uploaded",
  ai_generate: "AI Generated",
  settings_update: "Settings updated",
};

const quickActions = [
  { label: "Upload Certificate", href: "/admin/certificates", icon: Award, color: "#6366f1" },
  { label: "Add Project", href: "/admin/projects", icon: FolderKanban, color: "#06b6d4" },
  { label: "Add Event", href: "/admin/events", icon: CalendarDays, color: "#f59e0b" },
  { label: "AI Assistant", href: "/admin/ai", icon: Sparkles, color: "#ec4899" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const { data } = await res.json();
          setData(data);
        }
      } catch (err) { console.error(err);
        // Silently handle — dashboard will show zeros
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: "Total Projects", value: stats?.projects ?? 0, icon: <FolderKanban size={18} />, color: "#6366f1" },
    { label: "Total Certificates", value: stats?.certificates ?? 0, icon: <Award size={18} />, color: "#8b5cf6" },
    { label: "Internships", value: stats?.internships ?? 0, icon: <Briefcase size={18} />, color: "#06b6d4" },
    { label: "Workshops", value: stats?.workshops ?? 0, icon: <Presentation size={18} />, color: "#f59e0b" },
    { label: "Courses", value: stats?.courses ?? 0, icon: <GraduationCap size={18} />, color: "#10b981" },
    { label: "Total Events", value: stats?.events ?? 0, icon: <CalendarDays size={18} />, color: "#ec4899" },
    { label: "Achievements", value: stats?.achievements ?? 0, icon: <Trophy size={18} />, color: "#f97316" },
    { label: "Gallery Images", value: stats?.gallery ?? 0, icon: <ImageIcon size={18} />, color: "#14b8a6" },
    { label: "Visitors", value: stats?.visitors ?? 0, icon: <BarChart3 size={18} />, color: "#3b82f6" },
    { label: "GitHub Commits", value: stats?.githubCommits ?? 0, icon: <Github size={18} />, color: "#a855f7" },
    { label: "Repositories", value: stats?.githubRepos ?? 0, icon: <BookOpen size={18} />, color: "#64748b" },
    { label: "Messages", value: stats?.unreadMessages ?? 0, icon: <MessageSquare size={18} />, color: "#ef4444", suffix: " new" },
    { label: "Storage Used", value: formatFileSize(stats?.storageUsed ?? 0), icon: <HardDrive size={18} />, color: "#0ea5e9" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1"
            style={{ color: "var(--admin-ink-muted)" }}
          >
            Portfolio CMS
          </p>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Overview of your portfolio content and analytics.</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="admin-card flex items-center gap-3 p-4 hover:shadow-md transition-all duration-200 group"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${action.color}14`, color: action.color }}
            >
              <action.icon size={16} />
            </div>
            <span className="text-[12px] font-semibold" style={{ color: "var(--admin-ink)" }}>
              {action.label}
            </span>
            <ArrowUpRight
              size={12}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--admin-ink-muted)" }}
            />
          </Link>
        ))}
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
        {loading
          ? Array.from({ length: 13 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, i) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                delay={i * 0.04}
              />
            ))
        }
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="admin-card"
      >
        <div className="admin-card-header">
          <h3 className="admin-card-title flex items-center gap-2">
            <Activity size={14} />
            Recent Activity
          </h3>
          <Link
            href="/admin/logs"
            className="admin-btn admin-btn-ghost admin-btn-sm"
          >
            View all
          </Link>
        </div>
        <div className="admin-card-body p-0">
          {!data?.recentActivity?.length ? (
            <div className="p-8 text-center">
              <Clock size={20} style={{ color: "var(--admin-ink-muted)", margin: "0 auto 8px" }} />
              <p className="text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>
                No activity yet. Start by uploading content!
              </p>
            </div>
          ) : (
            <div>
              {data.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-5 py-3 transition-colors"
                  style={{ borderBottom: "1px solid var(--admin-line)" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--admin-accent-soft)", color: "var(--admin-accent)" }}
                  >
                    <Upload size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--admin-ink)" }}>
                      {actionLabels[log.action] || log.action}{" "}
                      <span style={{ color: "var(--admin-ink-secondary)" }}>{log.entity_type}</span>
                    </p>
                    {log.entity_title && (
                      <p className="text-[11px] truncate" style={{ color: "var(--admin-ink-muted)" }}>
                        {log.entity_title}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: "var(--admin-ink-muted)" }}>
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
