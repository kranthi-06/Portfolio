"use client";

import { philosophy } from "@/lib/content";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";

export function PhilosophySection() {
  return (
    <section id="philosophy" className="section" aria-labelledby="philosophy-title">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow mb-6">{philosophy.eyebrow}</p>
              <h2 id="philosophy-title" className="section-title mb-6">
                {philosophy.title}
              </h2>
              <p className="section-subtitle">
                Not a bio. A point of view on why this work matters.
              </p>
            </Reveal>
          </div>

          <StaggerReveal className="space-y-6">
            {philosophy.pillars.map((pillar) => (
              <StaggerItem key={pillar.id}>
                <article
                  className="p-8 md:p-10 rounded-3xl transition-colors duration-300 group hover:shadow-md"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {pillar.label}
                  </p>
                  <p
                    className="text-base md:text-lg leading-[1.75]"
                    style={{ color: "var(--ink-secondary)" }}
                  >
                    {pillar.body}
                  </p>
                </article>
              </StaggerItem>
            ))}

            <StaggerItem>
              <blockquote
                className="p-8 md:p-10 rounded-3xl font-serif italic text-xl md:text-2xl leading-relaxed tracking-[-0.02em]"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--ink)",
                  borderLeft: "3px solid var(--accent)",
                }}
              >
                &ldquo;{philosophy.closing}&rdquo;
              </blockquote>
            </StaggerItem>
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
