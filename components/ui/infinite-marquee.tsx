"use client";

import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  items: string[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  separator?: string;
}

/**
 * Continuously scrolling text/icon marquee
 */
export function InfiniteMarquee({
  items,
  className,
  speed = "normal",
  direction = "left",
  separator = "•",
}: InfiniteMarqueeProps) {
  const speedMap = {
    slow: "40s",
    normal: "30s",
    fast: "20s",
  };

  const animationDuration = speedMap[speed];
  const duplicated = [...items, ...items]; // Duplicate for seamless loop

  return (
    <div
      className={cn(
        "relative overflow-hidden py-4",
        className
      )}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Scrolling content */}
      <div
        className={cn(
          "flex items-center gap-8 whitespace-nowrap",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
        )}
        style={{ animationDuration }}
      >
        {duplicated.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="text-sm md:text-base font-medium text-muted/60 hover:text-primary transition-colors duration-300">
              {item}
            </span>
            {i < duplicated.length - 1 && (
              <span className="text-primary/30">{separator}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
