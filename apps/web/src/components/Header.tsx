import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Search,
  Bell,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCheck,
  Menu,
} from "lucide-react";

export interface AdminNotification {
  id: string | number;
  title: string;
  message?: string;
  time: string; // contoh: "5 menit lalu"
  read?: boolean;
  href?: string;
}

interface HeaderProps {
  /** Judul halaman (dari konfigurasi navigasi) */
  title?: string;
  subtitle?: string;
  /** Pill kecil di samping judul, contoh: "+11%" */
  badge?: string;
  /** Buka sidebar di layar kecil */
  onOpenSidebar?: () => void;
  hijriDate?: string;
  gregorianDate?: string;
  notifications?: AdminNotification[];
  user?: { name: string; role: string; avatarUrl?: string };
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: AdminNotification) => void;
  onMarkAllRead?: () => void;
  onViewAllNotifications?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const DEFAULT_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 1,
    title: "Pendaftaran anggota baru",
    message: "3 calon anggota menunggu persetujuan.",
    time: "5 menit lalu",
    read: false,
  },
  {
    id: 2,
    title: "Kas masuk",
    message: "Iuran bulanan dari Fatimah telah tercatat.",
    time: "1 jam lalu",
    read: false,
  },
  {
    id: 3,
    title: "Kegiatan besok",
    message: "Kajian rutin ba'da Maghrib di masjid.",
    time: "Kemarin",
    read: true,
  },
];

// Foto profil disimpan oleh halaman Profil di localStorage
const PHOTO_KEY = "profile_photo";

const readProfilePhoto = (): string => {
  try {
    return localStorage.getItem(PHOTO_KEY) ?? "";
  } catch {
    return "";
  }
};

