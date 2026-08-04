"use client";

import { motion } from "framer-motion";
import { Download, FileText, ArrowUpRight } from "lucide-react";
import type { Resume } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { MagneticButton } from "../ui/magnetic-button";

export function ResumeSection({ data }: { data?: Resume | null }) {
  if (!data?.file_url) return null;

  return (
    <section id="resume" className="relative py-32 bg-background-elevated/30">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="09"
          eyebrow="Resume"
          title="Curriculum Vitae."
          body="A comprehensive overview of my professional experience, skills, and education."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col items-center max-w-2xl mx-auto text-center"
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-background border border-line text-ink mb-8 shadow-sm">
            <FileText size={32} strokeWidth={1.5} />
          </div>

          <h3 className="text-2xl font-display font-medium text-ink mb-4">
            Download Full Resume
          </h3>
          
          <p className="text-ink-secondary mb-10 max-w-lg">
            For a detailed breakdown of my professional history, technical skills, and educational background, please download my official CV.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={data.file_url} target="_blank" rel="noreferrer">
              <MagneticButton variant="primary" className="px-8 py-4 rounded-full bg-ink text-background hover:bg-ink/90 transition-colors flex items-center gap-2 font-medium text-sm">
                Download PDF <Download size={16} />
              </MagneticButton>
            </a>
            <a href={data.file_url} target="_blank" rel="noreferrer">
              <MagneticButton variant="outline" className="px-8 py-4 rounded-full border border-line bg-transparent hover:bg-background text-ink transition-colors flex items-center gap-2 font-medium text-sm">
                Open in Browser <ArrowUpRight size={16} />
              </MagneticButton>
            </a>
          </div>

          {data.created_at && (
            <p className="mt-8 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
              Last updated: {new Date(data.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
              })}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
