"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

export function ExperienceSection({ data }: { data: PortfolioData }) {
  return (
    <section
      id="experience"
      className="relative py-[var(--section-gap)] bg-background-subtle"
    >
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="03"
          eyebrow="Experience"
          title="Where I've made impact."
          body="A track record of delivering impactful solutions across various roles."
        />

        {data.experience.length > 0 ? (
          <div className="relative max-w-4xl">
            {/* Timeline line */}
            <div className="absolute top-6 bottom-6 left-[19px] md:left-[119px] w-px bg-gradient-to-b from-accent/40 via-accent-secondary/20 to-transparent" />

            <div className="flex flex-col gap-14 md:gap-16">
              {data.experience.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.6,
                    delay: Math.min(index * 0.1, 0.4),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative grid md:grid-cols-[90px_1fr] gap-6 md:gap-12"
                >
                  {/* Date + Dot */}
                  <div className="relative pl-12 md:pl-0 md:text-right pt-1">
                    <div className="absolute left-[16px] md:left-auto md:-right-[30px] top-[10px] w-[7px] h-[7px] rounded-full bg-accent ring-[3px] ring-background-subtle z-10" />
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.1em] whitespace-nowrap">
                      {item.start_date.split(" ")[1] ??
                        item.start_date.slice(0, 4)}
                      {item.end_date
                        ? ` — ${item.end_date.split(" ")[1] ?? item.end_date.slice(0, 4)}`
                        : " — Now"}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="p-7 md:p-9 rounded-2xl bg-background-elevated border border-line hover:border-line-strong transition-colors duration-300 group relative overflow-hidden">
                    {/* Subtle corner glow on hover */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/[0.04] rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div>
                        <p className="text-[10px] font-semibold text-accent uppercase tracking-[0.15em] mb-2">
                          {item.type}
                        </p>
                        <h3 className="text-xl sm:text-2xl font-display font-medium text-ink tracking-[-0.02em] mb-1">
                          {item.title}
                        </h3>
                        <strong className="text-sm font-semibold text-ink-secondary">
                          {item.company}
                        </strong>
                      </div>

                      {item.location && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted bg-background-subtle px-2.5 py-1 rounded-full border border-line whitespace-nowrap self-start shrink-0">
                          <MapPin size={11} /> {item.location}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-ink-secondary leading-relaxed mb-5">
                        {item.description}
                      </p>
                    )}

                    {item.achievements.length > 0 && (
                      <ul className="space-y-3 mb-6">
                        {item.achievements.map((achievement, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-ink-secondary leading-relaxed"
                          >
                            <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-gradient-to-br from-accent to-accent-secondary" />
                            <span className="flex-1">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-5 border-t border-line/50">
                        {item.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-full bg-background-subtle border border-line text-[10px] font-medium text-ink-muted"
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
          <div className="flex flex-col items-center justify-center py-24 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm">Experience will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
