"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Download, Maximize2,
} from "lucide-react";

interface GalleryImage {
  url: string;
  caption?: string;
  type?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function ImageGallery({ images, activeIndex, onClose, onChange }: ImageGalleryProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const open = activeIndex !== null;
  const image = open ? images[activeIndex] : null;

  const previous = useCallback(() => {
    if (activeIndex === null) return;
    onChange((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, onChange]);

  const next = useCallback(() => {
    if (activeIndex === null) return;
    onChange((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, onChange]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") previous();
      if (e.key === "ArrowRight") next();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === "-") setZoom((z) => Math.max(0.5, z - 0.25));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, previous, next, onClose]);

  useEffect(() => {
    setZoom(1);
    setImageFailed(false);
  }, [activeIndex]);

  // Touch swipe support
  const touchStartRef = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) previous();
      else next();
    }
    touchStartRef.current = null;
  }

  async function handleDownload() {
    if (!image) return;
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.caption || `image-${(activeIndex || 0) + 1}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err);
      // Fallback: open in new tab
      window.open(image.url, "_blank");
    }
  }

  if (!image || activeIndex === null) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close gallery"
            className="absolute inset-0 cursor-default"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(24px)",
            }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col w-full h-full max-w-[100vw] max-h-[100vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span
                  className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {activeIndex + 1} / {images.length}
                </span>
                {image.type && (
                  <span
                    className="text-[11px] font-medium capitalize"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {image.type.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="gallery-btn"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="gallery-btn"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(zoom === 1 ? 2 : 1)}
                  className="gallery-btn"
                  aria-label="Toggle fullscreen zoom"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  className="gallery-btn"
                  aria-label="Download image"
                >
                  <Download size={16} />
                </button>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  className="gallery-btn"
                  aria-label="Close gallery"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image area */}
            <div
              className="flex-1 flex items-center justify-center overflow-auto px-4"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  {imageFailed ? (
                    <div
                      className="flex flex-col items-center justify-center gap-3 p-8"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      <p className="text-sm">Unable to load image</p>
                    </div>
                  ) : (
                    <Image
                      src={image.url}
                      alt={image.caption || `Image ${activeIndex + 1}`}
                      width={1200}
                      height={900}
                      priority
                      className="max-h-[80vh] w-auto h-auto rounded-lg object-contain transition-transform duration-200"
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "center",
                      }}
                      onError={() => setImageFailed(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={previous}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 gallery-nav-btn"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 gallery-nav-btn"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Caption */}
            {image.caption && (
              <div className="px-4 py-3 text-center">
                <p
                  className="text-[13px]"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {image.caption}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
