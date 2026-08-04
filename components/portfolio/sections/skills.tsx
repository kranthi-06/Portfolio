"use client";

import { motion } from "framer-motion";
import { Sparkles, Layers } from "lucide-react";
import type { Skill } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { clsx } from "clsx";

export function Skills({ items }: { items?: Skill[] }) {
  if (!Array.isArray(items)) return null;

  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <section id="skills" className="relative py-32 bg-background-elevated/30">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="04"
          eyebrow="Core Competencies"
          title="Skills & Expertise."
          body="A curated toolkit of languages, frameworks, and methodologies."
        />

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
            {categories.map((category, catIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: catIdx * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-line">
                  <Layers size={16} className="text-ink-muted" strokeWidth={1.5} />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-widest">
                    {category}
                  </h3>
                </div>

                <div className="flex flex-col gap-5">
                  {items
                    .filter((item) => item.category === category)
                    .map((skill, index) => (
                      <div key={skill.id} className="group flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-medium text-ink-secondary group-hover:text-ink transition-colors">
                            {skill.name}
                          </span>
                          <span className="text-xs font-medium text-ink-muted group-hover:text-ink-secondary transition-colors">
                            {skill.level}%
                          </span>
                        </div>
                        {/* Minimal Progress Bar */}
                        <div className="h-1 w-full bg-background-subtle rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                            className={clsx(
                              "h-full rounded-full transition-all duration-300",
                              skill.level > 90 ? "bg-ink" : "bg-ink-muted group-hover:bg-ink-secondary"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Skills will appear here soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
