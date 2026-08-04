"use client";

import { ArrowUpRight } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Footer({
  profile,
  socialLinks,
}: Pick<PortfolioData, "profile" | "socialLinks">) {
  const name = text(profile.name) ?? "Portfolio";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-10 border-t border-line bg-background">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <a
              href="#top"
              className="text-base font-display font-medium tracking-tight text-ink hover:text-accent transition-colors"
            >
              {name}
            </a>
            {text(profile.title) && (
              <span className="block mt-1 text-xs text-ink-muted">
                {profile.title}
              </span>
            )}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 order-3 md:order-2 w-full md:w-auto">
            {Object.entries(socialLinks)
              .filter(([, href]) => href)
              .map(([name, href]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  {label(name)}
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </a>
              ))}
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-6 text-[13px] text-ink-muted order-2 md:order-3">
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
