"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ZoomIn } from "lucide-react";
import type { GalleryItem } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { GalleryLightbox } from "./gallery-lightbox";
import { clsx } from "clsx";

export function Gallery({ items }: { items?: GalleryItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeAlbum, setActiveAlbum] = useState("All");

  if (!Array.isArray(items)) return null;

  const albums = [
    "All",
    ...Array.from(new Set(items.map((item) => item.album))),
  ];
  
  const visibleItems = activeAlbum === "All"
    ? items
    : items.filter((item) => item.album === activeAlbum);

  return (
    <section id="gallery" className="relative py-32 bg-background">
      <div className="container-narrow relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <SectionHeading
            number="08"
            eyebrow="Gallery"
            title="Moments Captured."
            className="mb-0"
          />

          {albums.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setActiveAlbum(album)}
                  className={clsx(
                    "px-4 py-2 rounded-md text-[13px] font-medium tracking-wide transition-colors duration-300",
                    activeAlbum === album
                      ? "bg-ink text-background shadow-sm"
                      : "bg-transparent text-ink-muted hover:text-ink hover:bg-background-elevated"
                  )}
                >
                  {album}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {visibleItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.8,
                  delay: Math.min(index * 0.05, 0.3),
                  ease: [0.16, 1, 0.3, 1]
                }}
                onClick={() => setSelectedId(item.id)}
                className="group relative w-full overflow-hidden rounded-2xl bg-background-elevated border border-line cursor-zoom-in block break-inside-avoid shadow-sm"
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? item.caption ?? "Gallery image"}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'; // simple fallback for masonry
                  }}
                />

                {/* Elegant Apple-style overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 backdrop-blur-[1px]">
                  <ZoomIn
                    className="absolute top-6 right-6 text-ink opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 bg-background p-2 rounded-full shadow-md"
                    size={32}
                    strokeWidth={1.5}
                  />

                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-2.5 py-1 mb-3 rounded-md bg-background text-[10px] font-bold tracking-[0.2em] text-ink uppercase shadow-sm">
                      {item.album}
                    </span>
                    {(item.title || item.caption) && (
                      <p className="text-ink font-medium text-sm text-left line-clamp-2 leading-relaxed">
                        {item.title ?? item.caption}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-muted border border-dashed border-line rounded-2xl bg-background-elevated">
            <Sparkles size={24} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Gallery images will appear here.</p>
          </div>
        )}
      </div>

      <GalleryLightbox
        items={visibleItems}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />
    </section>
  );
}
