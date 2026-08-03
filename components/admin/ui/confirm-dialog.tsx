"use client";

import { AlertTriangle } from "lucide-react";
import { AdminModal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Delete", variant = "danger", loading = false,
}: ConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="440px"
      footer={
        <>
          <button onClick={onClose} className="admin-btn admin-btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`admin-btn ${variant === "danger" ? "admin-btn-danger" : "admin-btn-primary"}`}
            disabled={loading}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: variant === "danger" ? "var(--admin-danger-soft)" : "var(--admin-warning-soft)",
            color: variant === "danger" ? "var(--admin-danger)" : "var(--admin-warning)",
          }}
        >
          <AlertTriangle size={18} />
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--admin-ink-secondary)" }}>
          {message}
        </p>
      </div>
    </AdminModal>
  );
}
