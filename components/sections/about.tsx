"use client";

import { motion } from "framer-motion";
import { Target, Lightbulb, Rocket, Users } from "lucide-react";
import { personalInfo } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from "@/lib/animations";
import { hexToRgb } from "@/lib/utils";

const highlights = [
  {
    icon: Lightbulb,
    title: "Problem Solver",
    description:
      "I approach every challenge with a first-principles mindset, breaking down complex problems into elegant, maintainable solutions.",
    color: "#6C63FF",
  },
  {
    icon: Rocket,
    title: "Fast Learner",
    description:
      "New technologies excite me. I rapidly prototype, iterate, and ship production-quality products using cutting-edge tools.",
    color: "#00D4FF",
  },
  {
    icon: Target,
    title: "Detail-Oriented",
    description:
      "From pixel-perfect UIs to optimized ML pipelines, I obsess over the details that separate good from exceptional.",
    color: "#A855F7",
  },
  {
    icon: Users,
    title: "Team Player",
    description:
      "I thrive in collaborative environments, bringing strong communication skills and a passion for mentoring others.",
    color: "#34D399",
  },
];

/**
 * About section with professional story, mission, and highlight cards
 */
export function About() {
  return (
    <section id="about" className="relative section-padding">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="About Me"
          title="My Story"
          subtitle="A passionate developer on a mission to build intelligent products that make a difference."
        />

        {/* Content grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Left — Story */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-6"
          >
            {personalInfo.about.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-muted leading-relaxed text-base md:text-lg">
                {paragraph}
              </p>
            ))}
          </motion.div>

          {/* Right — Mission card */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <GlassCard className="p-8" glowColor="108, 99, 255">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-heading">My Mission</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  To bridge the gap between cutting-edge AI research and practical,
                  user-facing applications. I believe technology should empower
                  people, and every line of code I write serves that purpose.
                </p>

                {/* Mini journey timeline */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-dark">
                    Journey
                  </h4>
                  {[
                    { year: "2023", event: "Started B.Tech in CSE-AI & ML" },
                    { year: "2023", event: "First hackathon win" },
                    { year: "2024", event: "Multiple internships" },
                    { year: "2025", event: "AI Systems Engineer" },
                  ].map((item) => (
                    <div key={item.year} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-primary font-semibold mt-0.5 min-w-[40px]">
                        {item.year}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="text-sm text-muted">{item.event}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* What I bring to the table */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {highlights.map((item) => (
            <motion.div key={item.title} variants={fadeInUp}>
              <GlassCard className="p-6 h-full" glowColor={hexToRgb(item.color)}>
                <div className="space-y-4">
                  <div
                    className="p-3 rounded-xl w-fit"
                    style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}25` }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-lg font-semibold font-heading">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
