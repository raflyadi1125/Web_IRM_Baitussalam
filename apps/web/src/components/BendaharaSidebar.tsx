import { useState } from "react";
import { BellRing, ChevronLeft, Wallet, X } from "lucide-react";
import {
  canRoleAccessPage,
  getNavigationForRole,
  ROLE_META,
} from "../routes/config";
import type { AppRole } from "../routes/types";
import type { NavKey } from "../types";

// Sidebar ini khusus untuk role bendahara, jadi role tidak dikirim lewat props.
const BENDAHARA_ROLE: AppRole = "bendahara";

interface BendaharaSidebarProps {
  activePage: NavKey;
  isOpen: boolean;
  onNavigate: (page: NavKey) => void;
  onClose: () => void;
}

export default function BendaharaSidebar({
  activePage,
  isOpen,
  onNavigate,
  onClose,
}: BendaharaSidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const bendaharaMeta = ROLE_META[BENDAHARA_ROLE];
  const navigationItems = getNavigationForRole(BENDAHARA_ROLE);

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
        className={`sidebar sidebar-bendahara ${isOpen ? "sidebar-open" : ""}`}
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
            <span className="brand-subtitle">Panel Bendahara</span>
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
            <Wallet size={17} />
          </div>
          <div>
            <p className="community-title">Ruang {bendaharaMeta.label}</p>
            <p className="community-subtitle">
              Kas, iuran, dan laporan keuangan
            </p>
          </div>
          <span className="online-dot" />
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi bendahara">
          {/* Bagi bendahara, menu keuangan ditampilkan lebih dulu */}
          {financeItems.length > 0 && (
            <>
              <p className="nav-section-label">KEUANGAN & LAPORAN</p>
              {renderItems(financeItems)}
            </>
          )}
          <p
            className={`nav-section-label ${
              financeItems.length > 0 ? "nav-section-spaced" : ""
            }`}
          >
            MENU UTAMA
          </p>
          {renderItems(primaryItems)}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon">
            <BellRing size={17} />
          </div>
          <p className="help-title">Pengumuman</p>
          <p className="help-text">
            Lihat informasi terbaru terkait kegiatan dan keuangan organisasi.
          </p>
          <button
            onClick={() => {
              onNavigate(
                canRoleAccessPage(BENDAHARA_ROLE, "pengumuman")
                  ? "pengumuman"
                  : "dashboard",
              );
              onClose();
            }}
            className="help-link"
          >
            Lihat pengumuman <ChevronLeft size={14} className="rotate-180" />
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="avatar avatar-sidebar">{bendaharaMeta.initials}</div>
          <div className="profile-text">
            <span className="profile-name">{bendaharaMeta.label} IRM</span>
            <span className="profile-role">{bendaharaMeta.description}</span>
          </div>
        </div>
      </aside>
    </>
  );
}