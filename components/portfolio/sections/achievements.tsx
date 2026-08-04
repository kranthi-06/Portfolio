"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy, ArrowUpRight } from "lucide-react";
import type { Achievement } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

export function Achievements({ items }: { items?: Achievement[] }) {
  if (!Array.isArray(items)) return null;

  return (
    <section id="achievements" className="relative py-32 bg-background">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="06"
          eyebrow="Milestones"
          title="Awards & Recognition."
          body="Acknowledged for excellence and innovation."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {items.map((achievement, index) => (
              <motion.article
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                className="group relative flex flex-col p-8 rounded-2xl bg-background-elevated border border-line shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Subtle Glow Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-ink/[0.02] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-150" />

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border border-line text-ink">
                    <Trophy size={20} strokeWidth={1.5} />
                  </div>
                  {achievement.date && (
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">
                      {achievement.date}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-display font-medium text-ink tracking-tight mb-3">
                  {achievement.title}
                </h3>

                {achievement.event && (
                  <p className="text-sm font-semibold text-ink-secondary mb-4 uppercase tracking-wider">
                    {achievement.event}
                  </p>
                )}

                {achievement.description && (
                  <p className="text-[15px] text-ink-secondary/90 leading-relaxed font-body mb-8 flex-1">
                    {achievement.description}
                  </p>
                )}
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background-elevated">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Achievements will appear here soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
