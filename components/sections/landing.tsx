"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownRight, Sparkles } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { ParticleField } from "@/components/effects/particle-field";
import { Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";

const rotatingWords = ["useful.", "human.", "inevitable."];

export function LandingSection() {
  const { personalInfo: personal } = usePortfolio();
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayText(rotatingWords[0]);
      return;
    }

    const word = rotatingWords[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayText.length < word.length) {
      timeout = setTimeout(() => setDisplayText(word.slice(0, displayText.length + 1)), 80);
    } else if (!deleting && displayText.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(word.slice(0, displayText.length - 1)), 45);
    } else if (deleting && displayText.length === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, deleting, wordIndex]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  return (
    <section
      id="landing"
      className="relative min-h-screen flex items-center overflow-hidden"
      onPointerMove={handlePointerMove}
      aria-labelledby="landing-title"
    >
      <ParticleField count={50} />

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${50 + pointer.x * 8}% ${40 + pointer.y * 8}%, var(--glow), transparent 70%)`,
          transition: "background 0.4s ease",
        }}
      />

      <div className="container relative z-10 pt-32 pb-20 px-[var(--page-padding)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-8 items-center">
          <div>
            <Reveal delay={0.1}>
              <p className="eyebrow mb-8">
                AI systems engineer · product builder
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <h1
                id="landing-title"
                className="font-display font-medium tracking-[-0.05em] leading-[0.92] mb-8"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)", color: "var(--ink)" }}
              >
                Making AI feel
                <br />
                <span className="font-serif italic tracking-[-0.06em]">
                  {displayText}
                  <span className="inline-block w-[3px] h-[0.75em] ml-1 align-middle animate-pulse" style={{ background: "var(--accent)" }} />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.35}>
              <p className="text-lg leading-relaxed mb-10 max-w-lg" style={{ color: "var(--ink-secondary)" }}>
                {personal.bio}
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="flex flex-wrap items-center gap-4">
                <Magnetic>
                  <a href="#products" className="btn btn-primary">
                    Explore products <ArrowDownRight size={16} />
                  </a>
                </Magnetic>
                <a href="#philosophy" className="btn btn-ghost">
                  Read my philosophy
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.6}>
              <div
                className="flex items-center gap-6 mt-16 pt-8 text-[11px] uppercase tracking-[0.12em] font-semibold"
                style={{ color: "var(--ink-muted)", borderTop: "1px solid var(--line)" }}
              >
                <span>02 live products</span>
                <span style={{ width: 1, height: 12, background: "var(--line)" }} />
                <span>{personal.location} · global</span>
                <span style={{ width: 1, height: 12, background: "var(--line)" }} />
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} /> {personal.availability}
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3} direction="left">
            <div
              className="relative flex justify-center lg:justify-end"
              style={{
                transform: `translate(${pointer.x * 6}px, ${pointer.y * 6}px)`,
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="relative w-[min(340px,85vw)]">
                <motion.div
                  className="absolute -inset-8 rounded-full opacity-30 blur-3xl"
                  style={{ background: "linear-gradient(135deg, var(--gradient-1), var(--gradient-2))" }}
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />

                <div
                  className="relative aspect-[3/4] rounded-[140px_140px_24px_24px] overflow-hidden"
                  style={{
                    border: "1px solid var(--line)",
                    boxShadow: "var(--shadow-lg)",
                    background: "var(--bg-elevated)",
                  }}
                >
                  <Image
                    src={personal.avatar_url || "/assets/images/kranthi-kiran-portrait.png"}
                    alt={`Portrait of ${personal.name}`}
                    fill
                    priority
                    sizes="(max-width: 800px) 280px, 340px"
                    className="object-cover object-[50%_30%]"
                    style={{ filter: "saturate(0.95) contrast(1.03)" }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-6 pt-16"
                    style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-white/70 mb-1">
                      {personal.title}
                    </p>
                    <p className="font-display text-white text-base font-medium tracking-tight leading-snug">
                      Intelligence, shaped into<br />clearer experiences.
                    </p>
                  </div>
                </div>

                <motion.div
                  className="absolute -top-4 -right-2 glass px-3 py-2 text-[11px] font-semibold flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Building the future
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-4 glass px-3 py-2 text-[11px] font-semibold"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  AI-native thinking
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
