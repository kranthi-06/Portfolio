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
  socialLinks: { name: string; url: string; icon: LucideIcon }[];
  stats: { label: string; value: number; suffix: string }[];
  skillCategories: { title: string; icon: LucideIcon; description: string; color: string; skills: { name: string; level: number }[] }[];
  experiences: { title: string; company: string; companyUrl?: string; location: string; type: string; startDate: string; endDate: string; description: string; achievements: string[]; technologies: string[] }[];
  projects: { id: string; title: string; subtitle: string; description: string; long_description: string; problem: string; solution: string; features: string[]; technologies: string[]; github_url?: string; live_url?: string; media?: { url: string; type: string }; category: string; featured: boolean; architecture?: string; challenges: string[]; future_scope: string[] }[];
  achievements: { title: string; event: string; position: string; date: string; description: string; icon: LucideIcon; color: string; media?: { url: string; type: string } }[];
  certifications: { title: string; organization: string; date: string; credentialUrl?: string; media?: { url: string; type: string } }[];
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

const getIcon = (name: string): LucideIcon => {
  const n = name.toLowerCase();
  if (n.includes("github")) return Github;
  if (n.includes("linkedin")) return Linkedin;
  if (n.includes("twitter") || n.includes("x")) return Twitter;
  if (n.includes("mail") || n.includes("email")) return Mail;
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
      name: key.charAt(0).toUpperCase() + key.slice(1),
      url: url || "",
      icon: getIcon(key),
    }));

    // 3. Stats
    const stats = Object.entries(data.counters || {}).map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof value === "number" ? value : parseInt(String(value)) || 0,
      suffix: typeof value === "string" && isNaN(Number(value)) ? value.replace(/^[0-9]+/, '') : "+",
    }));

    // 4. Experiences
    const experiences = (data.experience || []).map((exp) => ({
      title: exp.title,
      company: exp.company,
      companyUrl: exp.company_url || undefined,
      location: exp.location || "",
      type: exp.type,
      startDate: exp.start_date,
      endDate: exp.end_date || "Present",
      description: exp.description || "",
      achievements: exp.achievements || [],
      technologies: exp.technologies || [],
    }));

    // 5. Projects
    const projects = (data.projects || []).map((proj) => ({
      id: proj.id,
      title: proj.title,
      subtitle: proj.subtitle || "",
      description: proj.description || "",
      long_description: proj.long_description || "",
      problem: proj.problem || "",
      solution: proj.solution || "",
      features: proj.features || [],
      technologies: proj.technologies || [],
      github_url: proj.github_url || undefined,
      live_url: proj.live_url || undefined,
      media: proj.media || undefined,
      category: proj.category || "",
      featured: proj.featured || false,
      architecture: proj.architecture || undefined,
      challenges: proj.challenges || [],
      future_scope: proj.future_scope || [],
    }));

    // 6. Achievements
    const achievements = (data.achievements || []).map((ach) => ({
      title: ach.title,
      event: ach.event || "",
      position: ach.position || "",
      date: ach.date || "",
      description: ach.description || "",
      icon: getIcon(ach.title),
      color: ach.color || "#6C63FF",
      media: ach.media || undefined,
    }));

    // 7. Certifications
    const certifications = (data.certificates || []).map((cert) => ({
      title: cert.title,
      organization: cert.organization || "",
      date: cert.issue_date || "",
      credentialUrl: cert.credential_url || undefined,
      media: cert.media || undefined,
    }));

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
      experiences,
      projects,
      achievements,
      certifications,
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
