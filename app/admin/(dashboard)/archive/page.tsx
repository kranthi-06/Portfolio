"use client";

import { useState, useEffect, useCallback } from "react";
import { Archive, Trash2, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

type ArchivedItem = {
  id: string;
  title: string;
  type: string; // "certificate" | "project" etc.
  created_at: string;
};

export default function ArchivePage() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("certificates");
  
  // Modals
  const [restoreTarget, setRestoreTarget] = useState<ArchivedItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArchivedItem | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchArchived = useCallback(async () => {
    setLoading(true);
    try {
      // In a real robust system we would fetch all, but here we dynamically fetch the selected type
      const res = await fetch(`/api/admin/${selectedType}?status=archived`);
      if (res.ok) {
        const json = await res.json();
        const mapped = (json.data?.data || json.data || []).map((item: any) => ({
          id: item.id,
          title: item.title || item.name || "Untitled",
          type: selectedType,
          created_at: item.created_at,
        }));
        setItems(mapped);
      }
    } catch (err) { console.error(err);
      toast.error("Failed to fetch archived items");
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  async function handleRestore() {
    if (!restoreTarget) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/${restoreTarget.type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: restoreTarget.id, status: "draft" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Item restored successfully");
      fetchArchived();
      setRestoreTarget(null);
    } catch (err) { console.error(err);
      toast.error("Failed to restore item");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/${deleteTarget.type}?id=${deleteTarget.id}&permanent=true`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Item permanently deleted");
      fetchArchived();
      setDeleteTarget(null);
    } catch (err) { console.error(err);
      toast.error("Failed to delete item permanently");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <div className="admin-page-header mb-8">
        <div>
          <h1 className="admin-page-title">Archive</h1>
          <p className="admin-page-subtitle">Manage and restore archived content</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["certificates", "projects", "events", "achievements", "gallery"].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              selectedType === type 
                ? "bg-[var(--admin-accent)] text-white" 
                : "bg-[var(--admin-bg-subtle)] text-[var(--admin-ink-secondary)] hover:bg-[var(--admin-bg-hover)]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="admin-skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Archive size={48} />}
          title={`No archived ${selectedType}`}
          description={`You don't have any archived ${selectedType}. Items you archive will appear here.`}
        />
      ) : (
        <div className="bg-[var(--admin-bg-elevated)] border border-[var(--admin-line)] rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--admin-bg-subtle)] text-[var(--admin-ink-muted)] text-xs uppercase font-bold border-b border-[var(--admin-line)]">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Archived On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--admin-line)] last:border-0 hover:bg-[var(--admin-bg-subtle)]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--admin-ink)]">{item.title}</td>
                  <td className="px-6 py-4 text-[var(--admin-ink-secondary)] capitalize">{item.type}</td>
                  <td className="px-6 py-4 text-[var(--admin-ink-secondary)]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRestoreTarget(item)}
                        className="admin-btn admin-btn-ghost px-3 py-1.5 h-auto text-xs"
                      >
                        <RefreshCw size={14} className="mr-1" /> Restore
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="admin-btn admin-btn-ghost text-red-500 hover:bg-red-500/10 px-3 py-1.5 h-auto text-xs"
                      >
                        <Trash2 size={14} className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Restore */}
      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restore Item"
        message={`Are you sure you want to restore "${restoreTarget?.title}" to drafts?`}
        confirmLabel={processing ? "Restoring..." : "Restore"}
        variant="warning"
        loading={processing}
      />

      {/* Confirm Permanent Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Permanently Delete Item"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone and will delete all associated media files.`}
        confirmLabel={processing ? "Deleting..." : "Delete Permanently"}
        variant="danger"
        loading={processing}
      />
    </div>
  );
}
