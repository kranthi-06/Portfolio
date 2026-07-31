"use client";

import { useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/constants";
import { MagneticButton } from "./magnetic-button";
import { BrowserFrame } from "./browser-frame";
import { modalOverlay, modalContent } from "@/lib/animations";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Detailed project view modal with architecture, challenges, and mockups
 */
export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalContent project={project} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function ModalContent({ project, onClose }: { project: Project; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
        <motion.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} project details`}
            className={cn(
              "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto",
              "rounded-3xl glass-strong",
              "border border-white/10",
              "shadow-2xl"
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Browser Preview */}
            <div className="p-4 sm:p-6 bg-zinc-950/60 rounded-t-3xl border-b border-white/10">
              <BrowserFrame
                title={project.title}
                url={project.liveUrl}
                image={project.image}
                accent="violet"
                aspectRatio="aspect-[16/9]"
                className="w-full shadow-2xl"
              />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Subtitle & Category */}
              <div>
                <p className="text-lg text-muted mb-2">{project.subtitle}</p>
                <span className="tech-badge">{project.category}</span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold font-heading mb-3 text-white">
                  Overview
                </h4>
                <p className="text-muted leading-relaxed">
                  {project.longDescription}
                </p>
              </div>

              {/* Problem & Solution */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-2">
                    The Problem
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {project.problem}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-2">
                    The Solution
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-lg font-semibold font-heading mb-4 text-white">
                  Key Features
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture */}
              {project.architecture && (
                <div>
                  <h4 className="text-lg font-semibold font-heading mb-3 text-white">
                    Architecture
                  </h4>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-muted leading-relaxed">
                      {project.architecture}
                    </p>
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              <div>
                <h4 className="text-lg font-semibold font-heading mb-3 text-white">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="tech-badge">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              {project.challenges && (
                <div>
                  <h4 className="text-lg font-semibold font-heading mb-3 text-white">
                    Challenges & Solutions
                  </h4>
                  <ul className="space-y-2">
                    {project.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-primary font-mono text-sm mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm text-muted">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Future Scope */}
              {project.futureScope && (
                <div>
                  <h4 className="text-lg font-semibold font-heading mb-3 text-white">
                    Future Scope
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.futureScope.map((scope) => (
                      <span
                        key={scope}
                        className="px-3 py-1.5 rounded-full text-xs bg-accent/10 border border-accent/20 text-accent"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                {project.githubUrl && (
                  <MagneticButton
                    href={project.githubUrl}
                    target="_blank"
                    variant="secondary"
                    size="sm"
                  >
                    <Github className="w-4 h-4" />
                    View Code
                  </MagneticButton>
                )}
                {project.liveUrl && project.liveUrl !== "#" && (
                  <MagneticButton
                    href={project.liveUrl}
                    target="_blank"
                    variant="primary"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </MagneticButton>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
  );
}
