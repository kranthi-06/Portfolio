"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AdminThemeProvider, useAdminTheme } from "@/components/admin/theme-provider";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { AdminToastProvider } from "@/components/admin/toast-provider";
import "../admin.css";

function AdminDashboardLayoutInner({ children }: { children: ReactNode }) {
  const { theme } = useAdminTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  function handleToggleSidebar() {
    setSidebarCollapsed((prev) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!prev));
      return !prev;
    });
  }

  return (
    <div className="admin-layout" data-theme={theme}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`admin-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <AdminHeader onMobileMenuToggle={() => setMobileOpen((p) => !p)} />
        <main className="admin-page">{children}</main>
      </div>
      <AdminToastProvider />
    </div>
  );
}

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminDashboardLayoutInner>{children}</AdminDashboardLayoutInner>
    </AdminThemeProvider>
  );
}
