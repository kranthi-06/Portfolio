"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, ExternalLink, FileText, Sparkles, Building2 } from "lucide-react";
import type { Certificate } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { SafeImage } from "../ui/safe-image";
import { clsx } from "clsx";

export function Certificates({ items }: { items?: Certificate[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  if (!Array.isArray(items)) return null;

  const categories = [
    "All",
    ...Array.from(new Set(items.map((item) => item.category))),
  ];
  
  const visibleItems = activeCategory === "All"
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <section id="credentials" className="relative py-32 bg-background-elevated/30">
      <div className="container-narrow relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <SectionHeading
            number="05"
            eyebrow="Credentials"
            title="Continuous Learning."
            body="Professional certifications, specializations, and education milestones."
            className="mb-0"
          />

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={clsx(
                    "px-4 py-2 rounded-md text-[13px] font-medium tracking-wide transition-colors duration-300",
                    activeCategory === category
                      ? "bg-ink text-background shadow-sm"
                      : "bg-transparent text-ink-muted hover:text-ink hover:bg-background-elevated"
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.8,
                  delay: Math.min(index * 0.1, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex flex-col overflow-hidden rounded-2xl bg-background border border-line shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Preview Thumbnail */}
                <button
                  onClick={() => {
                    if (certificate.file_url) {
                      window.open(certificate.file_url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  aria-label={`Preview ${certificate.title}`}
                  className="relative w-full aspect-[4/3] bg-background-elevated overflow-hidden flex items-center justify-center text-ink-muted border-b border-line cursor-pointer"
                >
                  {certificate.thumbnail_url ? (
                    <SafeImage
                      src={certificate.thumbnail_url}
                      alt={certificate.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <FileText size={32} className="opacity-20" />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-background/20 backdrop-blur-sm">
                    <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-background text-[11px] font-semibold tracking-wide shadow-xl transform scale-95 group-hover:scale-100 transition-transform duration-300">
                      View Certificate <ArrowUpRight size={14} />
                    </span>
                  </div>
                </button>

                {/* Content */}
                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.2em]">
                      {certificate.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-medium tracking-tight text-ink mb-3 group-hover:text-ink-secondary transition-colors duration-300">
                    {certificate.title}
                  </h3>

                  {certificate.organization && (
                    <span className="flex items-center gap-2 text-sm font-medium text-ink-secondary mb-6">
                      <Building2 size={16} /> {certificate.organization}
                    </span>
                  )}

                  {(certificate.professional_summary || certificate.description) && (
                    <p className="text-sm text-ink-secondary/90 leading-relaxed mb-8 line-clamp-3 font-body">
                      {certificate.professional_summary ?? certificate.description}
                    </p>
                  )}

                  <div className="mt-auto pt-6 border-t border-line/50">
                    {Array.isArray(certificate.skills) && certificate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {certificate.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-3 py-1 rounded-sm bg-background-elevated border border-line text-[11px] font-medium text-ink-muted">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 mt-auto">
                      {certificate.issue_date && (
                        <span className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                          <CalendarDays size={14} /> {certificate.issue_date}
                        </span>
                      )}

                      {certificate.credential_url && (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-ink-secondary transition-colors"
                        >
                          Verify <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Credentials will appear here soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
