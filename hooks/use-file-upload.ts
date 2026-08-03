"use client";

import { useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UploadOptions {
  bucket: string;
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
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .substring(0, 60);
      const fileName = `${safeName}-${timestamp}.${extension}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      setProgress(30);

      const { error: uploadError } = await supabaseBrowser.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(80);

      // Get public URL
      const { data: urlData } = supabaseBrowser.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: filePath,
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
      const { error } = await supabaseBrowser.storage.from(bucket).remove([path]);
      if (error) throw error;
      toast.success("File deleted");
      return true;
    } catch {
      toast.error("Failed to delete file");
      return false;
    }
  }, []);

  return { upload, deleteFile, uploading, progress };
}
