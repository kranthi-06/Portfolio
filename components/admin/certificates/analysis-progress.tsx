"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, ImageDown, ScanText, Sparkles, CheckCircle2,
  PartyPopper, Loader2, AlertCircle,
} from "lucide-react";

export type AnalysisStep =
  | "upload"
  | "compress"
  | "ocr"
  | "ai_analysis"
  | "validation"
  | "complete";

interface AnalysisProgressProps {
  currentStep: AnalysisStep;
  status: "running" | "completed" | "failed" | "fallback";
  failedStep?: string;
}

const STEPS: { key: AnalysisStep; label: string; icon: React.ElementType }[] = [
  { key: "upload", label: "Uploading File", icon: Upload },
  { key: "compress", label: "Compressing Image", icon: ImageDown },
  { key: "ocr", label: "Extracting Text", icon: ScanText },
  { key: "ai_analysis", label: "Analyzing Certificate", icon: Sparkles },
  { key: "validation", label: "Generating Metadata", icon: CheckCircle2 },
  { key: "complete", label: "Ready for Review", icon: PartyPopper },
];

function getStepIndex(step: AnalysisStep): number {
  return STEPS.findIndex((s) => s.key === step);
}

export function AnalysisProgress({ currentStep, status, failedStep }: AnalysisProgressProps) {
  const currentIdx = getStepIndex(currentStep);

  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* Main spinner / status icon */}
      <AnimatePresence mode="wait">
        {status === "running" ? (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative mb-6"
          >
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--admin-accent)", opacity: 0.15 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--admin-accent-soft)" }}
            >
              <Loader2
                size={28}
                className="animate-spin"
                style={{ color: "var(--admin-accent)" }}
              />
            </div>
          </motion.div>
        ) : status === "completed" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: "var(--admin-success-soft)" }}
          >
            <CheckCircle2 size={28} style={{ color: "var(--admin-success)" }} />
          </motion.div>
        ) : status === "fallback" ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: "var(--admin-warning-soft)" }}
          >
            <AlertCircle size={28} style={{ color: "var(--admin-warning)" }} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Current step label */}
      <motion.p
        key={currentStep}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[15px] font-semibold mb-1"
        style={{ color: "var(--admin-ink)" }}
      >
        {status === "completed"
          ? "Analysis Complete!"
          : status === "fallback"
            ? "Partial Analysis"
            : STEPS[currentIdx]?.label || "Processing..."}
      </motion.p>

      {status === "fallback" && (
        <p
          className="text-[12px] text-center max-w-[300px] mb-4"
          style={{ color: "var(--admin-ink-muted)" }}
        >
          We couldn&apos;t automatically extract all information. Please review
          and edit the detected details.
        </p>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 mt-4">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx || status === "completed";
          const isCurrent = idx === currentIdx && status === "running";
          const isFailed = failedStep === step.key;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.key}
              className="flex items-center"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isCompleted
                    ? "var(--admin-accent)"
                    : isCurrent
                      ? "var(--admin-accent-soft)"
                      : isFailed
                        ? "var(--admin-danger-soft)"
                        : "var(--admin-bg-hover)",
                  color: isCompleted
                    ? "var(--admin-accent-fg, white)"
                    : isCurrent
                      ? "var(--admin-accent)"
                      : isFailed
                        ? "var(--admin-danger)"
                        : "var(--admin-ink-muted)",
                }}
                title={step.label}
              >
                {isCompleted ? (
                  <CheckCircle2 size={12} />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={12} />
                  </motion.div>
                ) : (
                  <Icon size={12} />
                )}
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className="w-4 h-0.5 mx-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: isCompleted
                      ? "var(--admin-accent)"
                      : "var(--admin-bg-hover)",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Step labels below (only visible on wider screens) */}
      <div className="hidden sm:flex items-center gap-1.5 mt-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx || status === "completed";
          const isCurrent = idx === currentIdx && status === "running";

          return (
            <div key={step.key} className="flex items-center">
              <span
                className="text-[9px] font-medium w-7 text-center"
                style={{
                  color: isCompleted || isCurrent
                    ? "var(--admin-ink)"
                    : "var(--admin-ink-muted)",
                }}
              />
              {idx < STEPS.length - 1 && <div className="w-4 mx-0.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
