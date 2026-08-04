"use client";

import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LinkIcon({ name, size = 18 }: { name: string; size?: number }) {
  const key = name.toLowerCase();
  if (key.includes("github")) return <Github size={size} />;
  if (key.includes("linkedin")) return <Linkedin size={size} />;
  return <ExternalLink size={size} />;
}

export function About({ data }: { data: PortfolioData }) {
  const content = text(data.profile.about) ?? text(data.profile.bio);
  const socialLinks = Object.entries(data.socialLinks).filter(([, href]) =>
    Boolean(href)
  );
  const hasContact =
    text(data.profile.email) ||
    text(data.profile.location) ||
    socialLinks.length > 0;

  return (
    <section id="about" className="relative py-[var(--section-gap)]">
      <div className="container-narrow relative z-10">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-16 lg:gap-24 items-start">
          {/* Left — Bio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              number="02"
              eyebrow="About"
              title="The person behind the pixels."
              className="mb-10"
            />

            {content ? (
              <div className="max-w-2xl">
                <p className="text-xl sm:text-2xl lg:text-[1.75rem] font-serif text-ink-secondary leading-[1.5] tracking-[-0.01em] whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-5 text-ink-muted border border-dashed border-line-strong rounded-2xl text-sm">
                <Sparkles size={16} /> An about section will appear here.
              </div>
            )}
          </motion.div>

          {/* Right — Connect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:pt-20"
          >
            <h3 className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.2em] mb-6 pl-1">
              Connect
            </h3>

            <div className="flex flex-col border-t border-line">
              {text(data.profile.email) && (
                <a
                  href={`mailto:${data.profile.email}`}
                  className="group flex items-center justify-between py-5 border-b border-line transition-colors hover:bg-background-subtle rounded-none px-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-subtle text-ink-muted group-hover:text-accent transition-colors">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-0.5">
                        Email
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {data.profile.email}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              )}

              {text(data.profile.location) && (
                <div className="flex items-center py-5 border-b border-line px-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-subtle text-ink-muted">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-0.5">
                        Location
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {data.profile.location}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {socialLinks.map(([name, href]) => (
                <a
                  key={name}
                  href={href as string}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between py-5 border-b border-line transition-colors hover:bg-background-subtle px-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-subtle text-ink-muted group-hover:text-accent transition-colors">
                      <LinkIcon name={name} size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-0.5">
                        {label(name)}
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {(href as string)
                          .replace(/^https?:\/\/(www\.)?/, "")
                          .replace(/\/$/, "")}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}

              {!hasContact && (
                <div className="flex items-center gap-3 py-5 text-ink-muted text-sm">
                  <Sparkles size={16} /> Contact details will appear here.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
