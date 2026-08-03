"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Cpu, Plus, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { SKILL_CATEGORIES } from "@/lib/admin/constants";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AdminModal } from "@/components/admin/ui/modal";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface Skill { id: string; name: string; category: string; level: number; color: string; }

const emptySkill = { name: "", category: "Programming Languages", level: 80, color: "#6366f1" };

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<typeof emptySkill & { id?: string }>(emptySkill);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSkills = useCallback(async () => {
    try { const res = await fetch("/api/admin/skills"); if (res.ok) { const { data } = await res.json(); setSkills(data || []); } }
    catch { toast.error("Failed to load skills"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  async function handleSave() {
    if (!editing.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      const method = editing.id ? "PATCH" : "POST";
      await fetch("/api/admin/skills", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      toast.success(editing.id ? "Updated" : "Created"); setShowEditor(false); setEditing(emptySkill); fetchSkills();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try { await fetch(`/api/admin/skills?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); fetchSkills(); }
    catch { toast.error("Failed to delete"); } finally { setDeleting(false); }
  }

  const grouped = SKILL_CATEGORIES.reduce((acc, cat) => {
    const catSkills = skills.filter(s => s.category === cat);
    if (catSkills.length > 0) acc[cat] = catSkills;
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="admin-page-title">Skills</h1><p className="admin-page-subtitle">{skills.length} skills across {Object.keys(grouped).length} categories</p></div>
        <button onClick={() => { setEditing(emptySkill); setShowEditor(true); }} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Skill</button>
      </div>

      {loading ? (
        <div className="space-y-6">{[1,2,3].map(i => <div key={i}><div className="admin-skeleton h-5 w-40 mb-3" /><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[1,2,3].map(j => <div key={j} className="admin-skeleton h-12 rounded-xl" />)}</div></div>)}</div>
      ) : skills.length === 0 ? (
        <EmptyState icon={<Cpu size={48} />} title="No skills yet" description="Add your programming languages, frameworks, tools, and more."
          action={<button onClick={() => { setEditing(emptySkill); setShowEditor(true); }} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Skill</button>} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catSkills], ci) => (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
              <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--admin-ink)" }}>{category}</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {catSkills.map(skill => (
                  <div key={skill.id} className="admin-card p-3 flex items-center gap-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium" style={{ color: "var(--admin-ink)" }}>{skill.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--admin-bg-hover)" }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${skill.level}%`, background: skill.color || "var(--admin-accent)" }} />
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "var(--admin-ink-muted)" }}>{skill.level}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ ...emptySkill, ...skill }); setShowEditor(true); }} className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-icon"><Cpu size={12} /></button>
                      <button onClick={() => setDeleteTarget(skill)} className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-icon" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Skill" : "Add Skill"} maxWidth="440px"
        footer={<><button onClick={() => setShowEditor(false)} className="admin-btn admin-btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}</button></>}>
        <div className="space-y-4">
          <div className="admin-field"><label className="admin-label">Skill Name *</label><input className="admin-input" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Python" /></div>
          <div className="admin-field"><label className="admin-label">Category</label><select className="admin-input admin-select" value={editing.category} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}>{SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="admin-field"><label className="admin-label">Proficiency Level: {editing.level}%</label><input type="range" min="0" max="100" value={editing.level} onChange={e => setEditing(p => ({ ...p, level: parseInt(e.target.value) }))} className="w-full accent-[var(--admin-accent)]" /></div>
          <div className="admin-field"><label className="admin-label">Color</label><input type="color" className="admin-input h-10 p-1 cursor-pointer" value={editing.color} onChange={e => setEditing(p => ({ ...p, color: e.target.value }))} /></div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Skill" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
    </div>
  );
}
