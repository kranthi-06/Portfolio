"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Trash2, Search, ExternalLink, Copy, FileText, ImageIcon, Film } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/admin/constants";
import { UploadZone } from "@/components/admin/certificates/upload-zone";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";

interface MediaItem {
  id: string; file_name: string; original_name: string; file_url: string;
  file_type: string; file_size: number; bucket: string; created_at: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/media${params}`);
      if (res.ok) { const { data } = await res.json(); setItems(data || []); }
    } catch (err) { console.error(err); toast.error("Failed to load"); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  async function handleUploadComplete(result: { url: string; fileName: string; fileSize: number; fileType: string; path: string }) {
    try {
      await fetch("/api/admin/media", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: result.path, original_name: result.fileName, file_url: result.url,
          file_type: result.fileType, file_size: result.fileSize, bucket: "documents",
        }),
      });
      toast.success("File added to media library"); setShowUpload(false); fetchMedia();
    } catch (err) { console.error(err); toast.error("Failed to save"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try { await fetch(`/api/admin/media?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); fetchMedia(); }
    catch (err) { console.error(err); toast.error("Failed"); } finally { setDeleting(false); }
  }

  function copyUrl(url: string) { navigator.clipboard.writeText(url); toast.success("URL copied to clipboard"); }

  function getIcon(type: string) {
    if (type.startsWith("image/")) return <ImageIcon size={14} />;
    if (type.startsWith("video/")) return <Film size={14} />;
    return <FileText size={14} />;
  }

  const totalSize = items.reduce((s, i) => s + i.file_size, 0);

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Media Library</h1>
          <p className="admin-page-subtitle">{items.length} files · {formatFileSize(totalSize)}</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="admin-btn admin-btn-primary"><ImagePlus size={14} /> Upload</button>
      </div>

      <div className="mb-6 relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--admin-ink-muted)" }} />
        <input className="admin-input pl-9" placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="admin-skeleton rounded-xl" style={{ paddingBottom: "100%" }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<ImagePlus size={48} />} title="Media library is empty" description="Upload files to use across your portfolio."
          action={<button onClick={() => setShowUpload(true)} className="admin-btn admin-btn-primary"><ImagePlus size={14} /> Upload</button>} />
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="admin-card group rounded-xl overflow-hidden">
              <div className="relative aspect-square flex items-center justify-center overflow-hidden" style={{ background: "var(--admin-bg-subtle)" }}>
                {item.file_type.startsWith("image/") ? (
                  <SafeImage useNextImage={true} src={item.file_url} alt={item.original_name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                ) : (
                  <div className="flex flex-col items-center gap-2" style={{ color: "var(--admin-ink-muted)" }}>
                    {getIcon(item.file_type)}
                    <span className="text-[10px]">{item.file_type.split("/")[1]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--admin-ink)" }}>{item.original_name}</p>
                <p className="text-[10px]" style={{ color: "var(--admin-ink-muted)" }}>{formatFileSize(item.file_size)}</p>
                <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyUrl(item.file_url)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: "2px 6px", fontSize: 10 }}><Copy size={10} /> Copy URL</button>
                  <button onClick={() => setDeleteTarget(item)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: "2px 6px", fontSize: 10, color: "var(--admin-danger)" }}><Trash2 size={10} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminModal open={showUpload} onClose={() => setShowUpload(false)} title="Upload to Media Library" maxWidth="480px">
        <UploadZone bucket="documents" folder="media" onUploadComplete={handleUploadComplete} label="Upload any file" />
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete File" message={`Delete "${deleteTarget?.original_name}"?`} loading={deleting} />
    </div>
  );
}
