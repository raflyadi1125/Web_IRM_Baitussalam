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

/* ---------- Data contoh (ganti dengan data dari API) ---------- */

interface StatCard {
  label: string;
  value: string;
  sub: string;
  badge: string;
  icon: LucideIcon;
  tone: "emerald" | "amber" | "sky" | "violet";
  badgeTone: string;
}

const STATS: StatCard[] = [
  {
    label: "Total Anggota Aktif",
    value: "128",
    sub: "72 Remaja Putra, 56 Putri",
    badge: "▲ +12% bln ini",
    icon: Users,
    tone: "emerald",
    badgeTone: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Saldo Kas IRMA",
    value: "Rp 14.250k",
    sub: "Pemasukan bln ini: Rp 3.200.000",
    badge: "Segar & Aman",
    icon: Wallet,
    tone: "amber",
    badgeTone: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Kegiatan Bulan Ini",
    value: "6 Program",
    sub: "4 Agenda mendatang",
    badge: "2 Selesai",
    icon: CalendarDays,
    tone: "sky",
    badgeTone: "bg-sky-50 text-sky-700",
  },
  {
    label: "Inventaris Pemuda",
    value: "42 Item",
    sub: "Sound system, alat hadroh, dll",
    badge: "98% Baik",
    icon: Box,
    tone: "violet",
    badgeTone: "bg-slate-100 text-slate-600",
  },
];

const TONE: Record<StatCard["tone"], string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-500",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
};

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
  const filtered = AGENDA.filter(
    (a) => filter === "Semua" || a.category === filter
  );

  return (
    <div className="space-y-8 bg-slate-50 px-11 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 px-11 py-10 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[32px] border-white/5" />

        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
          <Sparkles className="h-4 w-4" />
          Assalamu'alaikum, Akhi & Ukhti
        </span>

        <h2 className="mt-4 text-4xl font-bold tracking-tight">
          Selamat Datang di Portal Pemuda Masjid Baitussalam
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-emerald-50/90">
          "Barangsiapa memakmurkan masjid-masjid Allah, sesungguhnya mereka
          termasuk orang-orang yang mendapat petunjuk." Mari terus tingkatkan
          semangat ukhuwah dan ketaqwaan.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddActivity}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-emerald-950 transition-colors hover:bg-amber-400"
          >
            <Plus className="h-5 w-5" />
            Tambah Kegiatan Baru
          </button>
          <button
            type="button"
            onClick={onAddCash}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-800/60 px-5 py-3 font-semibold text-emerald-50 transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Catat Kas Masuk
          </button>
        </div>
      </section>

      {/* Kartu statistik */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ label, value, sub, badge, badgeTone, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-[15px] text-slate-600">{label}</p>
              <div className={`rounded-xl p-3 ${TONE[tone]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-bold leading-tight text-slate-900">
                {value}
              </p>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${badgeTone}`}
              >
                {badge}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{sub}</p>
          </div>
        ))}
      </section>

      {/* Jadwal & Pengumuman */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Jadwal Kegiatan Terdekat
              </h3>
              <p className="text-slate-500">
                Agenda agenda dakwah & sosial IRMA Baitussalam
              </p>
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1">
              {(["Semua", "Kajian", "Sosial & Seni"] as Category[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    filter === c
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-6 divide-y divide-slate-100">
            {filtered.map((a) => (
              <li key={a.title} className="flex items-center gap-5 py-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <span className="text-lg font-bold leading-none">
                    {a.date.split(" ")[0]}
                  </span>
                  <span className="text-xs">{a.date.split(" ")[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{a.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {a.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {a.place}
                    </span>
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {a.category}
                </span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-8 text-center text-slate-400">
                Belum ada agenda di kategori ini.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-500">
              <Megaphone className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pengumuman & Info</h3>
          </div>

          <div className="mt-5 space-y-3">
            {ANNOUNCEMENTS.map((n) => (
              <div
                key={n.title}
                className="rounded-xl border border-amber-100 bg-amber-50/60 p-4"
              >
                <p className="font-semibold text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}