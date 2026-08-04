"use client";

import type { PortfolioData } from "@/lib/portfolio/types";

export function Footer({ data }: { data?: PortfolioData }) {
  const currentYear = new Date().getFullYear();
  const name = data?.profile?.name || "Portfolio";

  return (
    <footer className="w-full bg-background border-t border-line">
      <div className="container-narrow py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-secondary">
            © {currentYear} {name}.
          </span>
          <span className="text-sm font-medium text-ink-muted">
            All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-ink-muted">
          <a href="#top" className="hover:text-ink transition-colors">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
