"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Briefcase, Plus, Trash2, Globe, Pencil, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { EXPERIENCE_TYPES } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { AIAssistantField } from "@/components/admin/ui/ai-assistant-field";
import { useAutoSave } from "@/hooks/use-auto-save";

interface Experience {
  id: string; title: string; company: string; company_url: string; location: string;
  type: string; start_date: string; end_date: string | null; description: string;
  achievements: string[]; technologies: string[];
  status: "draft" | "published" | "archived"; created_at: string;
}

const emptyExp = {
  title: "", company: "", company_url: "", location: "", type: "Internship",
  start_date: "", end_date: "" as string | null, description: "", achievements: [] as string[],
  technologies: [] as string[], status: "draft" as "draft" | "published" | "archived",
};

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<typeof emptyExp & { id?: string }>(emptyExp);
  const [originalEditing, setOriginalEditing] = useState<typeof emptyExp & { id?: string }>(emptyExp);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [achInput, setAchInput] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const { clearDraft } = useAutoSave(
    `exp_draft_${editing.id || "new"}`,
    editing,
    showEditor
  );

  function openEdit(exp?: Experience) {
    const data = exp ? { ...emptyExp, ...exp } : emptyExp;
    setEditing(data);
    setOriginalEditing(data);
    setShowEditor(true);
    
    setTimeout(() => {
      try {
        const draftKey = `exp_draft_${(data as any).id || "new"}`;
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
    try { const res = await fetch("/api/admin/experience"); if (res.ok) { const { data } = await res.json(); setItems(data || []); } }
    catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleSave() {
    if (!editing.title.trim() || !editing.company.trim()) { toast.error("Title and company required"); return; }
    setSaving(true);
    try {
      const method = editing.id ? "PATCH" : "POST";
      await fetch("/api/admin/experience", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      toast.success(editing.id ? "Updated" : "Created"); 
      clearDraft();
      setShowEditor(false); 
      setEditing(emptyExp); 
      fetchItems();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    try { await fetch("/api/admin/experience", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); toast.success("Updated"); fetchItems(); }
    catch { toast.error("Failed"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try { await fetch(`/api/admin/experience?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); fetchItems(); }
    catch { toast.error("Failed"); } finally { setDeleting(false); }
  }

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="admin-page-title">Experience</h1><p className="admin-page-subtitle">{items.length} entries</p></div>
        <button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Experience</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="admin-card p-4"><div className="admin-skeleton h-5 w-48 mb-2" /><div className="admin-skeleton h-3 w-32 mb-2" /><div className="admin-skeleton h-3 w-full" /></div>)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Briefcase size={48} />} title="No experience yet" description="Add your internships, jobs, freelancing, and volunteer work."
          action={<button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Experience</button>} />
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="admin-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold" style={{ color: "var(--admin-ink)" }}>{item.title}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--admin-accent)" }}>{item.company}</p>
                  <div className="flex items-center gap-3 mt-1 text-[12px]" style={{ color: "var(--admin-ink-muted)" }}>
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{item.start_date} — {item.end_date || "Present"}</span>
                    {item.location && <><span>•</span><span>{item.location}</span></>}
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
                  {item.status === "draft" ? <button onClick={() => updateStatus(item.id, "published")} className="admin-btn admin-btn-ghost admin-btn-sm"><Globe size={12} /></button>
                    : <button onClick={() => updateStatus(item.id, "draft")} className="admin-btn admin-btn-ghost admin-btn-sm">↩</button>}
                  <button onClick={() => setDeleteTarget(item)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Experience" : "New Experience"} maxWidth="620px"
        preventClose={showEditor} onCloseAttempt={handleCloseAttempt}
        footer={<><button onClick={handleCloseAttempt} className="admin-btn admin-btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}</button></>}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Job Title *</label><AIAssistantField value={editing.title} onChange={val => setEditing(p => ({ ...p, title: val }))}><input className="admin-input" value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} /></AIAssistantField></div>
            <div className="admin-field"><label className="admin-label">Company *</label><AIAssistantField value={editing.company} onChange={val => setEditing(p => ({ ...p, company: val }))}><input className="admin-input" value={editing.company} onChange={e => setEditing(p => ({ ...p, company: e.target.value }))} /></AIAssistantField></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="admin-field"><label className="admin-label">Type</label><select className="admin-input admin-select" value={editing.type} onChange={e => setEditing(p => ({ ...p, type: e.target.value }))}>{EXPERIENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="admin-field"><label className="admin-label">Start Date</label><AIAssistantField value={editing.start_date} onChange={val => setEditing(p => ({ ...p, start_date: val }))}><input className="admin-input" value={editing.start_date} onChange={e => setEditing(p => ({ ...p, start_date: e.target.value }))} placeholder="e.g. Jun 2025" /></AIAssistantField></div>
            <div className="admin-field"><label className="admin-label">End Date</label><AIAssistantField value={editing.end_date || ""} onChange={val => setEditing(p => ({ ...p, end_date: val }))}><input className="admin-input" value={editing.end_date || ""} onChange={e => setEditing(p => ({ ...p, end_date: e.target.value }))} placeholder="Present" /></AIAssistantField></div>
          </div>
          <div className="admin-field"><label className="admin-label">Location</label><AIAssistantField value={editing.location} onChange={val => setEditing(p => ({ ...p, location: val }))}><input className="admin-input" value={editing.location} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))} /></AIAssistantField></div>
          <div className="admin-field"><label className="admin-label">Description</label><AIAssistantField value={editing.description} onChange={val => setEditing(p => ({ ...p, description: val }))}><textarea className="admin-input admin-textarea" value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} /></AIAssistantField></div>
          <div className="admin-field">
            <label className="admin-label">Technologies</label>
            <div className="flex gap-2 mb-2"><input className="admin-input" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (techInput.trim()) { setEditing(p => ({ ...p, technologies: [...p.technologies, techInput.trim()] })); setTechInput(""); } } }} placeholder="Add…" /><button type="button" onClick={() => { if (techInput.trim()) { setEditing(p => ({ ...p, technologies: [...p.technologies, techInput.trim()] })); setTechInput(""); } }} className="admin-btn admin-btn-secondary">Add</button></div>
            <div className="flex flex-wrap gap-1">{editing.technologies.map((t, i) => <span key={i} className="admin-tag">{t}<button onClick={() => setEditing(p => ({ ...p, technologies: p.technologies.filter((_, idx) => idx !== i) }))} className="admin-tag-remove"><X size={12} /></button></span>)}</div>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Experience" message={`Delete "${deleteTarget?.title} at ${deleteTarget?.company}"?`} loading={deleting} />
      
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
