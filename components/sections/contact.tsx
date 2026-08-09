"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { personalInfo, socialLinks } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { fadeInLeft, fadeInRight } from "@/lib/animations";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Contact section with glassmorphism form, social links, and EmailJS integration
 */
export function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // EmailJS integration — replace with your credentials
      // import emailjs from "@emailjs/browser";
      // await emailjs.send(
      //   "YOUR_SERVICE_ID",
      //   "YOUR_TEMPLATE_ID",
      //   { ...form },
      //   "YOUR_PUBLIC_KEY"
      // );

      // Simulate send for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) { console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted-dark text-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300";

  return (
    <section id="contact" className="relative section-padding">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Contact"
          title="Let's Connect"
          subtitle="Have a project in mind or just want to chat? I'd love to hear from you."
        />

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Left — Contact Info */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Direct contact */}
            <GlassCard className="p-6">
              <div className="space-y-5">
                <h3 className="text-lg font-semibold font-heading">
                  Direct Contact
                </h3>

                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors group"
                >
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-dark">Email</p>
                    <p className="font-medium text-white group-hover:text-primary transition-colors">
                      {personalInfo.email}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-3 text-sm text-muted">
                  <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-dark">Location</p>
                    <p className="font-medium text-white">{personalInfo.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted">
                  <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Clock className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-dark">Availability</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="font-medium text-green-400">
                        {personalInfo.availability}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Social links */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold font-heading mb-4">
                Find Me Online
              </h3>
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted group-hover:text-white transition-colors">
                        {link.name}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Right — Contact Form */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-3"
          >
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold font-heading mb-2">
                  Send a Message
                </h3>

                {/* Name & Email row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs text-muted-dark mb-1.5 uppercase tracking-wider font-medium"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs text-muted-dark mb-1.5 uppercase tracking-wider font-medium"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs text-muted-dark mb-1.5 uppercase tracking-wider font-medium"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs text-muted-dark mb-1.5 uppercase tracking-wider font-medium"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell me about your project or idea..."
                    value={form.message}
                    onChange={handleChange}
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center gap-4">
                  <MagneticButton
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    type="submit"
                  >
                    {status === "sending" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </MagneticButton>

                  {/* Status messages */}
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-green-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Message sent!
                    </motion.div>
                  )}
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-red-400"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Failed to send
                    </motion.div>
                  )}
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
