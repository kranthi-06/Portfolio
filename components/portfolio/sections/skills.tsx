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
    <section id="skills" className="relative py-24 md:py-32 bg-background-subtle">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <SectionHeading 
          eyebrow="Capabilities" 
          title="A practical technical toolkit." 
          body="Languages, frameworks, and tools used to build production-ready applications."
        />

        {groups.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {groups.map(([category, skills], groupIndex) => (
              <motion.article 
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
                className="p-8 md:p-10 rounded-[2rem] bg-background-elevated border border-line glass-card"
              >
                <h3 className="text-2xl font-heading font-medium text-ink mb-10 tracking-tight">
                  {category}
                </h3>
                
                <div className="grid gap-8">
                  {skills.map((skill, index) => (
                    <div key={skill.id} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-ink-secondary tracking-wide">
                          {skill.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-ink-muted">
                          {skill.level}%
                        </span>
                      </div>
                      
                      <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-line/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-gradient-1 to-gradient-2 shadow-glow"
                          style={{ 
                            backgroundColor: skill.color ? skill.color : undefined,
                            backgroundImage: skill.color ? 'none' : undefined 
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
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Skills will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
