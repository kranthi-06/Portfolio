"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@/lib/portfolio/types";

interface GalleryLightboxProps {
  items: GalleryItem[] | undefined;
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function GalleryLightbox({
  items = [],
  selectedId,
  onClose,
  onSelect,
}: GalleryLightboxProps) {
  const safeItems = useMemo(() => Array.isArray(items) ? items : [], [items]);
  const selectedIndex = safeItems.findIndex((item) => item.id === selectedId);
  const selected = safeItems[selectedIndex];

  useEffect(() => {
    if (!selectedId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        onSelect(safeItems[selectedIndex - 1].id);
      }
      if (e.key === "ArrowRight" && selectedIndex < safeItems.length - 1) {
        onSelect(safeItems[selectedIndex + 1].id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedId, selectedIndex, safeItems, onClose, onSelect]);

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 sm:p-8"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background/20 text-ink hover:bg-background border border-line/50 transition-colors shadow-sm"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Navigation Controls */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(safeItems[selectedIndex - 1].id);
              }}
              className="absolute left-4 sm:left-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-background/20 text-ink hover:bg-background border border-line/50 transition-colors shadow-sm"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
          )}

          {selectedIndex < safeItems.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(safeItems[selectedIndex + 1].id);
              }}
              className="absolute right-4 sm:right-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-background/20 text-ink hover:bg-background border border-line/50 transition-colors shadow-sm"
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          )}

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[1200px] w-full max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-background border border-line shadow-2xl"
          >
            <div className="relative flex-1 w-full flex items-center justify-center min-h-[40vh] bg-background-elevated">
              <img
                src={selected.image_url}
                alt={selected.title ?? selected.caption ?? "Gallery image"}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>
            
            {(selected.title || selected.caption) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-background border-t border-line">
                <div>
                  <h3 className="text-xl font-display font-medium text-ink mb-1">
                    {selected.title}
                  </h3>
                  {selected.caption && (
                    <p className="text-sm text-ink-secondary">{selected.caption}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
