"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal } from "@/components/ui/reveal";

export function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const { journey } = usePortfolio();

  return (
    <section
      id="journey"
      className="section"
      style={{ background: "var(--bg-subtle)" }}
      aria-labelledby="journey-title"
    >
      <div className="container">
        <Reveal className="mb-20 max-w-2xl">
          <p className="eyebrow mb-6">My journey</p>
          <h2 id="journey-title" className="section-title mb-6">
            Every step,<br />intentional.
          </h2>
          <p className="section-subtitle">
            From foundations to live products — a timeline of learning, building, and growing.
          </p>
        </Reveal>

        <div ref={containerRef} className="relative max-w-3xl mx-auto">
          <div className="timeline-line" aria-hidden="true">
            <motion.div
              className="absolute top-0 left-0 w-full origin-top"
              style={{
                height: lineHeight,
                background: "linear-gradient(to bottom, var(--gradient-1), var(--gradient-2))",
              }}
            />
          </div>

          <div className="space-y-0">
            {journey.map((item, i) => (
              <Reveal key={`${item.id}`} delay={i * 0.05}>
                <article className="relative pl-16 md:pl-20 pb-21 last:pb-0">
                  <div
                    className="absolute left-[18px] md:left-[18px] top-2 w-3 h-3 rounded-full z-10"
                    style={{
                      background: i === journey.length - 1
                        ? "linear-gradient(135deg, var(--gradient-1), var(--gradient-2))"
                        : "var(--bg-elevated)",
                      border: "2px solid var(--gradient-1)",
                      boxShadow: i === journey.length - 1 ? "0 0 12px var(--glow)" : "none",
                    }}
                  />

                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span
                      className="font-display text-2xl font-medium tracking-tight"
                      style={{ color: "var(--ink)" }}
                    >
                      {item.period}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                      style={{ background: "var(--accent-soft)", color: "var(--ink-muted)" }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <h3
                    className="font-display text-xl md:text-2xl font-medium tracking-tight mb-1"
                    style={{ color: "var(--ink)" }}
                  >
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm font-medium mb-3" style={{ color: "var(--ink-muted)" }}>
                      {item.subtitle}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-base leading-relaxed mb-4 max-w-xl" style={{ color: "var(--ink-secondary)" }}>
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-3 py-1 rounded-full"
                        style={{ background: "var(--bg-elevated)", color: "var(--ink-muted)", border: "1px solid var(--line)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
