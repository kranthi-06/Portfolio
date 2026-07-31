"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowRight, Sparkles } from "lucide-react";
import { projects } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ProjectModal } from "@/components/ui/project-modal";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/constants";

/**
 * Premium project showcase with featured cards and detail modal
 */
export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="projects" className="relative section-padding">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Projects"
          title="Featured Work"
          subtitle="Handpicked projects that showcase my skills and passion for building exceptional products."
        />

        {/* Projects Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-8"
        >
          {projects.map((project, i) => (
            <motion.div key={project.id} variants={fadeInUp}>
              <div
                className={cn(
                  "group relative rounded-3xl overflow-hidden",
                  "bg-card/60 backdrop-blur-xl",
                  "border border-white/[0.05] hover:border-primary/30",
                  "transition-all duration-500",
                  "hover:shadow-glow-lg"
                )}
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image / Visual Side */}
                  <div
                    className={cn(
                      "relative h-64 lg:h-auto min-h-[300px] overflow-hidden",
                      i % 2 !== 0 && "lg:order-2"
                    )}
                  >
                    {/* Gradient placeholder for project image */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"
                    />
                    <div className="absolute inset-0 dot-grid opacity-20" />

                    {/* Project title overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <motion.h3
                          className="text-4xl md:text-5xl font-bold font-heading gradient-text"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {project.title}
                        </motion.h3>
                        <p className="text-muted mt-2 text-sm">{project.subtitle}</p>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="px-6 py-3 rounded-xl bg-primary/20 border border-primary/40 text-white font-medium text-sm hover:bg-primary/30 transition-colors"
                      >
                        View Case Study
                      </button>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className={cn("p-8 lg:p-10 flex flex-col justify-center", i % 2 !== 0 && "lg:order-1")}>
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="tech-badge">
                        <Sparkles className="w-3 h-3" />
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Key features (first 3) */}
                    <div className="space-y-2 mb-6">
                      {project.features.slice(0, 3).map((feature, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="tech-badge">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {project.githubUrl && (
                        <MagneticButton
                          href={project.githubUrl}
                          target="_blank"
                          variant="secondary"
                          size="sm"
                        >
                          <Github className="w-4 h-4" />
                          Source Code
                        </MagneticButton>
                      )}
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors group/link"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Coming Soon Card */}
          <motion.div variants={fadeInUp}>
            <div className="relative rounded-3xl overflow-hidden border border-dashed border-white/10 p-12 text-center">
              <div className="absolute inset-0 dot-grid opacity-5" />
              <div className="relative z-10">
                <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold font-heading text-muted mb-2">
                  More Projects Coming Soon
                </h3>
                <p className="text-sm text-muted-dark max-w-md mx-auto">
                  I&apos;m constantly building and experimenting. Check back soon or
                  visit my GitHub for the latest work.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