export default function Header({
  title = "Dashboard",
  subtitle,
  badge,
  onOpenSidebar,
  hijriDate = "17 Jumadil Awal 1448 H",
  gregorianDate = "Jumat, 6 November 2026",
  notifications: notificationsProp = DEFAULT_NOTIFICATIONS,
  user: userProp,
  onSearch,
  onNotificationClick,
  onMarkAllRead,
  onViewAllNotifications,
  onProfile,
  onSettings,
  onLogout,
}: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<"profile" | "notif" | null>(null);
  const [notifications, setNotifications] = useState(notificationsProp);
  const [profilePhoto, setProfilePhoto] = useState<string>(readProfilePhoto);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut, session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Header dipakai semua role: nama & peran diambil dari sesi login,
  // foto diambil dari foto profil yang disimpan di halaman Profil
  const roleText = session?.role
    ? session.role.charAt(0).toUpperCase() + session.role.slice(1)
    : "";
  const user = userProp ?? {
    name: session?.name ?? "Pengguna",
    role: roleText,
    avatarUrl: profilePhoto || undefined,
  };

  // Perbarui foto saat profil disimpan (tab ini) atau diubah dari tab lain
  useEffect(() => {
    const sync = () => setProfilePhoto(readProfilePhoto());
    window.addEventListener("profile-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("profile-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Token warna sesuai tema
  const c = isDark
    ? {
        bar: "bg-[#0c0f0b]/80",
        title: "text-white",
        muted: "text-white/50",
        pill: "border-white/10 bg-white/[0.04] text-white",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/60 focus:ring-lime-300/20",
        icon: "text-white/60",
        panel: "border-white/10 bg-[#141811] text-white shadow-2xl shadow-black/50",
        divider: "border-white/10 divide-white/10",
        item: "text-white/80 hover:bg-white/[0.06]",
        unreadRow: "bg-lime-300/[0.06]",
        rowHover: "hover:bg-white/[0.04]",
        strong: "text-white",
        soft: "text-white/50",
        faint: "text-white/35",
        accent: "text-lime-300",
        accentHover: "text-lime-300 hover:bg-lime-300/10",
        ring: "focus-visible:ring-lime-300/40",
        btnHover: "hover:bg-white/[0.06]",
        danger: "text-red-400 hover:bg-red-500/10",
      }
    : {
        bar: "bg-white/80",
        title: "text-slate-900",
        muted: "text-slate-500",
        pill: "border-slate-200 bg-white text-slate-800",
        input:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20",
        icon: "text-slate-500",
        panel: "border-slate-200 bg-white text-slate-800 shadow-xl",
        divider: "border-slate-100 divide-slate-100",
        item: "text-slate-700 hover:bg-slate-100",
        unreadRow: "bg-lime-50",
        rowHover: "hover:bg-slate-50",
        strong: "text-slate-900",
        soft: "text-slate-500",
        faint: "text-slate-400",
        accent: "text-lime-700",
        accentHover: "text-lime-700 hover:bg-lime-50",
        ring: "focus-visible:ring-lime-500/40",
        btnHover: "hover:bg-slate-100",
        danger: "text-red-600 hover:bg-red-50",
      };

  // Keluar: hapus sesi lewat AuthContext, lalu arahkan ke halaman login
  const handleLogout = () => {
    setOpenMenu(null);
    signOut();
    onLogout?.();
    navigate("/login", { replace: true });
  };

  // Profil Saya: buka /admin/profil, /anggota/profil, dst. sesuai role
  const handleProfile = () => {
    setOpenMenu(null);
    if (onProfile) onProfile();
    else navigate(`/${session?.role ?? "anggota"}/profil`);
  };

  // Pengaturan: buka /admin/pengaturan, /anggota/pengaturan, dst. sesuai role
  const handleSettings = () => {
    setOpenMenu(null);
    if (onSettings) onSettings();
    else navigate(`/${session?.role ?? "anggota"}/pengaturan`);
  };

  // Sinkronkan jika data notifikasi dari luar berubah
  useEffect(() => {
    setNotifications(notificationsProp);
  }, [notificationsProp]);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!openMenu) return;
    const activeRef = openMenu === "profile" ? profileRef : notifRef;
    const onClick = (e: MouseEvent) => {
      if (activeRef.current && !activeRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const toggle = (menu: "profile" | "notif") =>
    setOpenMenu((cur) => (cur === menu ? null : menu));

  const run = (fn?: () => void) => () => {
    setOpenMenu(null);
    fn?.();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (item: AdminNotification) => {
    setNotifications((list) =>
      list.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setOpenMenu(null);
    onNotificationClick?.(item);
  };

  const handleMarkAllRead = () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roundBtn = `relative grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 ${c.pill} ${c.icon} ${c.btnHover} ${c.ring}`;
  const menuItem = `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${c.item}`;

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between gap-4 px-5 py-5 backdrop-blur lg:px-8 ${c.bar}`}
    >
      {/* Judul halaman */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka menu"
          className={`${roundBtn} lg:hidden`}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-3">
            <h1
              className={`truncate text-2xl font-medium tracking-tight sm:text-3xl ${c.title}`}
            >
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-lime-300 px-2.5 py-0.5 text-[11px] font-semibold text-[#10150c]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`mt-1 hidden truncate text-sm sm:block ${c.muted}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 lg:gap-4">
        {/* Pencarian */}
        <div className="relative hidden w-64 md:block lg:w-80 xl:w-96">
          <Search
            className={`pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
          />
          <input
            type="search"
            placeholder="Cari kegiatan, anggota, atau kas..."
            onChange={(e) => onSearch?.(e.target.value)}
            className={`h-12 w-full rounded-full border pl-12 pr-5 text-sm focus:outline-none focus:ring-2 ${c.input}`}
          />
        </div>

        {/* Tanggal */}
        <div
          className={`hidden items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5 2xl:flex ${c.pill}`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-lime-300/15">
            <Moon className="h-[18px] w-[18px] fill-lime-300 text-lime-300" />
          </span>
          <div className="leading-tight">
            <p className={`whitespace-nowrap text-sm font-semibold ${c.accent}`}>
              {hijriDate}
            </p>
            <p className={`whitespace-nowrap text-xs ${c.muted}`}>
              {gregorianDate}
            </p>
          </div>
        </div>

        {/* Notifikasi + dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => toggle("notif")}
            aria-label={
              unreadCount > 0
                ? `Notifikasi, ${unreadCount} belum dibaca`
                : "Notifikasi"
            }
            aria-haspopup="menu"
            aria-expanded={openMenu === "notif"}
            className={roundBtn}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ${
                  isDark ? "ring-[#141811]" : "ring-white"
                }`}
              />
            )}
          </button>

          {openMenu === "notif" && (
            <div
              role="menu"
              className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border ${c.panel}`}
            >
              <div
                className={`flex items-center justify-between border-b px-4 py-3 ${c.divider}`}
              >
                <div>
                  <p className={`text-sm font-semibold ${c.strong}`}>
                    Notifikasi
                  </p>
                  <p className={`text-xs ${c.soft}`}>
                    {unreadCount > 0
                      ? `${unreadCount} belum dibaca`
                      : "Semua sudah dibaca"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${c.accentHover}`}
                  >
                    <CheckCheck className="h-4 w-4" /> Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Bell className={`h-8 w-8 ${c.faint}`} />
                    <p className={`text-sm ${c.soft}`}>Belum ada notifikasi</p>
                  </div>
                ) : (
                  <ul className={`divide-y ${c.divider}`}>
                    {notifications.map((item) => (
                      <li key={item.id}>
                        <button
                          role="menuitem"
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${c.rowHover} ${
                            item.read ? "" : c.unreadRow
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              item.read ? "bg-transparent" : "bg-lime-300"
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-sm ${
                                item.read
                                  ? `font-medium ${c.soft}`
                                  : `font-semibold ${c.strong}`
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.message && (
                              <span
                                className={`mt-0.5 line-clamp-2 block text-xs ${c.soft}`}
                              >
                                {item.message}
                              </span>
                            )}
                            <span
                              className={`mt-1 block text-[11px] ${c.faint}`}
                            >
                              {item.time}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`border-t p-1.5 ${c.divider}`}>
                <button
                  type="button"
                  onClick={run(onViewAllNotifications)}
                  className={`w-full rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${c.accentHover}`}
                >
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil + dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => toggle("profile")}
            aria-haspopup="menu"
            aria-expanded={openMenu === "profile"}
            aria-label="Menu profil"
            className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition-colors focus:outline-none focus-visible:ring-2 ${c.pill} ${c.btnHover} ${c.ring}`}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime-300 text-sm font-bold text-[#10150c]">
                {initials}
              </div>
            )}
            <div className="hidden min-w-0 max-w-[150px] text-left leading-tight xl:block">
              <p className={`truncate text-sm font-semibold ${c.strong}`}>
                {user.name}
              </p>
              <p className={`truncate text-xs ${c.accent}`}>{user.role}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${c.muted} ${
                openMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "profile" && (
            <div
              role="menu"
              className={`absolute right-0 top-[calc(100%+10px)] z-50 w-60 rounded-2xl border p-1.5 ${c.panel}`}
            >
              <div
                className={`flex items-center gap-3 border-b px-3 pb-2.5 pt-2 ${c.divider}`}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-300 text-xs font-bold text-[#10150c]">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${c.strong}`}>
                    {user.name}
                  </p>
                  <p className={`truncate text-xs ${c.accent}`}>{user.role}</p>
                </div>
              </div>

              <div className="py-1.5">
                <button role="menuitem" type="button" onClick={handleProfile} className={menuItem}>
                  <User className={`h-4 w-4 ${c.faint}`} /> Profil Saya
                </button>
                <button role="menuitem" type="button" onClick={handleSettings} className={menuItem}>
                  <Settings className={`h-4 w-4 ${c.faint}`} /> Pengaturan
                </button>
              </div>

              <div className={`border-t pt-1.5 ${c.divider}`}>
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  className={`${menuItem} ${c.danger}`}
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}