"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Plus, Search, Grid3X3, List, Loader2,
  Globe, Archive, Trash2, FileText, ImageIcon, Sparkles,
  RefreshCw, Shield, Clock, Eye,
} from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { toast } from "sonner";
import { CERTIFICATE_CATEGORIES } from "@/lib/admin/constants";
import { UploadZone } from "@/components/admin/certificates/upload-zone";
import { AIReviewPanel } from "@/components/admin/certificates/ai-review-panel";
import { AnalysisProgress } from "@/components/admin/certificates/analysis-progress";
import type { AnalysisStep } from "@/components/admin/certificates/analysis-progress";
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
  professional_summary: string;
  category: string;
  issue_date: string;
  credential_id: string;
  credential_url: string;
  file_url: string;
  file_public_id: string;
  file_type: string;
  thumbnail_url: string;
  thumbnail_public_id: string;
  skills: string[];
  technologies: string[];
  tags: string[];
  status: "draft" | "published" | "archived";
  created_at: string;
  ai_generated: boolean;
  confidence: number;
  analysis_status: string;
  achievement: string;
  difficulty: string;
  credibility: string;
}

interface SupportingImage {
  id?: string;
  image_url: string;
  image_public_id?: string;
  image_type: string;
  caption: string;
  sort_order: number;
}

