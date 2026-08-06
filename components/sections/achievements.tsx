"use client";

import { Trophy } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function AchievementsSection() {
  const { achievements, stats, certifications } = usePortfolio();

  return (
    <section id="achievements" className="section" aria-labelledby="achievements-title">
      <div className="container">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow mb-6">Recognition</p>
          <h2 id="achievements-title" className="section-title mb-6">
            Proof of work.
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div
                className="p-6 md:p-8 rounded-2xl text-center"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)" }}
              >
                <p
                  className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-2"
                  style={{ color: "var(--ink)" }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--ink-muted)" }}>
                  {stat.label}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <StaggerReveal className="grid md:grid-cols-2 gap-6 mb-20">
          {achievements.map((award) => (
            <StaggerItem key={award.title}>
              <article
                className="group p-8 rounded-3xl h-full transition-all duration-300 hover:shadow-lg"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${award.color}20`, color: award.color }}
                  >
                    <Trophy size={20} />
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: "var(--ink-muted)" }}>
                    {award.date}
                  </span>
                </div>
                <p
                  className="font-display text-xl font-medium tracking-tight mb-1"
                  style={{ color: "var(--ink)" }}
                >
                  {award.title}
                </p>
                <p className="text-sm font-semibold mb-3" style={{ color: award.color }}>
                  {award.event || award.position}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                  {award.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: "var(--ink-muted)" }}>
            Certifications
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.slice(0, 6).map((cert) => (
              <div
                key={cert.title}
                className="p-5 rounded-2xl flex items-start gap-4"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)" }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "var(--gradient-1)" }}
                />
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--ink)" }}>
                    {cert.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    {cert.organization} · {cert.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
