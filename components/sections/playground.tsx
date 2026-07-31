"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Brain, Palette, Server, Wrench, Cloud } from "lucide-react";
import { playground } from "@/lib/content";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";

const iconMap = {
  code: Code2,
  brain: Brain,
  palette: Palette,
  server: Server,
  wrench: Wrench,
  cloud: Cloud,
};

export function PlaygroundSection() {
  const [activeDomain, setActiveDomain] = useState(playground.domains[0].id);

  const active = playground.domains.find((d) => d.id === activeDomain) ?? playground.domains[0];
  const Icon = iconMap[active.icon as keyof typeof iconMap] ?? Code2;

  return (
    <section
      id="playground"
      className="section overflow-hidden"
      style={{ background: "var(--bg-subtle)" }}
      aria-labelledby="playground-title"
    >
      <div className="container">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow mb-6">{playground.eyebrow}</p>
          <h2 id="playground-title" className="section-title mb-6">
            {playground.title}
          </h2>
          <p className="section-subtitle">{playground.subtitle}</p>
        </Reveal>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <StaggerReveal className="space-y-2">
            {playground.domains.map((domain) => {
              const DomainIcon = iconMap[domain.icon as keyof typeof iconMap] ?? Code2;
              const isActive = domain.id === activeDomain;
              return (
                <StaggerItem key={domain.id}>
                  <button
                    type="button"
                    onClick={() => setActiveDomain(domain.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all duration-300"
                    style={{
                      background: isActive ? "var(--bg-elevated)" : "transparent",
                      border: `1px solid ${isActive ? "var(--line-strong)" : "var(--line)"}`,
                      boxShadow: isActive ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${domain.color}18`, color: domain.color }}
                    >
                      <DomainIcon size={16} />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isActive ? "var(--ink)" : "var(--ink-muted)" }}
                    >
                      {domain.label}
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerReveal>

          <motion.div
            key={activeDomain}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-8 md:p-12 rounded-3xl min-h-[360px]"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: active.color }}
            />

            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${active.color}18`, color: active.color }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-display text-2xl font-medium tracking-tight" style={{ color: "var(--ink)" }}>
                    {active.label}
                  </p>
                  <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    {active.tools.length} technologies
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {active.tools.map((tool, i) => (
                  <motion.span
                    key={tool}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-default"
                    style={{
                      background: "var(--bg-subtle)",
                      color: "var(--ink-secondary)",
                      border: "1px solid var(--line)",
                    }}
                    whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 relative">
          <div
            className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--bg-subtle), transparent)" }}
          />
          <div
            className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--bg-subtle), transparent)" }}
          />
          <div className="overflow-hidden py-4">
            <div className="marquee-track gap-8">
              {[...playground.marquee, ...playground.marquee].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="text-2xl md:text-3xl font-display font-medium tracking-tight whitespace-nowrap px-4"
                  style={{ color: "var(--line-strong)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
