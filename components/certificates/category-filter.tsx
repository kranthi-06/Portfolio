"use client";

import { motion } from "framer-motion";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ categories, activeCategory, onChange, counts }: CategoryFilterProps) {
  const filters = ["All", ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 certificates-scrollbar" role="tablist" aria-label="Filter certificates by category">
      {filters.map((category) => {
        const active = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(category)}
            className="relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors"
            style={{ color: active ? "var(--accent-fg)" : "var(--ink-secondary)" }}
          >
            {active && (
              <motion.span
                layoutId="certificate-active-filter"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10">{category} <span className="opacity-60">{category === "All" ? counts.All : counts[category]}</span></span>
          </button>
        );
      })}
    </div>
  );
}
