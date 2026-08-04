"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github } from "lucide-react";
import type { Project } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";

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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="min-h-full flex items-start justify-center p-4 sm:p-8 md:p-16">
            <motion.article
              initial={{ opacity: 0, y: 80, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 200,
              }}
              className="relative w-full max-w-4xl bg-background-elevated rounded-3xl shadow-xl border border-line overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-ink hover:bg-background border border-line transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Hero Image */}
              {project.image_url && (
                <div className="relative w-full aspect-[16/8] bg-background-subtle overflow-hidden">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-elevated via-transparent to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="relative px-8 sm:px-12 md:px-16 pb-16 pt-8 -mt-16">
                {/* Category */}
                <div className="inline-flex items-center gap-3 mb-5 text-ink-muted text-[11px] font-semibold uppercase tracking-[0.15em]">
                  <span className="w-2 h-2 rounded-full bg-accent shadow-glow" />
                  {project.category ?? "Project"}
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium tracking-[-0.04em] text-ink mb-4 text-balance leading-[0.95]">
                  {project.title}
                </h3>

                {(project.long_description ?? project.description) && (
                  <p className="text-lg text-ink-secondary leading-relaxed max-w-2xl mb-10 text-balance">
                    {project.long_description ?? project.description}
                  </p>
                )}

                {/* Action Buttons */}
                {(project.live_url || project.github_url) && (
                  <div className="flex flex-wrap gap-3 mb-14">
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MagneticButton variant="primary">
                          Live demo <ExternalLink size={15} />
                        </MagneticButton>
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MagneticButton variant="outline">
                          Source code <Github size={15} />
                        </MagneticButton>
                      </a>
                    )}
                  </div>
                )}

                {/* Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
                  {[
                    { title: "The Challenge", content: project.problem },
                    { title: "The Solution", content: project.solution },
                    { title: "Architecture", content: project.architecture },
                  ].map(({ title, content }) =>
                    content ? (
                      <div
                        key={title}
                        className="p-6 rounded-2xl bg-background-subtle border border-line"
                      >
                        <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-3">
                          {title}
                        </h4>
                        <p className="text-sm text-ink-secondary leading-relaxed">
                          {content}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Features & Tech */}
                <div className="grid md:grid-cols-2 gap-12">
                  {project.features.length > 0 && (
                    <div>
                      <h4 className="text-lg font-display font-medium text-ink mb-6">
                        Key Features
                      </h4>
                      <ul className="space-y-4">
                        {project.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-ink-secondary leading-relaxed"
                          >
                            <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-gradient-to-br from-accent to-accent-secondary" />
                            <span className="flex-1">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.technologies.length > 0 && (
                    <div>
                      <h4 className="text-lg font-display font-medium text-ink mb-6">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3.5 py-1.5 rounded-full bg-background border border-line text-xs font-medium text-ink-secondary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
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
