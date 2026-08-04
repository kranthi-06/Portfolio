"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ZoomIn } from "lucide-react";
import type { GalleryItem } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { GalleryLightbox } from "./gallery-lightbox";
import { clsx } from "clsx";

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeAlbum, setActiveAlbum] = useState("All");

  const albums = ["All", ...Array.from(new Set(items.map((item) => item.album)))];
  const visibleItems = activeAlbum === "All" ? items : items.filter((item) => item.album === activeAlbum);

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-background-subtle">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20">
          <SectionHeading 
            eyebrow="Gallery" 
            title="Moments from the journey." 
            className="mb-0 md:mb-0"
          />

          {albums.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setActiveAlbum(album)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300",
                    activeAlbum === album 
                      ? "bg-ink text-background shadow-md" 
                      : "bg-transparent text-ink-muted hover:text-ink hover:bg-background-elevated border border-line"
                  )}
                >
                  {album}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {visibleItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                onClick={() => setSelectedId(item.id)}
                className="group relative w-full overflow-hidden rounded-2xl bg-background-elevated border border-line cursor-zoom-in block"
                style={{ breakInside: "avoid" }}
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? item.caption ?? "Gallery image"}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <ZoomIn className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                  
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2 py-1 mb-2 rounded bg-white/20 backdrop-blur-md text-[9px] font-bold tracking-widest text-white uppercase">
                      {item.album}
                    </span>
                    {(item.title || item.caption) && (
                      <p className="text-white font-medium text-sm text-left line-clamp-2 leading-snug">
                        {item.title ?? item.caption}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-ink-muted border border-dashed border-line-strong rounded-3xl bg-background-elevated/50">
            <Sparkles size={24} className="mb-4 opacity-50" />
            <p>Gallery images will appear here.</p>
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
