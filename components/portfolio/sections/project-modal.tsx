"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";
import { clsx } from "clsx";

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-ink/40 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.article
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl bg-background-elevated rounded-[2rem] shadow-2xl border border-line-strong overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background-subtle/80 backdrop-blur-md text-ink hover:bg-background transition-colors border border-line hover:border-line-strong"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Hero Image */}
            <div className="relative w-full h-[35vh] sm:h-[45vh] min-h-[300px] bg-gradient-to-br from-background-subtle to-background overflow-hidden">
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background-elevated via-background-elevated/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative px-6 sm:px-12 md:px-16 pb-16 pt-8 -mt-20">
              <div className="flex items-center gap-2 mb-4 text-ink-muted text-xs font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-1 shadow-glow" />
                {project.category ?? "Project"}
              </div>

              <h3 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-ink mb-6 text-balance">
                {project.title}
              </h3>

              {(project.long_description ?? project.description) && (
                <p className="text-lg md:text-xl text-ink-secondary leading-relaxed max-w-3xl mb-12 text-balance">
                  {project.long_description ?? project.description}
                </p>
              )}

              {/* Action Buttons */}
              {(project.live_url || project.github_url) && (
                <div className="flex flex-wrap gap-4 mb-16">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer">
                      <MagneticButton variant="primary">
                        Live demo <ExternalLink size={16} />
                      </MagneticButton>
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noreferrer">
                      <MagneticButton variant="outline">
                        Source code <Github size={16} />
                      </MagneticButton>
                    </a>
                  )}
                </div>
              )}

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                  { title: "The challenge", content: project.problem },
                  { title: "The solution", content: project.solution },
                  { title: "Architecture", content: project.architecture },
                ].map(({ title, content }) => content ? (
                  <div key={title} className="p-6 rounded-2xl bg-background-subtle border border-line">
                    <h4 className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">
                      {title}
                    </h4>
                    <p className="text-sm text-ink-secondary leading-relaxed">
                      {content}
                    </p>
                  </div>
                ) : null)}
              </div>

              {/* Features & Tech */}
              <div className="grid md:grid-cols-2 gap-12">
                {project.features.length > 0 && (
                  <div>
                    <h4 className="text-lg font-heading font-medium text-ink mb-6">Key Features</h4>
                    <ul className="space-y-4">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex gap-3 text-sm text-ink-secondary leading-relaxed">
                          <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-gradient-to-br from-gradient-1 to-gradient-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {project.technologies.length > 0 && (
                  <div>
                    <h4 className="text-lg font-heading font-medium text-ink mb-6">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 rounded-full bg-background border border-line text-xs font-semibold text-ink-secondary transition-colors hover:border-ink-muted"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
