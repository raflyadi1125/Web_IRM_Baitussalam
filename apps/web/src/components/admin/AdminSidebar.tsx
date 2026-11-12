import type { MouseEvent } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  LayoutGrid,
  Megaphone,
  Moon,
  Settings,
  Star,
  Sun,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export type MenuKey =
  | "dashboard"
  | "anggota"
  | "pengurus"
  | "kegiatan"
  | "keuangan"
  | "laporan"
  | "pengumuman"
  | "pengaturan";

interface MenuItem {
  key: MenuKey;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const MENU: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "anggota", label: "Data Anggota", icon: Users },
  { key: "pengurus", label: "Data Pengurus", icon: UserCog },
  { key: "kegiatan", label: "Kegiatan", icon: CalendarDays },
  { key: "keuangan", label: "Keuangan", icon: CircleDollarSign },
  { key: "laporan", label: "Laporan", icon: ClipboardList },
  { key: "pengumuman", label: "Pengumuman", icon: Megaphone },
];

interface AdminSidebarProps {
  /** Menu yang sedang aktif (dari useRoleNavigation) */
  activePage?: string;
  /** Status buka/tutup sidebar di layar kecil */
  isOpen?: boolean;
  onNavigate?: (key: MenuKey) => void;
  onClose?: () => void;
  /** Ganti tema terang/gelap (origin = titik awal lingkaran animasi) */
  onToggleTheme?: (origin?: { x: number; y: number }) => void;
}

interface RailButtonProps {
  label: string;
  ariaLabel?: string;
  icon: LucideIcon;
  isActive?: boolean;
  badge?: number;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function AdminSidebar({
  activePage = "dashboard",
  isOpen = false,
  onNavigate,
  onClose,
  onToggleTheme,
}: AdminSidebarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleNavigate = (key: MenuKey) => {
    onNavigate?.(key);
    onClose?.(); // tutup drawer setelah pilih menu (layar kecil)
  };

  const isSettingsActive = activePage === "pengaturan";

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
    label,
    ariaLabel,
    icon: Icon,
    isActive = false,
    badge,
    onClick,
  }: RailButtonProps) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-current={isActive ? "page" : undefined}
      className="group flex w-full items-center gap-3 focus:outline-none"
    >
      <span className={`${circle} ${isActive ? circleActive : c.circleIdle}`}>
        <Icon className="h-[18px] w-[18px]" />
        {badge !== undefined && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-300 px-1 text-[10px] font-bold leading-none text-[#10150c]">
            {badge}
          </span>
        )}
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
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-56 shrink-0 flex-col border-r px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${c.rail} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Atas: logo + nama */}
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.3)]">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <span
            className={`min-w-0 truncate text-sm font-semibold ${c.brand}`}
          >
            IRMA Baitussalam
          </span>
        </div>

        <div className="my-4">{divider}</div>

        {/* Tengah: menu utama (bisa di-scroll jika layar pendek) */}
        <nav className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(max-height:720px)]:gap-2.5">
          {MENU.map(({ key, label, icon, badge }) =>
            railButton({
              label,
              icon,
              badge,
              isActive: key === activePage,
              onClick: () => handleNavigate(key),
            })
          )}
        </nav>

        {/* Bawah: pengaturan + tema */}
        <div className="mt-4 flex flex-col gap-3.5 [@media(max-height:720px)]:gap-2.5">
          {divider}

          {railButton({
            label: "Pengaturan",
            icon: Settings,
            isActive: isSettingsActive,
            onClick: () => handleNavigate("pengaturan"),
          })}

          {/* Satu tombol ganti tema */}
          {railButton({
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