import { useState } from "react";
import { BellRing, ChevronLeft, Users, X } from "lucide-react";
import {
  canRoleAccessPage,
  getNavigationForRole,
  ROLE_META,
} from "../routes/config";
import type { AppRole } from "../routes/types";
import type { NavKey } from "../types";

// Sidebar ini khusus untuk role anggota, jadi role tidak dikirim lewat props.
const ANGGOTA_ROLE: AppRole = "anggota";

interface AnggotaSidebarProps {
  activePage: NavKey;
  isOpen: boolean;
  onNavigate: (page: NavKey) => void;
  onClose: () => void;
}

export default function AnggotaSidebar({
  activePage,
  isOpen,
  onNavigate,
  onClose,
}: AnggotaSidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const anggotaMeta = ROLE_META[ANGGOTA_ROLE];
  const navigationItems = getNavigationForRole(ANGGOTA_ROLE);

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
      <aside
        className={`sidebar sidebar-anggota ${isOpen ? "sidebar-open" : ""}`}
      >
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
            <span className="brand-subtitle">Portal Anggota</span>
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
            <Users size={17} />
          </div>
          <div>
            <p className="community-title">Ruang {anggotaMeta.label}</p>
            <p className="community-subtitle">
              Kegiatan dan informasi organisasi
            </p>
          </div>
          <span className="online-dot" />
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi anggota">
          <p className="nav-section-label">MENU ANGGOTA</p>
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
            Hubungi pengurus jika ada kendala saat menggunakan sistem.
          </p>
          <button
            onClick={() => {
              onNavigate(
                canRoleAccessPage(ANGGOTA_ROLE, "pengumuman")
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
          <div className="avatar avatar-sidebar">{anggotaMeta.initials}</div>
          <div className="profile-text">
            <span className="profile-name">{anggotaMeta.label} IRM</span>
            <span className="profile-role">{anggotaMeta.description}</span>
          </div>
        </div>
      </aside>
    </>
  );
}