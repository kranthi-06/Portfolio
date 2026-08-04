"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Skill } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { Sparkles } from "lucide-react";

export function Skills({ items }: { items: Skill[] }) {
  const groups = useMemo(() => {
    return Object.entries(
      items.reduce<Record<string, Skill[]>>((all, item) => {
        const name = item.category_label || item.category || "Skills";
        (all[name] ??= []).push(item);
        return all;
      }, {})
    );
  }, [items]);

  return (
    <section id="skills" className="relative py-[var(--section-gap)]">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="04"
          eyebrow="Capabilities"
          title="Technical toolkit."
          body="Languages, frameworks, and tools I use to build production-ready applications."
        />

        {groups.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {groups.map(([category, skills], groupIndex) => (
              <motion.article
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: groupIndex * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="p-8 md:p-10 rounded-2xl bg-background-elevated border border-line"
              >
                <h3 className="text-xl font-display font-medium text-ink mb-8 tracking-[-0.02em]">
                  {category}
                </h3>

                <div className="grid gap-6">
                  {skills.map((skill, index) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-end mb-2.5">
                        <span className="text-sm font-medium text-ink-secondary">
                          {skill.name}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-ink-muted">
                          {skill.level}%
                        </span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-background-subtle overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${skill.level}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: 0.15 + index * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full rounded-full"
                          style={{
                            background: skill.color
                              ? skill.color
                              : "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm">Skills will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
