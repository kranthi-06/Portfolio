"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github } from "lucide-react";
import type { Project } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";
import { SafeImage } from "../ui/safe-image";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.article
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 250,
              }}
              className="relative w-full max-w-5xl bg-background rounded-2xl shadow-2xl border border-line/50 overflow-hidden my-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background border border-line text-ink hover:bg-background-elevated transition-colors duration-300 shadow-sm"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              {/* Hero Image */}
              {project.image_url && (
                <div className="relative w-full aspect-[16/8] md:aspect-[21/9] bg-background-subtle overflow-hidden border-b border-line">
                  <SafeImage
                    src={project.image_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    priority
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative px-6 sm:px-12 md:px-20 pb-24 pt-16">
                {/* Category */}
                <div className="flex items-center gap-4 mb-8 text-ink-muted text-xs font-semibold uppercase tracking-widest">
                  <span>{project.category ?? "Case Study"}</span>
                </div>

                <h3 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-ink mb-6 text-balance leading-[1.1]">
                  {project.title}
                </h3>

                {(project.long_description ?? project.description) && (
                  <p className="text-lg md:text-xl font-serif font-normal text-ink-secondary leading-relaxed max-w-3xl mb-12 text-pretty">
                    {project.long_description ?? project.description}
                  </p>
                )}

                {/* Action Buttons */}
                {(project.live_url || project.github_url) && (
                  <div className="flex flex-wrap gap-4 mb-16 pb-16 border-b border-line/50">
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noreferrer">
                        <MagneticButton variant="primary" className="px-6 py-3 rounded-full bg-ink text-background hover:bg-ink/90 transition-colors flex items-center gap-2 font-medium text-sm">
                          Live demo <ExternalLink size={15} />
                        </MagneticButton>
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noreferrer">
                        <MagneticButton variant="outline" className="px-6 py-3 rounded-full border border-line bg-transparent hover:bg-background-elevated text-ink transition-colors flex items-center gap-2 font-medium text-sm">
                          Source code <Github size={15} />
                        </MagneticButton>
                      </a>
                    )}
                  </div>
                )}

                {/* Typography Prose Layout for Details */}
                <div className="max-w-3xl space-y-16">
                  {project.problem && (
                    <section>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6">
                        The Challenge
                      </h4>
                      <p className="text-base text-ink-secondary leading-relaxed font-body">
                        {project.problem}
                      </p>
                    </section>
                  )}

                  {project.solution && (
                    <section>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6">
                        The Solution
                      </h4>
                      <p className="text-base text-ink-secondary leading-relaxed font-body">
                        {project.solution}
                      </p>
                    </section>
                  )}

                  {project.architecture && (
                    <section>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6">
                        Architecture
                      </h4>
                      <p className="text-base text-ink-secondary leading-relaxed font-body">
                        {project.architecture}
                      </p>
                    </section>
                  )}

                  {Array.isArray(project.features) && project.features.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6">
                        Key Features
                      </h4>
                      <ul className="space-y-4">
                        {project.features.map((feature, i) => (
                          <li key={i} className="flex gap-4 text-base text-ink-secondary leading-relaxed font-body">
                            <span className="flex-shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-ink-muted" />
                            <span className="flex-1">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-[0.2em] mb-6">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="px-3 py-1.5 rounded-md bg-background-elevated border border-line text-[13px] font-medium text-ink-secondary">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </motion.article>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
