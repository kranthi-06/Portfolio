"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import type { Certificate } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { clsx } from "clsx";

export function Certificates({ items }: { items: Certificate[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(items.map((item) => item.category))),
  ];
  const visibleItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <section
      id="credentials"
      className="relative py-[var(--section-gap)] bg-background-subtle"
    >
      <div className="container-narrow relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 md:mb-20">
          <SectionHeading
            number="05"
            eyebrow="Credentials"
            title="Continuous learning."
            body="Professional certifications and education milestones."
            className="mb-0 md:mb-0"
          />

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-300",
                    activeCategory === category
                      ? "bg-ink text-background"
                      : "text-ink-muted hover:text-ink border border-line hover:border-line-strong"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((certificate, index) => (
              <motion.article
                key={certificate.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.08, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex flex-col overflow-hidden rounded-2xl bg-background-elevated border border-line hover:border-line-strong transition-colors duration-300"
              >
                {/* Preview */}
                <button
                  onClick={() =>
                    window.open(
                      certificate.file_url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  aria-label={`Preview ${certificate.title}`}
                  className="relative w-full aspect-[1.6] bg-background-subtle overflow-hidden flex items-center justify-center text-ink-muted border-b border-line cursor-pointer"
                >
                  {certificate.thumbnail_url ? (
                    <img
                      src={certificate.thumbnail_url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <FileText
                      size={40}
                      opacity={0.2}
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-ink/20">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Preview <ArrowUpRight size={13} />
                    </span>
                  </div>
                </button>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-[0.15em] mb-3">
                    {certificate.category}
                  </p>

                  <h3 className="text-lg font-display font-medium tracking-[-0.02em] text-ink mb-1">
                    {certificate.title}
                  </h3>

                  {certificate.organization && (
                    <strong className="text-sm font-medium text-ink-secondary block mb-3">
                      {certificate.organization}
                    </strong>
                  )}

                  {(certificate.professional_summary ||
                    certificate.description) && (
                    <p className="text-sm text-ink-secondary leading-relaxed mb-5 line-clamp-2">
                      {certificate.professional_summary ??
                        certificate.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    {certificate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {certificate.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-full bg-background-subtle border border-line text-[10px] font-medium text-ink-muted"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-line/50">
                      {certificate.issue_date && (
                        <span className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                          <CalendarDays size={13} /> {certificate.issue_date}
                        </span>
                      )}

                      {certificate.credential_url && (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-ink hover:text-accent transition-colors"
                        >
                          Verify <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm">Credentials will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
