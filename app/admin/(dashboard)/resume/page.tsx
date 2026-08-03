"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, Download, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/admin/constants";
import { UploadZone } from "@/components/admin/certificates/upload-zone";

interface ResumeVersion { id: string; file_url: string; file_name: string; file_size: number; version: number; is_active: boolean; created_at: string; }

export default function ResumePage() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchResume() {
    try { const res = await fetch("/api/admin/resume"); if (res.ok) { const { data } = await res.json(); setVersions(data || []); } }
    catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }

  useEffect(() => { fetchResume(); }, []);

  async function handleUploadComplete(result: { url: string; fileName: string; fileSize: number }) {
    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: result.url, file_name: result.fileName, file_size: result.fileSize }),
      });
      if (!res.ok) throw new Error();
      toast.success("Resume uploaded! Previous version deactivated.");
      fetchResume();
    } catch { toast.error("Failed to save resume"); }
  }

  const active = versions.find(v => v.is_active);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Resume</h1>
        <p className="admin-page-subtitle">Upload and manage your resume. Only the latest version is shown on the portfolio.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Resume */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title flex items-center gap-2"><FileText size={14} /> Current Resume</h3>
          </div>
          <div className="admin-card-body">
            {loading ? (
              <div className="space-y-3"><div className="admin-skeleton h-12 rounded-xl" /><div className="admin-skeleton h-4 w-1/2" /></div>
            ) : active ? (
              <div>
                <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: "var(--admin-bg-subtle)", border: "1px solid var(--admin-line)" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--admin-danger-soft)", color: "var(--admin-danger)" }}><FileText size={18} /></div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--admin-ink)" }}>{active.file_name}</p>
                    <p className="text-[11px]" style={{ color: "var(--admin-ink-muted)" }}>Version {active.version} · {formatFileSize(active.file_size)} · {new Date(active.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={active.file_url} target="_blank" rel="noopener" className="admin-btn admin-btn-primary"><Download size={14} /> Download</a>
                  <a href={active.file_url} target="_blank" rel="noopener" className="admin-btn admin-btn-secondary">Preview</a>
                </div>
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>No resume uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Upload New */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title flex items-center gap-2"><Upload size={14} /> Upload New Version</h3>
          </div>
          <div className="admin-card-body">
            <p className="text-[12px] mb-4" style={{ color: "var(--admin-ink-muted)" }}>Uploading a new resume will replace the current active version on your portfolio.</p>
            <UploadZone bucket="resume" folder="versions" onUploadComplete={handleUploadComplete} accept={["application/pdf"]} maxSize={5242880} label="Upload resume (PDF only, max 5MB)" />
          </div>
        </div>
      </div>

      {/* Version History */}
      {versions.length > 1 && (
        <div className="admin-card mt-6">
          <div className="admin-card-header"><h3 className="admin-card-title flex items-center gap-2"><Clock size={14} /> Version History</h3></div>
          <div className="admin-card-body p-0">
            {versions.map(v => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                <FileText size={14} style={{ color: v.is_active ? "var(--admin-accent)" : "var(--admin-ink-muted)" }} />
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{ color: "var(--admin-ink)" }}>
                    Version {v.version} {v.is_active && <span className="admin-badge admin-badge-published ml-1">Active</span>}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--admin-ink-muted)" }}>{formatFileSize(v.file_size)} · {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <a href={v.file_url} target="_blank" rel="noopener" className="admin-btn admin-btn-ghost admin-btn-sm"><Download size={12} /></a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
