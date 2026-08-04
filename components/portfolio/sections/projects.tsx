"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";
import type { Project } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { ProjectModal } from "./project-modal";
import { clsx } from "clsx";

export function Projects({ items }: { items: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const published = items.filter((p) => p.status === "published");

  return (
    <section id="projects" className="relative py-[var(--section-gap)]">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="01"
          eyebrow="Selected Work"
          title="Projects I've crafted."
          body="End-to-end products and experiments — from concept to production."
        />

        {published.length > 0 ? (
          <div className="flex flex-col gap-20 md:gap-28">
            {published.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.7,
                  delay: Math.min(index * 0.1, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={clsx(
                  "group",
                  project.featured && "relative"
                )}
              >
                {/* Image */}
                <button
                  onClick={() => setSelected(project)}
                  className={clsx(
                    "relative w-full overflow-hidden rounded-2xl md:rounded-3xl bg-background-subtle border border-line cursor-pointer block",
                    project.featured
                      ? "aspect-[16/8] md:aspect-[16/7]"
                      : "aspect-[16/9]"
                  )}
                >
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      loading={index < 2 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted">
                      <Sparkles size={40} opacity={0.2} />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8 md:p-12">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      View case study <ArrowUpRight size={14} />
                    </span>
                  </div>

                  {project.featured && (
                    <div className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-bold tracking-[0.15em] uppercase text-ink border border-line shadow-sm">
                      Featured
                    </div>
                  )}
                </button>

                {/* Content below image */}
                <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-12">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.15em]">
                        {project.category ?? "Project"}
                      </span>
                      {project.featured && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-ink-muted/40" />
                          <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.15em]">
                            Featured
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-medium tracking-[-0.03em] text-ink mb-2">
                      {project.title}
                    </h3>

                    {project.subtitle && (
                      <p className="text-sm font-medium text-accent mb-3">
                        {project.subtitle}
                      </p>
                    )}

                    {project.description && (
                      <p className="text-base text-ink-secondary leading-relaxed max-w-2xl line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-4 md:pt-8 shrink-0">
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {project.technologies
                        .slice(0, project.featured ? 5 : 4)
                        .map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-full bg-background-subtle border border-line text-[11px] font-medium text-ink-muted"
                          >
                            {tech}
                          </span>
                        ))}
                      {project.technologies.length >
                        (project.featured ? 5 : 4) && (
                        <span className="px-3 py-1 rounded-full bg-background-subtle border border-line text-[11px] font-medium text-ink-muted">
                          +
                          {project.technologies.length -
                            (project.featured ? 5 : 4)}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelected(project)}
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink hover:text-accent transition-colors duration-300"
                      >
                        Details <ArrowUpRight size={15} />
                      </button>
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${project.title}`}
                          className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-muted hover:text-ink hover:border-line-strong transition-all duration-300"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm">Published projects will appear here.</p>
          </div>
        )}
      </div>

      <ProjectModal
        project={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
