"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We log the error safely without exposing it in the UI
    console.error("[Global Error Boundary Caught]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] dark:bg-[#0c0c0e] text-neutral-900 dark:text-neutral-100 p-4 font-sans">
          <div className="max-w-md w-full p-8 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-semibold tracking-tight mb-3">Application Error</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
              We encountered a critical error while rendering this page. The engineering team has been notified.
            </p>
            
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-neutral-900 w-full sm:w-auto"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
