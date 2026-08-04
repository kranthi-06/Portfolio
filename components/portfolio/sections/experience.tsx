"use client";

import { motion } from "framer-motion";
import { Building2, Sparkles, MapPin } from "lucide-react";
import type { Experience } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { clsx } from "clsx";

export function Experience({ items }: { items?: Experience[] }) {
  if (!Array.isArray(items)) return null;

  const sortedItems = [...items].sort((a, b) => {
    if (!a.end_date && b.end_date) return -1;
    if (a.end_date && !b.end_date) return 1;
    if (a.end_date && b.end_date) return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
    return 0;
  });

  return (
    <section id="experience" className="relative py-32 bg-background">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="02"
          eyebrow="Career"
          title="Experience."
          body="Professional journey and impactful roles across the industry."
        />

        {sortedItems.length > 0 ? (
          <div className="relative mt-24">
            {/* Minimal Timeline Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[1px] bg-line/50 md:-translate-x-1/2" />

            <div className="flex flex-col gap-16 md:gap-24">
              {sortedItems.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={clsx(
                    "relative flex flex-col md:flex-row md:items-center gap-8 md:gap-16",
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  )}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-[24px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-2 h-2 rounded-full bg-background border-2 border-ink z-10 mt-1 md:mt-0 shadow-[0_0_0_6px_var(--bg)]" />

                  {/* Empty space for alternating layout on desktop */}
                  <div className="hidden md:block w-1/2" />

                  {/* Content Card */}
                  <div className={clsx("pl-16 md:pl-0 w-full md:w-1/2", index % 2 === 0 ? "md:pr-12 lg:pr-16" : "md:pl-12 lg:pl-16")}>
                    <div className="flex flex-col p-8 rounded-2xl bg-background border border-line shadow-sm hover:shadow-md transition-shadow duration-300 group">
                      
                      {/* Date & Location */}
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-background-elevated border border-line text-[11px] font-bold text-ink uppercase tracking-widest shadow-sm">
                          {experience.start_date} — {!experience.end_date ? "Present" : experience.end_date}
                        </span>
                        {experience.location && (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                            <MapPin size={12} strokeWidth={2} /> {experience.location}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-display font-medium text-ink tracking-tight mb-2 group-hover:text-ink-secondary transition-colors">
                        {experience.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-[15px] font-serif italic text-ink-secondary mb-6 pb-6 border-b border-line">
                        <Building2 size={16} className="text-ink-muted" strokeWidth={1.5} />
                        {experience.company}
                      </div>

                      <p className="text-[15px] text-ink-secondary/90 leading-relaxed font-body mb-6">
                        {experience.description}
                      </p>

                      {Array.isArray(experience.technologies) && experience.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {experience.technologies.map((tech) => (
                            <span key={tech} className="px-2.5 py-1 rounded border border-line bg-background text-[11px] font-medium text-ink-muted">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Experience history will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
