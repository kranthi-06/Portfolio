"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely
    console.error("[Route Segment Error]:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2 text-neutral-900 dark:text-neutral-100">
        Something went wrong
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-[400px] mb-8">
        A localized error occurred in this section of the application. The system has logged the issue for investigation.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-full font-medium transition-colors"
      >
        Retry Loading
      </button>
    </div>
  );
}
