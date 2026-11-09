import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import SekretarisSidebar from "../components/sekretaris/SekretarisSidebar";
import Header from "../components/Header";
import { useRoleNavigation } from "../hooks/useRoleNavigation";
import { getNavigationForRole } from "../routes/config";

export default function SekretarisLayout() {
  const { activePage, onNavigate } = useRoleNavigation("sekretaris");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle =
    getNavigationForRole("sekretaris").find((item) => item.key === activePage)
      ?.label ?? "Dashboard";

  return (
    <div className="app-shell layout-sekretaris min-h-screen bg-slate-50">
      <SekretarisSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
      />

      {/* lg:pl-72 = lebar sidebar, supaya konten mulai di sebelah kanan sidebar */}
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