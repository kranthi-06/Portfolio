"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, Trash2, Globe, Pencil, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { AIAssistantField } from "@/components/admin/ui/ai-assistant-field";
import { useAutoSave } from "@/hooks/use-auto-save";
import { GalleryItem, GalleryManager } from "@/components/admin/achievements/gallery-manager";
import { UploadZone } from "@/components/admin/certificates/upload-zone";
import Image from "next/image";

interface EvidenceItem {
  label: string;
  url: string;
}

interface Achievement {
  id: string; title: string; event: string; position: string; date: string;
  description: string; color: string; status: "draft" | "published" | "archived"; created_at: string;
  image_url: string;
  certificate_url?: string;
  certificate_type?: string;
  certificate_filename?: string;
  certificate_mime_type?: string;
  gallery?: GalleryItem[];
  evidence?: EvidenceItem[];
}

const emptyAch = { 
  title: "", event: "", position: "", date: "", description: "", color: "#FFD700", status: "draft" as "draft" | "published" | "archived",
  image_url: "", certificate_url: "", certificate_type: "", certificate_filename: "", certificate_mime_type: "", gallery: [] as GalleryItem[], evidence: [] as EvidenceItem[]
};

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

  const { clearDraft } = useAutoSave(`ach_draft_${editing.id || "new"}`, editing, showEditor);

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
      const res = await fetch("/api/admin/achievements", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Failed to save");
      }
      toast.success(editing.id ? "Updated" : "Created"); 
      clearDraft();
      setShowEditor(false); 
      setEditing(emptyAch); 
      fetchItems();
    } catch (err: any) { console.error(err); toast.error(err.message || "Failed to save"); } finally { setSaving(false); }
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
        <EmptyState icon={<Trophy size={48} />} title="No achievements yet" description="Add awards, medals, badges, and more." action={<button onClick={() => openEdit()} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Achievement</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="admin-card p-4 flex flex-col" style={{ borderLeft: `3px solid ${item.color}` }}>
                {item.image_url && (
                  <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden bg-black/5">
                    <Image src={item.image_url} alt="Cover" fill className="object-cover" sizes="300px" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[14px] font-semibold" style={{ color: "var(--admin-ink)" }}>{item.title}</h3>
                    {item.event && <p className="text-[12px]" style={{ color: "var(--admin-ink-secondary)" }}>{item.event}</p>}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.position && <span className="admin-badge admin-badge-published mb-2" style={{ background: `${item.color}20`, color: item.color }}>{item.position}</span>}
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {item.gallery && item.gallery.length > 0 && <span className="text-[10px] flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "var(--admin-bg-hover)", color: "var(--admin-ink-muted)" }}><ImageIcon size={10} /> {item.gallery.length}</span>}
                  {item.certificate_url && <span className="text-[10px] flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "var(--admin-bg-hover)", color: "var(--admin-ink-muted)" }}><FileText size={10} /> Cert</span>}
                  {item.evidence && item.evidence.length > 0 && <span className="text-[10px] flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "var(--admin-bg-hover)", color: "var(--admin-ink-muted)" }}><LinkIcon size={10} /> {item.evidence.length}</span>}
                </div>
                <div className="flex-1" />
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

      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Achievement" : "New Achievement"} maxWidth="720px"
        preventClose={showEditor} onCloseAttempt={handleCloseAttempt}
        footer={<><button onClick={handleCloseAttempt} className="admin-btn admin-btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}</button></>}>
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-ink-muted)] border-b border-[var(--admin-line)] pb-2">1. Achievement Details</h3>
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
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-ink-muted)] border-b border-[var(--admin-line)] pb-2">2. Certificate</h3>
            {editing.certificate_url ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--admin-line)] bg-[var(--admin-bg-subtle)]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
                    {editing.certificate_type === 'application/pdf' || editing.certificate_url.endsWith('.pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <div className="truncate">
                    <p className="text-[13px] font-semibold text-[var(--admin-ink)] truncate">{editing.certificate_filename || "Certificate Document"}</p>
                    <a href={editing.certificate_url} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--admin-accent)] hover:underline truncate inline-block max-w-[200px]">View File</a>
                  </div>
                </div>
                <button type="button" onClick={() => setEditing(p => ({ ...p, certificate_url: "", certificate_filename: "", certificate_type: "", certificate_mime_type: "" }))} className="admin-btn admin-btn-ghost text-[var(--admin-danger)]"><Trash2 size={14} /> Remove</button>
              </div>
            ) : (
              <UploadZone 
                bucket="achievements" folder="certificates"
                onUploadComplete={(res) => setEditing(p => ({ ...p, certificate_url: res.url, certificate_filename: res.fileName, certificate_mime_type: res.fileType, certificate_type: res.fileType }))}
                label="Upload Certificate (PDF, PNG, JPEG)"
              />
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-ink-muted)] border-b border-[var(--admin-line)] pb-2">3. Event & Recognition Gallery</h3>
            <GalleryManager 
              images={editing.gallery || []} 
              onChange={g => setEditing(p => ({ ...p, gallery: g }))} 
              onCoverSelect={url => setEditing(p => ({ ...p, image_url: url }))} 
              coverUrl={editing.image_url} 
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-ink-muted)] border-b border-[var(--admin-line)] pb-2">4. External Evidence</h3>
            <div className="space-y-2">
              {(editing.evidence || []).map((ev, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input className="admin-input flex-1" placeholder="Label (e.g. Media Coverage)" value={ev.label} onChange={e => { const evs = [...(editing.evidence || [])]; evs[i].label = e.target.value; setEditing(p => ({ ...p, evidence: evs })); }} />
                  <input className="admin-input flex-[2]" placeholder="URL (e.g. https://...)" value={ev.url} onChange={e => { const evs = [...(editing.evidence || [])]; evs[i].url = e.target.value; setEditing(p => ({ ...p, evidence: evs })); }} />
                  <button type="button" onClick={() => { const evs = [...(editing.evidence || [])]; evs.splice(i, 1); setEditing(p => ({ ...p, evidence: evs })); }} className="admin-btn admin-btn-ghost px-2 text-[var(--admin-danger)] h-10"><X size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setEditing(p => ({ ...p, evidence: [...(p.evidence || []), { label: "", url: "" }] }))} className="admin-btn admin-btn-secondary text-[12px] h-8 mt-2"><Plus size={14} /> Add Link</button>
            </div>
          </section>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Achievement" message={`Delete "${deleteTarget?.title}"? All associated certificates and gallery images will also be removed.`} loading={deleting} />
      
      <ConfirmDialog open={showCloseConfirm} onClose={() => setShowCloseConfirm(false)} onConfirm={() => { setShowCloseConfirm(false); setShowEditor(false); clearDraft(); }} title="Discard Unsaved Changes?" message="You have unsaved changes. Are you sure you want to discard them?" confirmLabel="Discard Changes" variant="danger" />
    </div>
  );
}
