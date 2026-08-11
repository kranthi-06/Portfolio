"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Image as ImageIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/portfolio/types";
import { modalOverlay, modalContent } from "@/lib/animations";
import Image from "next/image";
import { Lightbox } from "./lightbox";

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

function getPreviewUrl(url?: string | null) {
  if (!url) return "";
  if (url.toLowerCase().endsWith(".pdf")) return url.replace(/\.pdf$/i, ".jpg");
  return url;
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
            "bg-white dark:bg-zinc-950",
            "rounded-[24px] sm:rounded-[32px]",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-2xl"
          )}
        >
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5 text-zinc-900 dark:text-white" />
          </button>

          <div className="flex flex-col">
            {/* Header Certificate */}
            {hasCertificate && (
               <div className="relative w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="relative w-full aspect-[1.414/1] max-h-[60vh]">
                    <Image 
                      src={getPreviewUrl(achievement.certificate_url)} 
                      alt={achievement.title} 
                      fill 
                      className="object-contain" 
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority
                    />
                  </div>
               </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Header Info */}
              <div className="space-y-5">
                <h3 className="text-3xl sm:text-4xl font-display font-semibold text-zinc-900 dark:text-zinc-50">
                  {achievement.title}
                </h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-6">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-zinc-600 dark:text-zinc-300">
                    {achievement.event && (
                      <span className="text-lg font-medium">
                        {achievement.event}
                      </span>
                    )}
                    {achievement.event && achievement.date && (
                      <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    )}
                    {achievement.date && (
                      <span className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
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
                      <span className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {achievement.position}
                      </span>
                    )}
                    {achievement.evidence?.map((ev, i) => (
                      <a 
                        key={i} 
                        href={ev.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
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
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base sm:text-lg">
                    {achievement.description}
                  </p>
                </div>
              )}

              {/* Event & Recognition Gallery */}
              {hasGallery && (
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                  <h4 className="text-lg sm:text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                     <ImageIcon size={20} className="text-zinc-900 dark:text-zinc-50" /> Event & Recognition Gallery
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {galleryImages.map((img, i) => (
                      <div 
                        key={img.url} 
                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
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
