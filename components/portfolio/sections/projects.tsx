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

  return (
    <section id="projects" className="relative py-24 md:py-32 overflow-hidden">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <SectionHeading 
          eyebrow="Selected work" 
          title="Projects, shaped into products." 
          body="A showcase of recent work, featuring end-to-end products and experiments."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {items.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4) }}
                className={clsx(
                  "group relative flex flex-col overflow-hidden rounded-[2rem] bg-background-elevated border border-line glass-card",
                  project.featured && "md:col-span-2 md:flex-row md:items-center"
                )}
              >
                {/* Image Section */}
                <div 
                  className={clsx(
                    "relative overflow-hidden bg-background-subtle",
                    project.featured ? "md:w-3/5 h-64 md:h-[400px]" : "w-full aspect-[4/3] sm:aspect-[16/9]"
                  )}
                  onClick={() => setSelected(project)}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-gradient-1/20 to-gradient-3/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  
                  {project.image_url ? (
                    <img 
                      src={project.image_url} 
                      alt={project.title} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted">
                      <Sparkles size={32} opacity={0.3} />
                    </div>
                  )}

                  {project.featured && (
                    <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-ink border border-line-strong shadow-sm">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div 
                  className={clsx(
                    "relative flex flex-col p-6 sm:p-8 flex-1",
                    project.featured && "md:w-2/5 md:p-12"
                  )}
                >
                  <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">
                    {project.category ?? "Project"}
                  </p>
                  
                  <h3 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight text-ink mb-2">
                    {project.title}
                  </h3>
                  
                  {project.subtitle && (
                    <p className="text-sm font-semibold text-gradient-1 mb-4">
                      {project.subtitle}
                    </p>
                  )}
                  
                  {project.description && (
                    <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-6 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.slice(0, project.featured ? 6 : 4).map((tech) => (
                        <span key={tech} className="px-2.5 py-1 rounded-md bg-background border border-line text-[10px] font-semibold text-ink-muted">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > (project.featured ? 6 : 4) && (
                        <span className="px-2.5 py-1 rounded-md bg-background border border-line text-[10px] font-semibold text-ink-muted">
                          +{project.technologies.length - (project.featured ? 6 : 4)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelected(project)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-gradient-1 transition-colors"
                      >
                        Case study <ArrowUpRight size={16} />
                      </button>
                      
                      {project.live_url && (
                        <a 
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${project.title}`}
                          className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-strong transition-colors ml-auto"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Published projects will appear here.</p>
          </div>
        )}
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
