"use client";

import { motion } from "framer-motion";
import { achievements } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { hexToRgb } from "@/lib/utils";

/**
 * Achievements section with trophy-themed cards and animated counter
 */
export function Achievements() {
  return (
    <section id="achievements" className="relative section-padding">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-yellow-500/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Achievements"
          title="Milestones & Wins"
          subtitle="Hackathons, competitions, and recognitions that fuel my drive to keep building."
        />

        {/* Total counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <div className="px-8 py-4 rounded-2xl glass border border-white/5">
            <AnimatedCounter
              value={achievements.length}
              suffix="+"
              label="Major Achievements"
            />
          </div>
        </motion.div>

        {/* Achievement Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {achievements.map((achievement, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <GlassCard className="p-6 h-full" glowColor={hexToRgb(achievement.color)}>
                <div className="space-y-4">
                  {/* Icon and position */}
                  <div className="flex items-start justify-between">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: `${achievement.color}15`,
                        border: `1px solid ${achievement.color}25`,
                      }}
                    >
                      <achievement.icon
                        className="w-6 h-6"
                        style={{ color: achievement.color }}
                      />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: achievement.color }}
                    >
                      {achievement.position}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-primary mt-1">{achievement.event}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted leading-relaxed">
                    {achievement.description}
                  </p>

                  {/* Date */}
                  <span className="inline-block text-xs text-muted-dark font-mono">
                    {achievement.date}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
