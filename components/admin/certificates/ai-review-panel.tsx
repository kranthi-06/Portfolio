"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, RefreshCw, Sparkles, Pencil, Minus, Plus,
  ArrowRight, Loader2, AlertTriangle,
} from "lucide-react";
import type { CertificateAnalysis } from "@/lib/ai/schemas";
import { CERTIFICATE_CATEGORIES } from "@/lib/admin/constants";
import { toast } from "sonner";
import { AIAssistantField } from "@/components/admin/ui/ai-assistant-field";

interface AIReviewPanelProps {
  analysis: CertificateAnalysis;
  onAccept: (data: CertificateAnalysis) => void;
  onReject: () => void;
  onRegenerate: () => void;
  regenerating?: boolean;
}

export function AIReviewPanel({
  analysis,
  onAccept,
  onReject,
  onRegenerate,
  regenerating = false,
}: AIReviewPanelProps) {
  const [editedData, setEditedData] = useState<CertificateAnalysis>(analysis);
  const [editMode, setEditMode] = useState(false);
  const [improvingField, setImprovingField] = useState<string | null>(null);

  function updateField(field: keyof CertificateAnalysis, value: unknown) {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  }

  async function improveField(field: string, text: string) {
    setImprovingField(field);
    try {
      const res = await fetch("/api/admin/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action: "improve", context: "certificate metadata" }),
      });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      updateField(field as keyof CertificateAnalysis, data.result);
      toast.success(`${field} improved by AI`);
    } catch {
      toast.error("AI improvement failed");
    } finally {
      setImprovingField(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card"
    >
      <div className="admin-card-header">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: "var(--admin-accent)" }} />
          <h3 className="admin-card-title">AI Analysis Review</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditMode(!editMode)}
            className="admin-btn admin-btn-ghost admin-btn-sm"
          >
            <Pencil size={12} />
            {editMode ? "Preview" : "Edit"}
          </button>
        </div>
      </div>

      <div className="admin-card-body space-y-4">
        {/* Category Review Warning */}
        {editedData.requiresCategoryReview && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: "var(--admin-warning-soft)" }}
          >
            <AlertTriangle size={16} style={{ color: "var(--admin-warning)", marginTop: 2 }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--admin-warning)" }}>
                Category needs review
              </p>
              <p className="text-[12px]" style={{ color: "var(--admin-ink-secondary)" }}>
                AI confidence: {Math.round(editedData.categoryConfidence * 100)}%. Please verify the category.
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <FieldRow
          label="Title"
          value={editedData.title}
          editMode={editMode}
          onChange={(v) => updateField("title", v)}
          onImprove={() => improveField("title", editedData.title)}
          improving={improvingField === "title"}
        />

        {/* Organization */}
        <FieldRow
          label="Organization"
          value={editedData.organization}
          editMode={editMode}
          onChange={(v) => updateField("organization", v)}
        />

        {/* Category */}
        <div className="admin-field">
          <label className="admin-label">Category</label>
          {editMode ? (
            <select
              className="admin-input admin-select"
              value={editedData.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              {CERTIFICATE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <span className="admin-badge admin-badge-published">{editedData.category}</span>
              <span className="text-[11px]" style={{ color: "var(--admin-ink-muted)" }}>
                {Math.round(editedData.categoryConfidence * 100)}% confidence
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <FieldRow
          label="Description"
          value={editedData.description}
          editMode={editMode}
          multiline
          onChange={(v) => updateField("description", v)}
          onImprove={() => improveField("description", editedData.description)}
          improving={improvingField === "description"}
        />

        {/* Professional Summary */}
        <FieldRow
          label="Professional Summary"
          value={editedData.professionalSummary}
          editMode={editMode}
          multiline
          onChange={(v) => updateField("professionalSummary", v)}
          onImprove={() => improveField("professionalSummary", editedData.professionalSummary)}
          improving={improvingField === "professionalSummary"}
        />

        {/* Issue Date & Credential ID */}
        <div className="grid grid-cols-2 gap-4">
          <FieldRow
            label="Issue Date"
            value={editedData.issueDate || "Not detected"}
            editMode={editMode}
            onChange={(v) => updateField("issueDate", v)}
          />
          <FieldRow
            label="Credential ID"
            value={editedData.credentialId || "Not detected"}
            editMode={editMode}
            onChange={(v) => updateField("credentialId", v)}
          />
        </div>

        {/* Skills */}
        <div className="admin-field">
          <label className="admin-label">Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {editedData.skills.map((skill, i) => (
              <span key={i} className="admin-tag">
                {skill}
                {editMode && (
                  <button
                    onClick={() => updateField("skills", editedData.skills.filter((_, idx) => idx !== i))}
                    className="admin-tag-remove"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="admin-field">
          <label className="admin-label">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {editedData.tags.map((tag, i) => (
              <span key={i} className="admin-tag">
                {tag}
                {editMode && (
                  <button
                    onClick={() => updateField("tags", editedData.tags.filter((_, idx) => idx !== i))}
                    className="admin-tag-remove"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* SEO */}
        <FieldRow
          label="SEO Title"
          value={editedData.seoTitle}
          editMode={editMode}
          onChange={(v) => updateField("seoTitle", v)}
        />
        <FieldRow
          label="SEO Description"
          value={editedData.seoDescription}
          editMode={editMode}
          multiline
          onChange={(v) => updateField("seoDescription", v)}
        />
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 p-4"
        style={{ borderTop: "1px solid var(--admin-line)" }}
      >
        <button onClick={onReject} className="admin-btn admin-btn-secondary">
          <X size={14} /> Reject
        </button>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="admin-btn admin-btn-secondary"
        >
          {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Regenerate
        </button>
        <div className="flex-1" />
        <button onClick={() => onAccept(editedData)} className="admin-btn admin-btn-primary">
          <Check size={14} /> Accept & Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ---- Field Row Helper ---- */
function FieldRow({
  label, value, editMode, multiline, onChange, onImprove, improving,
}: {
  label: string;
  value: string;
  editMode: boolean;
  multiline?: boolean;
  onChange?: (v: string) => void;
  onImprove?: () => void;
  improving?: boolean;
}) {
  if (editMode) {
    return (
      <div className="admin-field">
        <div className="flex items-center justify-between">
          <label className="admin-label">{label}</label>
          {onImprove && (
            <button
              onClick={onImprove}
              disabled={improving}
              className="admin-btn admin-btn-ghost admin-btn-sm"
              style={{ fontSize: 11, padding: "3px 8px" }}
            >
              {improving ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              Improve with AI
            </button>
          )}
        </div>
        {multiline ? (
          <AIAssistantField value={value} onChange={(v) => onChange?.(v)}>
            <textarea
              className="admin-input admin-textarea"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              rows={3}
            />
          </AIAssistantField>
        ) : (
          <AIAssistantField value={value} onChange={(v) => onChange?.(v)}>
            <input
              className="admin-input"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
            />
          </AIAssistantField>
        )}
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--admin-ink-secondary)" }}>
        {value}
      </p>
    </div>
  );
}
