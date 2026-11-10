import { useMemo } from "react";
import {
  CalendarDays,
  CalendarCheck,
  Megaphone,
  Wallet,
  MapPin,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file dashboard Anda
import { useTheme } from "../../contexts/ThemeContext";

interface Kegiatan {
  id: number;
  judul: string;
  tanggal: string; // ISO date
  lokasi: string;
}

interface Pengumuman {
  id: number;
  judul: string;
  tanggal: string;
  ringkasan: string;
}

// TODO: ganti dengan data dari API
const kegiatanMendatang: Kegiatan[] = [
  { id: 1, judul: "Rapat Bulanan Anggota", tanggal: "2026-11-12", lokasi: "Aula Utama" },
  { id: 2, judul: "Bakti Sosial", tanggal: "2026-11-20", lokasi: "Desa Cibiru" },
  { id: 3, judul: "Pelatihan Kepemimpinan", tanggal: "2026-12-03", lokasi: "Ruang Seminar" },
];

const pengumumanTerbaru: Pengumuman[] = [
  {
    id: 1,
    judul: "Jadwal Rapat Bulan November",
    tanggal: "2026-11-05",
    ringkasan: "Rapat bulanan akan dilaksanakan pada 12 November. Harap hadir tepat waktu.",
  },
  {
    id: 2,
    judul: "Pembayaran Iuran Anggota",
    tanggal: "2026-11-02",
    ringkasan: "Iuran bulan ini dapat dibayarkan kepada bendahara paling lambat tanggal 15.",
  },
];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Hanya untuk tampilan kotak tanggal (tidak mengubah data)
const bagianTanggal = (iso: string) => {
  const d = new Date(iso);
  return {
    hari: d.toLocaleDateString("id-ID", { day: "numeric" }),
    bulan: d.toLocaleDateString("id-ID", { month: "short" }),
  };
};

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stats = useMemo(
    () => [
      { label: "Kegiatan Diikuti", value: 8, icon: CalendarCheck as LucideIcon },
      { label: "Kegiatan Mendatang", value: kegiatanMendatang.length, icon: CalendarDays as LucideIcon },
      { label: "Pengumuman Baru", value: pengumumanTerbaru.length, icon: Megaphone as LucideIcon },
      { label: "Status Iuran", value: "Lunas", icon: Wallet as LucideIcon },
    ],
    []
  );

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
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

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Dashboard Anggota
        </h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Selamat datang kembali! Berikut ringkasan aktivitas Anda.
        </p>
      </section>

      {/* Statistik */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
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
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Kegiatan mendatang */}
        <div className={card}>
          <h2 className={`text-lg font-semibold ${c.title}`}>Kegiatan Mendatang</h2>

          <ul className={`mt-5 divide-y ${c.divider}`}>
            {kegiatanMendatang.map((k) => {
              const t = bagianTanggal(k.tanggal);
              return (
                <li key={k.id} className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${c.dateTile}`}
                  >
                    <span className="text-lg font-semibold leading-none">{t.hari}</span>
                    <span className="mt-0.5 text-[11px]">{t.bulan}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${c.title}`}>{k.judul}</p>
                    <p
                      className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${c.muted}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" /> {formatTanggal(k.tanggal)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {k.lokasi}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pengumuman terbaru */}
        <div className={card}>
          <div className="flex items-center gap-3">
            <span
              className={`grid h-10 w-10 place-items-center rounded-full ${c.noteIcon}`}
            >
              <Megaphone className="h-5 w-5" />
            </span>
            <h2 className={`text-lg font-semibold ${c.title}`}>Pengumuman Terbaru</h2>
          </div>

          <div className="mt-5 space-y-3">
            {pengumumanTerbaru.map((p) => (
              <div key={p.id} className={`rounded-2xl border p-4 ${c.note}`}>
                <p className={`font-medium ${c.title}`}>{p.judul}</p>
                <p className={`mt-0.5 text-xs ${c.muted}`}>{formatTanggal(p.tanggal)}</p>
                <p className={`mt-2 text-sm ${c.text}`}>{p.ringkasan}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}