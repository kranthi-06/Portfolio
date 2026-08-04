"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

export function Events({ items }: { items: PortfolioData["events"] }) {
  return (
    <section id="events" className="relative py-24 md:py-32">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <SectionHeading 
          eyebrow="Events" 
          title="Beyond the screen." 
          body="Speaking engagements, hackathons, and community involvement."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((event, index) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
                className="group flex flex-col overflow-hidden rounded-[2rem] bg-background-elevated border border-line glass-card hover:border-line-strong transition-all duration-300"
              >
                {event.cover_image_url && (
                  <div className="relative w-full aspect-[1.8] overflow-hidden bg-background-subtle">
                    <img 
                      src={event.cover_image_url} 
                      alt={event.name} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-elevated to-transparent opacity-60" />
                  </div>
                )}
                
                <div className="flex flex-col flex-1 p-6 md:p-8">
                  <p className="text-xs font-bold text-gradient-2 uppercase tracking-widest mb-3">
                    {event.event_type ?? "Event"}
                  </p>
                  
                  <h3 className="text-2xl font-heading font-medium tracking-tight text-ink mb-3">
                    {event.name}
                  </h3>
                  
                  {(event.summary || event.description) && (
                    <p className="text-sm text-ink-secondary leading-relaxed mb-6 line-clamp-3">
                      {event.summary ?? event.description}
                    </p>
                  )}
                  
                  <div className="mt-auto">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      {event.event_date && (
                        <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                          <CalendarDays size={14} /> {event.event_date}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                          <MapPin size={14} /> {event.location}
                        </span>
                      )}
                    </div>
                    
                    {event.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-line/50">
                        {event.highlights.slice(0, 3).map((highlight) => (
                          <span key={highlight} className="px-2.5 py-1 rounded-md bg-background border border-line text-[10px] font-bold text-ink-secondary tracking-wide">
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
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Events will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
