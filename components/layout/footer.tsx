"use client";

import { useScrollProgress } from "@/components/ui/reveal";
import { ArrowUpRight } from "lucide-react";
import { footer, links, personal } from "@/lib/content";

export function ScrollProgress() {
  const ref = useScrollProgress();
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none">
      <div
        ref={ref}
        className="h-full w-full origin-left"
        style={{
          background: "linear-gradient(90deg, var(--gradient-1), var(--gradient-2), var(--gradient-3))",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="section border-t"
      style={{ borderColor: "var(--line)", paddingTop: "80px", paddingBottom: "48px" }}
    >
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div>
            <p className="font-display text-3xl md:text-4xl font-medium tracking-tight mb-4" style={{ color: "var(--ink)" }}>
              {personal.name}
            </p>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              {footer.tagline} · {footer.year}
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { label: "GitHub", href: links.github },
              { label: "LinkedIn", href: links.linkedin },
              { label: "Email", href: links.email },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--ink-secondary)" }}
              >
                {item.label} <ArrowUpRight size={14} />
              </a>
            ))}
            <a
              href="#landing"
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-secondary)" }}
            >
              Back to top <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
