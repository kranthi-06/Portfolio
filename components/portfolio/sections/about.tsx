"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { SafeImage } from "../ui/safe-image";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function About({ data }: { data?: PortfolioData }) {
  if (!data?.profile) return null;

  const { profile } = data;
  const bio = text(profile.bio);
  const avatarUrl = text(profile.avatar_url);

  if (!bio && !avatarUrl) return null;

  return (
    <section id="about" className="relative py-32 bg-background-elevated/30">
      <div className="container-narrow relative z-10">
        <SectionHeading
          number="03"
          eyebrow="Background"
          title="About Me."
        />

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mt-16 items-start">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[40%] max-w-[400px] shrink-0"
          >
            <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-background border border-line shadow-sm">
              {avatarUrl ? (
                <SafeImage
                  src={avatarUrl}
                  alt={text(profile.name) ? `${profile.name}` : "Profile portrait"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-muted">
                  <User size={48} className="opacity-20" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Bio Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full"
          >
            {bio ? (
              <div className="prose prose-lg prose-p:text-ink-secondary prose-p:leading-relaxed prose-a:text-ink hover:prose-a:text-ink-secondary max-w-none">
                {bio.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-lg text-ink-secondary leading-relaxed mb-6 font-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-lg text-ink-muted italic">Biography details are currently being updated.</p>
            )}

            {/* Quick Facts */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-line/50">
              {text(profile.location) && (
                <div>
                  <h4 className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.2em] mb-2">Location</h4>
                  <p className="text-sm font-medium text-ink">{profile.location}</p>
                </div>
              )}
              {text(profile.availability) && (
                <div>
                  <h4 className="text-[10px] font-bold text-ink-muted uppercase tracking-[0.2em] mb-2">Status</h4>
                  <p className="text-sm font-medium text-ink">{profile.availability}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
