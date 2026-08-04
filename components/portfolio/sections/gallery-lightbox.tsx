"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@/lib/portfolio/types";

interface GalleryLightboxProps {
  items: GalleryItem[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function GalleryLightbox({ items, selectedId, onClose, onSelect }: GalleryLightboxProps) {
  const selectedIndex = items.findIndex((item) => item.id === selectedId);
  const selected = items[selectedIndex];

  useEffect(() => {
    if (!selectedId) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        const prevIndex = (selectedIndex - 1 + items.length) % items.length;
        onSelect(items[prevIndex].id);
      }
      if (e.key === "ArrowRight") {
        const nextIndex = (selectedIndex + 1) % items.length;
        onSelect(items[nextIndex].id);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedId, selectedIndex, items, onClose, onSelect]);

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const prevIndex = (selectedIndex - 1 + items.length) % items.length;
              onSelect(items[prevIndex].id);
            }}
            className="absolute left-4 md:left-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextIndex = (selectedIndex + 1) % items.length;
              onSelect(items[nextIndex].id);
            }}
            className="absolute right-4 md:right-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* Image Container */}
          <div 
            className="relative w-full max-w-6xl max-h-[85vh] flex flex-col items-center justify-center px-16 md:px-32"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={selected.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              src={selected.image_url}
              alt={selected.title ?? selected.caption ?? "Gallery image"}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-white"
            >
              {selected.title && (
                <h4 className="text-xl font-heading font-medium tracking-tight">
                  {selected.title}
                </h4>
              )}
              {selected.caption && (
                <p className="mt-2 text-sm text-white/70 max-w-2xl mx-auto">
                  {selected.caption}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
