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

export function Header({ profile, socialLinks }: Pick<PortfolioData, "profile" | "socialLinks">) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const name = text(profile.name) ?? "Portfolio";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const contact = text(profile.email) ? "#contact" : text(socialLinks.linkedin) ?? text(socialLinks.github) ?? "#contact";

  const links = [
    { title: "Projects", href: "#projects" },
    { title: "Experience", href: "#experience" },
    { title: "Skills", href: "#skills" },
    { title: "Credentials", href: "#credentials" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "py-4" : "py-6"
        )}
      >
        <div className="w-[min(1180px,calc(100%-40px))] mx-auto">
          <div 
            className={clsx(
              "flex items-center justify-between gap-6 px-6 py-3 transition-all duration-300 rounded-2xl",
              scrolled 
                ? "bg-background-elevated/70 backdrop-blur-xl shadow-lg border border-line" 
                : "bg-transparent border border-transparent"
            )}
          >
            {/* Brand */}
            <a 
              href="#top" 
              className="group flex items-center gap-3 text-ink hover:text-gradient-1 transition-colors z-50 relative"
              aria-label="Back to top"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink text-background text-[10px] font-extrabold tracking-widest shadow-sm group-hover:bg-gradient-to-tr group-hover:from-gradient-1 group-hover:to-gradient-2 transition-all">
                {initials || "P"}
              </span>
              <span className="font-heading font-semibold tracking-tight hidden sm:block">
                {name}
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
              {links.map(({ title, href }) => (
                <a 
                  key={href} 
                  href={href} 
                  className="text-[13px] font-semibold text-ink-secondary hover:text-ink transition-colors relative group"
                >
                  {title}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-1 rounded-full transition-all group-hover:w-1/2" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 z-50 relative">
              <button 
                onClick={() => setTheme(theme === "pearl" ? "midnight" : "pearl")}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-background-subtle text-ink border border-line hover:border-line-strong hover:bg-background-elevated transition-all"
                aria-label="Toggle color theme"
              >
                {theme === "pearl" ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <a 
                href={contact}
                target={contact.startsWith("http") ? "_blank" : undefined}
                rel={contact.startsWith("http") ? "noreferrer" : undefined}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-background text-[13px] font-semibold hover:shadow-glow hover:scale-105 transition-all"
              >
                Let&apos;s talk <ArrowUpRight size={14} />
              </a>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-background-subtle text-ink border border-line"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col pt-32 px-8 pb-8 md:hidden"
          >
            <nav className="flex flex-col gap-6 text-center">
              {links.map(({ title, href }) => (
                <a 
                  key={href} 
                  href={href} 
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-heading font-medium text-ink hover:text-gradient-1 transition-colors"
                >
                  {title}
                </a>
              ))}
              <a 
                href={contact}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-heading font-medium text-ink hover:text-gradient-1 transition-colors"
              >
                Contact
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
