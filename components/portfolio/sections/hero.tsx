"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  MapPin,
  Sparkles,
  UserRound,
  Download,
} from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";
import { clsx } from "clsx";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Hero({ data }: { data: PortfolioData }) {
  const { profile, counters, projects } = data;
  const heroCopy =
    text(profile.headline) ?? text(profile.tagline) ?? text(profile.bio);
  const counterEntries = Object.entries(counters)
    .filter(([, value]) => value !== undefined)
    .slice(0, 4);

  const hasImage = text(profile.hero_image_url) || text(profile.avatar_url);

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Ambient Gradient Orbs */}
      <div className="absolute top-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-accent/[0.06] blur-[120px] pointer-events-none animate-float" />
      <div
        className="absolute bottom-[-10%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-accent-secondary/[0.05] blur-[100px] pointer-events-none animate-float"
        style={{ animationDelay: "-3s" }}
      />

      <div className="container-narrow relative z-10 pt-40 pb-20 md:pt-48 md:pb-28">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-16 lg:gap-20 items-center">
          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Availability Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full border border-line bg-background-elevated/50 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-ink-secondary tracking-wide">
                {text(profile.availability) ??
                  "Available for new opportunities"}
              </span>
            </motion.div>

            {/* Name + Title */}
            <h1 className="font-display font-medium tracking-[-0.05em] leading-[0.88] text-ink mb-6">
              <span className="block text-[clamp(3.2rem,7.5vw,7rem)]">
                {text(profile.name) ?? "Portfolio"}
              </span>
              {text(profile.title) && (
                <span className="block mt-3 text-[clamp(1.4rem,3.2vw,2.4rem)] font-serif font-normal text-ink-secondary italic tracking-[-0.02em]">
                  {profile.title}
                </span>
              )}
            </h1>

            {/* Headline */}
            {heroCopy ? (
              <p className="max-w-lg text-lg md:text-xl text-ink-secondary leading-[1.7] mb-10 text-balance">
                {heroCopy}
              </p>
            ) : (
              <div className="max-w-lg p-5 mb-10 rounded-2xl border border-dashed border-line-strong text-ink-muted text-sm flex items-center gap-3">
                <Sparkles size={16} /> An introduction will appear here when
                published.
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a href="#projects">
                <MagneticButton variant="primary">
                  View my work <ArrowDownRight size={16} />
                </MagneticButton>
              </a>
              {data.resume && (
                <a
                  href={data.resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MagneticButton variant="outline">
                    Résumé <Download size={15} />
                  </MagneticButton>
                </a>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 mt-12 text-[13px] text-ink-muted">
              {text(profile.location) && (
                <span className="flex items-center gap-2">
                  <MapPin size={14} /> {profile.location}
                </span>
              )}
              {projects.length > 0 && (
                <span className="flex items-center gap-2">
                  <Sparkles size={14} /> {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </span>
              )}
            </div>
          </motion.div>

          {/* Right — Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
              {/* Gradient ring */}
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-accent-tertiary/20 blur-sm" />

              <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-line-strong bg-background-subtle group">
                {hasImage ? (
                  <img
                    src={
                      text(profile.hero_image_url) ??
                      text(profile.avatar_url) ??
                      ""
                    }
                    alt={
                      text(profile.name)
                        ? `Portrait of ${profile.name}`
                        : "Portfolio portrait"
                    }
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-ink-muted">
                    <UserRound size={48} opacity={0.3} />
                    <span className="text-xs font-medium">Profile image</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Counters */}
        {counterEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-24 md:mt-32"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-line">
              {counterEntries.map(([key, value], idx) => (
                <div
                  key={key}
                  className={clsx(
                    "py-8 md:py-10",
                    idx !== 0 && "border-l border-line",
                    idx >= 2 && "border-t md:border-t-0 border-line"
                  )}
                >
                  <div className="px-6 md:px-8">
                    <span className="block text-3xl md:text-4xl font-display font-medium text-ink tracking-tight">
                      {value}
                    </span>
                    <span className="block mt-2 text-[10px] font-semibold text-ink-muted uppercase tracking-[0.15em]">
                      {label(key)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
