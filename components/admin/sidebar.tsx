"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, Award, CalendarDays, Trophy,
  ImageIcon, Briefcase, Cpu, FileText, BarChart3, Github,
  ImagePlus, MessageSquare, Sparkles, Settings, ScrollText,
  LogOut, ChevronLeft, Zap,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navSections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
      { label: "Events", href: "/admin/events", icon: CalendarDays },
      { label: "Achievements", href: "/admin/achievements", icon: Trophy },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Experience", href: "/admin/experience", icon: Briefcase },
      { label: "Skills", href: "/admin/skills", icon: Cpu },
      { label: "Resume", href: "/admin/resume", icon: FileText },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "GitHub", href: "/admin/github", icon: Github },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Media Library", href: "/admin/media", icon: ImagePlus },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare, badge: true },
      { label: "AI Assistant", href: "/admin/ai", icon: Sparkles },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Logs", href: "/admin/logs", icon: ScrollText },
    ],
  },
];

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">
            <Zap size={16} />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-[13px] font-bold tracking-tight" style={{ color: "var(--admin-ink)" }}>
                Portfolio CMS
              </span>
              <span className="text-[10px]" style={{ color: "var(--admin-ink-muted)" }}>
                Admin Panel
              </span>
            </motion.div>
          )}
          <button
            onClick={onToggle}
            className="admin-icon-btn ml-auto hidden lg:flex"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={16}
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label} className="admin-nav-section">
              {!collapsed && (
                <span className="admin-nav-section-label">{section.label}</span>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive(item.href) ? "active" : ""}`}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="admin-nav-item-icon" />
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span className="admin-nav-badge">New</span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          ))}

          {/* Logout */}
          <div className="admin-nav-section" style={{ marginTop: "auto", paddingTop: 8 }}>
            <button
              onClick={handleLogout}
              className="admin-nav-item danger"
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="admin-nav-item-icon" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
