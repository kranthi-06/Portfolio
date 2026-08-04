"use client";

import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import type { Achievement } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

export function Achievements({ items }: { items: Achievement[] }) {
  return (
    <section id="achievements" className="relative py-24 md:py-32 bg-background-subtle">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <SectionHeading 
          eyebrow="Achievements" 
          title="Milestones that matter." 
          body="Awards, recognitions, and significant professional accomplishments."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {items.map((achievement, index) => (
              <motion.article
                key={achievement.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
                className="group relative flex flex-col p-8 min-h-[280px] overflow-hidden rounded-[2rem] bg-background-elevated border border-line glass-card hover:border-line-strong"
              >
                {/* Background Glow */}
                <div 
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ backgroundColor: achievement.color ?? "#8b5cf6" }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div 
                    className="w-14 h-14 flex items-center justify-center rounded-2xl mb-8 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm"
                    style={{ 
                      backgroundColor: `${achievement.color ?? "#8b5cf6"}15`,
                      color: achievement.color ?? "#8b5cf6",
                      border: `1px solid ${achievement.color ?? "#8b5cf6"}30`
                    }}
                  >
                    <Trophy size={24} />
                  </div>

                  <span className="absolute top-2 right-2 text-[10px] font-bold text-ink-muted uppercase tracking-widest bg-background-subtle px-2 py-1 rounded-full border border-line">
                    {achievement.date}
                  </span>

                  <h3 className="text-xl md:text-2xl font-heading font-medium tracking-tight text-ink mb-1 mt-auto">
                    {achievement.position ?? achievement.title}
                  </h3>
                  
                  {achievement.position && (
                    <strong className="block text-sm font-semibold mb-3" style={{ color: achievement.color ?? "var(--gradient-1)" }}>
                      {achievement.title}
                    </strong>
                  )}
                  
                  {achievement.event && (
                    <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                      {achievement.event}
                    </p>
                  )}
                  
                  {achievement.description && (
                    <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3">
                      {achievement.description}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Achievements will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
