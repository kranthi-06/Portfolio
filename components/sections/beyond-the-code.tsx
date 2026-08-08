"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Calendar, Trophy, Image as ImageIcon, Award, ExternalLink } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal } from "@/components/ui/reveal";

export function BeyondTheCodeSection() {
  const { events, achievements, gallery, certifications } = usePortfolio();
  const [activeTab, setActiveTab] = useState<"events" | "achievements" | "gallery">("achievements");

  const tabs = [
    { id: "events", label: "Events", icon: Calendar, count: events.length },
    { id: "achievements", label: "Achievements & Certs", icon: Trophy, count: achievements.length + certifications.length },
    { id: "gallery", label: "Gallery", icon: ImageIcon, count: gallery.length },
  ] as const;

  return (
    <section id="beyond-the-code" className="section overflow-hidden" aria-labelledby="beyond-the-code-title">
      <div className="container">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-6">Beyond the code</p>
            <h2 id="beyond-the-code-title" className="section-title mb-6">
              Life outside the <span className="font-serif italic font-normal">IDE.</span>
            </h2>
            <p className="section-subtitle">
              Hackathons, community events, milestones, and moments captured along the journey.
            </p>
          </div>
        </Reveal>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b" style={{ borderColor: "var(--line)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative`}
              style={{ color: activeTab === tab.id ? "var(--ink)" : "var(--ink-muted)" }}
            >
              <tab.icon size={16} />
              {tab.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--ink-muted)" }}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "achievements" && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {/* Certificates */}
                {certifications.map((cert) => (
                  <div key={`cert-${cert.id}`} className="flex flex-col p-5 rounded-2xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                        <Award size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: "var(--bg-subtle)", color: "var(--ink-muted)" }}>
                        {cert.category}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: "var(--ink)" }}>{cert.title}</h3>
                    {cert.organization && <p className="text-sm font-medium mb-3" style={{ color: "var(--ink-muted)" }}>{cert.organization}</p>}
                    <p className="text-sm line-clamp-3 mb-4" style={{ color: "var(--ink-secondary)" }}>{cert.description}</p>
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-auto hover:underline" style={{ color: "var(--accent)" }}>
                        View Credential <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
                {/* Achievements */}
                {achievements.map((ach) => (
                  <div key={`ach-${ach.title}`} className="flex flex-col p-5 rounded-2xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ach.color ? `${ach.color}15` : "var(--accent-soft)", color: ach.color || "var(--accent)" }}>
                        <Trophy size={20} />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: "var(--ink)" }}>{ach.title}</h3>
                    {ach.event && <p className="text-sm font-medium mb-3" style={{ color: "var(--ink-muted)" }}>{ach.event}</p>}
                    {ach.description && <p className="text-sm line-clamp-3" style={{ color: "var(--ink-secondary)" }}>{ach.description}</p>}
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "events" && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl"
              >
                {events.map((event, i) => (
                  <div key={`event-${event.id}`} className="flex gap-4 md:gap-6 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)", color: "var(--ink)" }}>
                        <Calendar size={14} />
                      </div>
                      {i !== events.length - 1 && <div className="w-[1px] flex-1 my-2" style={{ background: "var(--line)" }} />}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "var(--accent)" }}>{event.event_date}</p>
                      <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--ink)" }}>{event.name}</h3>
                      <p className="text-sm font-medium mb-2" style={{ color: "var(--ink-muted)" }}>{event.organizer} {event.location && `· ${event.location}`}</p>
                      {event.summary && <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>{event.summary}</p>}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "gallery" && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {gallery.map((item) => (
                  <div key={`gal-${item.id}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5 border" style={{ borderColor: "var(--line)" }}>
                    <Image
                      src={item.media.url}
                      alt={item.title || "Gallery image"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {(item.title || item.caption) && (
                      <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/80 to-transparent translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {item.title && <h3 className="text-white text-sm font-medium mb-1">{item.title}</h3>}
                        {item.caption && <p className="text-white/70 text-xs line-clamp-2">{item.caption}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
