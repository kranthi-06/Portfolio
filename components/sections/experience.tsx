"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { experiences } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { fadeInUp, fadeInLeft, fadeInRight } from "@/lib/animations";

/**
 * Experience section with animated vertical timeline
 */
export function Experience() {
  return (
    <section id="experience" className="relative section-padding">
      {/* Background glow */}
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-gradient-radial from-accent/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Experience"
          title="Professional Journey"
          subtitle="Where I've worked and what I've built along the way."
        />

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/30 to-transparent" />

          {/* Experience cards */}
          <div className="space-y-12">
            {experiences.map((exp, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  variants={isLeft ? fadeInLeft : fadeInRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className={`relative flex flex-col md:flex-row items-start gap-8 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                      className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-glow"
                    />
                  </div>

                  {/* Spacer for layout */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card */}
                  <div className="ml-12 md:ml-0 md:w-1/2">
                    <GlassCard className="p-6" glowColor="108, 99, 255">
                      <div className="space-y-4">
                        {/* Header */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                              {exp.type}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold font-heading text-white">
                            {exp.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                            <span className="flex items-center gap-1.5 font-medium text-secondary">
                              {exp.company}
                              {exp.companyUrl && (
                                <ExternalLink className="w-3 h-3" />
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {exp.startDate} — {exp.endDate}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted leading-relaxed">
                          {exp.description}
                        </p>

                        {/* Achievements */}
                        <ul className="space-y-2">
                          {exp.achievements.map((achievement, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm text-muted"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {exp.technologies.map((tech) => (
                            <span key={tech} className="tech-badge">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
