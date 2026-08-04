"use client";

import { motion } from "framer-motion";
import { Download, FileText, Sparkles } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";

export function ResumeSection({
  resume,
}: {
  resume: PortfolioData["resume"];
}) {
  return (
    <section id="resume" className="relative py-[var(--section-gap)]">
      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-12 p-10 md:p-16 rounded-3xl border border-line bg-background-elevated"
        >
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent/[0.04] blur-[80px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent-tertiary/[0.03] blur-[60px] rounded-full pointer-events-none translate-y-1/4 -translate-x-1/4" />

          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex items-center gap-3 mb-5 text-ink-muted text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-accent shadow-glow" />
              Résumé
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-ink tracking-[-0.04em] leading-[0.95] mb-5 text-balance">
              Ready for the{" "}
              <span className="font-serif italic font-normal text-ink-secondary">
                full story?
              </span>
            </h2>

            <p className="text-base text-ink-secondary leading-relaxed">
              {resume
                ? `Version ${resume.version} · ${resume.file_name}`
                : "The current résumé will be available here when uploaded."}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            {resume ? (
              <>
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MagneticButton variant="primary">
                    Preview <FileText size={15} />
                  </MagneticButton>
                </a>
                <a href={resume.file_url} download>
                  <MagneticButton variant="outline">
                    Download <Download size={15} />
                  </MagneticButton>
                </a>
              </>
            ) : (
              <div className="flex items-center gap-3 px-5 py-3 text-sm text-ink-muted border border-dashed border-line-strong rounded-full">
                <Sparkles size={15} /> Not available yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
