"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { clsx } from "clsx";

export function ExperienceSection({ data }: { data: PortfolioData }) {
  return (
    <section id="experience" className="relative py-24 md:py-32 overflow-hidden">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <SectionHeading 
          eyebrow="Experience" 
          title="Built through real-world practice." 
          body="A track record of delivering impactful solutions across various roles and organizations."
        />

        {data.experience.length > 0 ? (
          <div className="relative max-w-4xl mx-auto mt-16 md:mt-24">
            {/* Timeline Line */}
            <div className="absolute top-8 bottom-8 left-[23px] md:left-[119px] w-px bg-gradient-to-b from-gradient-1 via-gradient-2 to-transparent opacity-50" />

            <div className="flex flex-col gap-12 md:gap-16">
              {data.experience.map((item, index) => (
                <motion.article 
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: Math.min(index * 0.15, 0.5) }}
                  className="relative grid md:grid-cols-[90px_1fr] gap-8 md:gap-12"
                >
                  {/* Timeline Dot & Date */}
                  <div className="relative pl-[56px] md:pl-0 md:text-right pt-2">
                    <div className="absolute left-[20px] md:left-auto md:-right-[68px] top-[14px] w-2 h-2 rounded-full bg-gradient-1 ring-4 ring-background shadow-glow z-10" />
                    <span className="text-xs font-bold text-ink-muted uppercase tracking-widest whitespace-nowrap">
                      {item.start_date.split(" ")[1] ?? item.start_date.slice(0, 4)} 
                      {item.end_date ? ` — ${item.end_date.split(" ")[1] ?? item.end_date.slice(0, 4)}` : " — Present"}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="glass-card p-6 md:p-8 rounded-[2rem] bg-background-elevated border border-line hover:border-line-strong transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gradient-1/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs font-bold text-gradient-1 uppercase tracking-widest mb-2">
                          {item.type}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-heading font-medium text-ink mb-1">
                          {item.title}
                        </h3>
                        <strong className="text-base font-semibold text-ink-secondary">
                          {item.company}
                        </strong>
                      </div>
                      
                      {item.location && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted bg-background px-2.5 py-1 rounded-full border border-line whitespace-nowrap self-start">
                          <MapPin size={12} /> {item.location}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-base text-ink-secondary leading-relaxed mb-6">
                        {item.description}
                      </p>
                    )}

                    {item.achievements.length > 0 && (
                      <ul className="space-y-3 mb-8">
                        {item.achievements.map((achievement, i) => (
                          <li key={i} className="flex gap-3 text-sm text-ink-secondary leading-relaxed">
                            <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-gradient-to-br from-gradient-1 to-gradient-2" />
                            <span className="flex-1">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-6 border-t border-line/50">
                        {item.technologies.map((tech) => (
                          <span 
                            key={tech} 
                            className="px-2.5 py-1 rounded-md bg-background-subtle border border-line text-[10px] font-bold text-ink-muted tracking-wide"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Experience will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
