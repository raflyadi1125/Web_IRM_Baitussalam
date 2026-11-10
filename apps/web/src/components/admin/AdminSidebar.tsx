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
  X,
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
  /** Ganti tema terang/gelap */
  onToggleTheme?: () => void;
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

  // Semua tombol bulat memakai ukuran yang sama agar rapi
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
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-20 shrink-0 flex-col items-center border-r py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${c.rail} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Atas: logo */}
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.3)]"
          title="IRMA Baitussalam"
        >
          <Star className="h-5 w-5 fill-current" />
        </div>

        <div className="my-4 flex flex-col items-center gap-4">
          {divider}
        </div>

        {/* Tengah: menu utama */}
        <nav className="flex flex-1 flex-col items-center gap-2.5 [@media(max-height:720px)]:gap-2">
          {MENU.map(({ key, label, icon: Icon, badge }) => {
            const isActive = key === activePage;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(key)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`${base} ${isActive ? active : c.idle}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {badge !== undefined && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-300 px-1 text-[10px] font-bold leading-none text-[#10150c]">
                    {badge}
                  </span>
                )}
                {tooltip(label)}
              </button>
            );
          })}
        </nav>

        {/* Bawah: pengaturan + tema */}
        <div className="mt-4 flex flex-col items-center gap-3">
          {divider}

          <button
            type="button"
            onClick={() => handleNavigate("pengaturan")}
            aria-label="Pengaturan"
            aria-current={isSettingsActive ? "page" : undefined}
            className={`${base} ${isSettingsActive ? active : c.idle}`}
          >
            <Settings className="h-[18px] w-[18px]" />
            {tooltip("Pengaturan")}
          </button>

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
          aria-label="Tutup menu"
          className={`absolute -right-3 top-5 grid h-7 w-7 place-items-center rounded-full border lg:hidden ${c.rail} ${c.idle}`}
        >
          <X size={14} />
        </button>
      </aside>
    </>
  );
}