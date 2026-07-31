"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Decorative geometric shapes floating with parallax
 */
export function FloatingShapes({ className }: { className?: string }) {
  const shapes = [
    {
      type: "circle",
      size: 120,
      x: "10%",
      y: "20%",
      color: "rgba(108, 99, 255, 0.06)",
      delay: 0,
      duration: 8,
    },
    {
      type: "circle",
      size: 80,
      x: "80%",
      y: "30%",
      color: "rgba(0, 212, 255, 0.05)",
      delay: 1,
      duration: 10,
    },
    {
      type: "ring",
      size: 100,
      x: "70%",
      y: "70%",
      color: "rgba(168, 85, 247, 0.08)",
      delay: 2,
      duration: 7,
    },
    {
      type: "circle",
      size: 60,
      x: "20%",
      y: "80%",
      color: "rgba(108, 99, 255, 0.04)",
      delay: 3,
      duration: 9,
    },
    {
      type: "ring",
      size: 140,
      x: "90%",
      y: "10%",
      color: "rgba(0, 212, 255, 0.03)",
      delay: 1.5,
      duration: 11,
    },
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -25, 0, 15, 0],
            x: [0, 10, 0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        >
          {shape.type === "circle" ? (
            <div
              className="w-full h-full rounded-full"
              style={{
                background: shape.color,
                filter: "blur(30px)",
              }}
            />
          ) : (
            <div
              className="w-full h-full rounded-full border"
              style={{
                borderColor: shape.color,
                filter: "blur(1px)",
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
