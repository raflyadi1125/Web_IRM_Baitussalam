import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AnggotaSidebar from "../components/anggota/AnggotaSidebar";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";

export default function AnggotaLayout() {
  const { activePage, onNavigate } = useRoleNavigation("anggota");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Judul halaman diambil dari konfigurasi navigasi anggota
  const pageTitle =
    getNavigationForRole("anggota").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div className="app-shell layout-anggota">
      <AnggotaSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="topbar-menu lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">Portal Anggota IRM Baitussalam</p>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}