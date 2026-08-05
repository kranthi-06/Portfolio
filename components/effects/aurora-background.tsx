"use client";

import { cn } from "@/lib/utils";

/**
 * Animated aurora borealis gradient blobs with slow organic movement
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Primary blob */}
      <div
        className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20 animate-blob"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(108, 99, 255, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Secondary blob */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-15 animate-blob"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 212, 255, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "2s",
        }}
      />

      {/* Accent blob */}
      <div
        className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-10 animate-blob"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "4s",
        }}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
