"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  magneticStrength?: number;
  type?: "button" | "submit";
}

/**
 * Button that magnetically follows cursor on hover with spring physics.
 * Supports both <a> (when href is provided) and <button> elements.
 */
export function MagneticButton({
  children,
  className,
  onClick,
  href,
  target,
  variant = "primary",
  size = "md",
  magneticStrength = 0.3,
  type = "button",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * magneticStrength);
    y.set((e.clientY - centerY) * magneticStrength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-primary via-primary/90 to-accent text-white shadow-glow hover:shadow-glow-lg",
    secondary:
      "border border-primary/30 text-white hover:bg-primary/10 hover:border-primary/60",
    ghost:
      "text-muted hover:text-white hover:bg-white/5",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
    md: "px-6 py-3 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-xl gap-2.5",
  };

  const sharedClasses = cn(
    "relative inline-flex items-center justify-center font-medium",
    "transition-all duration-300 overflow-hidden cursor-pointer",
    "active:scale-[0.98]",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {href ? (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={sharedClasses}
        >
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </a>
      ) : (
        <button
          type={type}
          onClick={onClick}
          className={sharedClasses}
        >
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
      )}
    </motion.div>
  );
}
