"use client";

import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar, BookOpen } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { fadeInUp } from "@/lib/animations";

/**
 * Education section with timeline format, CGPA, and coursework badges
 */
export function Education() {
  const { education } = usePortfolio();
  return (
    <section id="education" className="relative section-padding">
      {/* Background glow */}
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-secondary/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Education"
          title="Academic Background"
          subtitle="The foundation that shaped my technical expertise."
        />

        {/* Education cards */}
        <div className="max-w-3xl mx-auto space-y-8">
          {education.map((edu, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <GlassCard className="p-8" glowColor="0, 212, 255">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading text-white">
                        {edu.degree}
                      </h3>
                      <p className="text-base text-secondary font-medium mt-1">
                        {edu.branch}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          {edu.institution}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {edu.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {edu.startYear} — {edu.endYear}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CGPA */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-center">
                      <span className="text-2xl font-bold gradient-text font-heading">
                        {edu.cgpa}
                      </span>
                      <p className="text-xs text-muted-dark mt-1">CGPA</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div>
                      <p className="text-sm text-muted">
                        Consistently maintained strong academic performance while
                        actively participating in hackathons, open-source projects,
                        and technical clubs.
                      </p>
                    </div>
                  </div>

                  {/* Coursework */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-dark mb-3">
                      Relevant Coursework
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {edu.coursework.map((course) => (
                        <span key={course} className="tech-badge">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
