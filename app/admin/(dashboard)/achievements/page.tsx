"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, Trash2, Globe, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { AIAssistantField } from "@/components/admin/ui/ai-assistant-field";
import { useAutoSave } from "@/hooks/use-auto-save";

interface Achievement {
  id: string; title: string; event: string; position: string; date: string;
  description: string; color: string; status: "draft" | "published" | "archived"; created_at: string;
}

const emptyAch = { title: "", event: "", position: "", date: "", description: "", color: "#FFD700", status: "draft" as "draft" | "published" | "archived" };

export default function AchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<typeof emptyAch & { id?: string }>(emptyAch);
  const [originalEditing, setOriginalEditing] = useState<typeof emptyAch & { id?: string }>(emptyAch);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const { clearDraft } = useAutoSave(
    `ach_draft_${editing.id || "new"}`,
    editing,
    showEditor
  );

  function openEdit(ach?: Achievement) {
    const data = ach ? { ...emptyAch, ...ach } : emptyAch;
    setEditing(data);
    setOriginalEditing(data);
    setShowEditor(true);
    
    setTimeout(() => {
      try {
        const draftKey = `ach_draft_${(data as any).id || "new"}`;
        const draftStr = localStorage.getItem(draftKey);
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (JSON.stringify(draft) !== JSON.stringify(data)) {
            if (confirm("You have an unsaved draft. Restore it?")) {
              setEditing(draft);
            } else {
              localStorage.removeItem(draftKey);
            }
          }
        }
      } catch (e) {}
    }, 50);
  }

  function handleCloseAttempt() {
    if (JSON.stringify(editing) !== JSON.stringify(originalEditing)) {
      setShowCloseConfirm(true);
    } else {
      setShowEditor(false);
      clearDraft();
    }
  }

  const fetchItems = useCallback(async () => {
    try { const res = await fetch("/api/admin/achievements"); if (res.ok) { const { data } = await res.json(); setItems(data || []); } }
    catch (err) { console.error(err); toast.error("Failed to load"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleSave() {
    if (!editing.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      const method = editing.id ? "PATCH" : "POST";
      await fetch("/api/admin/achievements", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      toast.success(editing.id ? "Updated" : "Created"); 
      clearDraft();
      setShowEditor(false); 
      setEditing(emptyAch); 
      fetchItems();
    } catch (err) { console.error(err); toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    try { await fetch("/api/admin/achievements", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); toast.success("Updated"); fetchItems(); }
    catch (err) { console.error(err); toast.error("Failed"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try { await fetch(`/api/admin/achievements?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); fetchItems(); }
    catch (err) { console.error(err); toast.error("Failed"); } finally { setDeleting(false); }
  }

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="admin-page-title">Achievements</h1><p className="admin-page-subtitle">{items.length} achievements</p></div>
        <button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Achievement</button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="admin-card p-4"><div className="admin-skeleton h-4 w-3/4 mb-3" /><div className="admin-skeleton h-3 w-full mb-2" /><div className="admin-skeleton h-3 w-1/2" /></div>)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Trophy size={48} />} title="No achievements yet" description="Add awards, medals, badges, and more."
          action={<button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Achievement</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="admin-card p-4" style={{ borderLeft: `3px solid ${item.color}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[14px] font-semibold" style={{ color: "var(--admin-ink)" }}>{item.title}</h3>
                    {item.event && <p className="text-[12px]" style={{ color: "var(--admin-ink-secondary)" }}>{item.event}</p>}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.position && <span className="admin-badge admin-badge-published mb-2" style={{ background: `${item.color}20`, color: item.color }}>{item.position}</span>}
                {item.description && <p className="text-[12px] mt-2 line-clamp-2" style={{ color: "var(--admin-ink-muted)" }}>{item.description}</p>}
                <div className="flex items-center gap-1 mt-3 pt-2" style={{ borderTop: "1px solid var(--admin-line)" }}>
                  <button onClick={() => openEdit(item)} className="admin-btn admin-btn-ghost admin-btn-sm"><Pencil size={12} /></button>
                  {item.status === "draft" ? <button onClick={() => updateStatus(item.id, "published")} className="admin-btn admin-btn-ghost admin-btn-sm"><Globe size={12} /> Publish</button>
                    : <button onClick={() => updateStatus(item.id, "draft")} className="admin-btn admin-btn-ghost admin-btn-sm">Unpublish</button>}
                  <div className="flex-1" />
                  <button onClick={() => setDeleteTarget(item)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Achievement" : "New Achievement"} maxWidth="520px"
        preventClose={showEditor} onCloseAttempt={handleCloseAttempt}
        footer={<><button onClick={handleCloseAttempt} className="admin-btn admin-btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}</button></>}>
        <div className="space-y-4">
          <div className="admin-field"><label className="admin-label">Title *</label><AIAssistantField value={editing.title} onChange={val => setEditing(p => ({ ...p, title: val }))}><input className="admin-input" value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="e.g. 1st Place Winner" /></AIAssistantField></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Event</label><AIAssistantField value={editing.event} onChange={val => setEditing(p => ({ ...p, event: val }))}><input className="admin-input" value={editing.event} onChange={e => setEditing(p => ({ ...p, event: e.target.value }))} /></AIAssistantField></div>
            <div className="admin-field"><label className="admin-label">Position</label><AIAssistantField value={editing.position} onChange={val => setEditing(p => ({ ...p, position: val }))}><input className="admin-input" value={editing.position} onChange={e => setEditing(p => ({ ...p, position: e.target.value }))} placeholder="e.g. 🥇 Winner" /></AIAssistantField></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Date</label><AIAssistantField value={editing.date} onChange={val => setEditing(p => ({ ...p, date: val }))}><input className="admin-input" value={editing.date} onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} placeholder="e.g. March 2025" /></AIAssistantField></div>
            <div className="admin-field"><label className="admin-label">Accent Color</label><input type="color" className="admin-input h-10 p-1 cursor-pointer" value={editing.color} onChange={e => setEditing(p => ({ ...p, color: e.target.value }))} /></div>
          </div>
          <div className="admin-field"><label className="admin-label">Description</label><AIAssistantField value={editing.description} onChange={val => setEditing(p => ({ ...p, description: val }))}><textarea className="admin-input admin-textarea" value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} /></AIAssistantField></div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Achievement" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      
      <ConfirmDialog 
        open={showCloseConfirm} 
        onClose={() => setShowCloseConfirm(false)} 
        onConfirm={() => {
          setShowCloseConfirm(false);
          setShowEditor(false);
          clearDraft();
        }} 
        title="Discard Unsaved Changes?" 
        message="You have unsaved changes. Are you sure you want to discard them?" 
        confirmLabel="Discard Changes"
        variant="danger"
      />
    </div>
  );
}
