"use client";

import { useState, type FormEvent } from "react";
import { Mail, Github, Linkedin, Send, Check } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";

const iconMap = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
};

export function CollaborateSection() {
  const [submitted, setSubmitted] = useState(false);
  const { personalInfo, socialLinks } = usePortfolio();

  const channels = [
    ...(personalInfo.email ? [{ label: "Email", value: personalInfo.email, href: `mailto:${personalInfo.email}`, icon: "mail" }] : []),
    ...socialLinks.map((link) => ({
      label: link.name,
      value: link.url.replace(/^https?:\/\/(www\.)?/, ""),
      href: link.url,
      icon: link.name.toLowerCase()
    }))
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const message = String(values.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Collaboration${name ? ` from ${name}` : ""}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);
    window.location.href = `mailto:${personalInfo.email || "hello@example.com"}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section
      id="collaborate"
      className="section"
      style={{ background: "var(--bg-subtle)" }}
      aria-labelledby="collaborate-title"
    >
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-start">
          <Reveal>
            <p className="eyebrow mb-6">Collab</p>
            <h2 id="collaborate-title" className="section-title mb-6">
              Let&apos;s build.
            </h2>
            <p className="section-subtitle mb-10">Have an interesting problem? Let&apos;s talk about it.</p>

            <div className="space-y-3">
              {channels.map((channel) => {
                const Icon = iconMap[channel.icon as keyof typeof iconMap] ?? Mail;
                return (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:shadow-md group"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--ink-muted)" }}>
                        {channel.label}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>{channel.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15} direction="left">
            <form
              onSubmit={handleSubmit}
              className="p-8 md:p-10 rounded-3xl"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
            >
              {submitted ? (
                <div className="text-center py-8" aria-live="polite">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "var(--accent-soft)" }}
                  >
                    <Check size={24} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3" style={{ color: "var(--ink)" }}>
                    Your email draft is ready.
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--ink-secondary)" }}>
                    Your email app should have opened with the details filled in.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-medium underline"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--ink-muted)" }}>
                      Your name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      placeholder="How should I address you?"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-shadow duration-200 focus:shadow-md"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink)" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--ink-muted)" }}>
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-shadow duration-200 focus:shadow-md"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink)" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--ink-muted)" }}>
                      What are we building?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Tell me about the idea, problem, or opportunity."
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-shadow duration-200 focus:shadow-md"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink)" }}
                    />
                  </div>
                  <Magnetic className="w-full">
                    <button type="submit" className="btn btn-primary w-full">
                      Open email draft <Send size={15} />
                    </button>
                  </Magnetic>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
