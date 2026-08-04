"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, body, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl mb-12 md:mb-20", className)}>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-4 text-ink-muted text-xs font-extrabold uppercase tracking-widest"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gradient-1 to-gradient-2 shadow-glow" />
        {eyebrow}
      </motion.p>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-ink tracking-tight leading-none m-0"
      >
        {title}
      </motion.h2>

      {body && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mt-6 text-base md:text-lg text-ink-secondary leading-relaxed"
        >
          {body}
        </motion.p>
      )}
    </div>
  );
}
