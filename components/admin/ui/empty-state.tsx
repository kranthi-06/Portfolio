"use client";

import { Package } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon">
        {icon || <Package size={48} />}
      </div>
      <h3
        className="text-[15px] font-semibold mb-1"
        style={{ color: "var(--admin-ink)" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[13px] mb-4" style={{ color: "var(--admin-ink-muted)", maxWidth: 360, margin: "0 auto" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
