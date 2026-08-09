"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UploadOptions {
  bucket: string; // Left for backwards compatibility, used as 'folder'
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  publicId?: string;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult | null> => {
    const { bucket, folder = "", maxSize = 20 * 1024 * 1024, allowedTypes } = options;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return null;
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      toast.error(`File type not allowed: ${file.type}`);
      return null;
    }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Use folder if provided, fallback to bucket name as folder
      formData.append("folder", folder || bucket || "misc");

      setProgress(30);

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || "Upload failed");
      }

      const { data } = await response.json();
      setProgress(100);

      const result: UploadResult = {
        url: data.secure_url,
        path: data.public_id,
        publicId: data.public_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };

      toast.success("File uploaded successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, []);

  const deleteFile = useCallback(async (bucket: string, path: string) => {
    try {
      // Path is expected to be the public_id for Cloudinary
      const response = await fetch('/api/admin/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: path }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete file");
      }
      
      toast.success("File deleted");
      return true;
    } catch (err) { console.error(err);
      toast.error("Failed to delete file");
      return false;
    }
  }, []);

  return { upload, deleteFile, uploading, progress };
}
