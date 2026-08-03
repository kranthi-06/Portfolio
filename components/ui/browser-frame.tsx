"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Lock, RefreshCw, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  title: string;
  url?: string;
  image: string;
  accent?: "violet" | "ocean" | "ember" | string;
  className?: string;
  aspectRatio?: string;
}

export function BrowserFrame({
  title,
  url = "#",
  image,
  accent = "violet",
  className,
  aspectRatio = "aspect-[16/10]",
}: BrowserFrameProps) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 3D Motion Spring Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["-100%", "200%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Clean domain display
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Accent color glow styles
  const glowShadowMap: Record<string, string> = {
    violet: "shadow-[0_20px_60px_-15px_rgba(139,92,246,0.35)] hover:shadow-[0_25px_80px_-10px_rgba(139,92,246,0.55)]",
    ocean: "shadow-[0_20px_60px_-15px_rgba(14,165,233,0.35)] hover:shadow-[0_25px_80px_-10px_rgba(14,165,233,0.55)]",
    ember: "shadow-[0_20px_60px_-15px_rgba(249,115,22,0.35)] hover:shadow-[0_25px_80px_-10px_rgba(249,115,22,0.55)]",
  };

  const glowShadow = glowShadowMap[accent] || glowShadowMap.violet;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        y: {
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      }}
      className={cn(
        "group relative cursor-pointer rounded-2xl overflow-hidden select-none",
        "bg-zinc-950/90 backdrop-blur-2xl",
        "border border-white/15 hover:border-primary/50",
        "transition-all duration-500 ease-out",
        glowShadow,
        className
      )}
    >
      {/* Chrome / Arc Style Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-white/10 backdrop-blur-md z-20 relative">
        {/* Mac OS Window Controls */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-red-600/40 shadow-sm group-hover:scale-110 transition-transform" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-yellow-600/40 shadow-sm group-hover:scale-110 transition-transform" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-green-600/40 shadow-sm group-hover:scale-110 transition-transform" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-white/10 text-xs text-zinc-300 max-w-[260px] sm:max-w-xs truncate font-mono shadow-inner group-hover:border-primary/40 group-hover:bg-zinc-800 transition-colors">
          <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="truncate text-[11px] tracking-wide text-zinc-300">
            {displayUrl}
          </span>
        </div>

        {/* Status / Action Indicator */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE APP
          </span>
          <div className="p-1.5 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className={cn("relative w-full overflow-hidden bg-zinc-900", aspectRatio)}>
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={image}
            alt={`${title} real web application showcase`}
            className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Glass reflection / Sheen effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          style={{ x: sheenX }}
          transition={{ ease: "easeOut" }}
        />

        {/* Ambient Gradient Glow at bottom of viewport */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />

        {/* Dynamic Hover Action Bar Overlay */}
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-sm shadow-2xl">
            <span>Explore Live Application</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
