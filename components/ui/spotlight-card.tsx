"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

/**
 * Card with mouse-following spotlight/gradient effect
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "108, 99, 255",
  spotlightSize = 300,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      ${spotlightSize}px circle at ${mouseX}px ${mouseY}px,
      rgba(${spotlightColor}, 0.1),
      transparent 80%
    )
  `;

  const borderGradient = useMotionTemplate`
    radial-gradient(
      ${spotlightSize * 0.6}px circle at ${mouseX}px ${mouseY}px,
      rgba(${spotlightColor}, 0.3),
      transparent 80%
    )
  `;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        className
      )}
    >
      {/* Spotlight border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: borderGradient }}
      />

      {/* Inner card */}
      <div className="relative rounded-2xl bg-card/80 backdrop-blur-sm border border-white/[0.05] m-[1px] overflow-hidden">
        {/* Spotlight fill */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: spotlightBackground }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}
