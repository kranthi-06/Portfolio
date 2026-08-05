"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ImageIcon, X, Loader2 } from "lucide-react";
import { ALLOWED_UPLOAD_TYPES, MAX_FILE_SIZE, formatFileSize } from "@/lib/admin/constants";
import { useFileUpload } from "@/hooks/use-file-upload";

interface UploadZoneProps {
  bucket: string;
  folder?: string;
  onUploadComplete: (result: { url: string; path: string; publicId?: string; fileName: string; fileSize: number; fileType: string }) => void;
  accept?: string[];
  maxSize?: number;
  label?: string;
}

export function UploadZone({
  bucket,
  folder,
  onUploadComplete,
  accept = ALLOWED_UPLOAD_TYPES,
  maxSize = MAX_FILE_SIZE,
  label = "Upload certificate file",
}: UploadZoneProps) {
  const { upload, uploading, progress } = useFileUpload();
  const [preview, setPreview] = useState<{ name: string; size: number; type: string } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPreview({ name: file.name, size: file.size, type: file.type });

    const result = await upload(file, {
      bucket,
      folder,
      maxSize,
      allowedTypes: accept,
    });

    if (result) {
      onUploadComplete(result);
    } else {
      setPreview(null);
    }
  }, [upload, bucket, folder, maxSize, accept, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: 1,
    disabled: uploading,
  });

  function clearPreview() {
    setPreview(null);
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`admin-upload-zone ${isDragActive ? "active" : ""} ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Loader2 size={32} className="animate-spin mb-3" style={{ color: "var(--admin-accent)" }} />
              <p className="text-[14px] font-semibold" style={{ color: "var(--admin-ink)" }}>
                Uploading…
              </p>
              <div
                className="w-48 h-1.5 rounded-full mt-3 overflow-hidden"
                style={{ background: "var(--admin-bg-hover)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--admin-accent)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[12px] mt-2" style={{ color: "var(--admin-ink-muted)" }}>
                {progress}%
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  background: isDragActive ? "var(--admin-accent)" : "var(--admin-accent-soft)",
                  color: isDragActive ? "var(--admin-accent-fg)" : "var(--admin-accent)",
                }}
              >
                <Upload size={20} />
              </div>
              <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--admin-ink)" }}>
                {isDragActive ? "Drop file here" : label}
              </p>
              <p className="text-[12px]" style={{ color: "var(--admin-ink-muted)" }}>
                PDF, PNG, JPEG, WEBP · Max {formatFileSize(maxSize)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File preview */}
      <AnimatePresence>
        {preview && !uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "var(--admin-bg-subtle)", border: "1px solid var(--admin-line)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: preview.type.includes("pdf") ? "var(--admin-danger-soft)" : "var(--admin-info-soft)",
                color: preview.type.includes("pdf") ? "var(--admin-danger)" : "var(--admin-info)",
              }}
            >
              {preview.type.includes("pdf") ? <FileText size={14} /> : <ImageIcon size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--admin-ink)" }}>
                {preview.name}
              </p>
              <p className="text-[11px]" style={{ color: "var(--admin-ink-muted)" }}>
                {formatFileSize(preview.size)}
              </p>
            </div>
            <button onClick={clearPreview} className="admin-icon-btn" aria-label="Remove">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
