"use client";

import { Toaster } from "sonner";
import { useAdminTheme } from "./theme-provider";

export function AdminToastProvider() {
  const { theme } = useAdminTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
          fontSize: "13px",
          borderRadius: "12px",
        },
      }}
    />
  );
}
