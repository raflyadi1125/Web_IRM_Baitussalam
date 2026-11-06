import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  LayoutGrid,
  Megaphone,
  Settings,
  Star,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export type MenuKey =
  | "dashboard"
  | "anggota"
  | "pengurus"
  | "kegiatan"
  | "keuangan"
  | "laporan"
  | "pengumuman";

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
}

const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const capitalize = (text: string): string =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

export default function AdminSidebar({
  activePage = "dashboard",
  isOpen = false,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  const { session } = useAuth();
  const userName = session?.name ?? "Pengguna";
  const userRole = capitalize(session?.role ?? "");

  const handleNavigate = (key: MenuKey) => {
    onNavigate?.(key);
    onClose?.(); // tutup drawer setelah pilih menu (layar kecil)
  };

  return (
    <>
      {/* Overlay (layar kecil) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col bg-emerald-900 text-emerald-50 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-emerald-800/70 px-6 py-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-emerald-900 shadow-md">
            <Star className="h-6 w-6 fill-current" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-lg font-bold text-amber-400">
              IRMA Baitussalam
            </p>
            <p className="mt-0.5 text-sm text-emerald-200/80" dir="rtl">
              إدارة شباب المسجد
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-8 w-8 place-items-center rounded-lg text-emerald-200 hover:bg-emerald-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu utama */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {MENU.map(({ key, label, icon: Icon, badge }) => {
            const isActive = key === activePage;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(key)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3.5 rounded-xl border-l-4 px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                  isActive
                    ? "border-amber-400 bg-emerald-800 text-amber-300"
                    : "border-transparent text-emerald-100 hover:bg-emerald-800/60"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-amber-300" : "text-emerald-300"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {badge !== undefined && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs font-semibold text-amber-300">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bagian bawah */}
        <div className="space-y-3 px-4 pb-5">
          <button
            type="button"
            className="flex w-full items-center gap-3.5 rounded-xl border-l-4 border-transparent px-4 py-3 text-[15px] font-medium text-emerald-100 transition-colors hover:bg-emerald-800/60"
          >
            <Settings className="h-5 w-5 shrink-0 text-emerald-300" />
            Pengaturan
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-800 bg-emerald-950/40 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-emerald-900">
              {getInitials(userName)}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold text-white">{userName}</p>
              <p className="truncate text-xs text-amber-300">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}