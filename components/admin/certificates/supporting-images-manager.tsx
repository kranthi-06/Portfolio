"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Upload, X, Loader2, ImageIcon, Camera, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { SUPPORTING_IMAGE_TYPES } from "@/lib/admin/constants";
import { ImageGallery } from "./image-gallery";

interface SupportingImage {
  id?: string;
  image_url: string;
  image_public_id?: string;
  image_type: string;
  caption: string;
  sort_order: number;
}

interface SupportingImagesManagerProps {
  certificateId?: string;
  images: SupportingImage[];
  onChange: (images: SupportingImage[]) => void;
  readOnly?: boolean;
}

export function SupportingImagesManager({
  certificateId,
  images,
  onChange,
  readOnly = false,
}: SupportingImagesManagerProps) {
  const { upload, uploading } = useFileUpload();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const result = await upload(file, {
          bucket: "certificates",
          folder: "supporting",
          maxSize: 10 * 1024 * 1024,
          allowedTypes: [
            "image/png", "image/jpeg", "image/jpg", "image/webp",
          ],
        });

        if (result) {
          const newImage: SupportingImage = {
            image_url: result.url,
            image_public_id: result.publicId,
            image_type: "general",
            caption: "",
            sort_order: images.length,
          };

          // If certificate already exists, save to API
          if (certificateId) {
            try {
              const res = await fetch("/api/admin/certificates/supporting-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  certificate_id: certificateId,
                  ...newImage,
                }),
              });
              if (res.ok) {
                const { data } = await res.json();
                newImage.id = data.id;
              }
            } catch {
              // Image is already uploaded to cloudinary, add to local state
            }
          }

          onChange([...images, newImage]);
          toast.success("Image added");
        }
      }
    },
    [upload, images, onChange, certificateId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
    maxFiles: 10,
    disabled: uploading || readOnly,
  });

  function removeImage(index: number) {
    const img = images[index];
    if (img.id && certificateId) {
      fetch(`/api/admin/certificates/supporting-images?id=${img.id}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    onChange(images.filter((_, i) => i !== index));
    toast.success("Image removed");
  }

  function updateImage(index: number, updates: Partial<SupportingImage>) {
    const updated = images.map((img, i) =>
      i === index ? { ...img, ...updates } : img
    );
    onChange(updated);

    // Persist to API if certificate exists
    const img = updated[index];
    if (img.id && certificateId) {
      fetch("/api/admin/certificates/supporting-images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: img.id,
          image_type: img.image_type,
          caption: img.caption,
          sort_order: img.sort_order,
        }),
      }).catch(() => {});
    }
  }

  const galleryImages = images.map((img) => ({
    url: img.image_url,
    caption: img.caption,
    type: img.image_type,
  }));

  return (
    <div>
      <label className="admin-label flex items-center gap-1.5 mb-2">
        <Camera size={12} />
        Supporting Images
        {images.length > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--admin-accent-soft)",
              color: "var(--admin-accent)",
            }}
          >
            {images.length}
          </span>
        )}
      </label>

      {/* Image grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img.image_url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              style={{ border: "1px solid var(--admin-line)" }}
              onClick={() => setGalleryIndex(i)}
            >
              <Image
                src={img.image_url}
                alt={img.caption || `Supporting image ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="120px"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />

              {/* Type badge */}
              <span
                className="absolute bottom-1 left-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md capitalize"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  backdropFilter: "blur(4px)",
                }}
              >
                {img.image_type.replace(/_/g, " ")}
              </span>

              {/* Actions */}
              {!readOnly && (
                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingIndex(editingIndex === i ? null : i);
                    }}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                    }}
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{
                      background: "rgba(220,38,38,0.8)",
                      color: "white",
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload drop zone */}
        {!readOnly && (
          <div
            {...getRootProps()}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${isDragActive ? "ring-2 ring-[var(--admin-accent)]" : ""}`}
            style={{
              background: isDragActive
                ? "var(--admin-accent-soft)"
                : "var(--admin-bg-subtle)",
              border: "2px dashed var(--admin-line)",
            }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2
                size={16}
                className="animate-spin"
                style={{ color: "var(--admin-accent)" }}
              />
            ) : (
              <>
                <Upload
                  size={16}
                  style={{
                    color: isDragActive
                      ? "var(--admin-accent)"
                      : "var(--admin-ink-muted)",
                  }}
                />
                <span
                  className="text-[9px] mt-1 font-medium"
                  style={{ color: "var(--admin-ink-muted)" }}
                >
                  Add
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Inline editor for selected image */}
      <AnimatePresence>
        {editingIndex !== null && images[editingIndex] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-3 mb-3 space-y-2"
            style={{
              background: "var(--admin-bg-subtle)",
              border: "1px solid var(--admin-line)",
            }}
          >
            <div className="flex items-center gap-2">
              <ImageIcon size={12} style={{ color: "var(--admin-ink-muted)" }} />
              <span className="text-[11px] font-semibold" style={{ color: "var(--admin-ink)" }}>
                Edit Image {editingIndex + 1}
              </span>
              <button
                onClick={() => setEditingIndex(null)}
                className="ml-auto"
              >
                <X size={12} style={{ color: "var(--admin-ink-muted)" }} />
              </button>
            </div>

            <select
              className="admin-input admin-select text-[12px]"
              value={images[editingIndex].image_type}
              onChange={(e) =>
                updateImage(editingIndex, { image_type: e.target.value })
              }
            >
              {SUPPORTING_IMAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>

            <input
              className="admin-input text-[12px]"
              placeholder="Caption (optional)"
              value={images[editingIndex].caption}
              onChange={(e) =>
                updateImage(editingIndex, { caption: e.target.value })
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen gallery */}
      <ImageGallery
        images={galleryImages}
        activeIndex={galleryIndex}
        onClose={() => setGalleryIndex(null)}
        onChange={setGalleryIndex}
      />
    </div>
  );
}
