import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import SekretarisSidebar from "../components/SekretarisSidebar";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";

export default function SekretarisLayout() {
  const { activePage, onNavigate } = useRoleNavigation("sekretaris");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Judul halaman diambil dari konfigurasi navigasi sekretaris
  const pageTitle =
    getNavigationForRole("sekretaris").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div className="app-shell layout-sekretaris">
      <SekretarisSidebar
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
            <p className="page-subtitle">Panel Sekretaris IRM Baitussalam</p>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}