"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";

export interface GalleryItem {
  url: string;
  public_id?: string;
  filename?: string;
  caption?: string;
  isCover?: boolean;
}

interface GalleryManagerProps {
  images: GalleryItem[];
  onChange: (images: GalleryItem[]) => void;
  onCoverSelect: (url: string) => void;
  coverUrl?: string;
}

export function GalleryManager({ images, onChange, onCoverSelect, coverUrl }: GalleryManagerProps) {
  const { upload, uploading } = useFileUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      let newImages = [...images];
      for (const file of acceptedFiles) {
        const result = await upload(file, {
          bucket: "achievements",
          folder: "gallery",
          maxSize: 10 * 1024 * 1024,
          allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
        });

        if (result) {
          const newImg: GalleryItem = {
            url: result.url,
            public_id: result.publicId,
            filename: file.name,
            caption: "",
            isCover: false,
          };
          newImages.push(newImg);
          toast.success("Image uploaded");
        }
      }
      
      // Auto-set cover if it's the first image
      if (newImages.length > 0 && !coverUrl) {
        onCoverSelect(newImages[0].url);
      }
      
      onChange(newImages);
    },
    [upload, images, onChange, onCoverSelect, coverUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [] },
    maxFiles: 10,
    disabled: uploading,
  });

  function removeImage(index: number) {
    const item = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    if (item.url === coverUrl) {
      if (newImages.length > 0) onCoverSelect(newImages[0].url);
      else onCoverSelect("");
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    if (index + direction < 0 || index + direction >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    onChange(newImages);
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img.url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              style={{ border: img.url === coverUrl ? "2px solid var(--admin-accent)" : "1px solid var(--admin-line)" }}
            >
              <Image src={img.url} alt={img.filename || `Image ${i}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="160px" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
              
              {img.url === coverUrl && (
                <span className="absolute top-1 left-1 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "var(--admin-accent)", color: "white" }}>
                  <Star size={10} fill="currentColor" /> Cover
                </span>
              )}

              <div className="absolute bottom-1 w-full px-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-between">
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-5 h-5 rounded-md flex items-center justify-center bg-black/60 text-white disabled:opacity-30">&larr;</button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="w-5 h-5 rounded-md flex items-center justify-center bg-black/60 text-white disabled:opacity-30">&rarr;</button>
                </div>
                {img.url !== coverUrl && (
                  <button type="button" onClick={() => onCoverSelect(img.url)} className="w-5 h-5 rounded-md flex items-center justify-center bg-black/60 text-white hover:bg-[var(--admin-accent)]"><Star size={10} /></button>
                )}
                <button type="button" onClick={() => removeImage(i)} className="w-5 h-5 rounded-md flex items-center justify-center bg-red-600/80 text-white hover:bg-red-600"><X size={10} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div
          {...getRootProps()}
          className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${isDragActive ? "ring-2 ring-[var(--admin-accent)]" : ""}`}
          style={{ background: isDragActive ? "var(--admin-accent-soft)" : "var(--admin-bg-subtle)", border: "2px dashed var(--admin-line)" }}
        >
          <input {...getInputProps()} />
          {uploading ? <Loader2 size={20} className="animate-spin" style={{ color: "var(--admin-accent)" }} /> : (
            <>
              <Upload size={20} style={{ color: isDragActive ? "var(--admin-accent)" : "var(--admin-ink-muted)" }} />
              <span className="text-[11px] mt-2 font-medium" style={{ color: "var(--admin-ink-muted)" }}>Add Images</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