type Step =
  | "idle"
  | "uploading"
  | "analyzing"
  | "reviewing"
  | "saving";

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
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    publicId: string;
    type: string;
  } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<CertificateAnalysis | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<
    "success" | "partial" | "fallback"
  >("success");
  const [analysisConfidence, setAnalysisConfidence] = useState(0);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [currentAnalysisStep, setCurrentAnalysisStep] =
    useState<AnalysisStep>("upload");
  const [analysisProgressStatus, setAnalysisProgressStatus] = useState<
    "running" | "completed" | "failed" | "fallback"
  >("running");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close protection
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  function handleCloseAttempt() {
    if (uploadedFile || step === "analyzing") {
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
        const json = await res.json();
        setCertificates(json.data?.data || []);
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
  function handleUploadComplete(result: {
    url: string;
    publicId?: string;
    fileType: string;
  }) {
    setUploadedFile({
      url: result.url,
      publicId: result.publicId || "",
      type: result.fileType,
    });
    setStep("analyzing");
    setCurrentAnalysisStep("upload");
    setAnalysisProgressStatus("running");
    runAIAnalysis(result.url, result.fileType);
  }

  // Run AI analysis
  async function runAIAnalysis(fileUrl: string, fileType: string) {
    // Simulate progress through steps
    setCurrentAnalysisStep("compress");
    await sleep(300);
    setCurrentAnalysisStep("ocr");
    await sleep(300);
    setCurrentAnalysisStep("ai_analysis");

    try {
      const res = await fetch("/api/admin/certificates/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, fileType }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || "Analysis request failed"
        );
      }

      const { data, message } = await res.json();

      setCurrentAnalysisStep("validation");
      await sleep(200);

      // Check for duplicate
      if (data.duplicate) {
        toast.warning(data.message || "Duplicate certificate detected");
        // Still proceed to review — let user decide
      }

      setAiAnalysis(data.analysis);
      setAnalysisStatus(data.status || "success");
      setAnalysisConfidence(data.confidence || 0);
      setOcrText(data.ocrText || null);
      setFileHash(data.fileHash || null);

      setCurrentAnalysisStep("complete");
      setAnalysisProgressStatus(
        data.status === "fallback" ? "fallback" : "completed"
      );

      // Brief pause on "complete" step before showing review
      await sleep(800);

      setStep("reviewing");

      if (data.status === "fallback") {
        toast.info(
          message ||
            "Partial analysis complete. Please review and fill in missing details."
        );
      } else {
        toast.success("AI analysis complete!");
      }
    } catch (err) {
      // NEVER show "AI Analysis Failed" — always go to fallback review
      console.error("[Certificate Analysis]", err);

      setAnalysisProgressStatus("fallback");
      setCurrentAnalysisStep("complete");

      // Build a minimal analysis for fallback
      const fallbackAnalysis: CertificateAnalysis = {
        title: "Untitled Certificate",
        organization: "Unknown",
        participantName: null,
        certificateNumber: null,
        category: "Certificate",
        categoryConfidence: 0,
        requiresCategoryReview: true,
        certificateType: null,
        eventType: null,
        description: "",
        achievement: null,
        position: null,
        location: null,
        issueDate: null,
        expiryDate: null,
        skills: [],
        technologies: [],
        tags: [],
        keywords: [],
        professionalSummary: "",
        resumeSummary: null,
        portfolioSummary: null,
        linkedinSummary: null,
        reflection: null,
        seoTitle: "",
        seoDescription: "",
        confidence: 0,
        difficulty: null,
        importance: null,
        credibility: "unknown",
        competitionLevel: null,
        domain: null,
        subdomain: null,
        estimatedHours: null,
      };

      setAiAnalysis(fallbackAnalysis);
      setAnalysisStatus("fallback");
      setAnalysisConfidence(0);

      await sleep(800);
      setStep("reviewing");

      toast.info(
        "We couldn't automatically extract all information. Please review and edit the details."
      );
    }
  }

  // Accept AI output and save
  async function handleAcceptAI(
    data: CertificateAnalysis,
    supportingImages: SupportingImage[]
  ) {
    if (!uploadedFile) return;
    setStep("saving");

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          organization: data.organization,
          participant_name: data.participantName,
          description: data.description,
          professional_summary: data.professionalSummary,
          category: data.category,
          category_confidence: data.categoryConfidence,
          requires_category_review: data.requiresCategoryReview,
          certificate_type: data.certificateType,
          event_type: data.eventType,
          achievement: data.achievement,
          position: data.position,
          location: data.location,
          issue_date: data.issueDate,
          expiry_date: data.expiryDate,
          credential_id: data.certificateNumber,
          file_url: uploadedFile.url,
          file_public_id: uploadedFile.publicId,
          file_type: uploadedFile.type,
          skills: data.skills,
          technologies: data.technologies,
          tags: data.tags,
          keywords: data.keywords,
          resume_summary: data.resumeSummary,
          portfolio_summary: data.portfolioSummary,
          linkedin_summary: data.linkedinSummary,
          reflection: data.reflection,
          confidence: data.confidence,
          difficulty: data.difficulty,
          importance: data.importance,
          credibility: data.credibility,
          competition_level: data.competitionLevel,
          domain: data.domain,
          subdomain: data.subdomain,
          estimated_hours: data.estimatedHours,
          file_hash: fileHash,
          ocr_text: ocrText,
          analysis_status: analysisStatus === "fallback" ? "fallback" : "completed",
          analysis_retries: 0,
          seo_title: data.seoTitle,
          seo_description: data.seoDescription,
          ai_generated: analysisStatus !== "fallback",
          status: "draft",
        }),
      });

      if (!res.ok) throw new Error();

      const { data: savedCert } = await res.json();

      // Save supporting images
      if (supportingImages.length > 0 && savedCert?.id) {
        for (const img of supportingImages) {
          await fetch("/api/admin/certificates/supporting-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              certificate_id: savedCert.id,
              image_url: img.image_url,
              image_public_id: img.image_public_id,
              image_type: img.image_type,
              caption: img.caption,
              sort_order: img.sort_order,
            }),
          }).catch(() => {}); // Don't block save if supporting image fails
        }
      }

      toast.success("Certificate saved as draft!");
      resetUploadFlow();
      fetchCertificates();
    } catch {
      toast.error("Failed to save certificate. Please try again.");
      setStep("reviewing");
    }
  }

  // Regenerate AI analysis
  async function handleRegenerate() {
    if (!uploadedFile) return;
    setRegenerating(true);
    setStep("analyzing");
    setCurrentAnalysisStep("upload");
    setAnalysisProgressStatus("running");
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
      toast.success(
        status === "published" ? "Published!" : `Status → ${status}`
      );
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
      const res = await fetch(
        `/api/admin/certificates?id=${deleteTarget.id}`,
        { method: "DELETE" }
      );
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
    setAnalysisStatus("success");
    setAnalysisConfidence(0);
    setOcrText(null);
    setFileHash(null);
    setCurrentAnalysisStep("upload");
    setAnalysisProgressStatus("running");
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Certificates</h1>
          <p className="admin-page-subtitle">
            {certificates.length} certificates managed
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="admin-btn admin-btn-primary"
        >
          <Plus size={14} /> Upload Certificate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--admin-ink-muted)" }}
          />
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
            <option key={cat} value={cat}>
              {cat}
            </option>
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
            className={`admin-btn admin-btn-icon ${
              view === "grid" ? "admin-btn-primary" : "admin-btn-ghost"
            }`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`admin-btn admin-btn-icon ${
              view === "list" ? "admin-btn-primary" : "admin-btn-ghost"
            }`}
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
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Award size={48} />}
          title="No certificates yet"
          description="Upload your first certificate to get started. AI will analyze and generate metadata automatically."
          action={
            <button
              onClick={() => setShowUpload(true)}
              className="admin-btn admin-btn-primary"
            >
              <Plus size={14} /> Upload Certificate
            </button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {certificates.map((cert, i) => (
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
                    <FileText
                      size={32}
                      style={{ color: "var(--admin-ink-muted)" }}
                    />
                  ) : (
                    <SafeImage
                      useNextImage={true}
                      src={cert.file_url}
                      alt={cert.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {cert.ai_generated && (
                      <span
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold"
                        style={{
                          background: "var(--admin-glass)",
                          backdropFilter: "blur(8px)",
                          color: "var(--admin-accent)",
                        }}
                      >
                        <Sparkles size={10} /> AI
                      </span>
                    )}
                    {cert.confidence > 0 && (
                      <span
                        className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-bold"
                        style={{
                          background: "var(--admin-glass)",
                          backdropFilter: "blur(8px)",
                          color:
                            cert.confidence >= 0.8
                              ? "var(--admin-success)"
                              : cert.confidence >= 0.5
                                ? "var(--admin-warning)"
                                : "var(--admin-danger)",
                        }}
                      >
                        <Shield size={8} />
                        {Math.round(cert.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "var(--admin-ink)" }}
                    >
                      {cert.title}
                    </h3>
                    <StatusBadge status={cert.status} />
                  </div>
                  <p
                    className="text-[12px] mb-2"
                    style={{ color: "var(--admin-ink-muted)" }}
                  >
                    {cert.organization}
                  </p>
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span
                      className="admin-tag"
                      style={{ fontSize: 10, padding: "2px 6px" }}
                    >
                      {cert.category}
                    </span>
                    {cert.achievement && (
                      <span
                        className="admin-tag"
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          background: "var(--admin-accent-soft)",
                          color: "var(--admin-accent)",
                        }}
                      >
                        🏆 {cert.achievement}
                      </span>
                    )}
                    {cert.difficulty && (
                      <span
                        className="text-[9px] font-medium capitalize px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--admin-bg-hover)",
                          color: "var(--admin-ink-muted)",
                        }}
                      >
                        {cert.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Skills preview */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {cert.skills.slice(0, 3).map((skill, si) => (
                        <span
                          key={si}
                          className="text-[9px] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: "var(--admin-bg-hover)",
                            color: "var(--admin-ink-muted)",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > 3 && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: "var(--admin-bg-hover)",
                            color: "var(--admin-ink-muted)",
                          }}
                        >
                          +{cert.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 pt-2"
                    style={{
                      borderTop: "1px solid var(--admin-line)",
                    }}
                  >
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
                <th>Confidence</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: cert.file_type?.includes("pdf")
                            ? "var(--admin-danger-soft)"
                            : "var(--admin-info-soft)",
                          color: cert.file_type?.includes("pdf")
                            ? "var(--admin-danger)"
                            : "var(--admin-info)",
                        }}
                      >
                        {cert.file_type?.includes("pdf") ? (
                          <FileText size={12} />
                        ) : (
                          <ImageIcon size={12} />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium">{cert.title}</p>
                        {cert.ai_generated && (
                          <span className="text-[9px] font-semibold" style={{ color: "var(--admin-accent)" }}>
                            <Sparkles size={8} className="inline mr-0.5" /> AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-tag" style={{ fontSize: 11 }}>
                      {cert.category}
                    </span>
                  </td>
                  <td className="text-[13px]">{cert.organization}</td>
                  <td>
                    {cert.confidence > 0 && (
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color:
                            cert.confidence >= 0.8
                              ? "var(--admin-success)"
                              : cert.confidence >= 0.5
                                ? "var(--admin-warning)"
                                : "var(--admin-danger)",
                        }}
                      >
                        {Math.round(cert.confidence * 100)}%
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={cert.status} />
                  </td>
                  <td
                    className="text-[12px]"
                    style={{ color: "var(--admin-ink-muted)" }}
                  >
                    {new Date(cert.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {cert.status === "draft" && (
                        <button
                          onClick={() => updateStatus(cert.id, "published")}
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                        >
                          <Globe size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(cert)}
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ color: "var(--admin-danger)" }}
                      >
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
        preventClose={!!uploadedFile || step === "analyzing"}
        title={
          step === "reviewing"
            ? "Review Certificate"
            : step === "analyzing"
              ? "Analyzing Certificate"
              : "Upload Certificate"
        }
        maxWidth={step === "reviewing" ? "780px" : "520px"}
      >
        {step === "idle" || step === "uploading" ? (
          <div className="p-4">
            <UploadZone
              bucket="certificates"
              folder="uploads"
              onUploadComplete={handleUploadComplete}
              label="Drop certificate here (PDF, PNG, JPEG, WEBP)"
            />
          </div>
        ) : step === "analyzing" ? (
          <AnalysisProgress
            currentStep={currentAnalysisStep}
            status={analysisProgressStatus}
          />
        ) : step === "reviewing" && aiAnalysis ? (
          <AIReviewPanel
            analysis={aiAnalysis}
            analysisStatus={analysisStatus}
            confidence={analysisConfidence}
            onAccept={handleAcceptAI}
            onReject={resetUploadFlow}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
            ocrText={ocrText}
            fileUrl={uploadedFile?.url}
            fileType={uploadedFile?.type}
          />
        ) : step === "saving" ? (
          <div className="flex flex-col items-center py-8">
            <Loader2
              size={32}
              className="animate-spin mb-4"
              style={{ color: "var(--admin-accent)" }}
            />
            <p
              className="text-[14px] font-semibold"
              style={{ color: "var(--admin-ink)" }}
            >
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
