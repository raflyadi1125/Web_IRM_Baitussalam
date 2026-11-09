import { Search, Bell, Moon } from "lucide-react";

interface AdminHeaderProps {
  hijriDate?: string;
  gregorianDate?: string;
  hasNotification?: boolean;
  user?: { name: string; role: string; avatarUrl?: string };
  onSearch?: (query: string) => void;
}

export default function AdminHeader({
  hijriDate = "17 Jumadil Awal 1448 H",
  gregorianDate = "Jumat, 6 November 2026",
  hasNotification = true,
  user = { name: "Ahmad Rizky", role: "Pembina / Admin" },
  onSearch,
}: AdminHeaderProps) {
  return (
    <header className="flex h-[88px] items-center justify-between gap-6 border-b border-slate-200 bg-white px-11">
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

      <div className="flex items-center gap-6">
        {/* Tanggal */}
        <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
          <Moon className="h-5 w-5 fill-amber-400 text-amber-400" />
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-emerald-800">{hijriDate}</p>
            <p className="text-sm text-slate-500">{gregorianDate}</p>
          </div>
        </div>

        {/* Notifikasi */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <Bell className="h-6 w-6" />
          {hasNotification && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
          )}
        </button>

        {/* Profil */}
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-12 w-12 rounded-full border-2 border-emerald-100 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-100 bg-emerald-700 font-bold text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
          <div className="text-right leading-tight">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs font-medium text-emerald-600">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}