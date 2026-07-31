"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, ArrowRight, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { commandPaletteActions, personalInfo, socialLinks } from "@/lib/constants";

/**
 * ⌘+K searchable command palette
 */
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Open/close with ⌘+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const filteredActions = useMemo(
    () =>
      commandPaletteActions.filter((action) =>
        action.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const handleAction = useCallback(
    (section: string) => {
      setIsOpen(false);
      setQuery("");

      if (section === "resume") {
        window.open(personalInfo.resumeUrl, "_blank");
        return;
      }
      if (section === "github") {
        const github = socialLinks.find((l) => l.name === "GitHub");
        if (github) window.open(github.url, "_blank");
        return;
      }

      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-start justify-center pt-[20vh]"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl glass-strong border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-white placeholder:text-muted-dark outline-none text-sm"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-muted-dark border border-white/10">
                ESC
              </kbd>
            </div>

            {/* Actions list */}
            <div className="max-h-[300px] overflow-y-auto py-2">
              {filteredActions.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-dark">
                  No results found
                </p>
              ) : (
                filteredActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.section)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                      <span>{action.label}</span>
                    </div>
                    <kbd className="hidden sm:block text-[10px] text-muted-dark font-mono">
                      {action.shortcut}
                    </kbd>
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-[10px] text-muted-dark">
              <span>Navigate with ↑↓ • Select with ↵</span>
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" /> K to toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
