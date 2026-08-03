"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Plus, Search, Trash2, Globe, Pencil, Archive, ExternalLink, Github, Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { UploadZone } from "@/components/admin/certificates/upload-zone";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  long_description: string;
  technologies: string[];
  github_url: string;
  live_url: string;
  image_url: string;
  category: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  created_at: string;
}

const emptyProject = {
  title: "", subtitle: "", description: "", long_description: "",
  problem: "", solution: "", features: [] as string[], technologies: [] as string[],
  github_url: "", live_url: "", image_url: "", category: "", featured: false,
  architecture: "", challenges: [] as string[], future_scope: [] as string[],
  status: "draft" as "draft" | "published" | "archived", seo_title: "", seo_description: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<typeof emptyProject & { id?: string }>(emptyProject);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [techInput, setTechInput] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/projects${params}`);
      if (res.ok) { const { data } = await res.json(); setProjects(data || []); }
    } catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleSave() {
    if (!editing.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/projects", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success(editing.id ? "Project updated" : "Project created");
      setShowEditor(false); setEditing(emptyProject); fetchProjects();
    } catch { toast.error("Failed to save project"); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "published" ? "Published!" : `Status → ${status}`);
      fetchProjects();
    } catch { toast.error("Failed to update"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Project deleted"); setDeleteTarget(null); fetchProjects();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  }

  function addTech() {
    if (techInput.trim() && !editing.technologies.includes(techInput.trim())) {
      setEditing(p => ({ ...p, technologies: [...p.technologies, techInput.trim()] }));
      setTechInput("");
    }
  }

  function openEdit(proj: Project) {
    setEditing({ ...emptyProject, ...proj }); setShowEditor(true);
  }

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Projects</h1>
          <p className="admin-page-subtitle">{projects.length} projects</p>
        </div>
        <button onClick={() => { setEditing(emptyProject); setShowEditor(true); }} className="admin-btn admin-btn-primary">
          <Plus size={14} /> Add Project
        </button>
      </div>

      <div className="mb-6 relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--admin-ink-muted)" }} />
        <input className="admin-input pl-9" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="admin-card p-4"><div className="admin-skeleton h-40 rounded-xl mb-3" /><div className="admin-skeleton h-4 w-3/4 mb-2" /><div className="admin-skeleton h-3 w-1/2" /></div>)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={48} />} title="No projects yet" description="Add your first project to showcase your work."
          action={<button onClick={() => { setEditing(emptyProject); setShowEditor(true); }} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Project</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {projects.map((proj, i) => (
              <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="admin-card group">
                <div className="relative h-36 flex items-center justify-center overflow-hidden" style={{ background: "var(--admin-bg-subtle)" }}>
                  {proj.image_url ? <Image src={proj.image_url} alt={proj.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /> : <FolderKanban size={32} style={{ color: "var(--admin-ink-muted)" }} />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[13px] font-semibold truncate" style={{ color: "var(--admin-ink)" }}>{proj.title}</h3>
                    <StatusBadge status={proj.status} />
                  </div>
                  <p className="text-[12px] mb-2 line-clamp-2" style={{ color: "var(--admin-ink-muted)" }}>{proj.subtitle || proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {proj.technologies.slice(0, 4).map(t => <span key={t} className="admin-tag" style={{ fontSize: 10, padding: "1px 5px" }}>{t}</span>)}
                      {proj.technologies.length > 4 && <span className="text-[10px]" style={{ color: "var(--admin-ink-muted)" }}>+{proj.technologies.length - 4}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-1 pt-2" style={{ borderTop: "1px solid var(--admin-line)" }}>
                    <button onClick={() => openEdit(proj)} className="admin-btn admin-btn-ghost admin-btn-sm"><Pencil size={12} /></button>
                    {proj.status === "draft" && <button onClick={() => updateStatus(proj.id, "published")} className="admin-btn admin-btn-ghost admin-btn-sm"><Globe size={12} /> Publish</button>}
                    {proj.status === "published" && <button onClick={() => updateStatus(proj.id, "draft")} className="admin-btn admin-btn-ghost admin-btn-sm">Unpublish</button>}
                    <div className="flex-1" />
                    {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener" className="admin-btn admin-btn-ghost admin-btn-sm"><Github size={12} /></a>}
                    {proj.live_url && <a href={proj.live_url} target="_blank" rel="noopener" className="admin-btn admin-btn-ghost admin-btn-sm"><ExternalLink size={12} /></a>}
                    <button onClick={() => setDeleteTarget(proj)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor Modal */}
      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Project" : "New Project"} maxWidth="680px"
        footer={<>
          <button onClick={() => setShowEditor(false)} className="admin-btn admin-btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Project"}</button>
        </>}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="admin-field"><label className="admin-label">Title *</label><input className="admin-input" value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="admin-field"><label className="admin-label">Subtitle</label><input className="admin-input" value={editing.subtitle} onChange={e => setEditing(p => ({ ...p, subtitle: e.target.value }))} /></div>
          <div className="admin-field"><label className="admin-label">Description</label><textarea className="admin-input admin-textarea" value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="admin-field"><label className="admin-label">Category</label><input className="admin-input" value={editing.category} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Full-Stack AI" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">GitHub URL</label><input className="admin-input" value={editing.github_url} onChange={e => setEditing(p => ({ ...p, github_url: e.target.value }))} /></div>
            <div className="admin-field"><label className="admin-label">Live URL</label><input className="admin-input" value={editing.live_url} onChange={e => setEditing(p => ({ ...p, live_url: e.target.value }))} /></div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Technologies</label>
            <div className="flex gap-2 mb-2">
              <input className="admin-input" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTech())} placeholder="Add technology…" />
              <button onClick={addTech} className="admin-btn admin-btn-secondary" type="button">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {editing.technologies.map((t, i) => (
                <span key={i} className="admin-tag">{t}<button onClick={() => setEditing(p => ({ ...p, technologies: p.technologies.filter((_, idx) => idx !== i) }))} className="admin-tag-remove"><X size={12} /></button></span>
              ))}
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Project Image</label>
            {editing.image_url ? (
              <div className="relative rounded-xl overflow-hidden h-40 mb-2" style={{ background: "var(--admin-bg-subtle)" }}>
                <Image src={editing.image_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                <button onClick={() => setEditing(p => ({ ...p, image_url: "" }))} className="absolute top-2 right-2 admin-icon-btn" style={{ background: "var(--admin-glass)" }}><X size={14} /></button>
              </div>
            ) : (
              <UploadZone bucket="projects" folder="images" onUploadComplete={r => setEditing(p => ({ ...p, image_url: r.url }))} accept={["image/png", "image/jpeg", "image/webp"]} maxSize={10485760} label="Upload project image" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={editing.featured} onChange={e => setEditing(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
            <label htmlFor="featured" className="text-[13px] font-medium" style={{ color: "var(--admin-ink-secondary)" }}>Featured project</label>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Project" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
