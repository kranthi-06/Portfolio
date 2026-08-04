"use client";

import { ArrowUpRight } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Footer({ profile, socialLinks }: Pick<PortfolioData, "profile" | "socialLinks">) {
  const name = text(profile.name) ?? "Portfolio";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-line bg-background">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="flex flex-col">
            <a 
              href="#top" 
              className="text-lg font-heading font-medium tracking-tight text-ink hover:text-gradient-1 transition-colors mb-1"
            >
              {name}
            </a>
            {text(profile.title) && (
              <span className="text-sm font-medium text-ink-secondary">
                {profile.title}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-6 md:gap-8 order-3 md:order-2 w-full md:w-auto">
            {Object.entries(socialLinks)
              .filter(([, href]) => href)
              .map(([name, href]) => (
                <a 
                  key={name} 
                  href={href} 
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
                >
                  {label(name)} 
                  <ArrowUpRight size={14} className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </a>
              ))}
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-ink-muted order-2 md:order-3">
            <span>&copy; {currentYear}</span>
            <a 
              href="#top" 
              className="hover:text-ink transition-colors"
            >
              Back to top ↑
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
