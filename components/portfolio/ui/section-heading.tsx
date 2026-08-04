"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  number?: string;
  eyebrow: string;
  title: string;
  body?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  number,
  eyebrow,
  title,
  body,
  className = "",
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={`${align === "center" ? "text-center mx-auto" : ""} max-w-3xl mb-16 md:mb-24 ${className}`}
    >
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-3 mb-5 text-ink-muted text-[11px] font-semibold uppercase tracking-[0.2em] font-body"
      >
        {number && (
          <span className="text-accent font-mono font-bold">{number}</span>
        )}
        <span className="w-8 h-px bg-ink-muted/40" />
        {eyebrow}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium text-ink tracking-[-0.04em] leading-[0.92] text-balance"
      >
        {title}
      </motion.h2>

      {body && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 text-base md:text-lg text-ink-secondary leading-relaxed max-w-xl"
        >
          {body}
        </motion.p>
      )}
    </div>
  );
}
