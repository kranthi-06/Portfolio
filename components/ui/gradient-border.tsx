"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  animated?: boolean;
  gradient?: string;
}

/**
 * Animated rotating gradient border wrapper
 */
export function GradientBorder({
  children,
  className,
  borderWidth = 1,
  animated = true,
  gradient = "from-primary via-secondary to-accent",
}: GradientBorderProps) {
  return (
    <div className={cn("relative rounded-2xl p-[1px] group", className)}>
      {/* Gradient border */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-40 group-hover:opacity-100 transition-opacity duration-500",
          gradient,
          animated && "animate-gradient"
        )}
        style={{
          padding: borderWidth,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Inner content */}
      <div className="relative rounded-2xl bg-card z-10">
        {children}
      </div>
    </div>
  );
}
