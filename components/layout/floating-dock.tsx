"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Code2,
  Briefcase,
  FolderOpen,
  Trophy,
  GraduationCap,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dockItems = [
  { icon: Home, label: "Home", section: "home" },
  { icon: User, label: "About", section: "about" },
  { icon: Code2, label: "Skills", section: "skills" },
  { icon: Briefcase, label: "Experience", section: "experience" },
  { icon: FolderOpen, label: "Projects", section: "projects" },
  { icon: Trophy, label: "Achievements", section: "achievements" },
  { icon: GraduationCap, label: "Education", section: "education" },
  { icon: Mail, label: "Contact", section: "contact" },
];

/**
 * macOS-style floating dock at bottom center with magnification
 */
export function FloatingDock() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.15;
    return 1;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block"
        >
          <div className="flex items-end gap-1 px-3 py-2 rounded-2xl glass-strong border border-white/10 shadow-2xl">
            {dockItems.map((item, i) => (
              <motion.button
                key={item.section}
                onClick={() => handleClick(item.section)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{ scale: getScale(i) }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative group p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                aria-label={item.label}
              >
                <item.icon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredIndex === i && (
                    <motion.span
                      initial={{ opacity: 0, y: 5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.8 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-medium rounded-lg bg-card border border-white/10 whitespace-nowrap shadow-lg"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
