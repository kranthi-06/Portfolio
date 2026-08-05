"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  variant?: "char" | "word" | "line";
  once?: boolean;
}

/**
 * Text with staggered reveal animation — character, word, or line level
 */
export function AnimatedText({
  text,
  className,
  delay = 0,
  variant = "word",
  once = true,
}: AnimatedTextProps) {
  const items = variant === "char"
    ? text.split("")
    : variant === "word"
    ? text.split(" ")
    : [text];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: variant === "char" ? 0.02 : variant === "word" ? 0.08 : 0,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: variant === "word" ? -40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.span
      className={cn("inline-flex flex-wrap", className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          className="inline-block"
          style={{ perspective: "400px" }}
        >
          {item}
          {variant !== "char" && variant !== "line" && i < items.length - 1 && (
            <span>&nbsp;</span>
          )}
        </motion.span>
      ))}
    </motion.span>
  );
}
