"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MagneticButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  children: ReactNode;
  strength?: number;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function MagneticButton({
  children,
  strength = 40,
  variant = "primary",
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * (strength / width), y: middleY * (strength / height) });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const variants = {
    primary: "bg-ink text-background hover:shadow-glow hover:scale-105 border-transparent",
    secondary: "bg-background-elevated text-ink hover:shadow-card-hover border-line hover:border-line-strong",
    outline: "bg-transparent text-ink border-line hover:border-ink hover:bg-background-elevated",
    ghost: "bg-transparent text-ink hover:bg-background-subtle border-transparent",
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
