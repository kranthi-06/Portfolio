"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, Search, Trash2, Globe, Pencil, Loader2, X, ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { UploadZone } from "@/components/admin/certificates/upload-zone";

interface EventImage { id?: string; image_url: string; caption: string; image_type: string; }
interface Event {
  id: string; name: string; description: string; organizer: string; location: string;
  event_date: string; event_type: string; achievement: string; prize: string;
  cover_image_url: string; status: "draft" | "published" | "archived";
  event_images: EventImage[]; created_at: string;
}

const emptyEvent = {
  name: "", description: "", summary: "", organizer: "", location: "",
  event_date: "", event_type: "", achievement: "", prize: "",
  highlights: [] as string[], cover_image_url: "", status: "draft" as "draft" | "published" | "archived",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<typeof emptyEvent & { id?: string; images?: EventImage[] }>(emptyEvent);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) { const { data } = await res.json(); setEvents(data || []); }
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function handleSave() {
    if (!editing.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/events", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success(editing.id ? "Event updated" : "Event created");
      setShowEditor(false); setEditing(emptyEvent); fetchEvents();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch("/api/admin/events", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      toast.success(status === "published" ? "Published!" : `Status → ${status}`); fetchEvents();
    } catch { toast.error("Failed to update"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await fetch(`/api/admin/events?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Event deleted"); setDeleteTarget(null); fetchEvents(); }
    catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  }

  function addEventImage(result: { url: string }) {
    setEditing(p => ({ ...p, images: [...(p.images || []), { image_url: result.url, caption: "", image_type: "" }] }));
  }

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="admin-page-title">Events</h1><p className="admin-page-subtitle">{events.length} events</p></div>
        <button onClick={() => { setEditing(emptyEvent); setShowEditor(true); }} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Event</button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="admin-card p-4"><div className="admin-skeleton h-32 rounded-xl mb-3" /><div className="admin-skeleton h-4 w-3/4 mb-2" /><div className="admin-skeleton h-3 w-1/2" /></div>)}</div>
      ) : events.length === 0 ? (
        <EmptyState icon={<CalendarDays size={48} />} title="No events yet" description="Add hackathons, workshops, conferences, and more."
          action={<button onClick={() => { setEditing(emptyEvent); setShowEditor(true); }} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Event</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {events.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="admin-card">
                <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ background: "var(--admin-bg-subtle)" }}>
                  {ev.cover_image_url ? <Image src={ev.cover_image_url} alt={ev.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /> : <CalendarDays size={28} style={{ color: "var(--admin-ink-muted)" }} />}
                  {ev.event_images?.length > 0 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: "var(--admin-glass)", backdropFilter: "blur(8px)" }}>
                      <ImageIcon size={10} /> {ev.event_images.length}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[13px] font-semibold truncate" style={{ color: "var(--admin-ink)" }}>{ev.name}</h3>
                    <StatusBadge status={ev.status} />
                  </div>
                  {ev.organizer && <p className="text-[12px] mb-1" style={{ color: "var(--admin-ink-secondary)" }}>{ev.organizer}</p>}
                  {ev.location && <p className="text-[11px] flex items-center gap-1 mb-2" style={{ color: "var(--admin-ink-muted)" }}><MapPin size={10} />{ev.location}</p>}
                  <div className="flex items-center gap-1 pt-2" style={{ borderTop: "1px solid var(--admin-line)" }}>
                    <button onClick={() => { setEditing({ ...emptyEvent, ...ev, images: ev.event_images }); setShowEditor(true); }} className="admin-btn admin-btn-ghost admin-btn-sm"><Pencil size={12} /></button>
                    {ev.status === "draft" ? <button onClick={() => updateStatus(ev.id, "published")} className="admin-btn admin-btn-ghost admin-btn-sm"><Globe size={12} /> Publish</button>
                      : <button onClick={() => updateStatus(ev.id, "draft")} className="admin-btn admin-btn-ghost admin-btn-sm">Unpublish</button>}
                    <div className="flex-1" />
                    <button onClick={() => setDeleteTarget(ev)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AdminModal open={showEditor} onClose={() => setShowEditor(false)} title={editing.id ? "Edit Event" : "New Event"} maxWidth="680px"
        footer={<><button onClick={() => setShowEditor(false)} className="admin-btn admin-btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Event"}</button></>}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="admin-field"><label className="admin-label">Event Name *</label><input className="admin-input" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Organizer</label><input className="admin-input" value={editing.organizer} onChange={e => setEditing(p => ({ ...p, organizer: e.target.value }))} /></div>
            <div className="admin-field"><label className="admin-label">Location</label><input className="admin-input" value={editing.location} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Event Date</label><input className="admin-input" value={editing.event_date} onChange={e => setEditing(p => ({ ...p, event_date: e.target.value }))} placeholder="e.g. March 2025" /></div>
            <div className="admin-field"><label className="admin-label">Event Type</label><input className="admin-input" value={editing.event_type} onChange={e => setEditing(p => ({ ...p, event_type: e.target.value }))} placeholder="e.g. Hackathon" /></div>
          </div>
          <div className="admin-field"><label className="admin-label">Description</label><textarea className="admin-input admin-textarea" value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-field"><label className="admin-label">Achievement</label><input className="admin-input" value={editing.achievement} onChange={e => setEditing(p => ({ ...p, achievement: e.target.value }))} placeholder="e.g. 1st Place" /></div>
            <div className="admin-field"><label className="admin-label">Prize</label><input className="admin-input" value={editing.prize} onChange={e => setEditing(p => ({ ...p, prize: e.target.value }))} /></div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Cover Image</label>
            {editing.cover_image_url ? (
              <div className="relative rounded-xl overflow-hidden h-32 mb-2" style={{ background: "var(--admin-bg-subtle)" }}>
                <Image src={editing.cover_image_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                <button onClick={() => setEditing(p => ({ ...p, cover_image_url: "" }))} className="absolute top-2 right-2 admin-icon-btn" style={{ background: "var(--admin-glass)" }}><X size={14} /></button>
              </div>
            ) : <UploadZone bucket="events" folder="covers" onUploadComplete={r => setEditing(p => ({ ...p, cover_image_url: r.url }))} accept={["image/png","image/jpeg","image/webp"]} maxSize={10485760} label="Upload cover image" />}
          </div>
          <div className="admin-field">
            <label className="admin-label">Event Gallery Images</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(editing.images || []).map((img, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden h-20" style={{ background: "var(--admin-bg-subtle)" }}>
                  <Image src={img.image_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  <button onClick={() => setEditing(p => ({ ...p, images: (p.images || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", color: "white" }}><X size={10} /></button>
                </div>
              ))}
            </div>
            <UploadZone bucket="events" folder="gallery" onUploadComplete={addEventImage} accept={["image/png","image/jpeg","image/webp"]} maxSize={10485760} label="Add gallery image" />
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Event" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
