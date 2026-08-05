"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export function useAutoSave<T>(key: string, data: T, isDirty: boolean) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage
  const loadDraft = (): T | null => {
    try {
      const draft = localStorage.getItem(key);
      if (draft) {
        return JSON.parse(draft) as T;
      }
    } catch (e) {
      console.error("Failed to load draft from localStorage", e);
    }
    return null;
  };

  // Clear draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch (e) {
      console.error("Failed to clear draft", e);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!isDirty) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setLastSaved(new Date());
      } catch (e) {
        console.error("Failed to save draft to localStorage", e);
      }
    }, 2000); // 2 seconds debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, isDirty, key]);

  return { lastSaved, loadDraft, clearDraft };
}
