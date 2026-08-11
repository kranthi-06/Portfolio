"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Image as ImageIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/portfolio/types";
import { modalOverlay, modalContent } from "@/lib/animations";
import Image from "next/image";
import { Lightbox } from "./lightbox";
import dynamic from "next/dynamic";

const PdfThumbnail = dynamic(
  () => import("@/components/certificates/pdf-thumbnail").then(mod => mod.PdfThumbnail),
  { ssr: false, loading: () => <div className="animate-pulse w-full h-full" style={{ background: "var(--bg-subtle)" }} /> }
);

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalContent achievement={achievement} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function ModalContent({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightboxOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    if (!lightboxOpen) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (!lightboxOpen) document.body.style.overflow = "";
    };
  }, [onClose, lightboxOpen]);

  const galleryImages = (achievement.gallery || []).map(g => ({ url: g.url, caption: g.caption || "" }));
  
  const hasExternalEvidence = achievement.evidence && achievement.evidence.length > 0;
  const hasCertificate = !!achievement.certificate_url;
  const isPdf = hasCertificate && achievement.certificate_url!.toLowerCase().endsWith(".pdf");
  const hasGallery = galleryImages.length > 0;

  return (
    <>
      <motion.div
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />

        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`${achievement.title} details`}
          className={cn(
            "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto",
            "rounded-[24px] sm:rounded-[32px]",
            "shadow-2xl"
          )}
          style={{ 
            background: "var(--bg-elevated)", 
            border: "1px solid var(--line)", 
            color: "var(--ink)" 
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-50 p-2 rounded-full transition-colors flex items-center justify-center"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink)" }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            {/* Header Certificate */}
            {hasCertificate && (
               <div className="relative w-full border-b" style={{ borderColor: "var(--line)", background: "var(--bg-subtle)" }}>
                  <div className="relative w-full aspect-[1.414/1] max-h-[60vh] flex items-center justify-center">
                    {isPdf ? (
                       <PdfThumbnail src={achievement.certificate_url!} title={achievement.title} />
                    ) : (
                      <Image 
                        src={achievement.certificate_url!} 
                        alt={achievement.title} 
                        fill 
                        className="object-contain" 
                        sizes="(max-width: 768px) 100vw, 1200px"
                        priority
                      />
                    )}
                  </div>
               </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Header Info */}
              <div className="space-y-5">
                <h3 className="text-3xl sm:text-4xl font-display font-semibold" style={{ color: "var(--ink)" }}>
                  {achievement.title}
                </h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--line)" }}>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4" style={{ color: "var(--ink-secondary)" }}>
                    {achievement.event && (
                      <span className="text-lg font-medium">
                        {achievement.event}
                      </span>
                    )}
                    {achievement.event && achievement.date && (
                      <span className="hidden sm:block w-1.5 h-1.5 rounded-full" style={{ background: "var(--line-strong)" }} />
                    )}
                    {achievement.date && (
                      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--ink-muted)" }}>
                        <Calendar size={16} />
                        {achievement.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge/Position & Evidence (as pills) */}
                {(achievement.position || hasExternalEvidence) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {achievement.position && (
                      <span className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium" style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink-secondary)" }}>
                        {achievement.position}
                      </span>
                    )}
                    {achievement.evidence?.map((ev, i) => (
                      <a 
                        key={i} 
                        href={ev.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:brightness-95"
                        style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink-secondary)" }}
                      >
                        {ev.label}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {achievement.description && (
                <div className="prose max-w-none">
                  <p className="leading-relaxed text-base sm:text-lg" style={{ color: "var(--ink-secondary)" }}>
                    {achievement.description}
                  </p>
                </div>
              )}

              {/* Event & Recognition Gallery */}
              {hasGallery && (
                <div className="pt-6 border-t" style={{ borderColor: "var(--line)" }}>
                  <h4 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--ink)" }}>
                     <ImageIcon size={20} style={{ color: "var(--ink)" }} /> Event & Recognition Gallery
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {galleryImages.map((img, i) => (
                      <div 
                        key={img.url} 
                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border shadow-sm hover:shadow-md transition-all"
                        style={{ borderColor: "var(--line)" }}
                        onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      >
                        <Image src={img.url} alt={img.caption || `Gallery image ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <Lightbox 
        images={galleryImages} 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        initialIndex={lightboxIndex} 
      />
    </>
  );
}
