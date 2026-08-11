"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trophy, Calendar, ExternalLink, Image as ImageIcon } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal } from "@/components/ui/reveal";
import { AchievementModal } from "@/components/ui/achievement-modal";
import type { Achievement } from "@/lib/portfolio/types";
import dynamic from "next/dynamic";

const PdfThumbnail = dynamic(
  () => import("@/components/certificates/pdf-thumbnail").then(mod => mod.PdfThumbnail),
  { ssr: false, loading: () => <div className="absolute inset-0 animate-pulse w-full h-full" style={{ background: "var(--bg-subtle)" }} /> }
);

export function BeyondTheCodeSection() {
  const { events, achievements, gallery } = usePortfolio();
  const [activeTab, setActiveTab] = useState<"events" | "achievements" | "gallery">("achievements");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const tabs = [
    { id: "events", label: "Events", icon: Calendar, count: events.length },
    { id: "achievements", label: "Achievements", icon: Trophy, count: achievements.length },
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
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {/* Achievements */}
                {achievements.map((ach) => {
                  const hasCertificate = !!ach.certificate_url;
                  const isPdf = hasCertificate && (
                    ach.certificate_url!.toLowerCase().endsWith(".pdf") || 
                    ach.certificate_type === "application/pdf"
                  );

                  return (
                    <div 
                      key={`ach-${ach.title}`} 
                      onClick={() => setSelectedAchievement(ach)}
                      className="flex flex-col rounded-[20px] overflow-hidden cursor-pointer group transition-all hover:-translate-y-1" 
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}
                    >
                      {/* Full bleed Certificate Image */}
                      {hasCertificate && (
                        <div className="relative block aspect-[1.42/1] w-full overflow-hidden shrink-0 border-b" style={{ borderColor: "var(--line)", background: "var(--bg-subtle)" }}>
                          {isPdf ? (
                            <PdfThumbnail src={ach.certificate_url!} title={ach.title} />
                          ) : (
                            <Image 
                              src={ach.certificate_url!} 
                              alt={`Certificate for ${ach.title}`} 
                              fill 
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]" 
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                      )}

                      <div className="flex flex-col p-5 flex-grow">
                        {/* Top Pill (Position/Prize) */}
                        {ach.position && (
                          <div 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest self-start mb-4"
                            style={{ 
                              background: ach.color ? `${ach.color}15` : "#fef3c7", 
                              color: ach.color || "#b45309", 
                              border: `1px solid ${ach.color ? ach.color+'40' : '#fcd34d'}` 
                            }}
                          >
                            <Trophy size={12} />
                            {ach.position}
                          </div>
                        )}

                        {/* Date */}
                        {ach.date && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--gradient-1)" }}>
                            <Calendar size={12} />
                            {ach.date}
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-display font-semibold mb-2 leading-tight" style={{ color: "var(--ink)" }}>{ach.title}</h3>
                        
                        {/* Event / Subtitle */}
                        {ach.event && (
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ color: "var(--gradient-2)" }}>
                            {ach.event}
                          </p>
                        )}

                        {/* Description */}
                        {ach.description && (
                          <p className="text-[13px] leading-relaxed mb-5 line-clamp-3" style={{ color: "var(--ink-secondary)" }}>
                            {ach.description}
                          </p>
                        )}

                        {/* Media Preview (Small Thumbnails) */}
                        {ach.gallery && ach.gallery.length > 0 && (
                          <div className="flex gap-2 mb-5">
                            {ach.gallery.slice(0, 3).map((img, i) => (
                              <div key={i} className="relative h-14 w-20 sm:h-16 sm:w-24 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: "var(--line)" }}>
                                <Image 
                                  src={img.url} 
                                  alt={img.caption || `Gallery preview ${i+1}`} 
                                  fill 
                                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                                  sizes="100px" 
                                />
                                {i === 2 && ach.gallery!.length > 3 && (
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-medium text-[10px]">
                                    +{ach.gallery!.length - 3}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tags / Evidence */}
                        {ach.evidence && ach.evidence.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                            {ach.evidence.map((ev, i) => (
                              <span 
                                key={i} 
                                className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                                style={{ 
                                  color: "var(--gradient-2)", 
                                  background: "transparent", 
                                  border: "1px solid var(--gradient-2)",
                                  opacity: 0.8
                                }}
                              >
                                {ev.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
      
      <AchievementModal 
        achievement={selectedAchievement} 
        isOpen={!!selectedAchievement} 
        onClose={() => setSelectedAchievement(null)} 
      />
    </section>
  );
}
