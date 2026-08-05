"use client";

import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";
import { cn } from "@/lib/utils";

/**
 * Premium footer with gradient divider, social links, nav, and tech badges
 */
export function Footer() {
  const { personalInfo, socialLinks, navItems } = usePortfolio();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Aurora glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />

      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-heading">
              <span className="gradient-text">{personalInfo.firstName}</span>
              <span className="text-white">{personalInfo.lastName}</span>
            </h3>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              {personalInfo.tagline}. Let&apos;s build something amazing together.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 transition-all duration-300"
                  aria-label={link.name}
                >
                  <link.icon className="w-4 h-4 text-muted hover:text-primary transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-dark">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              {navItems.slice(0, 6).map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-300"
                >
                  <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Get in Touch */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-dark">
              Get in Touch
            </h4>
            <div className="space-y-3">
              <a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors group"
              >
                {personalInfo.email}
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-sm text-muted">{personalInfo.location}</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-400">{personalInfo.availability}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-dark flex items-center gap-1.5">
              © {currentYear} {personalInfo.name}. Built with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              </motion.span>
              and lots of ☕
            </p>

            {/* Tech badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {["Next.js", "React", "TypeScript", "Tailwind", "Framer Motion"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-dark border border-white/5"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
