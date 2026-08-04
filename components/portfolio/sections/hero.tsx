"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, MapPin, Sparkles, UserRound, Download } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Hero({ data }: { data: PortfolioData }) {
  const { profile, counters, projects } = data;
  const heroCopy = text(profile.headline) ?? text(profile.tagline) ?? text(profile.bio);
  const counterEntries = Object.entries(counters).filter(([, value]) => value !== undefined).slice(0, 4);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section id="top" className="relative min-h-[90vh] flex flex-col justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-gradient-1/20 to-transparent blur-[120px] pointer-events-none mix-blend-screen animate-float-slow"
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-l from-gradient-2/20 to-transparent blur-[120px] pointer-events-none mix-blend-screen animate-float"
        style={{ animationDelay: "-4s" }}
      />
      
      {/* Interactive Cursor Light */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03), transparent 40%)`
        }}
      />

      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-24 items-center">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full glass border border-line-strong shadow-sm text-xs font-semibold text-ink-muted uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-1 animate-pulse-glow" />
            {text(profile.availability) ?? "Available for new opportunities"}
          </motion.div>
          
          <h1 className="text-[clamp(3.5rem,8vw,7.5rem)] font-heading font-medium tracking-tighter leading-[0.9] text-ink mb-6 text-balance">
            {text(profile.name) ?? "Portfolio"}
            {text(profile.title) && (
              <span className="block mt-2 text-[0.6em] font-serif font-normal text-ink-secondary italic">
                {profile.title}
              </span>
            )}
          </h1>
          
          {heroCopy ? (
            <p className="max-w-xl text-lg md:text-xl text-ink-secondary leading-relaxed mb-10 text-balance">
              {heroCopy}
            </p>
          ) : (
            <div className="max-w-xl p-6 mb-10 rounded-2xl border border-dashed border-line-strong text-ink-muted text-sm flex items-center gap-3">
              <Sparkles size={16} /> An introduction will appear here when published.
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-4">
            <a href="#projects">
              <MagneticButton variant="primary">
                Explore work <ArrowDownRight size={16} />
              </MagneticButton>
            </a>
            {data.resume && (
              <a href={data.resume.file_url} target="_blank" rel="noreferrer">
                <MagneticButton variant="outline">
                  View résumé <Download size={16} />
                </MagneticButton>
              </a>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-12 text-sm font-medium text-ink-muted">
            {text(profile.location) && (
              <span className="flex items-center gap-2">
                <MapPin size={15} /> {profile.location}
              </span>
            )}
            {projects.length > 0 && (
              <span className="flex items-center gap-2">
                <Sparkles size={15} /> {projects.length} published {projects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>
        </motion.div>

        {/* Right Content - Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.1, type: "spring", stiffness: 50 }}
          className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-gradient-1/20 to-gradient-3/20 blur-2xl transform rotate-3 scale-105" />
          <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-line-strong glass-card shadow-2xl z-10 group">
            {(text(profile.hero_image_url) || text(profile.avatar_url)) ? (
              <img 
                src={text(profile.hero_image_url) ?? text(profile.avatar_url) ?? ""} 
                alt={text(profile.name) ? `Portrait of ${profile.name}` : "Portfolio portrait"}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-ink-muted bg-background-subtle">
                <UserRound size={48} opacity={0.5} />
                <span className="text-sm font-medium">Profile image</span>
              </div>
            )}
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform" />
          </div>
        </motion.div>
      </div>

      {/* Counters */}
      {counterEntries.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-[min(1180px,calc(100%-40px))] mx-auto mt-20 relative z-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-line">
            {counterEntries.map(([key, value], idx) => (
              <div 
                key={key} 
                className={clsx(
                  "p-6 md:p-8 flex flex-col justify-center",
                  idx !== 0 && "border-l border-line",
                  (idx === 2 || idx === 3) && "border-t md:border-t-0 border-line"
                )}
              >
                <span className="text-3xl md:text-4xl font-heading font-medium text-ink tracking-tight">
                  {value}
                </span>
                <span className="mt-2 text-xs font-bold text-ink-muted uppercase tracking-widest">
                  {label(key)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
