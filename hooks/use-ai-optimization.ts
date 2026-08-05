"use client";

import { useState } from "react";
import { toast } from "sonner";

export type AIAction = 
  | "improve" 
  | "rewrite" 
  | "expand" 
  | "shorten" 
  | "humanize" 
  | "professional" 
  | "developer" 
  | "startup" 
  | "portfolio" 
  | "ats" 
  | "grammar" 
  | "simplify" 
  | "generate";

interface UseAIOptimizationProps {
  onSuccess: (text: string) => void;
}

export function useAIOptimization({ onSuccess }: UseAIOptimizationProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const optimize = async (text: string, action: AIAction, contextType?: string) => {
    if (!text.trim() && action !== "generate") {
      toast.error("Please provide some text to optimize");
      return;
    }

    setIsProcessing(true);
    const loadingToastId = toast.loading("AI is optimizing your content...");

    try {
      const response = await fetch("/api/admin/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action, contextType }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize text");
      }

      const data = await response.json();
      
      if (data.improvedText) {
        onSuccess(data.improvedText);
        toast.success("Content optimized successfully!", { id: loadingToastId });
      } else {
        throw new Error("No text returned");
      }
    } catch (error) {
      console.error("AI Optimization Error:", error);
      toast.error("Failed to optimize content. Please try again.", { id: loadingToastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return { optimize, isProcessing };
}
