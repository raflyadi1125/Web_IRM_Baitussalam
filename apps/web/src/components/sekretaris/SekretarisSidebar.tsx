import { useState } from "react";
import { BellRing, Moon, Sun, X } from "lucide-react";
import {
  canRoleAccessPage,
  getNavigationForRole,
  ROLE_META,
} from "../../routes/config";
import type { AppRole } from "../../routes/types";
import type { NavKey } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";

// Sidebar ini khusus untuk role sekretaris, jadi role tidak dikirim lewat props.
const SEKRETARIS_ROLE: AppRole = "sekretaris";

interface SekretarisSidebarProps {
  activePage: NavKey;
  isOpen: boolean;
  onNavigate: (page: NavKey) => void;
  onClose: () => void;
  /** Ganti tema terang/gelap */
  onToggleTheme?: () => void;
}

export default function SekretarisSidebar({
  activePage,
  isOpen,
  onNavigate,
  onClose,
  onToggleTheme,
}: SekretarisSidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sekretarisMeta = ROLE_META[SEKRETARIS_ROLE];
  const navigationItems = getNavigationForRole(SEKRETARIS_ROLE);

  const primaryItems = navigationItems.filter(
    (item) => item.section === "utama",
  );
  const financeItems = navigationItems.filter(
    (item) => item.section === "keuangan",
  );
  const groups = [primaryItems, financeItems].filter((g) => g.length > 0);

  // Pintasan pengumuman hanya muncul jika belum ada di daftar menu
  const hasAnnouncementMenu = navigationItems.some(
    (item) => item.key === "pengumuman",
  );

  const handleNavigate = (key: NavKey) => {
    onNavigate(key);
    onClose();
  };

  // Token warna sesuai tema
  const c = isDark
    ? {
        rail: "border-white/5 bg-[#0c0f0b]",
        idle: "border-white/10 bg-white/[0.04] text-white/60 hover:border-lime-300/40 hover:text-lime-300",
        tip: "border border-white/10 bg-[#1a1f17] text-white",
        pill: "border-white/10 bg-white/[0.04]",
        pillIdle: "text-white/50 hover:text-white",
        divider: "bg-white/10",
        overlay: "bg-black/60",
      }
    : {
        rail: "border-slate-200 bg-white",
        idle: "border-slate-200 bg-slate-50 text-slate-500 hover:border-lime-400 hover:text-lime-700",
        tip: "border border-slate-200 bg-white text-slate-800 shadow-md",
        pill: "border-slate-200 bg-slate-50",
        pillIdle: "text-slate-400 hover:text-slate-700",
        divider: "bg-slate-200",
        overlay: "bg-black/30",
      };

  const base =
    "group relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60 [@media(max-height:720px)]:h-10 [@media(max-height:720px)]:w-10";
  const active =
    "border-lime-300/70 bg-gradient-to-b from-lime-300/35 to-lime-300/5 text-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.35)]";

  const tooltip = (text: string) => (
    <span
      className={`pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 lg:block ${c.tip}`}
    >
      {text}
    </span>
  );

  const divider = <span className={`h-px w-8 shrink-0 ${c.divider}`} />;

  const renderItems = (items: typeof navigationItems) =>
    items.map(({ key, label, icon: Icon }) => {
      const isActive = activePage === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => handleNavigate(key)}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          className={`${base} ${isActive ? active : c.idle}`}
        >
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
          {tooltip(label)}
        </button>
      );
    });

  return (
    <>
      {/* Overlay (layar kecil) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 transition-opacity lg:hidden ${c.overlay} ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Navigasi sekretaris"
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-20 shrink-0 flex-col items-center border-r py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${c.rail} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Atas: logo */}
        <div
          className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-lime-300 text-xs font-bold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.3)]"
          title={`IRM Baitussalam · ${sekretarisMeta.label}`}
        >
          {logoFailed ? (
            <span aria-hidden="true">IRM</span>
          ) : (
            <img
              src="/Logo_Prismaba.jpg"
              alt="Logo IRM Baitussalam"
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>

        <div className="my-4">{divider}</div>

        {/* Tengah: menu sekretaris, dipisah garis antar kelompok */}
        <nav
          className="flex flex-1 flex-col items-center gap-2.5 [@media(max-height:720px)]:gap-2"
          aria-label="Menu sekretaris"
        >
          {groups.map((items, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2.5 [@media(max-height:720px)]:gap-2"
            >
              {index > 0 && <div className="mb-0.5">{divider}</div>}
              {renderItems(items)}
            </div>
          ))}
        </nav>

        {/* Bawah: pintasan pengumuman + tema */}
        <div className="mt-4 flex flex-col items-center gap-3">
          {divider}

          {!hasAnnouncementMenu && (
            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  canRoleAccessPage(SEKRETARIS_ROLE, "pengumuman")
                    ? "pengumuman"
                    : "dashboard",
                )
              }
              aria-label="Pengumuman"
              className={`${base} ${c.idle}`}
            >
              <BellRing size={18} />
              {tooltip("Pengumuman")}
            </button>
          )}

          <div
            className={`flex flex-col items-center gap-1 rounded-full border p-1 ${c.pill}`}
          >
            <button
              type="button"
              onClick={() => !isDark && onToggleTheme?.()}
              aria-label="Mode gelap"
              aria-pressed={isDark}
              className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                isDark
                  ? "bg-lime-300 text-[#10150c] shadow-[0_0_16px_rgba(190,242,100,0.4)]"
                  : c.pillIdle
              }`}
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => isDark && onToggleTheme?.()}
              aria-label="Mode terang"
              aria-pressed={!isDark}
              className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
                !isDark ? "bg-lime-400 text-[#10150c]" : c.pillIdle
              }`}
            >
              <Sun className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tombol tutup (hanya layar kecil) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup navigasi"
          className={`absolute -right-3 top-5 grid h-7 w-7 place-items-center rounded-full border lg:hidden ${c.rail} ${c.idle}`}
        >
          <X size={14} />
        </button>
      </aside>
    </>
  );
}