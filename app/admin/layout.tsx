import type { ReactNode } from "react";

/**
 * Root admin layout — intentionally bare.
 * The (dashboard) group gets the sidebar/header layout.
 * The (auth) group (login) gets no chrome.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
