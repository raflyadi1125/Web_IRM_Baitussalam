import { useState } from "react";
import {
  Plus,
  Sparkles,
  Users,
  Wallet,
  CalendarDays,
  Box,
  Megaphone,
  Clock,
  MapPin,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file dashboard Anda
import { useTheme } from "../../contexts/ThemeContext";

/* ---------- Data contoh (ganti dengan data dari API) ---------- */

interface StatCard {
  label: string;
  value: string;
  sub: string;
  badge: string;
  icon: LucideIcon;
}

const STATS: StatCard[] = [
  {
    label: "Total Anggota Aktif",
    value: "128",
    sub: "72 Remaja Putra, 56 Putri",
    badge: "▲ +12% bln ini",
    icon: Users,
  },
  {
    label: "Saldo Kas IRMA",
    value: "Rp 14.250k",
    sub: "Pemasukan bln ini: Rp 3.200.000",
    badge: "Segar & Aman",
    icon: Wallet,
  },
  {
    label: "Kegiatan Bulan Ini",
    value: "6 Program",
    sub: "4 Agenda mendatang",
    badge: "2 Selesai",
    icon: CalendarDays,
  },
  {
    label: "Inventaris Pemuda",
    value: "42 Item",
    sub: "Sound system, alat hadroh, dll",
    badge: "98% Baik",
    icon: Box,
  },
];

type Category = "Semua" | "Kajian" | "Sosial & Seni";

interface Agenda {
  title: string;
  date: string;
  time: string;
  place: string;
  category: Exclude<Category, "Semua">;
}

const AGENDA: Agenda[] = [
  { title: "Kajian Rutin Malam Sabtu", date: "7 Nov", time: "19.30 WIB", place: "Aula Masjid", category: "Kajian" },
  { title: "Latihan Hadroh Remaja", date: "9 Nov", time: "16.00 WIB", place: "Teras Masjid", category: "Sosial & Seni" },
  { title: "Bakti Sosial Warga", date: "14 Nov", time: "08.00 WIB", place: "Balai RW", category: "Sosial & Seni" },
  { title: "Tahsin Al-Qur'an", date: "16 Nov", time: "18.45 WIB", place: "Ruang Utama", category: "Kajian" },
];

const ANNOUNCEMENTS = [
  { title: "Rapat Persiapan Maulid", body: "Seluruh pengurus diharapkan hadir Ahad ini ba'da Ashar." },
  { title: "Pengumpulan Infaq Pembangunan", body: "Kas khusus dibuka sampai akhir bulan." },
];

const FILTERS: Category[] = ["Semua", "Kajian", "Sosial & Seni"];

/* ---------- Komponen ---------- */

interface AdminDashboardProps {
  onAddActivity?: () => void;
  onAddCash?: () => void;
}

export default function AdminDashboard({
  onAddActivity,
  onAddCash,
}: AdminDashboardProps) {
  const [filter, setFilter] = useState<Category>("Semua");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filtered = AGENDA.filter(
    (a) => filter === "Semua" || a.category === filter,
  );

  // Token warna sesuai tema (tidak bergantung pada CSS tema lama)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        badge: "bg-lime-300/15 text-lime-300",
        segment: "border-white/10 bg-white/[0.04]",
        segActive: "bg-lime-300 text-[#10150c]",
        segIdle: "text-white/60 hover:text-white",
        dateTile: "border-lime-300/20 bg-lime-300/10 text-lime-300",
        tag: "bg-white/[0.06] text-white/70",
        note: "border-white/10 bg-white/[0.03]",
        noteIcon: "bg-lime-300/15 text-lime-300",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "divide-slate-100",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        badge: "bg-lime-100 text-lime-800",
        segment: "border-slate-200 bg-slate-50",
        segActive: "bg-lime-400 text-[#10150c]",
        segIdle: "text-slate-500 hover:text-slate-800",
        dateTile: "border-lime-200 bg-lime-50 text-lime-700",
        tag: "bg-slate-100 text-slate-600",
        note: "border-slate-200 bg-slate-50",
        noteIcon: "bg-lime-100 text-lime-700",
      };

  const card = `rounded-3xl border p-6 ${c.card}`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <span className="relative inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1.5 text-sm font-medium text-lime-300">
          <Sparkles className="h-4 w-4" />
          Assalamu'alaikum, Akhi & Ukhti
        </span>

        <h2 className="relative mt-4 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Selamat Datang di Portal Pemuda Masjid Baitussalam
        </h2>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          "Barangsiapa memakmurkan masjid-masjid Allah, sesungguhnya mereka
          termasuk orang-orang yang mendapat petunjuk." Mari terus tingkatkan
          semangat ukhuwah dan ketaqwaan.
        </p>

        <div className="relative mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddActivity}
            className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] transition-colors hover:bg-lime-200"
          >
            <Plus className="h-4 w-4" />
            Tambah Kegiatan Baru
          </button>
          <button
            type="button"
            onClick={onAddCash}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-lime-300/40 hover:text-lime-300"
          >
            <Plus className="h-4 w-4" />
            Catat Kas Masuk
          </button>
        </div>
      </section>

      {/* Kartu statistik */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ label, value, sub, badge, icon: Icon }) => (
          <div key={label} className={`${card} min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <p className={`text-sm font-medium ${c.text}`}>{label}</p>
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>

            <p
              className={`mt-4 whitespace-nowrap text-3xl font-semibold tracking-tight ${c.title}`}
            >
              {value}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${c.badge}`}
              >
                {badge}
              </span>
              <p className={`min-w-0 text-xs ${c.muted}`}>{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Jadwal & Pengumuman */}
      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-semibold ${c.title}`}>
                Jadwal Kegiatan Terdekat
              </h3>
              <p className={`mt-0.5 text-sm ${c.muted}`}>
                Agenda dakwah & sosial IRMA Baitussalam
              </p>
            </div>
            <div className={`flex rounded-full border p-1 ${c.segment}`}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === f ? c.segActive : c.segIdle
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ul className={`mt-5 divide-y ${c.divider}`}>
            {filtered.map((a) => (
              <li key={a.title} className="flex items-center gap-4 py-4">
                <div
                  className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${c.dateTile}`}
                >
                  <span className="text-lg font-semibold leading-none">
                    {a.date.split(" ")[0]}
                  </span>
                  <span className="mt-0.5 text-[11px]">
                    {a.date.split(" ")[1]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${c.title}`}>{a.title}</p>
                  <p
                    className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${c.muted}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {a.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {a.place}
                    </span>
                  </p>
                </div>
                <span
                  className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-medium sm:inline-block ${c.tag}`}
                >
                  {a.category}
                </span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className={`py-8 text-center text-sm ${c.muted}`}>
                Belum ada agenda di kategori ini.
              </li>
            )}
          </ul>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3">
            <span
              className={`grid h-10 w-10 place-items-center rounded-full ${c.noteIcon}`}
            >
              <Megaphone className="h-5 w-5" />
            </span>
            <h3 className={`text-lg font-semibold ${c.title}`}>
              Pengumuman & Info
            </h3>
          </div>

          <div className="mt-5 space-y-3">
            {ANNOUNCEMENTS.map((n) => (
              <div
                key={n.title}
                className={`rounded-2xl border p-4 ${c.note}`}
              >
                <p className={`font-medium ${c.title}`}>{n.title}</p>
                <p className={`mt-1 text-sm ${c.text}`}>{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}