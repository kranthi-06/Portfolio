"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, LoaderCircle, Send } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { MagneticButton } from "../ui/magnetic-button";

export function Contact({ data }: { data: PortfolioData }) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      if (!response.ok) throw new Error();
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="relative py-[var(--section-gap)] bg-ink text-background overflow-hidden"
    >
      {/* Background ambience */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[40vw] h-[40vw] bg-accent-tertiary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container-narrow relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12">
              <p className="inline-flex items-center gap-3 mb-5 text-background/50 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-accent-secondary shadow-glow" />
                Contact
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-[-0.04em] leading-[0.92] text-background text-balance mb-6">
                Let&apos;s build something{" "}
                <span className="font-serif italic font-normal text-background/60">
                  meaningful.
                </span>
              </h2>
            </div>

            {data.profile.email && (
              <a
                href={`mailto:${data.profile.email}`}
                className="group inline-flex items-center gap-4 text-xl sm:text-2xl lg:text-3xl font-display font-medium tracking-tight text-background hover:text-accent-secondary transition-colors duration-300 border-b border-background/20 hover:border-accent-secondary pb-2"
              >
                {data.profile.email}
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            )}
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-8 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
          >
            {status === "sent" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center mb-6 shadow-glow text-white">
                  <Check size={28} />
                </div>
                <h3 className="text-2xl font-display font-medium text-background mb-3">
                  Message received.
                </h3>
                <p className="text-background/60 mb-8 text-sm max-w-xs">
                  Thanks for reaching out. I&apos;ll get back to you as
                  soon as possible.
                </p>
                <MagneticButton
                  type="button"
                  variant="outline"
                  onClick={() => setStatus("idle")}
                  className="bg-transparent text-background border-white/20 hover:bg-white/10 hover:border-white/40"
                >
                  Send another message
                </MagneticButton>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-background/50 uppercase tracking-[0.15em]">
                    Name
                  </span>
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    className="h-12 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-background placeholder:text-background/25 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-background/50 uppercase tracking-[0.15em]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="h-12 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-background placeholder:text-background/25 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-background/50 uppercase tracking-[0.15em]">
                    Subject
                  </span>
                  <input
                    name="subject"
                    className="h-12 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-background placeholder:text-background/25 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-background/50 uppercase tracking-[0.15em]">
                    Message
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="p-4 rounded-xl bg-white/[0.05] border border-white/10 text-background placeholder:text-background/25 focus:outline-none focus:border-white/30 transition-colors resize-none text-sm"
                  />
                </label>

                {status === "error" && (
                  <p className="text-sm text-red-400 bg-red-400/10 px-4 py-2.5 rounded-xl">
                    Something went wrong. Please try again.
                  </p>
                )}

                <MagneticButton
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 bg-background text-ink hover:bg-background/90"
                >
                  {status === "sending" ? (
                    <LoaderCircle className="animate-spin" size={16} />
                  ) : (
                    <>
                      Send message <Send size={15} />
                    </>
                  )}
                </MagneticButton>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
