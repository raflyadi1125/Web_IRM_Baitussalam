import { useMemo, type ReactNode } from "react";
import {
  CalendarClock,
  CalendarDays,
  FileText,
  MapPin,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";

type StatusKegiatan = "Akan Datang" | "Berlangsung" | "Selesai";

interface Kegiatan {
  id: number;
  judul: string;
  tanggal: string; // ISO date
  lokasi: string;
  status: StatusKegiatan;
}

interface Pengumuman {
  id: number;
  judul: string;
  tanggal: string;
  kategori: string;
}

interface Laporan {
  id: number;
  judul: string;
  tanggal: string;
  status: "Draft" | "Final";
}

// TODO: ganti dengan data dari API
const kegiatan: Kegiatan[] = [
  { id: 1, judul: "Rapat Bulanan Anggota", tanggal: "2026-11-12", lokasi: "Aula Utama", status: "Akan Datang" },
  { id: 2, judul: "Bakti Sosial", tanggal: "2026-11-20", lokasi: "Desa Cibiru", status: "Akan Datang" },
  { id: 3, judul: "Pelatihan Kepemimpinan", tanggal: "2026-11-06", lokasi: "Ruang Seminar", status: "Berlangsung" },
  { id: 4, judul: "Gotong Royong", tanggal: "2026-10-25", lokasi: "Sekretariat", status: "Selesai" },
];

const pengumuman: Pengumuman[] = [
  { id: 1, judul: "Jadwal Rapat Bulan November", tanggal: "2026-11-05", kategori: "Kegiatan" },
  { id: 2, judul: "Pembaruan Tata Tertib Organisasi", tanggal: "2026-10-28", kategori: "Umum" },
  { id: 3, judul: "Pembayaran Iuran Anggota", tanggal: "2026-11-02", kategori: "Keuangan" },
];

const laporan: Laporan[] = [
  { id: 1, judul: "Laporan Gotong Royong", tanggal: "2026-10-26", status: "Final" },
  { id: 2, judul: "Laporan Pelatihan Kepemimpinan", tanggal: "2026-11-06", status: "Draft" },
];

// "T00:00:00" supaya tanggal dibaca sebagai waktu lokal (bukan UTC)
const formatTanggal = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ---------- Token warna sesuai tema (sama dengan dashboard admin) ---------- */

function useTokens() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        countPill: "bg-white/[0.08] text-white/70",
        kegiatan: {
          "Akan Datang": "bg-lime-300/15 text-lime-300",
          Berlangsung: "bg-amber-300/15 text-amber-300",
          Selesai: "bg-white/[0.08] text-white/50",
        } as Record<StatusKegiatan, string>,
        laporan: {
          Final: "bg-lime-300/15 text-lime-300",
          Draft: "bg-amber-300/15 text-amber-300",
        } as Record<Laporan["status"], string>,
        barBerlangsung: "bg-amber-300",
        barMendatang: "bg-lime-300",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "divide-slate-100",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        countPill: "bg-slate-100 text-slate-600",
        kegiatan: {
          "Akan Datang": "bg-lime-100 text-lime-800",
          Berlangsung: "bg-amber-100 text-amber-800",
          Selesai: "bg-slate-100 text-slate-500",
        } as Record<StatusKegiatan, string>,
        laporan: {
          Final: "bg-lime-100 text-lime-800",
          Draft: "bg-amber-100 text-amber-800",
        } as Record<Laporan["status"], string>,
        barBerlangsung: "bg-amber-500",
        barMendatang: "bg-lime-500",
      };
}

/* ---------- Komponen kecil ---------- */

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  const c = useTokens();
  return (
    <div className={`min-w-0 rounded-3xl border p-6 ${c.card}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${c.text}`}>{label}</p>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className={`mt-4 text-3xl font-semibold tracking-tight ${c.title}`}>{value}</p>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  const c = useTokens();
  return (
    <section className={`flex min-w-0 flex-col rounded-3xl border p-6 ${c.card}`}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className={`text-lg font-semibold ${c.title}`}>{title}</h2>
        {count !== undefined && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.countPill}`}>{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  const c = useTokens();
  return <p className={`py-6 text-center text-sm ${c.muted}`}>{text}</p>;
}

/* ---------- Halaman ---------- */

export default function Dashboard() {
  const c = useTokens();

  const stats = useMemo(
    () => [
      { label: "Total Kegiatan", value: kegiatan.length, icon: CalendarDays },
      {
        label: "Kegiatan Mendatang",
        value: kegiatan.filter((k) => k.status === "Akan Datang").length,
        icon: CalendarClock,
      },
      { label: "Pengumuman", value: pengumuman.length, icon: Megaphone },
      {
        label: "Laporan Draft",
        value: laporan.filter((l) => l.status === "Draft").length,
        icon: FileText,
      },
    ],
    []
  );

  const mendatang = useMemo(
    () =>
      kegiatan
        .filter((k) => k.status !== "Selesai")
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    []
  );
  const pengumumanTerbaru = useMemo(
    () => [...pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5),
    []
  );
  const laporanTerbaru = useMemo(
    () => [...laporan].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5),
    []
  );

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Dashboard Sekretaris
        </h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Ringkasan kegiatan, pengumuman, dan laporan organisasi.
        </p>
      </section>

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Section title="Kegiatan Terdekat" count={mendatang.length}>
          {mendatang.length === 0 ? (
            <Empty text="Belum ada kegiatan." />
          ) : (
            <ul className="space-y-4">
              {mendatang.map((k) => (
                <li key={k.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-10 w-1 shrink-0 rounded-full ${
                      k.status === "Berlangsung" ? c.barBerlangsung : c.barMendatang
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium ${c.title}`}>{k.judul}</p>
                      <Badge className={c.kegiatan[k.status]}>{k.status}</Badge>
                    </div>
                    <p className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs ${c.muted}`}>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatTanggal(k.tanggal)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {k.lokasi}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Pengumuman Terbaru" count={pengumumanTerbaru.length}>
          {pengumumanTerbaru.length === 0 ? (
            <Empty text="Belum ada pengumuman." />
          ) : (
            <ul className={`divide-y ${c.divider}`}>
              {pengumumanTerbaru.map((p) => (
                <li key={p.id} className="py-3.5 first:pt-0 last:pb-0">
                  <p className={`font-medium ${c.title}`}>{p.judul}</p>
                  <p className={`mt-1 text-xs ${c.muted}`}>
                    {formatTanggal(p.tanggal)} • {p.kategori}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Laporan Terbaru" count={laporanTerbaru.length}>
          {laporanTerbaru.length === 0 ? (
            <Empty text="Belum ada laporan." />
          ) : (
            <ul className={`divide-y ${c.divider}`}>
              {laporanTerbaru.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className={`font-medium ${c.title}`}>{l.judul}</p>
                    <p className={`mt-1 text-xs ${c.muted}`}>{formatTanggal(l.tanggal)}</p>
                  </div>
                  <Badge className={c.laporan[l.status]}>{l.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}