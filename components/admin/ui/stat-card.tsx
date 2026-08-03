"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

export function StatCard({ label, value, icon, color, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="admin-stat-card"
      style={{ "--card-accent": color } as React.CSSProperties}
    >
      <div
        className="admin-stat-icon"
        style={{ background: `${color}14`, color }}
      >
        {icon}
      </div>
      <div className="admin-stat-value">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="admin-stat-label">{label}</span>
        {trend && (
          <span
            className="text-[11px] font-semibold"
            style={{
              color: trend.positive ? "var(--admin-success)" : "var(--admin-danger)",
            }}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}
