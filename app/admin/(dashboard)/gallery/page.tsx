"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Plus, Trash2, Globe, Pencil, Loader2, X } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { toast } from "sonner";
import { GALLERY_ALBUMS } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import { UploadZone } from "@/components/admin/certificates/upload-zone";
import { AIAssistantField } from "@/components/admin/ui/ai-assistant-field";

interface GalleryItem {
  id: string; title: string; caption: string; image_url: string; album: string;
  tags: string[]; status: "draft" | "published" | "archived"; created_at: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumFilter, setAlbumFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadAlbum, setUploadAlbum] = useState("General");
  const [uploadCaption, setUploadCaption] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  function handleCloseAttempt() {
    if (uploadCaption.trim()) {
      setShowCloseConfirm(true);
    } else {
      setShowUpload(false);
      setUploadCaption("");
    }
  }

  const fetchItems = useCallback(async () => {
    try {
      const params = albumFilter ? `?album=${encodeURIComponent(albumFilter)}` : "";
      const res = await fetch(`/api/admin/gallery${params}`);
      if (res.ok) { const { data } = await res.json(); setItems(data || []); }
    } catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }, [albumFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleUploadComplete(result: { url: string; publicId?: string }) {
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: result.url, image_public_id: result.publicId || null, album: uploadAlbum, caption: uploadCaption, status: "draft" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Image added to gallery"); setShowUpload(false); setUploadCaption(""); fetchItems();
    } catch { toast.error("Failed to save"); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch("/api/admin/gallery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Updated"); fetchItems();
    }
    catch { toast.error("Failed"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try {
      const res = await fetch(`/api/admin/gallery?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted"); setDeleteTarget(null); fetchItems();
    }
    catch { toast.error("Failed"); } finally { setDeleting(false); }
  }

  const albums = [...new Set(items.map(i => i.album))];

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="admin-page-title">Gallery</h1><p className="admin-page-subtitle">{items.length} images across {albums.length || 0} albums</p></div>
        <button onClick={() => setShowUpload(true)} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Image</button>
      </div>

      {/* Album Tabs */}
      <div className="admin-tabs mb-0">
        <button className={`admin-tab ${!albumFilter ? "active" : ""}`} onClick={() => setAlbumFilter("")}>All</button>
        {GALLERY_ALBUMS.map(a => (
          <button key={a} className={`admin-tab ${albumFilter === a ? "active" : ""}`} onClick={() => setAlbumFilter(a)}>{a}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="admin-skeleton rounded-xl" style={{ paddingBottom: "100%" }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<ImageIcon size={48} />} title="No images yet" description="Upload photos to your gallery."
          action={<button onClick={() => setShowUpload(true)} className="admin-btn admin-btn-primary"><Plus size={14} /> Add Image</button>} />
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                className="relative group rounded-xl overflow-hidden cursor-pointer" style={{ background: "var(--admin-bg-subtle)" }}>
                <div className="relative aspect-square">
                  <SafeImage useNextImage={true} src={item.image_url} alt={item.caption || item.title || ""} fill className="object-cover transition-transform duration-300 group-hover:scale-105" onClick={() => setLightbox(item.image_url)} sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-[11px] font-medium truncate">{item.caption || item.album}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {item.status === "draft" && <button onClick={(e) => { e.stopPropagation(); updateStatus(item.id, "published"); }} className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 text-white hover:bg-white/40 transition-colors"><Globe size={10} /></button>}
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} className="w-6 h-6 rounded-md flex items-center justify-center bg-white/20 text-white hover:bg-red-500/80 transition-colors"><Trash2 size={10} /></button>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2"><StatusBadge status={item.status} /></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AdminModal open={showUpload} onClose={() => setShowUpload(false)} title="Add Gallery Image" maxWidth="480px" preventClose={!!uploadCaption.trim()} onCloseAttempt={handleCloseAttempt}>
        <div className="space-y-4">
          <div className="admin-field">
            <label className="admin-label">Album</label>
            <select className="admin-input admin-select" value={uploadAlbum} onChange={e => setUploadAlbum(e.target.value)}>
              {GALLERY_ALBUMS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="admin-field"><label className="admin-label">Caption</label><AIAssistantField value={uploadCaption} onChange={setUploadCaption}><input className="admin-input" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="Optional caption…" /></AIAssistantField></div>
          <UploadZone bucket="gallery" folder={uploadAlbum.toLowerCase()} onUploadComplete={handleUploadComplete} accept={["image/png","image/jpeg","image/webp"]} maxSize={10485760} label="Upload gallery image" />
        </div>
      </AdminModal>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={() => setLightbox(null)}><X size={20} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Image" message="Delete this image from the gallery?" loading={deleting} />
      
      <ConfirmDialog 
        open={showCloseConfirm} 
        onClose={() => setShowCloseConfirm(false)} 
        onConfirm={() => {
          setShowCloseConfirm(false);
          setShowUpload(false);
          setUploadCaption("");
        }} 
        title="Discard Draft?" 
        message="You have entered a caption. Are you sure you want to discard it?" 
        confirmLabel="Discard"
        variant="danger"
      />
    </div>
  );
}
