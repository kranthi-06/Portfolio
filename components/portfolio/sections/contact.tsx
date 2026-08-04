"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, LoaderCircle, Send } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import { SectionHeading } from "../ui/section-heading";
import { MagneticButton } from "../ui/magnetic-button";

export function Contact({ data }: { data: PortfolioData }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fields))
      });
      if (!response.ok) throw new Error();
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-ink text-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gradient-1 via-ink to-ink" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-gradient-3/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-[min(1180px,calc(100%-40px))] mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12">
              <p className="flex items-center gap-2 mb-4 text-background/60 text-xs font-extrabold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-2 shadow-glow" />
                Contact
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight leading-none mb-6 text-balance text-background">
                Let&apos;s build something meaningful.
              </h2>
            </div>
            
            {data.profile.email && (
              <a 
                href={`mailto:${data.profile.email}`}
                className="group inline-flex items-center gap-4 text-xl sm:text-2xl lg:text-3xl font-heading font-medium tracking-tight text-background hover:text-gradient-2 transition-colors border-b border-background/20 hover:border-gradient-2 pb-2"
              >
                {data.profile.email}
                <ArrowUpRight className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background-elevated/5 p-8 sm:p-10 rounded-[2rem] border border-background/10 backdrop-blur-md"
          >
            {status === "sent" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12 h-full"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gradient-1 to-gradient-2 flex items-center justify-center mb-6 shadow-glow text-white">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-heading font-medium text-background mb-3">Message received.</h3>
                <p className="text-background/70 mb-8 max-w-sm">Thanks for reaching out. I&apos;ll get back to you as soon as possible.</p>
                <MagneticButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStatus("idle")}
                  className="bg-transparent text-background border-background/20 hover:bg-background/10 hover:border-background"
                >
                  Send another message
                </MagneticButton>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-background/60 uppercase tracking-widest">Name</span>
                  <input 
                    name="name" 
                    required 
                    autoComplete="name"
                    className="h-12 px-4 rounded-xl bg-background/5 border border-background/10 text-background placeholder:text-background/30 focus:outline-none focus:border-background/40 transition-colors"
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-background/60 uppercase tracking-widest">Email</span>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    autoComplete="email"
                    className="h-12 px-4 rounded-xl bg-background/5 border border-background/10 text-background placeholder:text-background/30 focus:outline-none focus:border-background/40 transition-colors"
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-background/60 uppercase tracking-widest">Subject</span>
                  <input 
                    name="subject"
                    className="h-12 px-4 rounded-xl bg-background/5 border border-background/10 text-background placeholder:text-background/30 focus:outline-none focus:border-background/40 transition-colors"
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-background/60 uppercase tracking-widest">Message</span>
                  <textarea 
                    name="message" 
                    required 
                    rows={4}
                    className="p-4 rounded-xl bg-background/5 border border-background/10 text-background placeholder:text-background/30 focus:outline-none focus:border-background/40 transition-colors resize-none"
                  />
                </label>
                
                {status === "error" && (
                  <p className="text-sm text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
                    Something went wrong. Please try again.
                  </p>
                )}
                
                <MagneticButton 
                  type="submit" 
                  disabled={status === "sending"}
                  className="mt-4 bg-background text-ink hover:bg-background/90"
                >
                  {status === "sending" ? (
                    <LoaderCircle className="animate-spin" size={16} />
                  ) : (
                    <>Send message <Send size={16} /></>
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
