"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Calendar, MapPin } from "lucide-react";
import type { Event } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { SafeImage } from "../ui/safe-image";
import { clsx } from "clsx";

export function Events({ items }: { items?: Event[] }) {
  if (!Array.isArray(items)) return null;

  return (
    <section id="events" className="relative py-32 bg-background-elevated/30">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="07"
          eyebrow="Community & Leadership"
          title="Events & Speaking."
          body="Talks, workshops, and community events."
        />

        {items.length > 0 ? (
          <div className="flex flex-col gap-6 mt-16">
            {items.map((event, index) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                className="group relative flex flex-col md:flex-row items-start md:items-center gap-8 p-6 md:p-8 rounded-2xl bg-background border border-line shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative w-full md:w-48 aspect-video md:aspect-square overflow-hidden rounded-xl bg-background-elevated shrink-0 border border-line/50">
                  {event.cover_image_url ? (
                    <SafeImage
                      src={event.cover_image_url}
                      alt={event.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 200px"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted bg-background-subtle">
                      <Calendar size={24} className="opacity-30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded bg-background-elevated border border-line text-[10px] font-bold text-ink uppercase tracking-widest shadow-sm">
                      {event.event_type ?? "Event"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                      <Calendar size={12} strokeWidth={2} /> {event.event_date}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-display font-medium text-ink tracking-tight mb-3 group-hover:text-ink-secondary transition-colors truncate">
                    {event.name}
                  </h3>

                  {event.description && (
                    <p className="text-[15px] text-ink-secondary leading-relaxed font-body mb-5 max-w-2xl line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto border-t border-line/50 pt-4">
                    {event.location && (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted uppercase tracking-widest">
                        <MapPin size={12} /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Events will appear here soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
