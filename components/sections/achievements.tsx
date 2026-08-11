"use client";

import { Trophy, ArrowRight } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useState } from "react";
import type { Achievement } from "@/lib/portfolio/types";
import { AchievementModal } from "@/components/ui/achievement-modal";
import Image from "next/image";

function getPreviewUrl(url?: string | null) {
  if (!url) return "";
  if (url.toLowerCase().endsWith(".pdf")) return url.replace(/\.pdf$/i, ".jpg");
  return url;
}

export function AchievementsSection() {
  const { achievements, stats, certifications } = usePortfolio();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

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
                className="group relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
                onClick={() => setSelectedAchievement(award)}
              >
                {/* Certificate */}
                {award.certificate_url ? (
                  <div className="relative w-full h-48 overflow-hidden bg-zinc-950/20">
                    <Image src={getPreviewUrl(award.certificate_url)} alt={award.title} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      Certificate
                    </div>
                  </div>
                ) : null}
                  <div className="p-6 pb-0 flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${award.color || '#FFD700'}20`, color: award.color || '#FFD700' }}
                    >
                      <Trophy size={20} />
                    </div>
                  </div>
                
                {/* Details */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  {award.position && (
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: award.color || "var(--primary)" }}>
                      {award.position}
                    </p>
                  )}
                  <p
                    className="font-display text-xl font-medium tracking-tight mb-1"
                    style={{ color: "var(--ink)" }}
                  >
                    {award.title}
                  </p>
                  {award.event && (
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink-secondary)" }}>
                      {award.event}
                    </p>
                  )}
                  {award.date && (
                    <p className="text-xs font-medium mb-3" style={{ color: "var(--ink-muted)" }}>
                      {award.date}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed line-clamp-3 mb-6 flex-1" style={{ color: "var(--ink-secondary)" }}>
                    {award.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm font-medium mt-auto transition-colors" style={{ color: "var(--primary)" }}>
                    View Achievement <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
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
                    {cert.organization} · {cert.issue_date || cert.start_date || "Present"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <AchievementModal 
        achievement={selectedAchievement} 
        isOpen={!!selectedAchievement} 
        onClose={() => setSelectedAchievement(null)} 
      />
    </section>
  );
}
