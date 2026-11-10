import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import Header from "../components/Header";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";
import { useTheme } from "../contexts/ThemeContext";

export default function AdminLayout() {
  const { activePage, onNavigate } = useRoleNavigation("admin");
  // NOTE: sesuaikan nama fungsi pengganti tema dengan ThemeContext Anda
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Judul halaman diambil dari konfigurasi navigasi admin
  const pageTitle =
    getNavigationForRole("admin").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div
      className={`app-shell layout-admin flex min-h-screen ${
        theme === "dark"
          ? "theme-dark bg-[#0c0f0b] text-white"
          : "theme-light bg-[#f3f5ef] text-slate-900"
      }`}
    >
      <AdminSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
        onToggleTheme={toggleTheme}
      />

      <div className="app-main flex min-w-0 flex-1 flex-col">
        <Header
          title={pageTitle}
          subtitle="Panel Admin IRM Baitussalam"
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="app-content flex-1 px-5 pb-8 pt-2 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}