"use client";

import { Search, Bell, Moon, Sun, Menu, User } from "lucide-react";
import { useAdminTheme } from "./theme-provider";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  userEmail?: string;
}

export function AdminHeader({ onMobileMenuToggle, userEmail }: HeaderProps) {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          onClick={onMobileMenuToggle}
          className="admin-icon-btn lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <button className="admin-search-trigger" aria-label="Search">
          <Search size={14} />
          <span>Search everything…</span>
          <kbd className="admin-search-kbd">⌘K</kbd>
        </button>
      </div>

      <div className="admin-header-right">
        <button
          onClick={toggleTheme}
          className="admin-icon-btn"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="admin-icon-btn" aria-label="Notifications">
          <Bell size={16} />
          <span className="notification-dot" />
        </button>

        <div
          className="flex items-center gap-2 pl-2 ml-1"
          style={{ borderLeft: "1px solid var(--admin-line)", paddingLeft: 12 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--admin-accent-soft)",
              color: "var(--admin-accent)",
            }}
          >
            <User size={14} />
          </div>
          {userEmail && (
            <span
              className="text-xs font-medium hidden sm:block max-w-[140px] truncate"
              style={{ color: "var(--admin-ink-secondary)" }}
            >
              {userEmail}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
