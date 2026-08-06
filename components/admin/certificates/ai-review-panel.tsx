"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, RefreshCw, Sparkles, Pencil, Loader2,
  AlertTriangle, ArrowRight, Copy, Shield, Clock, Target,
  BookOpen, Linkedin, FileText, Briefcase, ChevronDown, ChevronUp,
  Plus,
} from "lucide-react";
import type { CertificateAnalysis } from "@/lib/ai/schemas";
import {
  CERTIFICATE_CATEGORIES, CERTIFICATE_TYPES, EVENT_TYPES,
  DIFFICULTY_LEVELS, IMPORTANCE_LEVELS, CREDIBILITY_LEVELS,
} from "@/lib/admin/constants";
import { toast } from "sonner";
import { SupportingImagesManager } from "./supporting-images-manager";

interface SupportingImage {
  id?: string;
  image_url: string;
  image_public_id?: string;
  image_type: string;
  caption: string;
  sort_order: number;
}

interface AIReviewPanelProps {
  analysis: CertificateAnalysis;
  analysisStatus: "success" | "partial" | "fallback";
  confidence: number;
  onAccept: (data: CertificateAnalysis, supportingImages: SupportingImage[]) => void;
  onReject: () => void;
  onRegenerate: () => void;
  regenerating?: boolean;
  ocrText?: string | null;
  fileUrl?: string;
  fileType?: string;
}

