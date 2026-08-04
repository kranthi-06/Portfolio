"use client";

import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import type { Achievement } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

export function Achievements({ items }: { items: Achievement[] }) {
  return (
    <section id="achievements" className="relative py-[var(--section-gap)]">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="06"
          eyebrow="Achievements"
          title="Milestones that matter."
          body="Awards, recognitions, and significant accomplishments."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((achievement, index) => (
              <motion.article
                key={achievement.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.08, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex flex-col p-7 min-h-[260px] overflow-hidden rounded-2xl bg-background-elevated border border-line hover:border-line-strong transition-all duration-300"
              >
                {/* Background glow */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none"
                  style={{
                    backgroundColor: achievement.color ?? "#6366f1",
                  }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-xl mb-6 transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundColor: `${achievement.color ?? "#6366f1"}12`,
                      color: achievement.color ?? "#6366f1",
                      border: `1px solid ${achievement.color ?? "#6366f1"}20`,
                    }}
                  >
                    <Trophy size={20} />
                  </div>

                  {achievement.date && (
                    <span className="absolute top-0 right-0 text-[10px] font-medium text-ink-muted">
                      {achievement.date}
                    </span>
                  )}

                  <div className="mt-auto">
                    <h3 className="text-lg font-display font-medium tracking-[-0.02em] text-ink mb-1">
                      {achievement.position ?? achievement.title}
                    </h3>

                    {achievement.position && (
                      <strong
                        className="block text-sm font-semibold mb-2"
                        style={{
                          color:
                            achievement.color ?? "var(--accent)",
                        }}
                      >
                        {achievement.title}
                      </strong>
                    )}

                    {achievement.event && (
                      <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.1em] mb-2">
                        {achievement.event}
                      </p>
                    )}

                    {achievement.description && (
                      <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm">Achievements will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
