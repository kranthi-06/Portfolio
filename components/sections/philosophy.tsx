"use client";

import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";

export function PhilosophySection() {
  const { personalInfo } = usePortfolio();
  
  // Create pillars from CMS data if available, else fallback
  const pillars = [
    {
      id: "about",
      label: "About Me",
      body: personalInfo.about || "Building intelligent products that shape the future.",
    },
    {
      id: "bio",
      label: "My Philosophy",
      body: personalInfo.bio || "Intelligence belongs in the product - not as a demo, but as a quiet layer that makes decisions clearer and work lighter.",
    }
  ];

  return (
    <section id="philosophy" className="section" aria-labelledby="philosophy-title">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow mb-6">Philosophy</p>
              <h2 id="philosophy-title" className="section-title mb-6">
                Why I build.
              </h2>
              <p className="section-subtitle">
                Not a bio. A point of view on why this work matters.
              </p>
            </Reveal>
          </div>

          <StaggerReveal className="space-y-6">
            {pillars.map((pillar) => (
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
                    className="text-base md:text-lg leading-[1.75] whitespace-pre-wrap"
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
                &ldquo;Whether you&apos;re shaping an AI product, solving a hard technical problem, or looking for someone who thinks in systems and ships in code - I&apos;d like to hear from you.&rdquo;
              </blockquote>
            </StaggerItem>
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
