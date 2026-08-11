"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { PortfolioData } from "@/lib/portfolio/types";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Code2,
  Brain,
  Server,
  Wrench,
  Palette,
  Users,
  GraduationCap,
  Trophy,
  Award,
  Star,
  Globe,
  LucideIcon,
} from "lucide-react";
import { SiLeetcode, SiHackerrank, SiKaggle } from "@icons-pack/react-simple-icons";
import { skillCategories as defaultSkillCategories } from "@/lib/constants";

type LegacyContextType = {
  personalInfo: {
    name: string;
    firstName: string;
    lastName: string;
    title: string;
    tagline: string;
    roles: string[];
    email: string;
    location: string;
    availability: string;
    bio: string;
    about: string;
    resumeUrl: string;
    avatar_url: string;
  };
  socialLinks: { name: string; url: string; icon: React.ElementType }[];
  stats: { label: string; value: number; suffix: string }[];
  skillCategories: { title: string; icon: LucideIcon; description: string; color: string; skills: { name: string; level: number }[] }[];
  experience: import("@/lib/portfolio/types").Experience[];
  projects: import("@/lib/portfolio/types").Project[];
  achievements: (import("@/lib/portfolio/types").Achievement & { icon: React.ElementType })[];
  certifications: import("@/lib/portfolio/types").Certificate[];
  events: import("@/lib/portfolio/types").Event[];
  gallery: import("@/lib/portfolio/types").GalleryItem[];
  education: { degree: string; branch: string; institution: string; location: string; startYear: string; endYear: string; cgpa: string; coursework: string[]; icon: LucideIcon }[];
  navItems: { label: string; href: string }[];
  techMarqueeItems: string[];
  commandPaletteActions: { label: string; section: string; shortcut: string }[];
};

const PortfolioContext = createContext<LegacyContextType | null>(null);

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}

const getProperSocialName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("leetcode")) return "LeetCode";
  if (n.includes("hackerrank")) return "HackerRank";
  if (n.includes("kaggle")) return "Kaggle";
  if (n.includes("github")) return "GitHub";
  if (n.includes("linkedin")) return "LinkedIn";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const getIcon = (name: string): React.ElementType => {
  const n = name.toLowerCase();
  if (n.includes("github")) return Github;
  if (n.includes("linkedin")) return Linkedin;
  if (n.includes("twitter") || n.includes("x")) return Twitter;
  if (n.includes("mail") || n.includes("email")) return Mail;
  if (n.includes("leetcode")) return SiLeetcode;
  if (n.includes("hackerrank")) return SiHackerrank;
  if (n.includes("kaggle")) return SiKaggle;
  if (n.includes("trophy")) return Trophy;
  if (n.includes("award")) return Award;
  if (n.includes("star")) return Star;
  return Globe;
};

export function PortfolioProvider({
  data,
  children,
}: {
  data: PortfolioData;
  children: React.ReactNode;
}) {
  const legacyData = useMemo<LegacyContextType>(() => {
    // 1. Personal Info
    const personalInfo = {
      name: data.profile.name || "Portfolio",
      firstName: data.profile.name?.split(" ")[0] || "Portfolio",
      lastName: data.profile.name?.split(" ").slice(1).join(" ") || "",
      title: data.profile.title || "",
      tagline: data.profile.tagline || data.profile.headline || "",
      roles: data.seo?.keywords?.length ? data.seo.keywords : ["AI Developer", "Software Engineer"],
      email: data.profile.email || "",
      location: data.profile.location || "",
      availability: data.profile.availability || "",
      bio: data.profile.bio || "",
      about: data.profile.about || "",
      resumeUrl: data.resume?.media?.url || "#",
      avatar_url: data.profile.avatar_url || "",
    };

    // 2. Social Links
    const socialLinks = Object.entries(data.socialLinks || {}).map(([key, url]) => ({
      name: getProperSocialName(key),
      url: url || "",
      icon: getIcon(key),
    }));

    // 3. Stats
    const stats = Object.entries(data.counters || {}).map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof value === "number" ? value : parseInt(String(value)) || 0,
      suffix: typeof value === "string" && isNaN(Number(value)) ? value.replace(/^[0-9]+/, '') : "+",
    }));

    // 4. Experience (Unified Timeline)
    const experience = data.experience || [];

    // 6. Projects
    const projects = data.projects || [];

    // 6. Achievements
    const achievements = (data.achievements || []).map((ach) => ({
      ...ach,
      event: ach.event || "",
      position: ach.position || "",
      date: ach.date || "",
      description: ach.description || "",
      icon: getIcon(ach.title),
      color: ach.color || "#6C63FF",
      media: ach.media || null,
    }));

    // 7. Certifications
    const certifications = data.certificates || [];

    // 8. Education
    const education = [
      {
        degree: "Bachelor of Technology",
        branch: "Computer Science & Engineering",
        institution: "University",
        location: "India",
        startYear: "2022",
        endYear: "2026",
        cgpa: "8.5 / 10",
        coursework: ["Data Structures & Algorithms", "Machine Learning"],
        icon: GraduationCap,
      },
    ];

    // 9. Skills
    const categoryMap: Record<string, any[]> = {};
    (data.skills || []).forEach((skill) => {
      const cat = skill.category_label || skill.category || "Other";
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push({ name: skill.name, level: skill.level });
    });

    const skillCategories = Object.entries(categoryMap).map(([title, skills]) => ({
      title,
      icon: Code2,
      description: `Skills related to ${title}`,
      color: "#6C63FF",
      skills,
    }));

    const finalSkillCategories = skillCategories.length > 0 ? skillCategories : defaultSkillCategories;

    const navItems = [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Skills", href: "#skills" },
      { label: "Experience", href: "#experience" },
      { label: "Projects", href: "#projects" },
      { label: "Achievements", href: "#achievements" },
      { label: "Certifications", href: "#certifications" },
      { label: "Contact", href: "#contact" },
    ];

    const techMarqueeItems = (data.skills || []).map(s => s.name);
    
    const commandPaletteActions = [
      { label: "Go to Home", section: "home", shortcut: "G H" },
      { label: "Go to About", section: "about", shortcut: "G A" },
      { label: "Go to Projects", section: "projects", shortcut: "G P" },
      { label: "Download Resume", section: "resume", shortcut: "D R" },
    ];

    return {
      personalInfo,
      socialLinks,
      stats,
      skillCategories: finalSkillCategories,
      experience,
      projects,
      achievements,
      certifications,
      events: data.events || [],
      gallery: data.gallery || [],
      education,
      navItems,
      techMarqueeItems: techMarqueeItems.length > 0 ? techMarqueeItems : ["React", "Next.js"],
      commandPaletteActions,
    };
  }, [data]);

  return (
    <PortfolioContext.Provider value={legacyData}>
      {children}
    </PortfolioContext.Provider>
  );
}
