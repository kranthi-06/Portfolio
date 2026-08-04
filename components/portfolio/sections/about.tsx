"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, ExternalLink, Github, Linkedin, Sparkles, ArrowUpRight } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { MagneticButton } from "../ui/magnetic-button";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function label(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LinkIcon({ name, size = 18 }: { name: string, size?: number }) {
  const key = name.toLowerCase();
  if (key.includes("github")) return <Github size={size} />;
  if (key.includes("linkedin")) return <Linkedin size={size} />;
  return <ExternalLink size={size} />;
}

export function About({ data }: { data: PortfolioData }) {
  const content = text(data.profile.about) ?? text(data.profile.bio);
  const socialLinks = Object.entries(data.socialLinks).filter(([, href]) => Boolean(href));
  const hasContact = text(data.profile.email) || text(data.profile.location) || socialLinks.length > 0;

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-24 items-start">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading 
              eyebrow="About" 
              title="The person behind the work." 
              className="mb-8"
            />
            
            {content ? (
              <div className="prose prose-lg text-ink-secondary leading-relaxed max-w-none font-serif text-2xl lg:text-3xl tracking-tight">
                <p className="whitespace-pre-wrap">{content}</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-6 text-ink-muted border border-dashed border-line-strong rounded-2xl bg-background-subtle">
                <Sparkles size={18} /> An about section will appear here.
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-2"
          >
            <h3 className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-4 pl-4">
              Connect
            </h3>
            
            <div className="flex flex-col">
              {text(data.profile.email) && (
                <a 
                  href={`mailto:${data.profile.email}`}
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-background-elevated hover:shadow-card transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-background-subtle border border-line text-ink-secondary group-hover:text-ink group-hover:bg-gradient-to-br group-hover:from-gradient-1/20 group-hover:to-gradient-2/20 transition-colors">
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">Email</span>
                      <span className="text-base font-medium text-ink group-hover:text-gradient-1 transition-colors">{data.profile.email}</span>
                    </div>
                  </div>
                  <ArrowUpRight size={20} className="text-ink-muted group-hover:text-ink transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0" />
                </a>
              )}

              {text(data.profile.location) && (
                <div className="flex items-center gap-4 p-4 rounded-2xl">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-background-subtle border border-line text-ink-secondary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">Location</span>
                    <span className="text-base font-medium text-ink">{data.profile.location}</span>
                  </div>
                </div>
              )}

              {socialLinks.map(([name, href]) => (
                <a 
                  key={name}
                  href={href as string}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-background-elevated hover:shadow-card transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-background-subtle border border-line text-ink-secondary group-hover:text-ink group-hover:bg-gradient-to-br group-hover:from-gradient-2/20 group-hover:to-gradient-3/20 transition-colors">
                      <LinkIcon name={name} size={20} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">{label(name)}</span>
                      <span className="text-base font-medium text-ink group-hover:text-gradient-2 transition-colors">
                        {(href as string).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight size={20} className="text-ink-muted group-hover:text-ink transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0" />
                </a>
              ))}

              {!hasContact && (
                <div className="flex items-center gap-3 p-4 text-ink-muted border border-dashed border-line-strong rounded-2xl">
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
