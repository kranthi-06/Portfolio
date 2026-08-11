"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Award, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/portfolio/types";
import { MagneticButton } from "./magnetic-button";
import { modalOverlay, modalContent } from "@/lib/animations";
import Image from "next/image";
import { Lightbox } from "./lightbox";

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
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

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
            "rounded-3xl glass-strong",
            "border border-white/10",
            "shadow-2xl"
          )}
        >
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Cover Image */}
          {achievement.media?.url ? (
             <div className="relative w-full h-64 sm:h-80 bg-zinc-950/60 rounded-t-3xl border-b border-white/10 overflow-hidden">
                <Image src={achievement.media.url} alt={achievement.title} fill className="object-cover opacity-80" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
             </div>
          ) : (
            <div className="w-full h-32 bg-zinc-950/60 rounded-t-3xl border-b border-white/10" />
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-8 -mt-16 sm:-mt-24 relative z-10">
            {/* Title & Badge */}
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                style={{ background: `${achievement.color || '#FFD700'}20`, color: achievement.color || '#FFD700', border: `1px solid ${achievement.color || '#FFD700'}40` }}
              >
                <Award size={32} />
              </div>
              <div className="pt-2">
                <h3 className="text-2xl sm:text-4xl font-display font-medium text-white mb-2">{achievement.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-muted text-sm font-medium">
                  {achievement.event && <span className="text-primary">{achievement.event}</span>}
                  {achievement.event && achievement.date && <span className="w-1 h-1 rounded-full bg-white/20" />}
                  {achievement.date && <span>{achievement.date}</span>}
                  {achievement.position && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${achievement.color || '#FFD700'}20`, color: achievement.color || '#FFD700' }}>{achievement.position}</span>}
                </div>
              </div>
            </div>

            {/* Description */}
            {achievement.description && (
              <div>
                <h4 className="text-lg font-semibold font-heading mb-3 text-white">Overview</h4>
                <p className="text-muted leading-relaxed text-sm sm:text-base">{achievement.description}</p>
              </div>
            )}

            {/* Event & Recognition Gallery */}
            {hasGallery && (
              <div>
                <h4 className="text-lg font-semibold font-heading mb-4 text-white flex items-center gap-2">
                   <ImageIcon size={18} className="text-primary" /> Event & Recognition Gallery
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img, i) => (
                    <div 
                      key={img.url} 
                      className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/10"
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                    >
                      <Image src={img.url} alt={img.caption || `Gallery image ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="300px" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence & Verification Links */}
            {(hasExternalEvidence || hasCertificate) && (
              <div>
                 <h4 className="text-lg font-semibold font-heading mb-4 text-white flex items-center gap-2">
                   <ExternalLink size={18} className="text-primary" /> Verification & Evidence
                </h4>
                <div className="flex flex-wrap gap-3">
                  {hasCertificate && (
                    <MagneticButton href={achievement.certificate_url!} target="_blank" variant="primary" size="sm">
                       <FileText className="w-4 h-4" /> View Certificate
                    </MagneticButton>
                  )}
                  {achievement.evidence?.map((ev, i) => (
                    <MagneticButton key={i} href={ev.url} target="_blank" variant="secondary" size="sm">
                      <ExternalLink className="w-4 h-4" /> {ev.label}
                    </MagneticButton>
                  ))}
                </div>
              </div>
            )}
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
