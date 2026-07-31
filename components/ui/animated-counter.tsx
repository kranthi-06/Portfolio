"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
  label?: string;
}

export function AnimatedCounter({ value, suffix = "", duration = 2, className = "", label }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    if (started) spring.set(value);
  }, [started, spring, value]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
      {suffix}
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
