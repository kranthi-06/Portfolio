"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { nav, personal } from "@/lib/content";
import { useTheme } from "@/components/providers/theme-provider";
import type { ThemeId } from "@/lib/content";

const themeOptions: { id: ThemeId; icon: typeof Sun; label: string }[] = [
  { id: "pearl", icon: Sun, label: "Pearl" },
  { id: "midnight", icon: Moon, label: "Midnight" },
  { id: "aurora", icon: Sparkles, label: "Aurora" },
];

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "var(--glass)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        }}
      >
        <div className="container flex items-center justify-between h-[72px] px-[var(--page-padding)]">
          <a href="#landing" className="flex items-center gap-3 group">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold tracking-tighter"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              {personal.initials}
            </span>
            <span className="font-display text-sm font-semibold tracking-tight hidden sm:block" style={{ color: "var(--ink)" }}>
              {personal.name}
            </span>
          </a>

          <nav className="nav-desktop flex items-center gap-8" aria-label="Primary">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium transition-colors duration-200 hover:opacity-100"
                style={{ color: "var(--ink-muted)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)" }}
              role="group"
              aria-label="Theme selection"
            >
              {themeOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`${label} theme`}
                  aria-pressed={theme === id}
                  onClick={() => setTheme(id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: theme === id ? "var(--accent)" : "transparent",
                    color: theme === id ? "var(--accent-fg)" : "var(--ink-muted)",
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <a href="#collaborate" className="btn btn-primary hidden sm:inline-flex text-[13px] py-2.5 px-4">
              Collaborate
            </a>

            <button
              type="button"
              className="nav-mobile-toggle hidden w-10 h-10 items-center justify-center rounded-xl"
              style={{ color: "var(--ink)", border: "1px solid var(--line)" }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile fixed inset-0 z-40 flex flex-col pt-[88px] px-6"
            style={{ background: "var(--bg)" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col gap-1">
              {nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-2xl font-display font-medium tracking-tight"
                  style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="flex gap-2 mt-8">
              {themeOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`${label} theme`}
                  onClick={() => setTheme(id)}
                  className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
                  style={{
                    background: theme === id ? "var(--accent)" : "var(--bg-subtle)",
                    color: theme === id ? "var(--accent-fg)" : "var(--ink-muted)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
