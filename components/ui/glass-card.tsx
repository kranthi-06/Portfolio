"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverGlow?: boolean;
  tiltEffect?: boolean;
}

/**
 * Glassmorphism card with optional glow border, noise texture, and hover tilt
 */
export function GlassCard({
  children,
  className,
  glowColor = "108, 99, 255",
  hoverGlow = true,
  tiltEffect = true,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`
    radial-gradient(
      350px circle at ${mouseX}px ${mouseY}px,
      rgba(${glowColor}, 0.08),
      transparent 80%
    )
  `;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      whileHover={tiltEffect ? { y: -4, transition: { duration: 0.3 } } : {}}
      className={cn(
        "relative rounded-2xl overflow-hidden group",
        "bg-card/60 backdrop-blur-xl",
        "border border-white/[0.05]",
        "transition-colors duration-500",
        hoverGlow && "hover:border-primary/30",
        className
      )}
    >
      {/* Mouse-following gradient overlay */}
      {hoverGlow && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
