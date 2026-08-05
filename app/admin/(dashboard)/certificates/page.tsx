"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Plus, Search, Filter, Grid3X3, List, Loader2,
  MoreHorizontal, Eye, Pencil, Trash2, Globe, Archive,
  FileText, ImageIcon, Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { CERTIFICATE_CATEGORIES, formatFileSize } from "@/lib/admin/constants";
import { UploadZone } from "@/components/admin/certificates/upload-zone";
import { AIReviewPanel } from "@/components/admin/certificates/ai-review-panel";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminModal } from "@/components/admin/ui/modal";
import type { CertificateAnalysis } from "@/lib/ai/schemas";

interface Certificate {
  id: string;
  title: string;
  organization: string;
  description: string;
  category: string;
  file_url: string;
  file_type: string;
  status: "draft" | "published" | "archived";
  skills: string[];
  tags: string[];
  issue_date: string | null;
  created_at: string;
  ai_generated: boolean;
}

type Step = "idle" | "uploading" | "analyzing" | "reviewing" | "saving";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Upload / AI flow
  const [showUpload, setShowUpload] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: string } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<CertificateAnalysis | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close protection
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  function handleCloseAttempt() {
    if (uploadedFile) {
      setShowCloseConfirm(true);
    } else {
      resetUploadFlow();
    }
  }

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/certificates?${params}`);
      if (res.ok) {
        const { data } = await res.json();
        setCertificates(data || []);
      }
    } catch {
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Handle file upload complete
  function handleUploadComplete(result: { url: string; fileType: string }) {
    setUploadedFile({ url: result.url, type: result.fileType });
    setStep("analyzing");
    runAIAnalysis(result.url, result.fileType);
  }

  // Run AI analysis
  async function runAIAnalysis(fileUrl: string, fileType: string) {
    try {
      const res = await fetch("/api/admin/certificates/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, fileType }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const { data } = await res.json();
      setAiAnalysis(data.analysis);
      setStep("reviewing");
      toast.success("AI analysis complete!");
    } catch {
      toast.error("AI analysis failed. You can try again or enter details manually.");
      setStep("idle");
    }
  }

  // Accept AI output and save
  async function handleAcceptAI(data: CertificateAnalysis) {
    if (!uploadedFile) return;
    setStep("saving");

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          organization: data.organization,
          description: data.description,
          professional_summary: data.professionalSummary,
          category: data.category,
          category_confidence: data.categoryConfidence,
          requires_category_review: data.requiresCategoryReview,
          issue_date: data.issueDate,
          credential_id: data.credentialId,
          file_url: uploadedFile.url,
          file_type: uploadedFile.type,
          skills: data.skills,
          tags: data.tags,
          seo_title: data.seoTitle,
          seo_description: data.seoDescription,
          ai_generated: true,
          status: "draft",
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Certificate saved as draft!");
      resetUploadFlow();
      fetchCertificates();
    } catch {
      toast.error("Failed to save certificate");
      setStep("reviewing");
    }
  }

  // Regenerate AI analysis
  async function handleRegenerate() {
    if (!uploadedFile) return;
    setRegenerating(true);
    await runAIAnalysis(uploadedFile.url, uploadedFile.type);
    setRegenerating(false);
  }

  // Quick status change
  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "published" ? "Published!" : `Status → ${status}`);
      fetchCertificates();
    } catch {
      toast.error("Failed to update status");
    }
  }

  // Delete
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/certificates?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Certificate deleted");
      setDeleteTarget(null);
      fetchCertificates();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  function resetUploadFlow() {
    setShowUpload(false);
    setStep("idle");
    setUploadedFile(null);
    setAiAnalysis(null);
  }

  const filteredCerts = certificates;

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Certificates</h1>
          <p className="admin-page-subtitle">{certificates.length} certificates managed</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="admin-btn admin-btn-primary">
          <Plus size={14} /> Upload Certificate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--admin-ink-muted)" }} />
          <input
            className="admin-input pl-9"
            placeholder="Search certificates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-input admin-select"
          style={{ width: "auto", minWidth: 140 }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CERTIFICATE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="admin-input admin-select"
          style={{ width: "auto", minWidth: 120 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setView("grid")}
            className={`admin-btn admin-btn-icon ${view === "grid" ? "admin-btn-primary" : "admin-btn-ghost"}`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`admin-btn admin-btn-icon ${view === "list" ? "admin-btn-primary" : "admin-btn-ghost"}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-card p-4">
              <div className="admin-skeleton h-32 rounded-xl mb-3" />
              <div className="admin-skeleton h-4 w-3/4 mb-2" />
              <div className="admin-skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredCerts.length === 0 ? (
        <EmptyState
          icon={<Award size={48} />}
          title="No certificates yet"
          description="Upload your first certificate to get started. AI will analyze and generate metadata automatically."
          action={
            <button onClick={() => setShowUpload(true)} className="admin-btn admin-btn-primary">
              <Plus size={14} /> Upload Certificate
            </button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredCerts.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="admin-card group"
              >
                {/* Preview */}
                <div
                  className="h-36 flex items-center justify-center relative overflow-hidden"
                  style={{ background: "var(--admin-bg-subtle)" }}
                >
                  {cert.file_type?.includes("pdf") ? (
                    <FileText size={32} style={{ color: "var(--admin-ink-muted)" }} />
                  ) : (
                    <Image
                      src={cert.file_url}
                      alt={cert.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  {cert.ai_generated && (
                    <span
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold"
                      style={{ background: "var(--admin-glass)", backdropFilter: "blur(8px)", color: "var(--admin-accent)" }}
                    >
                      <Sparkles size={10} /> AI
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-[13px] font-semibold truncate" style={{ color: "var(--admin-ink)" }}>
                      {cert.title}
                    </h3>
                    <StatusBadge status={cert.status} />
                  </div>
                  <p className="text-[12px] mb-2" style={{ color: "var(--admin-ink-muted)" }}>
                    {cert.organization}
                  </p>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="admin-tag" style={{ fontSize: 10, padding: "2px 6px" }}>
                      {cert.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2" style={{ borderTop: "1px solid var(--admin-line)" }}>
                    {cert.status === "draft" && (
                      <button
                        onClick={() => updateStatus(cert.id, "published")}
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                      >
                        <Globe size={12} /> Publish
                      </button>
                    )}
                    {cert.status === "published" && (
                      <button
                        onClick={() => updateStatus(cert.id, "draft")}
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(cert.id, "archived")}
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                    >
                      <Archive size={12} />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => setDeleteTarget(cert)}
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      style={{ color: "var(--admin-danger)" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Category</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: cert.file_type?.includes("pdf") ? "var(--admin-danger-soft)" : "var(--admin-info-soft)",
                          color: cert.file_type?.includes("pdf") ? "var(--admin-danger)" : "var(--admin-info)",
                        }}
                      >
                        {cert.file_type?.includes("pdf") ? <FileText size={12} /> : <ImageIcon size={12} />}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium">{cert.title}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-tag" style={{ fontSize: 11 }}>{cert.category}</span>
                  </td>
                  <td className="text-[13px]">{cert.organization}</td>
                  <td><StatusBadge status={cert.status} /></td>
                  <td className="text-[12px]" style={{ color: "var(--admin-ink-muted)" }}>
                    {new Date(cert.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {cert.status === "draft" && (
                        <button onClick={() => updateStatus(cert.id, "published")} className="admin-btn admin-btn-ghost admin-btn-sm">
                          <Globe size={12} />
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(cert)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      <AdminModal
        open={showUpload}
        onClose={resetUploadFlow}
        onCloseAttempt={handleCloseAttempt}
        preventClose={!!uploadedFile}
        title={step === "reviewing" ? "Review AI Analysis" : "Upload Certificate"}
        maxWidth={step === "reviewing" ? "720px" : "520px"}
      >
        {step === "idle" || step === "uploading" ? (
          <UploadZone
            bucket="certificates"
            folder="uploads"
            onUploadComplete={handleUploadComplete}
            label="Drop certificate here (PDF, PNG, JPEG, WEBP)"
          />
        ) : step === "analyzing" ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={32} className="animate-spin mb-4" style={{ color: "var(--admin-accent)" }} />
            <p className="text-[14px] font-semibold" style={{ color: "var(--admin-ink)" }}>
              AI is analyzing your certificate…
            </p>
            <p className="text-[12px] mt-1" style={{ color: "var(--admin-ink-muted)" }}>
              Extracting title, organization, skills, and more
            </p>
          </div>
        ) : step === "reviewing" && aiAnalysis ? (
          <AIReviewPanel
            analysis={aiAnalysis}
            onAccept={handleAcceptAI}
            onReject={resetUploadFlow}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
          />
        ) : step === "saving" ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={32} className="animate-spin mb-4" style={{ color: "var(--admin-accent)" }} />
            <p className="text-[14px] font-semibold" style={{ color: "var(--admin-ink)" }}>
              Saving certificate…
            </p>
          </div>
        ) : null}
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Certificate"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
      />

      <ConfirmDialog 
        open={showCloseConfirm} 
        onClose={() => setShowCloseConfirm(false)} 
        onConfirm={() => {
          setShowCloseConfirm(false);
          resetUploadFlow();
        }} 
        title="Discard Upload?" 
        message="You have an unsaved certificate analysis. Are you sure you want to discard it?" 
        confirmLabel="Discard"
        variant="danger"
      />
    </div>
  );
}
