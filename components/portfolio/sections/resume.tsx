"use client";

import { motion } from "framer-motion";
import { Download, FileText, Sparkles } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";

export function ResumeSection({ resume }: { resume: PortfolioData["resume"] }) {
  return (
    <section id="resume" className="relative py-24 md:py-32">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-12 p-8 md:p-16 rounded-[3rem] bg-gradient-to-br from-gradient-1/10 via-background-elevated to-gradient-3/10 border border-line glass-card"
        >
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-gradient-3/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 max-w-2xl">
            <p className="flex items-center gap-2 mb-4 text-ink-muted text-xs font-extrabold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-1 shadow-glow" />
              Résumé
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-ink tracking-tight leading-none mb-6 text-balance">
              Ready for the full story?
            </h2>
            <p className="text-lg text-ink-secondary leading-relaxed">
              {resume ? `Version ${resume.version} · ${resume.file_name}` : "The current résumé will be available here when uploaded."}
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap items-center gap-4">
            {resume ? (
              <>
                <a href={resume.file_url} target="_blank" rel="noreferrer">
                  <MagneticButton variant="primary">
                    Preview <FileText size={16} />
                  </MagneticButton>
                </a>
                <a href={resume.file_url} download>
                  <MagneticButton variant="outline" className="bg-background">
                    Download <Download size={16} />
                  </MagneticButton>
                </a>
              </>
            ) : (
              <div className="flex items-center gap-3 px-6 py-3 text-sm text-ink-muted border border-dashed border-line-strong rounded-2xl bg-background-subtle">
                <Sparkles size={16} /> A résumé is not available yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
