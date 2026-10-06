"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Mail, Github, Linkedin, Send, Check, AlertCircle } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { toast } from "sonner";

const iconMap = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
};

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormStatus {
  status: "idle" | "sending" | "success" | "error" | "loading";
}

export function CollaborateSection() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>({ status: "loading" });
  const [csrfToken, setCsrfToken] = useState<string>("");
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

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/csrf", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
          setFormStatus({ status: "idle" });
        }
      })
      .catch(err => {
        console.error("Failed to fetch CSRF token:", err);
        setFormStatus({ status: "idle" });
      });
  }, []);

  // Generate cryptographically secure idempotency key for this submission
  const generateIdempotencyKey = () => {
    return crypto.randomUUID();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus({ status: "sending" });

    try {
      const idempotencyKey = generateIdempotencyKey();

      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ ...form, subject: "Collaboration", csrfToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to send message");
      }

      setFormStatus({ status: "success" });
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent successfully!");
      setTimeout(() => setFormStatus({ status: "idle" }), 4000);
    } catch (err) {
      console.error(err);
      setFormStatus({ status: "error" });
      toast.error(err instanceof Error ? err.message : "Failed to send message");
      setTimeout(() => setFormStatus({ status: "idle" }), 4000);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-shadow duration-200 focus:shadow-md";
  const inputStyle = { background: "var(--bg-subtle)", border: "1px solid var(--line)", color: "var(--ink)" };

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
              {formStatus.status === "success" && (
                <div className="text-center py-8" aria-live="polite">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "var(--accent-soft)" }}
                  >
                    <Check size={24} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3" style={{ color: "var(--ink)" }}>
                    Message sent!
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--ink-secondary)" }}>
                    Thanks for reaching out. I&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormStatus({ status: "idle" })}
                    className="text-sm font-medium underline"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Send another message
                  </button>
                </div>
              )}

              {formStatus.status === "error" && (
                <div className="text-center py-4" aria-live="polite" style={{ color: "var(--danger)" }}>
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <p className="text-sm mb-4">Failed to send message</p>
                  <button
                    type="button"
                    onClick={() => setFormStatus({ status: "idle" })}
                    className="text-sm font-medium underline"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {formStatus.status === "idle" || formStatus.status === "sending" ? (
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
                      value={form.name}
                      onChange={handleChange}
                      disabled={formStatus.status === "sending"}
                      className={inputClasses}
                      style={inputStyle}
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
                      value={form.email}
                      onChange={handleChange}
                      disabled={formStatus.status === "sending"}
                      className={inputClasses}
                      style={inputStyle}
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
                      value={form.message}
                      onChange={handleChange}
                      disabled={formStatus.status === "sending"}
                      className={`${inputClasses} resize-none`}
                      style={inputStyle}
                    />
                  </div>
                  <Magnetic className="w-full">
                    <button 
                      type="submit" 
                      disabled={!["idle", "success", "error"].includes(formStatus.status as any)}
                      className={`btn btn-primary w-full ${!["idle", "success", "error"].includes(formStatus.status as any) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {formStatus.status === "sending" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={15} />
                        </>
                      )}
                    </button>
                  </Magnetic>
                </div>
              ) : null}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
