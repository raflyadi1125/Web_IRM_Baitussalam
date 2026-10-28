import { useState } from "react";
import { Activity, BellRing, ChevronLeft, X } from "lucide-react";
import {
  canRoleAccessPage,
  getNavigationForRole,
  ROLE_META,
} from "../routes/config";
import type { AppRole } from "../routes/types";
import type { NavKey } from "../types";

interface SidebarProps {
  activePage: NavKey;
  activeRole: AppRole;
  isOpen: boolean;
  onNavigate: (page: NavKey) => void;
  onClose: () => void;
}

export default function Sidebar({
  activePage,
  activeRole,
  isOpen,
  onNavigate,
  onClose,
}: SidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const navigationItems = getNavigationForRole(activeRole);
  const primaryItems = navigationItems.filter(
    (item) => item.section === "utama",
  );
  const financeItems = navigationItems.filter(
    (item) => item.section === "keuangan",
  );
  const renderItems = (items: typeof navigationItems) =>
    items.map(({ key, label, icon: Icon }) => {
      const active = activePage === key;
      return (
        <button
          key={key}
          onClick={() => {
            onNavigate(key);
            onClose();
          }}
          className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
          aria-current={active ? "page" : undefined}
        >
          <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
          <span>{label}</span>
        </button>
      );
    });

  return (
    <>
      {isOpen && (
        <button
          className="sidebar-backdrop lg:hidden"
          aria-label="Tutup menu"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div
            className="brand-mark brand-logo"
            aria-label="Logo IRM Baitussalam"
          >
            {logoFailed ? (
              <span className="brand-logo-fallback" aria-hidden="true">
                IRM
              </span>
            ) : (
              <img
                src="/Logo_Prismaba.jpg"
                alt="Logo IRM Baitussalam"
                className="brand-logo-image"
                onError={() => setLogoFailed(true)}
              />
            )}
          </div>
          <div className="brand-copy">
            <span className="brand-title">IRM Baitussalam</span>
            <span className="brand-subtitle">Sistem Informasi</span>
          </div>
          <button
            className="sidebar-close lg:hidden"
            onClick={onClose}
            aria-label="Tutup navigasi"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-community">
          <div className="community-icon">
            <Activity size={17} />
          </div>
          <div>
            <p className="community-title">
              Ruang {ROLE_META[activeRole].label}
            </p>
            <p className="community-subtitle">Akses demo berdasarkan role</p>
          </div>
          <span className="online-dot" />
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          <p className="nav-section-label">MENU UTAMA</p>
          {renderItems(primaryItems)}
          {financeItems.length > 0 && (
            <>
              <p className="nav-section-label nav-section-spaced">
                KEUANGAN & LAPORAN
              </p>
              {renderItems(financeItems)}
            </>
          )}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon">
            <BellRing size={17} />
          </div>
          <p className="help-title">Butuh bantuan?</p>
          <p className="help-text">
            Hubungi admin jika ada kendala saat menggunakan sistem.
          </p>
          <button
            onClick={() => {
              onNavigate(
                canRoleAccessPage(activeRole, "pengumuman")
                  ? "pengumuman"
                  : "dashboard",
              );
              onClose();
            }}
            className="help-link"
          >
            Lihat informasi <ChevronLeft size={14} className="rotate-180" />
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="avatar avatar-sidebar">
            {ROLE_META[activeRole].initials}
          </div>
          <div className="profile-text">
            <span className="profile-name">
              {ROLE_META[activeRole].label} IRM
            </span>
            <span className="profile-role">
              {ROLE_META[activeRole].description}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
