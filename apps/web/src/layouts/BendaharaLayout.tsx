import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import BendaharaSidebar from "../components/bendahara/BendaharaSidebar";
import Header from "../components/Header";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";

export default function BendaharaLayout() {
  const { activePage, onNavigate } = useRoleNavigation("bendahara");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Judul halaman diambil dari konfigurasi navigasi bendahara
  const pageTitle =
    getNavigationForRole("bendahara").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div className="app-shell layout-bendahara min-h-screen bg-slate-50">
      <BendaharaSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
      />

      {/*
        lg:pl-72 = lebar sidebar (w-72 / 18rem).
        Kalau sidebar Anda w-80, ganti jadi lg:pl-80 (dan seterusnya).
      */}
      <div className="app-main flex min-h-screen min-w-0 flex-col lg:pl-72">
        <Header
          title={pageTitle}
          subtitle="Panel Admin IRM Baitussalam"
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="app-content min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}