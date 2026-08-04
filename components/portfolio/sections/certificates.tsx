"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, ExternalLink, FileText, Sparkles } from "lucide-react";
import type { Certificate } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { clsx } from "clsx";

export function Certificates({ items }: { items: Certificate[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];
  const visibleItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);

  return (
    <section id="credentials" className="relative py-24 md:py-32">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20">
          <SectionHeading 
            eyebrow="Credentials" 
            title="Learning with proof." 
            body="Professional certifications and continuous education milestones."
            className="mb-0 md:mb-0"
          />

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300",
                    activeCategory === category 
                      ? "bg-ink text-background shadow-md" 
                      : "bg-transparent text-ink-muted hover:text-ink hover:bg-background-elevated border border-line"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {visibleItems.map((certificate, index) => (
              <motion.article
                key={certificate.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4) }}
                className="group flex flex-col overflow-hidden rounded-[2rem] bg-background-elevated border border-line glass-card"
              >
                {/* Preview Image */}
                <button 
                  onClick={() => window.open(certificate.file_url, "_blank", "noopener,noreferrer")}
                  aria-label={`Preview ${certificate.title}`}
                  className="relative w-full aspect-[1.65] bg-gradient-to-tr from-gradient-1/10 to-gradient-3/10 overflow-hidden flex items-center justify-center text-ink-muted border-b border-line cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-gradient-1/20 to-gradient-3/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
                  
                  {certificate.thumbnail_url ? (
                    <img 
                      src={certificate.thumbnail_url} 
                      alt="" 
                      loading="lazy" 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  ) : (
                    <FileText size={48} opacity={0.3} className="transition-transform duration-700 ease-out-expo group-hover:scale-110 group-hover:text-ink" />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink/80 backdrop-blur-md text-xs font-bold text-background uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Preview <ArrowUpRight size={14} />
                    </span>
                  </div>
                </button>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6 sm:p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gradient-1/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <p className="text-xs font-bold text-gradient-1 uppercase tracking-widest mb-3">
                    {certificate.category}
                  </p>
                  
                  <h3 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-ink mb-1">
                    {certificate.title}
                  </h3>
                  
                  {certificate.organization && (
                    <strong className="text-sm font-semibold text-ink-secondary block mb-4">
                      {certificate.organization}
                    </strong>
                  )}
                  
                  {(certificate.professional_summary || certificate.description) && (
                    <p className="text-sm text-ink-secondary leading-relaxed mb-6 line-clamp-3">
                      {certificate.professional_summary ?? certificate.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    {certificate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {certificate.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2.5 py-1 rounded-md bg-background-subtle border border-line text-[10px] font-bold text-ink-muted tracking-wide">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-line/50">
                      {certificate.issue_date && (
                        <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                          <CalendarDays size={14} /> {certificate.issue_date}
                        </span>
                      )}
                      
                      {certificate.credential_url && (
                        <a 
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-gradient-1 transition-colors"
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
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Credentials will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
