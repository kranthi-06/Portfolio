"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";
import type { Project } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { ProjectModal } from "./project-modal";
import { SafeImage } from "../ui/safe-image";
import { clsx } from "clsx";

export function Projects({ items }: { items?: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  
  if (!Array.isArray(items)) return null;

  const published = items.filter((p) => p.status === "published");

  return (
    <section id="projects" className="relative py-32 bg-background-elevated/50">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="01"
          eyebrow="Selected Work"
          title="Case Studies."
          body="End-to-end products and experiments — from concept to production, crafted with precision."
        />

        {published.length > 0 ? (
          <div className="flex flex-col gap-24 md:gap-32 mt-20">
            {published.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.8,
                  delay: Math.min(index * 0.1, 0.2),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={clsx(
                  "group relative flex flex-col gap-10 md:gap-16 items-center",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Image / Visuals */}
                <button
                  onClick={() => setSelected(project)}
                  className={clsx(
                    "relative w-full md:w-1/2 overflow-hidden rounded-2xl bg-background border border-line cursor-pointer block shrink-0 shadow-sm transition-all duration-500 hover:shadow-xl",
                    project.featured ? "aspect-[16/10]" : "aspect-[4/3]"
                  )}
                >
                  {project.image_url ? (
                    <SafeImage
                      src={project.image_url}
                      alt={project.title}
                      priority={index < 2}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted bg-background-subtle">
                      <Sparkles size={40} className="opacity-20" />
                    </div>
                  )}

                  {/* Elegant Hover Overlay */}
                  <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/95 text-ink text-[11px] font-semibold tracking-wide transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-md">
                      Read Case Study <ArrowUpRight size={14} />
                    </span>
                  </div>
                </button>

                {/* Content */}
                <div className="flex-1 flex flex-col items-start w-full">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.2em]">
                      {project.category ?? "Engineering"}
                    </span>
                    {project.featured && (
                      <span className="px-2 py-1 rounded-sm bg-ink text-[10px] font-bold text-background uppercase tracking-widest shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-ink mb-4 group-hover:text-ink-secondary transition-colors duration-300">
                    {project.title}
                  </h3>

                  {project.subtitle && (
                    <p className="text-lg font-serif italic text-ink-secondary mb-6 tracking-wide">
                      {project.subtitle}
                    </p>
                  )}

                  {project.description && (
                    <p className="text-[15px] text-ink-secondary/90 leading-relaxed mb-8 max-w-lg">
                      {project.description}
                    </p>
                  )}

                  {/* Tech stack pills */}
                  {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded-full bg-background border border-line text-[11px] font-medium text-ink-muted">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-3 py-1 rounded-full bg-background border border-line text-[11px] font-medium text-ink-muted">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 mt-auto">
                    <button
                      onClick={() => setSelected(project)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-secondary transition-colors duration-300 border-b border-ink/20 pb-1 hover:border-ink"
                    >
                      View details <ArrowUpRight size={14} />
                    </button>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink-muted hover:text-ink hover:border-line-strong hover:bg-background transition-all duration-300"
                        aria-label="View live site"
                      >
                        <ExternalLink size={16} strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background-subtle/50">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Case studies will appear here soon.</p>
          </div>
        )}
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
