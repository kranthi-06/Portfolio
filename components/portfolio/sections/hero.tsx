"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, MapPin, Sparkles, UserRound, Download } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";
import { SafeImage } from "../ui/safe-image";
import { clsx } from "clsx";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Hero({ data }: { data?: PortfolioData }) {
  if (!data) return null;

  const { profile, counters, projects = [] } = data;
  const heroCopy = text(profile?.headline) ?? text(profile?.tagline) ?? text(profile?.bio);
  
  const counterEntries = counters ? Object.entries(counters)
    .filter(([, value]) => value !== undefined && value !== null)
    .slice(0, 4) : [];

  const imageUrl = text(profile?.hero_image_url) ?? text(profile?.avatar_url);

  return (
    <section id="top" className="relative h-screen min-h-[800px] flex flex-col justify-center overflow-hidden bg-background">
      {/* Absolute minimal radial lighting (Apple style subtle glow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1200px] rounded-full bg-accent/[0.015] blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <div className="container-narrow relative z-10 pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full flex flex-col items-start"
          >
            {/* Availability Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full border border-line bg-background-elevated shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-ink-secondary tracking-wide">
                {text(profile?.availability) ?? "Available for new opportunities"}
              </span>
            </motion.div>

            {/* Typography */}
            <h1 className="font-display font-medium tracking-tight text-ink mb-6 max-w-2xl leading-[1.05]">
              <span className="block text-5xl sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]">
                {text(profile?.name) ?? "Portfolio"}
              </span>
              {text(profile?.title) && (
                <span className="block mt-4 text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-ink-secondary italic tracking-normal">
                  {profile.title}
                </span>
              )}
            </h1>

            {/* Description */}
            {heroCopy ? (
              <p className="max-w-xl text-lg sm:text-xl text-ink-secondary leading-relaxed mb-10 text-pretty font-body">
                {heroCopy}
              </p>
            ) : (
              <div className="max-w-lg p-5 mb-10 rounded-xl border border-dashed border-line-strong text-ink-muted text-sm flex items-center gap-3">
                <Sparkles size={16} /> An introduction will appear here.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <a href="#projects">
                <MagneticButton variant="primary" className="px-7 py-3.5 rounded-full bg-ink text-background hover:bg-ink/90 transition-colors flex items-center gap-2 font-medium text-sm">
                  Explore Work <ArrowDownRight size={16} />
                </MagneticButton>
              </a>
              {data?.resume?.file_url && (
                <a href={data.resume.file_url} target="_blank" rel="noreferrer">
                  <MagneticButton variant="outline" className="px-7 py-3.5 rounded-full border border-line bg-transparent hover:bg-background-subtle text-ink transition-colors flex items-center gap-2 font-medium text-sm">
                    Résumé <Download size={15} />
                  </MagneticButton>
                </a>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mt-12 text-sm text-ink-muted font-medium border-t border-line/50 pt-6">
              {text(profile?.location) && (
                <span className="flex items-center gap-2">
                  <MapPin size={15} /> {profile.location}
                </span>
              )}
              {Array.isArray(projects) && projects.length > 0 && (
                <span className="flex items-center gap-2">
                  <Sparkles size={15} /> {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              )}
            </div>
          </motion.div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block w-full max-w-[420px]"
          >
            <div className="relative aspect-[3/4] w-full rounded-[2rem] overflow-hidden border border-line bg-background-elevated shadow-xl">
              {imageUrl ? (
                <SafeImage
                  src={imageUrl}
                  alt={text(profile?.name) ? `Portrait of ${profile.name}` : "Portfolio portrait"}
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-ink-muted bg-background-subtle">
                  <UserRound size={48} className="opacity-20" />
                </div>
              )}
              
              {/* Vercel style subtle inner border shadow for depth */}
              <div className="absolute inset-0 border border-white/10 dark:border-white/5 rounded-[2rem] pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-muted"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-ink-muted to-transparent opacity-50" />
      </motion.div>
    </section>
  );
}
