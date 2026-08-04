"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import type { PortfolioData } from "@/lib/portfolio/types";
import { clsx } from "clsx";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

const NAV_LINKS = [
  { title: "Work", href: "#projects" },
  { title: "About", href: "#about" },
  { title: "Experience", href: "#experience" },
  { title: "Contact", href: "#contact" },
];

export function Header({
  profile,
  socialLinks,
}: Pick<PortfolioData, "profile" | "socialLinks">) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  const name = text(profile.name) ?? "Portfolio";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const contact =
    text(profile.email)
      ? "#contact"
      : text(socialLinks.linkedin) ??
        text(socialLinks.github) ??
        "#contact";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="container-narrow">
          <div
            className={clsx(
              "flex items-center justify-between gap-4 px-5 py-2.5 rounded-full transition-all duration-500",
              scrolled
                ? "glass-panel shadow-md"
                : "bg-transparent border border-transparent"
            )}
          >
            {/* Brand */}
            <a
              href="#top"
              className="group flex items-center gap-3 z-50 relative"
              aria-label="Back to top"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink text-background text-[10px] font-bold tracking-widest transition-all duration-300 group-hover:bg-accent group-hover:shadow-glow">
                {initials || "P"}
              </span>
              <span className="font-display font-semibold text-sm tracking-tight text-ink hidden sm:block">
                {name}
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ title, href }) => (
                <a
                  key={href}
                  href={href}
                  className="relative text-[13px] font-medium text-ink-secondary hover:text-ink transition-colors duration-300 group"
                >
                  {title}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 z-50 relative">
              <button
                onClick={() =>
                  setTheme(theme === "pearl" ? "midnight" : "pearl")
                }
                className="w-9 h-9 flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-background-subtle transition-all duration-300"
                aria-label="Toggle color theme"
              >
                {theme === "pearl" ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <a
                href={contact}
                target={contact.startsWith("http") ? "_blank" : undefined}
                rel={contact.startsWith("http") ? "noreferrer" : undefined}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-background text-[13px] font-semibold hover:shadow-glow transition-all duration-300"
              >
                Let&apos;s talk
                <ArrowUpRight size={14} />
              </a>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-ink hover:bg-background-subtle transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map(({ title, href }, i) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="text-4xl font-display font-medium text-ink hover:text-accent transition-colors"
                >
                  {title}
                </motion.a>
              ))}
              <motion.a
                href={contact}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: NAV_LINKS.length * 0.08,
                  duration: 0.4,
                }}
                className="mt-4 px-8 py-3.5 rounded-full bg-ink text-background text-lg font-semibold"
              >
                Let&apos;s talk
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
