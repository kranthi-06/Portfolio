"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal } from "@/components/ui/reveal";
import { GraduationCap, Rocket, Briefcase, CodeXml, Atom, Hexagon, Leaf, Wind, Database, GitBranch, Terminal, Code, Cloud, Box } from "lucide-react";

function getTechIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('react')) return <Atom size={14} className="text-cyan-500" />;
  if (n.includes('node') || n.includes('express')) return <Hexagon size={14} className="text-green-500" />;
  if (n.includes('mongo')) return <Leaf size={14} className="text-green-600" />;
  if (n.includes('tailwind')) return <Wind size={14} className="text-sky-400" />;
  if (n.includes('supabase') || n.includes('database')) return <Database size={14} className="text-emerald-500" />;
  if (n.includes('git')) return <GitBranch size={14} className="text-orange-500" />;
  if (n.includes('python')) return <Terminal size={14} className="text-blue-500" />;
  if (n.includes('cloud')) return <Cloud size={14} className="text-blue-400" />;
  if (n.includes('dsa') || n.includes('algorithm')) return <Box size={14} className="text-indigo-500" />;
  if (n.includes('leet')) return <Code size={14} className="text-yellow-600" />;
  if (n.includes('hackerrank')) return <Code size={14} className="text-green-500" />;
  return <Code size={14} className="text-slate-400" />;
}

function getTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('education')) return <GraduationCap size={20} />;
  if (t.includes('project')) return <Rocket size={20} />;
  if (t.includes('internship') || t.includes('work')) return <Briefcase size={20} />;
  return <CodeXml size={20} />;
}

export function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const { experience } = usePortfolio();

  return (
    <section
      id="journey"
      className="section"
      style={{ background: "var(--bg-subtle)" }}
      aria-labelledby="journey-title"
    >
      <div className="container px-4 md:px-8 max-w-5xl mx-auto">
        <Reveal className="mb-20 max-w-2xl">
          <p className="eyebrow mb-6">My journey</p>
          <h2 id="journey-title" className="section-title mb-6">
            Every step,<br />intentional.
          </h2>
          <p className="section-subtitle">
            From foundations to live products — a timeline of learning, building, and growing.
          </p>
        </Reveal>

        <div ref={containerRef} className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[90px] md:left-[160px] top-0 bottom-0 w-[1px] bg-[var(--line)]" />
          <motion.div
            className="absolute left-[90px] md:left-[160px] top-0 w-[1px] origin-top"
            style={{
              height: lineHeight,
              background: "var(--gradient-1)",
            }}
          />

          <div className="space-y-12 md:space-y-16">
            {experience.map((item, i) => {
              const displayPeriod = item.start_date
                ? `${item.start_date}${item.end_date ? ` — ${item.end_date}` : ''}`
                : "";
              const displaySubtext = item.period || (item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase());
              const displaySubtitle = [item.organization, item.subtitle].filter(Boolean).join(" • ");

              const isLast = i === experience.length - 1;

              return (
                <Reveal key={`${item.id}`} delay={i * 0.05}>
                  <div className="relative flex items-start gap-6 md:gap-10">
                    
                    {/* Left Column (Date) */}
                    <div className="w-[70px] md:w-[130px] flex-shrink-0 text-right pt-[18px]">
                      <div className="font-display font-semibold text-[13px] md:text-base tracking-tight text-[var(--ink)] whitespace-nowrap">
                        {displayPeriod}
                      </div>
                      <div className="text-[11px] md:text-[13px] font-medium text-[var(--ink-muted)] mt-1 whitespace-nowrap">
                        {displaySubtext}
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div 
                      className="absolute left-[90px] md:left-[160px] top-[26px] -translate-x-1/2 w-[14px] h-[14px] rounded-full z-10 transition-colors duration-300"
                      style={{
                        background: isLast ? "var(--gradient-1)" : "var(--bg-elevated)",
                        border: isLast ? "none" : "2px solid var(--gradient-1)",
                        boxShadow: "0 0 0 6px var(--bg-subtle)" 
                      }}
                    />

                    {/* Right Column (Content) */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start gap-4 mb-3">
                        {/* Type Icon Container */}
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm mt-1"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--gradient-1)", 
                          }}
                        >
                          {getTypeIcon(item.type)}
                        </div>

                        <div className="pt-0.5">
                          {/* Badge */}
                          <span 
                            className="inline-block px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-2"
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--ink-muted)",
                              border: "1px solid var(--line)"
                            }}
                          >
                            {item.type}
                          </span>

                          {/* Title */}
                          <h3 className="font-display text-lg md:text-2xl font-bold tracking-tight text-[var(--ink)] mb-1 leading-snug max-w-2xl">
                            {item.title}
                          </h3>
                          
                          {/* Subtitle */}
                          {displaySubtitle && (
                            <p className="text-[13px] md:text-[15px] font-medium text-[var(--ink-muted)]">
                              {displaySubtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description & Tech */}
                      <div className="pl-0 md:pl-[64px] max-w-3xl mt-4 md:mt-0">
                        {item.description && (
                          <p className="text-[14px] md:text-[15px] leading-[1.7] text-[var(--ink-secondary)] mb-6 whitespace-pre-line">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Tech Pills */}
                        {item.technologies && item.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            {item.technologies.map((tag) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] md:text-[12px] font-medium shadow-sm transition-all hover:-translate-y-0.5 cursor-default"
                                style={{
                                  background: "var(--bg-elevated)",
                                  color: "var(--ink-secondary)",
                                  border: "1px solid var(--line)",
                                }}
                              >
                                {getTechIcon(tag)}
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
