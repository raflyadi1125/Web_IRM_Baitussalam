import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import Header from "../components/Header";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";
import { useTheme } from "../contexts/ThemeContext";

export default function AdminLayout() {
  const { activePage, onNavigate } = useRoleNavigation("admin");
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Judul halaman diambil dari konfigurasi navigasi admin
  const pageTitle =
    getNavigationForRole("admin").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div
      className={`app-shell layout-admin ${
        theme === "dark" ? "theme-dark" : "theme-light"
      }`}
    >
      <AdminSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Header
          title={pageTitle}
          subtitle="Panel Admin IRM Baitussalam"
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}