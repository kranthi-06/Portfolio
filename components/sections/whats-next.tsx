"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import { whatsNext } from "@/lib/content";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";

export function WhatsNextSection() {
  return (
    <section id="next" className="section" aria-labelledby="next-title">
      <div className="container">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow mb-6">{whatsNext.eyebrow}</p>
          <h2 id="next-title" className="section-title mb-6">
            {whatsNext.title}
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: "var(--ink-muted)" }}>
                Current work
              </p>
            </Reveal>
            <StaggerReveal className="space-y-4">
              {whatsNext.current.map((item) => (
                <StaggerItem key={item.title}>
                  <article
                    className="p-6 md:p-8 rounded-3xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
                  >
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full mb-4"
                      style={{ background: "var(--accent-soft)", color: "var(--ink-muted)" }}
                    >
                      {item.label}
                    </span>
                    <h3
                      className="font-display text-xl font-medium tracking-tight mb-3"
                      style={{ color: "var(--ink)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                      {item.detail}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>

          <div>
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: "var(--ink-muted)" }}>
                Future ideas
              </p>
              <div className="space-y-3 mb-12">
                {whatsNext.ideas.map((idea) => (
                  <div
                    key={idea}
                    className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)" }}
                  >
                    <Lightbulb size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--gradient-2)" }} />
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{idea}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: "var(--ink-muted)" }}>
                Roadmap
              </p>
              <div className="space-y-0">
                {whatsNext.roadmap.map((item, i) => (
                  <div
                    key={item.quarter}
                    className="flex gap-6 py-5"
                    style={{ borderBottom: i < whatsNext.roadmap.length - 1 ? "1px solid var(--line)" : "none" }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-[0.1em] w-20 flex-shrink-0 pt-0.5"
                      style={{ color: "var(--gradient-1)" }}
                    >
                      {item.quarter}
                    </span>
                    <p className="text-sm leading-relaxed flex items-center gap-2" style={{ color: "var(--ink-secondary)" }}>
                      {item.item}
                      <ArrowRight size={14} className="flex-shrink-0 opacity-40" />
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
