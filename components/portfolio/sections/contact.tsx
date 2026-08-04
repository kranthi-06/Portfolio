"use client";

import { motion } from "framer-motion";
import { Mail, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { MagneticButton } from "../ui/magnetic-button";
import { clsx } from "clsx";

export function Contact({ data }: { data?: PortfolioData }) {
  const [copied, setCopied] = useState(false);

  if (!data?.profile?.email) return null;

  const email = data.profile.email;
  const socialsMap = data.socialLinks || {};
  const socials = Object.entries(socialsMap).map(([platform, url]) => ({
    id: platform,
    platform,
    url
  })).filter(s => s.url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <section id="contact" className="relative py-32 bg-background border-t border-line/50">
      <div className="container-narrow relative z-10">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
          
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            <SectionHeading
              number="10"
              eyebrow="Get in touch"
              title="Let's build something."
              className="mb-6"
            />
            <p className="text-xl text-ink-secondary leading-relaxed font-body max-w-md">
              Whether you have a project in mind or just want to chat, I&apos;m always open to discussing new opportunities.
            </p>
          </motion.div>

          {/* Right: Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-auto md:min-w-[320px] flex flex-col gap-8"
          >
            {/* Primary Action */}
            <div className="flex flex-col gap-4">
              <a href={`mailto:${email}`} className="w-full">
                <MagneticButton variant="primary" className="w-full px-8 py-5 rounded-xl bg-ink text-background hover:bg-ink/90 transition-colors flex items-center justify-center gap-3 font-medium text-[15px]">
                  <Mail size={18} /> Send an email
                </MagneticButton>
              </a>
              
              <button
                onClick={handleCopy}
                className={clsx(
                  "w-full px-8 py-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm",
                  copied
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : "border-line bg-background text-ink-secondary hover:text-ink hover:bg-background-elevated"
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} /> Copied to clipboard
                  </>
                ) : (
                  <>
                    Copy {email}
                  </>
                )}
              </button>
            </div>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-8 border-t border-line/50">
                {socials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-background-elevated border border-line text-xs font-semibold text-ink-secondary hover:text-ink hover:bg-line/50 transition-colors"
                  >
                    {link.platform} <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
