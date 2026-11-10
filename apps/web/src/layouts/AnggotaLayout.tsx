import { useState } from "react";
import { Outlet } from "react-router-dom";
import AnggotaSidebar from "../components/anggota/AnggotaSidebar";
import Header from "../components/Header";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";
import { useTheme } from "../contexts/ThemeContext";

export default function AnggotaLayout() {
  const { activePage, onNavigate } = useRoleNavigation("anggota");
  // NOTE: sesuaikan nama fungsi pengganti tema dengan ThemeContext Anda
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Judul halaman diambil dari konfigurasi navigasi anggota
  const pageTitle =
    getNavigationForRole("anggota").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div
      className={`app-shell layout-anggota flex min-h-screen ${
        theme === "dark"
          ? "theme-dark bg-[#0c0f0b] text-white"
          : "theme-light bg-[#f3f5ef] text-slate-900"
      }`}
    >
      {/* Sidebar rail (w-20) sticky di sebelah kiri pada layar besar */}
      <AnggotaSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
        onToggleTheme={toggleTheme}
      />

      <div className="app-main flex min-w-0 flex-1 flex-col">
        <Header
          title={pageTitle}
          subtitle="Portal Anggota IRM Baitussalam"
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="app-content min-w-0 flex-1 px-5 pb-8 pt-2 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}