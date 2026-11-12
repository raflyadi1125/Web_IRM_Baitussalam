import { useState } from "react";
import type { MouseEvent } from "react";
import { BellRing, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  canRoleAccessPage,
  getNavigationForRole,
  ROLE_META,
} from "../../routes/config";
import type { AppRole } from "../../routes/types";
import type { NavKey } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";

// Sidebar ini khusus untuk role anggota, jadi role tidak dikirim lewat props.
const ANGGOTA_ROLE: AppRole = "anggota";

interface AnggotaSidebarProps {
  activePage: NavKey;
  isOpen: boolean;
  onNavigate: (page: NavKey) => void;
  onClose: () => void;
  /** Ganti tema terang/gelap (origin = titik awal lingkaran animasi) */
  onToggleTheme?: (origin?: { x: number; y: number }) => void;
}

interface RailButtonProps {
  id: string;
  label: string;
  ariaLabel?: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function AnggotaSidebar({
  activePage,
  isOpen,
  onNavigate,
  onClose,
  onToggleTheme,
}: AnggotaSidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const anggotaMeta = ROLE_META[ANGGOTA_ROLE];
  const navigationItems = getNavigationForRole(ANGGOTA_ROLE);

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
        circleIdle:
          "border-white/10 bg-white/[0.04] text-white/60 group-hover:border-lime-300/40 group-hover:text-lime-300",
        labelIdle: "text-white/60 group-hover:text-lime-300",
        labelActive: "text-lime-300",
        brand: "text-white",
        divider: "bg-white/10",
        overlay: "bg-black/60",
      }
    : {
        rail: "border-slate-200 bg-white",
        circleIdle:
          "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-lime-400 group-hover:text-lime-700",
        labelIdle: "text-slate-600 group-hover:text-lime-700",
        labelActive: "text-lime-700",
        brand: "text-slate-900",
        divider: "bg-slate-200",
        overlay: "bg-black/30",
      };

  // Lingkaran ikon: semua memakai ukuran yang sama agar rapi
  const circle =
    "relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-lime-300/60 [@media(max-height:720px)]:h-10 [@media(max-height:720px)]:w-10";
  const circleActive =
    "border-lime-300/70 bg-gradient-to-b from-lime-300/35 to-lime-300/5 text-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.35)]";

  const divider = <span className={`h-px w-full shrink-0 ${c.divider}`} />;

  // Tombol menu: lingkaran ikon + tulisan di sebelah kanannya
  const railButton = ({
    id,
    label,
    ariaLabel,
    icon: Icon,
    isActive = false,
    onClick,
  }: RailButtonProps) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-current={isActive ? "page" : undefined}
      className="group flex w-full items-center gap-3 focus:outline-none"
    >
      <span className={`${circle} ${isActive ? circleActive : c.circleIdle}`}>
        <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-left text-sm font-medium transition-colors ${
          isActive ? c.labelActive : c.labelIdle
        }`}
      >
        {label}
      </span>
    </button>
  );

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
        aria-label="Navigasi anggota"
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-56 shrink-0 flex-col border-r px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${c.rail} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Atas: logo + nama */}
        <div
          className="flex items-center gap-3"
          title={`IRM Baitussalam · ${anggotaMeta.label}`}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-lime-300 text-xs font-bold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.3)]">
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
          <span
            className={`min-w-0 truncate text-sm font-semibold ${c.brand}`}
          >
            IRM Baitussalam
          </span>
        </div>

        <div className="my-4">{divider}</div>

        {/* Tengah: menu anggota, dipisah garis antar kelompok */}
        <nav
          className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(max-height:720px)]:gap-2.5"
          aria-label="Menu anggota"
        >
          {groups.map((items, index) => (
            <div
              key={index}
              className="flex flex-col gap-3.5 [@media(max-height:720px)]:gap-2.5"
            >
              {index > 0 && divider}
              {items.map(({ key, label, icon }) =>
                railButton({
                  id: key,
                  label,
                  icon,
                  isActive: activePage === key,
                  onClick: () => handleNavigate(key),
                }),
              )}
            </div>
          ))}
        </nav>

        {/* Bawah: pintasan pengumuman + tema */}
        <div className="mt-4 flex flex-col gap-3.5 [@media(max-height:720px)]:gap-2.5">
          {divider}

          {!hasAnnouncementMenu &&
            railButton({
              id: "pengumuman",
              label: "Pengumuman",
              icon: BellRing,
              onClick: () =>
                handleNavigate(
                  canRoleAccessPage(ANGGOTA_ROLE, "pengumuman")
                    ? "pengumuman"
                    : "dashboard",
                ),
            })}

          {/* Satu tombol ganti tema */}
          {railButton({
            id: "tema",
            label: isDark ? "Mode Terang" : "Mode Gelap",
            ariaLabel: isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap",
            icon: isDark ? Sun : Moon,
            onClick: (e) => {
              // Lingkaran animasi muncul dari pusat ikon tombol ini
              const target =
                e.currentTarget.querySelector("span") ?? e.currentTarget;
              const rect = target.getBoundingClientRect();
              onToggleTheme?.({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              });
            },
          })}
        </div>
      </aside>
    </>
  );
}