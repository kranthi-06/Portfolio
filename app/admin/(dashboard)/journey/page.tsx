"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Map, Plus, Trash2, Globe, Pencil, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { AIAssistantField } from "@/components/admin/ui/ai-assistant-field";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { Experience } from "@/lib/portfolio/types";

const JOURNEY_CATEGORIES = ["INTERNSHIP", "WORK", "PROJECT", "EDUCATION", "HACKATHON", "WORKSHOP", "ACHIEVEMENT", "CERTIFICATION", "LEARNING", "MILESTONE", "OTHER"];

const emptyJourney: Omit<Experience, 'id'> = {
  title: "",
  organization: "",
  type: "MILESTONE",
  start_date: "",
  end_date: "",
  location: "",
  description: "",
  technologies: [],
  link_url: "",
  image_url: "",
  featured: false,
  sort_order: 0,
  period: "",
  subtitle: "",
  achievements: []
};

export default function JourneyPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Omit<Experience, 'id'> & { id?: string }>(emptyJourney);
  const [originalEditing, setOriginalEditing] = useState<Omit<Experience, 'id'> & { id?: string }>(emptyJourney);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const { clearDraft } = useAutoSave(
    `journey_draft_${editing.id || "new"}`,
    editing,
    showEditor
  );

  function openEdit(journey?: Experience) {
    const data = journey ? { ...emptyJourney, ...journey } : emptyJourney;
    // ensure null values become empty strings for controlled inputs
    data.organization = data.organization || "";
    data.link_url = data.link_url || "";
    data.location = data.location || "";
    data.start_date = data.start_date || "";
    data.end_date = data.end_date || "";
    data.description = data.description || "";
    data.image_url = data.image_url || "";
    data.period = data.period || "";
    data.subtitle = data.subtitle || "";
    data.achievements = data.achievements || [];
    data.technologies = data.technologies || [];

    setEditing(data);
    setOriginalEditing(data);
    setShowEditor(true);
    
    setTimeout(() => {
      try {
        const draftKey = `journey_draft_${(data as any).id || "new"}`;
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
    try { const res = await fetch("/api/admin/journey"); if (res.ok) { const { data } = await res.json(); setItems(data || []); } }
    catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleSave() {
    if (!editing.title.trim()) { toast.error("Title required"); return; }
    if (!editing.type) { toast.error("Category / Type required"); return; }
    setSaving(true);
    try {
      const method = editing.id ? "PATCH" : "POST";
      const payload = {
        ...editing,
        organization: editing.organization || null,
        link_url: editing.link_url || null,
        location: editing.location || null,
        start_date: editing.start_date || null,
        end_date: editing.end_date || null,
        description: editing.description || null,
        image_url: editing.image_url || null,
        period: editing.period || null,
        subtitle: editing.subtitle || null,
      };

      const res = await fetch("/api/admin/journey", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(editing.id ? "Updated" : "Created"); 
      clearDraft();
      setShowEditor(false); 
      setEditing(emptyJourney); 
      fetchItems();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try { await fetch(`/api/admin/journey?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); fetchItems(); }
    catch { toast.error("Failed"); } finally { setDeleting(false); }
  }

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="admin-page-title">Journey / Timeline</h1><p className="admin-page-subtitle">{items.length} milestones</p></div>
        <button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Timeline Entry</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="admin-card p-4"><div className="admin-skeleton h-5 w-48 mb-2" /><div className="admin-skeleton h-3 w-32 mb-2" /><div className="admin-skeleton h-3 w-full" /></div>)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Map size={48} />} title="No timeline entries yet" description="Add your experience, projects, and milestones."
          action={<button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Entry</button>} />
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="admin-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold" style={{ color: "var(--admin-ink)" }}>{item.title}</h3>
                    {item.featured && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">FEATURED</span>}
                  </div>
                  {item.organization && <p className="text-[13px] font-medium" style={{ color: "var(--admin-accent)" }}>{item.organization}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[12px]" style={{ color: "var(--admin-ink-muted)" }}>
                    <span className="px-2 py-0.5 rounded-sm" style={{ background: "var(--admin-bg-elevated)" }}>{item.type}</span>
                    <span>•</span>
                    <span>{item.start_date || item.period} {item.end_date ? `— ${item.end_date}` : ""}</span>
                  </div>
                  {item.description && <p className="text-[13px] mt-2 line-clamp-2" style={{ color: "var(--admin-ink-secondary)" }}>{item.description}</p>}
                  {item.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.technologies.slice(0, 6).map(t => <span key={t} className="admin-tag" style={{ fontSize: 10, padding: "1px 5px" }}>{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(item)} className="admin-btn admin-btn-ghost admin-btn-sm"><Pencil size={12} /></button>
                  <button onClick={() => setDeleteTarget(item)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Entry" : "New Timeline Entry"} maxWidth="620px"
        preventClose={showEditor} onCloseAttempt={handleCloseAttempt}
        footer={<><button onClick={handleCloseAttempt} className="admin-btn admin-btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}</button></>}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Title *</label><input className="admin-input" value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="admin-field"><label className="admin-label">Organization</label><input className="admin-input" value={editing.organization || ""} onChange={e => setEditing(p => ({ ...p, organization: e.target.value }))} /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Category / Type *</label><select className="admin-input admin-select" value={editing.type} onChange={e => setEditing(p => ({ ...p, type: e.target.value }))}>{JOURNEY_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="admin-field"><label className="admin-label">Location</label><input className="admin-input" value={editing.location || ""} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))} /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Start Date</label><input className="admin-input" value={editing.start_date || ""} onChange={e => setEditing(p => ({ ...p, start_date: e.target.value }))} placeholder="e.g. Oct 2025" /></div>
            <div className="admin-field"><label className="admin-label">End Date</label><input className="admin-input" value={editing.end_date || ""} onChange={e => setEditing(p => ({ ...p, end_date: e.target.value }))} placeholder="e.g. Dec 2025 or Present" /></div>
          </div>

          <div className="admin-field"><label className="admin-label">Description</label><AIAssistantField value={editing.description || ""} onChange={val => setEditing(p => ({ ...p, description: val }))}><textarea className="admin-input admin-textarea min-h-[100px]" value={editing.description || ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} /></AIAssistantField></div>
          
          <div className="admin-field">
            <label className="admin-label">Technologies</label>
            <div className="flex gap-2 mb-2"><input className="admin-input" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (techInput.trim()) { setEditing(p => ({ ...p, technologies: [...p.technologies, techInput.trim()] })); setTechInput(""); } } }} placeholder="Add tech…" /><button type="button" onClick={() => { if (techInput.trim()) { setEditing(p => ({ ...p, technologies: [...p.technologies, techInput.trim()] })); setTechInput(""); } }} className="admin-btn admin-btn-secondary">Add</button></div>
            <div className="flex flex-wrap gap-1">{editing.technologies.map((t, i) => <span key={i} className="admin-tag">{t}<button onClick={() => setEditing(p => ({ ...p, technologies: p.technologies.filter((_, idx) => idx !== i) }))} className="admin-tag-remove"><X size={12} /></button></span>)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="admin-field"><label className="admin-label">Optional Image URL</label><input className="admin-input" value={editing.image_url || ""} onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))} /></div>
             <div className="admin-field"><label className="admin-label">Optional Link URL</label><input className="admin-input" value={editing.link_url || ""} onChange={e => setEditing(p => ({ ...p, link_url: e.target.value }))} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="admin-field"><label className="admin-label">Sort Order</label><input type="number" className="admin-input" value={editing.sort_order} onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
             <div className="admin-field flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.featured} onChange={e => setEditing(p => ({ ...p, featured: e.target.checked }))} className="rounded border-[var(--admin-line)] bg-transparent text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]" />
                  <span className="text-sm font-medium text-[var(--admin-ink)]">Featured Entry</span>
                </label>
             </div>
          </div>

        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Timeline Entry" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      
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
