import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  Bell,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCheck,
} from "lucide-react";

export interface AdminNotification {
  id: string | number;
  title: string;
  message?: string;
  time: string; // contoh: "5 menit lalu"
  read?: boolean;
  href?: string;
}

interface AdminHeaderProps {
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

export default function AdminHeader({
  hijriDate = "17 Jumadil Awal 1448 H",
  gregorianDate = "Jumat, 6 November 2026",
  notifications: notificationsProp = DEFAULT_NOTIFICATIONS,
  user = { name: "Ahmad Rizky", role: "Pembina / Admin" },
  onSearch,
  onNotificationClick,
  onMarkAllRead,
  onViewAllNotifications,
  onProfile,
  onSettings,
  onLogout,
}: AdminHeaderProps) {
  const [openMenu, setOpenMenu] = useState<"profile" | "notif" | null>(null);
  const [notifications, setNotifications] = useState(notificationsProp);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Keluar: hapus sesi lewat AuthContext, lalu arahkan ke halaman login
  const handleLogout = () => {
    setOpenMenu(null);
    signOut();
    onLogout?.();
    navigate("/login", { replace: true });
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
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const menuItem =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100";

  return (
    <header className="flex h-[88px] items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 lg:px-11">
      {/* Pencarian */}
      <div className="relative w-full max-w-[432px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Cari kegiatan, anggota, atau kas..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-base text-slate-700 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      <div className="flex shrink-0 items-center gap-4 lg:gap-5">
        {/* Tanggal */}
        <div className="hidden items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3.5 py-2 md:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-amber-100">
            <Moon className="h-[18px] w-[18px] fill-amber-400 text-amber-400" />
          </span>
          <div className="leading-tight">
            <p className="whitespace-nowrap text-sm font-semibold text-emerald-800">
              {hijriDate}
            </p>
            <p className="whitespace-nowrap text-xs text-slate-500">
              {gregorianDate}
            </p>
          </div>
        </div>

        {/* Profil + dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => toggle("profile")}
            aria-haspopup="menu"
            aria-expanded={openMenu === "profile"}
            className="flex items-center gap-3 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-11 w-11 shrink-0 rounded-full border-2 border-emerald-100 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-100 bg-emerald-700 text-sm font-bold text-white">
                {initials}
              </div>
            )}
            <div className="hidden min-w-0 max-w-[160px] text-left leading-tight sm:block">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user.name}
              </p>
              <p className="truncate text-xs font-medium text-emerald-600">
                {user.role}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                openMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "profile" && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              <div className="border-b border-slate-100 px-3 pb-2.5 pt-2">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user.name}
                </p>
                <p className="truncate text-xs text-emerald-600">{user.role}</p>
              </div>

              <div className="py-1.5">
                <button role="menuitem" type="button" onClick={run(onProfile)} className={menuItem}>
                  <User className="h-4 w-4 text-slate-400" /> Profil Saya
                </button>
                <button role="menuitem" type="button" onClick={run(onSettings)} className={menuItem}>
                  <Settings className="h-4 w-4 text-slate-400" /> Pengaturan
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1.5">
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  className={`${menuItem} text-red-600 hover:bg-red-50`}
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            </div>
          )}
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
            className={`relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 ${
              openMenu === "notif" ? "bg-slate-100" : ""
            }`}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {openMenu === "notif" && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              {/* Header dropdown */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Notifikasi
                  </p>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} belum dibaca`
                      : "Semua sudah dibaca"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    <CheckCheck className="h-4 w-4" /> Tandai semua dibaca
                  </button>
                )}
              </div>

              {/* Daftar */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Bell className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">
                      Belum ada notifikasi
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {notifications.map((item) => (
                      <li key={item.id}>
                        <button
                          role="menuitem"
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                            item.read ? "" : "bg-emerald-50/50"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              item.read ? "bg-transparent" : "bg-amber-500"
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-sm ${
                                item.read
                                  ? "font-medium text-slate-700"
                                  : "font-semibold text-slate-900"
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.message && (
                              <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
                                {item.message}
                              </span>
                            )}
                            <span className="mt-1 block text-[11px] text-slate-400">
                              {item.time}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={run(onViewAllNotifications)}
                  className="w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}