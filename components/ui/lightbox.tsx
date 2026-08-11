"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface LightboxProps {
  images: { url: string; caption?: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handlePrev = useCallback(() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1)), [images.length]);
  const handleNext = useCallback(() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)), [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, images.length, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 md:left-10 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 md:right-10 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full flex-1">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || `Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {images[currentIndex].caption && (
            <div className="mt-4 text-center">
              <p className="text-white/80 text-lg">{images[currentIndex].caption}</p>
            </div>
          )}
          {images.length > 1 && (
            <p className="mt-2 text-white/50 text-sm">{currentIndex + 1} / {images.length}</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
