"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowRight, Sparkles, AlertCircle, Lightbulb, Cpu, Star, Target, Flag, CheckCircle2 } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ProjectModal } from "@/components/ui/project-modal";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/portfolio/types";
import Link from "next/link";

function InfoCard({ title, icon, content }: { title: string; icon: React.ReactNode; content: string | string[] }) {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="group bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/10 rounded-2xl p-6 lg:p-8 transition-all duration-300 h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-transform duration-300">
          {icon}
        </div>
        <h4 className="text-[15px] font-bold tracking-widest text-white uppercase">{title}</h4>
      </div>
      <div className="text-gray-400 text-[15px] leading-[1.7] flex-1">
        {Array.isArray(content) ? (
          <ul className="space-y-3">
            {content.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </motion.div>
  );
}

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { projects } = usePortfolio();

  if (!projects.length) return null;

  return (
    <section id="projects" className="relative py-[120px] px-6 md:px-10 lg:px-20 overflow-hidden bg-[#050507]">
      {/* Premium background effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent opacity-40 pointer-events-none blur-[100px]" />
      
      <div className="max-w-[1440px] mx-auto relative z-10 space-y-[160px]">
        {projects.map((project, index) => (
          <motion.div 
            key={project.id}
            id={`project-${project.id}`}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-16"
          >
            {/* Hero Area (12 Column Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column - 40% */}
              <motion.div variants={fadeInUp} className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                
                {/* Intro Headers (Only on first project) */}
                {index === 0 && (
                  <div className="mb-[64px]">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[13px] font-bold tracking-[0.2em] text-primary uppercase">
                        Featured Product
                      </span>
                    </div>
                    <h2 className="text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-tight text-white mb-6">
                      Not projects.<br />
                      <span className="text-primary">Products.</span>
                    </h2>
                    <p className="text-gray-400 text-lg leading-[1.6] max-w-[400px]">
                      Complete case studies — problem, architecture, lessons, and what comes next.
                    </p>
                  </div>
                )}

                {/* Project Metadata */}
                <div className="space-y-6">
                  <div>
                    <span className="text-[12px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-3 block">
                      {project.category || "Application"}
                    </span>
                    <h3 className="text-[34px] md:text-[40px] font-bold leading-[1.2] text-white tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 text-[17px] leading-[1.7] max-w-[480px]">
                    {project.description}
                  </p>

                  {/* Tech Stack Pills */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 pb-4">
                      {project.technologies.map(tech => (
                        <span 
                          key={tech} 
                          className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-full text-[13px] font-medium text-gray-300 transition-all cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Next Product Navigation */}
                  {index < projects.length - 1 && (
                    <a 
                      href={`#project-${projects[index + 1].id}`}
                      className="inline-flex items-center gap-2 text-[15px] font-semibold text-primary hover:text-white transition-colors group"
                    >
                      Next product 
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Right Column - 60% */}
              <motion.div variants={fadeInUp} className="lg:col-span-7 relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
                <div className="relative w-full max-w-[900px] mx-auto ml-auto lg:ml-8 transform transition-transform duration-500 hover:scale-[1.02]">
                  <BrowserFrame
                    title={project.title}
                    url={project.live_url || "#"}
                    image={project.media?.url || ""}
                    accent={index % 2 === 0 ? "ocean" : "violet"}
                    aspectRatio="aspect-[16/10]"
                    className="w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-xl overflow-hidden glassmorphism"
                  />
                </div>
              </motion.div>
            </div>

            {/* Cards Grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <InfoCard title="Problem" icon={<AlertCircle />} content={project.problem || ""} />
              <InfoCard title="Solution" icon={<Lightbulb />} content={project.solution || ""} />
              <InfoCard title="Architecture" icon={<Cpu />} content={project.architecture || ""} />
              <InfoCard title="Features" icon={<Star />} content={project.features} />
              <InfoCard title="Challenges & Lessons" icon={<Target />} content={project.challenges} />
              <InfoCard title="Future Roadmap" icon={<Flag />} content={project.future_scope} />
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-8">
              {project.live_url && (
                <a 
                  href={project.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-[15px] shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30 transition-all duration-250"
                >
                  Live Demo <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {project.github_url && (
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-[15px] hover:-translate-y-0.5 transition-all duration-250"
                >
                  <Github className="w-5 h-5" /> GitHub
                </a>
              )}
              <button
                onClick={() => setSelectedProject(project)}
                className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-semibold text-gray-400 hover:text-white transition-colors ml-auto"
              >
                View Full Details <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
            
          </motion.div>
        ))}

        {/* Coming Soon Section */}
        <motion.div variants={fadeInUp} className="max-w-[1000px] mx-auto text-center py-20 border border-dashed border-white/10 rounded-[32px] relative overflow-hidden bg-white/[0.01]">
          <div className="absolute inset-0 dot-grid opacity-10" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-[32px] font-bold tracking-tight text-white mb-4">
              More Products Coming Soon
            </h3>
            <p className="text-gray-400 text-lg max-w-lg">
              I'm always working on new ideas, solving complex problems, and building next-generation experiences.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Maintain functionality */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
