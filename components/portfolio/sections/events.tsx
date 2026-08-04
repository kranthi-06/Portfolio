"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

export function Events({ items }: { items: PortfolioData["events"] }) {
  return (
    <section
      id="events"
      className="relative py-[var(--section-gap)] bg-background-subtle"
    >
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="07"
          eyebrow="Events"
          title="Beyond the screen."
          body="Hackathons, conferences, and community involvement."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((event, index) => (
              <motion.article
                key={event.id}
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
                {event.cover_image_url && (
                  <div className="relative w-full aspect-[1.8] overflow-hidden bg-background-subtle">
                    <img
                      src={event.cover_image_url}
                      alt={event.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-elevated/80 to-transparent opacity-60" />
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6">
                  <p className="text-[10px] font-semibold text-accent-secondary uppercase tracking-[0.15em] mb-3">
                    {event.event_type ?? "Event"}
                  </p>

                  <h3 className="text-xl font-display font-medium tracking-[-0.02em] text-ink mb-3">
                    {event.name}
                  </h3>

                  {(event.summary || event.description) && (
                    <p className="text-sm text-ink-secondary leading-relaxed mb-5 line-clamp-3">
                      {event.summary ?? event.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="flex flex-wrap items-center gap-4 mb-5">
                      {event.event_date && (
                        <span className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                          <CalendarDays size={13} /> {event.event_date}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                          <MapPin size={13} /> {event.location}
                        </span>
                      )}
                    </div>

                    {event.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-line/50">
                        {event.highlights.slice(0, 3).map((highlight) => (
                          <span
                            key={highlight}
                            className="px-2.5 py-1 rounded-full bg-background border border-line text-[10px] font-medium text-ink-secondary"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-ink-muted border border-dashed border-line-strong rounded-3xl">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm">Events will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