export function AIReviewPanel({
  analysis,
  analysisStatus,
  confidence,
  onAccept,
  onReject,
  onRegenerate,
  regenerating = false,
  ocrText,
  fileUrl,
  fileType,
}: AIReviewPanelProps) {
  const [editedData, setEditedData] = useState<CertificateAnalysis>(analysis);
  const [editMode, setEditMode] = useState(analysisStatus === "fallback");
  const [supportingImages, setSupportingImages] = useState<SupportingImage[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    details: true,
    generated: false,
    metadata: false,
    supporting: false,
  });

  function updateField(field: keyof CertificateAnalysis, value: unknown) {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  }

  // Add chip to array field
  function addChip(field: "skills" | "technologies" | "tags" | "keywords", value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = editedData[field] as string[];
    if (!current.includes(trimmed)) {
      updateField(field, [...current, trimmed]);
    }
  }

  function removeChip(field: "skills" | "technologies" | "tags" | "keywords", index: number) {
    const current = editedData[field] as string[];
    updateField(field, current.filter((_, i) => i !== index));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col max-h-[80vh]"
    >
      {/* Header with confidence */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: "1px solid var(--admin-line)" }}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={16} style={{ color: "var(--admin-accent)" }} />
          <div>
            <h3
              className="text-[14px] font-semibold"
              style={{ color: "var(--admin-ink)" }}
            >
              {analysisStatus === "fallback"
                ? "Manual Review Required"
                : "AI Analysis Review"}
            </h3>
            <p
              className="text-[11px]"
              style={{ color: "var(--admin-ink-muted)" }}
            >
              {analysisStatus === "fallback"
                ? "Please fill in the details manually"
                : "Review and edit the extracted information"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence badge */}
          <ConfidenceBadge confidence={confidence} />

          <button
            onClick={() => setEditMode(!editMode)}
            className="admin-btn admin-btn-ghost admin-btn-sm"
          >
            <Pencil size={12} />
            {editMode ? "Preview" : "Edit"}
          </button>
        </div>
      </div>

      {/* Fallback warning */}
      {analysisStatus === "fallback" && (
        <div
          className="flex items-start gap-3 p-3 mx-4 mt-3 rounded-xl"
          style={{ background: "var(--admin-warning-soft)" }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "var(--admin-warning)", marginTop: 2, flexShrink: 0 }}
          />
          <div>
            <p
              className="text-[13px] font-semibold"
              style={{ color: "var(--admin-warning)" }}
            >
              Automatic extraction incomplete
            </p>
            <p
              className="text-[12px]"
              style={{ color: "var(--admin-ink-secondary)" }}
            >
              We couldn&apos;t automatically extract all information. Please
              review and edit the detected details below.
            </p>
          </div>
        </div>
      )}

      {/* Category review warning */}
      {editedData.requiresCategoryReview && analysisStatus !== "fallback" && (
        <div
          className="flex items-start gap-3 p-3 mx-4 mt-3 rounded-xl"
          style={{ background: "var(--admin-warning-soft)" }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "var(--admin-warning)", marginTop: 2, flexShrink: 0 }}
          />
          <div>
            <p
              className="text-[13px] font-semibold"
              style={{ color: "var(--admin-warning)" }}
            >
              Category needs review
            </p>
            <p className="text-[12px]" style={{ color: "var(--admin-ink-secondary)" }}>
              AI confidence: {Math.round(editedData.categoryConfidence * 100)}%.
              Please verify the category.
            </p>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Section: Core Info */}
        <CollapsibleSection
          title="Core Information"
          expanded={expandedSections.core}
          onToggle={() => toggleSection("core")}
        >
          <div className="space-y-3">
            <FieldRow
              label="Title"
              value={editedData.title}
              editMode={editMode}
              onChange={(v) => updateField("title", v)}
            />
            <FieldRow
              label="Organization"
              value={editedData.organization}
              editMode={editMode}
              onChange={(v) => updateField("organization", v)}
            />
            <FieldRow
              label="Participant Name"
              value={editedData.participantName || ""}
              editMode={editMode}
              onChange={(v) => updateField("participantName", v || null)}
              placeholder="Not detected"
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="admin-field">
                <label className="admin-label">Category</label>
                {editMode ? (
                  <select
                    className="admin-input admin-select text-[12px]"
                    value={editedData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {CERTIFICATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="admin-badge admin-badge-published">
                      {editedData.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Certificate Type */}
              <div className="admin-field">
                <label className="admin-label">Type</label>
                {editMode ? (
                  <select
                    className="admin-input admin-select text-[12px]"
                    value={editedData.certificateType || ""}
                    onChange={(e) => updateField("certificateType", e.target.value || null)}
                  >
                    <option value="">Auto-detect</option>
                    {CERTIFICATE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[13px] capitalize" style={{ color: "var(--admin-ink-secondary)" }}>
                    {editedData.certificateType || "—"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow
                label="Issue Date"
                value={editedData.issueDate || ""}
                editMode={editMode}
                onChange={(v) => updateField("issueDate", v || null)}
                placeholder="Not detected"
                type="date"
              />
              <FieldRow
                label="Expiry Date"
                value={editedData.expiryDate || ""}
                editMode={editMode}
                onChange={(v) => updateField("expiryDate", v || null)}
                placeholder="None"
                type="date"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow
                label="Certificate Number"
                value={editedData.certificateNumber || ""}
                editMode={editMode}
                onChange={(v) => updateField("certificateNumber", v || null)}
                placeholder="Not detected"
              />
              <FieldRow
                label="Location"
                value={editedData.location || ""}
                editMode={editMode}
                onChange={(v) => updateField("location", v || null)}
                placeholder="Not detected"
              />
            </div>

            <FieldRow
              label="Description"
              value={editedData.description}
              editMode={editMode}
              multiline
              onChange={(v) => updateField("description", v)}
            />
          </div>
        </CollapsibleSection>

        {/* Section: Details */}
        <CollapsibleSection
          title="Skills, Technologies & Tags"
          expanded={expandedSections.details}
          onToggle={() => toggleSection("details")}
        >
          <div className="space-y-3">
            <ChipField
              label="Skills"
              chips={editedData.skills}
              editMode={editMode}
              onAdd={(v) => addChip("skills", v)}
              onRemove={(i) => removeChip("skills", i)}
            />
            <ChipField
              label="Technologies"
              chips={editedData.technologies}
              editMode={editMode}
              onAdd={(v) => addChip("technologies", v)}
              onRemove={(i) => removeChip("technologies", i)}
            />
            <ChipField
              label="Tags"
              chips={editedData.tags}
              editMode={editMode}
              onAdd={(v) => addChip("tags", v)}
              onRemove={(i) => removeChip("tags", i)}
            />

            <div className="grid grid-cols-2 gap-3">
              <FieldRow
                label="Achievement"
                value={editedData.achievement || ""}
                editMode={editMode}
                onChange={(v) => updateField("achievement", v || null)}
                placeholder="e.g., First Place"
              />
              <FieldRow
                label="Position/Rank"
                value={editedData.position || ""}
                editMode={editMode}
                onChange={(v) => updateField("position", v || null)}
                placeholder="e.g., Winner"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section: Generated Content */}
        <CollapsibleSection
          title="Generated Content"
          expanded={expandedSections.generated}
          onToggle={() => toggleSection("generated")}
          badge={<Sparkles size={10} style={{ color: "var(--admin-accent)" }} />}
        >
          <div className="space-y-3">
            <GeneratedContentCard
              icon={<Briefcase size={12} />}
              label="Resume Summary"
              value={editedData.resumeSummary || ""}
              editMode={editMode}
              onChange={(v) => updateField("resumeSummary", v || null)}
              onCopy={() => copyToClipboard(editedData.resumeSummary || "", "Resume summary")}
            />
            <GeneratedContentCard
              icon={<Linkedin size={12} />}
              label="LinkedIn Description"
              value={editedData.linkedinSummary || ""}
              editMode={editMode}
              onChange={(v) => updateField("linkedinSummary", v || null)}
              onCopy={() => copyToClipboard(editedData.linkedinSummary || "", "LinkedIn description")}
            />
            <GeneratedContentCard
              icon={<FileText size={12} />}
              label="Portfolio Summary"
              value={editedData.portfolioSummary || ""}
              editMode={editMode}
              onChange={(v) => updateField("portfolioSummary", v || null)}
              onCopy={() => copyToClipboard(editedData.portfolioSummary || "", "Portfolio summary")}
            />
            <GeneratedContentCard
              icon={<BookOpen size={12} />}
              label="Reflection"
              value={editedData.reflection || ""}
              editMode={editMode}
              onChange={(v) => updateField("reflection", v || null)}
              onCopy={() => copyToClipboard(editedData.reflection || "", "Reflection")}
            />
            <FieldRow
              label="Professional Summary"
              value={editedData.professionalSummary}
              editMode={editMode}
              multiline
              onChange={(v) => updateField("professionalSummary", v)}
            />
          </div>
        </CollapsibleSection>

        {/* Section: AI Metadata */}
        <CollapsibleSection
          title="AI Metadata"
          expanded={expandedSections.metadata}
          onToggle={() => toggleSection("metadata")}
          badge={<Target size={10} style={{ color: "var(--admin-ink-muted)" }} />}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="admin-field">
                <label className="admin-label">Difficulty</label>
                {editMode ? (
                  <select
                    className="admin-input admin-select text-[12px]"
                    value={editedData.difficulty || ""}
                    onChange={(e) => updateField("difficulty", e.target.value || null)}
                  >
                    <option value="">—</option>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[12px] capitalize" style={{ color: "var(--admin-ink-secondary)" }}>
                    {editedData.difficulty || "—"}
                  </p>
                )}
              </div>
              <div className="admin-field">
                <label className="admin-label">Importance</label>
                {editMode ? (
                  <select
                    className="admin-input admin-select text-[12px]"
                    value={editedData.importance || ""}
                    onChange={(e) => updateField("importance", e.target.value || null)}
                  >
                    <option value="">—</option>
                    {IMPORTANCE_LEVELS.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[12px] capitalize" style={{ color: "var(--admin-ink-secondary)" }}>
                    {editedData.importance || "—"}
                  </p>
                )}
              </div>
              <div className="admin-field">
                <label className="admin-label">Credibility</label>
                {editMode ? (
                  <select
                    className="admin-input admin-select text-[12px]"
                    value={editedData.credibility || "unknown"}
                    onChange={(e) => updateField("credibility", e.target.value)}
                  >
                    {CREDIBILITY_LEVELS.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <CredibilityBadge value={editedData.credibility} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow
                label="Domain"
                value={editedData.domain || ""}
                editMode={editMode}
                onChange={(v) => updateField("domain", v || null)}
                placeholder="e.g., Software Engineering"
              />
              <FieldRow
                label="Subdomain"
                value={editedData.subdomain || ""}
                editMode={editMode}
                onChange={(v) => updateField("subdomain", v || null)}
                placeholder="e.g., Web Development"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow
                label="Competition Level"
                value={editedData.competitionLevel || ""}
                editMode={editMode}
                onChange={(v) => updateField("competitionLevel", v || null)}
                placeholder="e.g., National"
              />
              <FieldRow
                label="Estimated Hours"
                value={String(editedData.estimatedHours || "")}
                editMode={editMode}
                onChange={(v) => updateField("estimatedHours", v ? parseInt(v) : null)}
                placeholder="e.g., 40"
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow
                label="Event Type"
                value={editedData.eventType || ""}
                editMode={editMode}
                onChange={(v) => updateField("eventType", v || null)}
              />
              <FieldRow
                label="SEO Title"
                value={editedData.seoTitle}
                editMode={editMode}
                onChange={(v) => updateField("seoTitle", v)}
              />
            </div>
            <FieldRow
              label="SEO Description"
              value={editedData.seoDescription}
              editMode={editMode}
              multiline
              onChange={(v) => updateField("seoDescription", v)}
            />
          </div>
        </CollapsibleSection>

        {/* Section: Supporting Images */}
        <CollapsibleSection
          title="Supporting Images"
          expanded={expandedSections.supporting}
          onToggle={() => toggleSection("supporting")}
        >
          <SupportingImagesManager
            images={supportingImages}
            onChange={setSupportingImages}
          />
        </CollapsibleSection>
      </div>

      {/* Actions bar */}
      <div
        className="flex items-center gap-2 p-4"
        style={{ borderTop: "1px solid var(--admin-line)" }}
      >
        <button onClick={onReject} className="admin-btn admin-btn-secondary">
          <X size={14} /> Discard
        </button>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="admin-btn admin-btn-secondary"
        >
          {regenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Re-analyze
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onAccept(editedData, supportingImages)}
          className="admin-btn admin-btn-primary"
        >
          <Check size={14} /> Save Certificate
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ---- Confidence Badge ---- */
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    confidence >= 0.8
      ? "var(--admin-success)"
      : confidence >= 0.5
        ? "var(--admin-warning)"
        : "var(--admin-danger)";
  const bg =
    confidence >= 0.8
      ? "var(--admin-success-soft)"
      : confidence >= 0.5
        ? "var(--admin-warning-soft)"
        : "var(--admin-danger-soft)";

  return (
    <span
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
      style={{ background: bg, color }}
      title={`AI confidence: ${pct}%`}
    >
      <Shield size={10} />
      {pct}%
    </span>
  );
}

/* ---- Credibility Badge ---- */
function CredibilityBadge({ value }: { value: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    verified: { bg: "var(--admin-success-soft)", color: "var(--admin-success)" },
    unverified: { bg: "var(--admin-warning-soft)", color: "var(--admin-warning)" },
    unknown: { bg: "var(--admin-bg-hover)", color: "var(--admin-ink-muted)" },
  };
  const s = styles[value] || styles.unknown;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      <Shield size={9} /> {value}
    </span>
  );
}

/* ---- Collapsible Section ---- */
function CollapsibleSection({
  title,
  expanded,
  onToggle,
  badge,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--admin-line)" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        style={{ background: "var(--admin-bg-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[12px] font-semibold"
            style={{ color: "var(--admin-ink)" }}
          >
            {title}
          </span>
          {badge}
        </div>
        {expanded ? (
          <ChevronUp size={14} style={{ color: "var(--admin-ink-muted)" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "var(--admin-ink-muted)" }} />
        )}
      </button>
      {expanded && <div className="p-3">{children}</div>}
    </div>
  );
}

/* ---- Generated Content Card ---- */
function GeneratedContentCard({
  icon,
  label,
  value,
  editMode,
  onChange,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editMode: boolean;
  onChange: (v: string) => void;
  onCopy: () => void;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "var(--admin-bg-subtle)",
        border: "1px solid var(--admin-line)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ color: "var(--admin-accent)" }}>{icon}</span>
          <span
            className="text-[11px] font-semibold"
            style={{ color: "var(--admin-ink)" }}
          >
            {label}
          </span>
        </div>
        {value && (
          <button
            onClick={onCopy}
            className="admin-btn admin-btn-ghost admin-btn-sm"
            style={{ fontSize: 10, padding: "2px 6px" }}
          >
            <Copy size={10} /> Copy
          </button>
        )}
      </div>
      {editMode ? (
        <textarea
          className="admin-input admin-textarea text-[12px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={`AI-generated ${label.toLowerCase()}…`}
        />
      ) : (
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: value ? "var(--admin-ink-secondary)" : "var(--admin-ink-muted)" }}
        >
          {value || "Not generated"}
        </p>
      )}
    </div>
  );
}

/* ---- Chip Field ---- */
function ChipField({
  label,
  chips,
  editMode,
  onAdd,
  onRemove,
}: {
  label: string;
  chips: string[];
  editMode: boolean;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAdd(input);
      setInput("");
    }
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <span key={i} className="admin-tag">
            {chip}
            {editMode && (
              <button onClick={() => onRemove(i)} className="admin-tag-remove">
                <X size={10} />
              </button>
            )}
          </span>
        ))}
        {editMode && (
          <div className="flex items-center gap-1">
            <input
              className="admin-input text-[11px]"
              style={{
                width: 100,
                padding: "3px 8px",
                height: "auto",
              }}
              placeholder={`Add ${label.toLowerCase()}…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => {
                onAdd(input);
                setInput("");
              }}
              className="admin-btn admin-btn-ghost"
              style={{ padding: "3px 6px" }}
            >
              <Plus size={10} />
            </button>
          </div>
        )}
      </div>
      {chips.length === 0 && !editMode && (
        <p className="text-[11px] mt-1" style={{ color: "var(--admin-ink-muted)" }}>
          None detected
        </p>
      )}
    </div>
  );
}

/* ---- Field Row Helper ---- */
function FieldRow({
  label,
  value,
  editMode,
  multiline,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  editMode: boolean;
  multiline?: boolean;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  if (editMode) {
    return (
      <div className="admin-field">
        <label className="admin-label">{label}</label>
        {multiline ? (
          <textarea
            className="admin-input admin-textarea text-[12px]"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            rows={3}
            placeholder={placeholder}
          />
        ) : (
          <input
            className="admin-input text-[12px]"
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <p
        className="text-[13px] leading-relaxed"
        style={{
          color: value && value !== "Not detected"
            ? "var(--admin-ink-secondary)"
            : "var(--admin-ink-muted)",
        }}
      >
        {value || placeholder || "—"}
      </p>
    </div>
  );
}
