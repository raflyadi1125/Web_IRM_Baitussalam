import { useMemo } from "react";
import {
  CalendarClock,
  CalendarDays,
  FileText,
  MapPin,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

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

const statusKegiatanStyle: Record<StatusKegiatan, string> = {
  "Akan Datang": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Berlangsung: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Selesai: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const statusLaporanStyle = {
  Final: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Draft: "bg-amber-50 text-amber-700 ring-amber-600/20",
} as const;

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold leading-tight text-slate-900">{value}</p>
      </div>
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
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-slate-400">{text}</p>;
}

export default function Dashboard() {
  const stats = useMemo(
    () => [
      { label: "Total Kegiatan", value: kegiatan.length, icon: CalendarDays, tone: "bg-blue-50 text-blue-600" },
      {
        label: "Kegiatan Mendatang",
        value: kegiatan.filter((k) => k.status === "Akan Datang").length,
        icon: CalendarClock,
        tone: "bg-emerald-50 text-emerald-600",
      },
      { label: "Pengumuman", value: pengumuman.length, icon: Megaphone, tone: "bg-amber-50 text-amber-600" },
      {
        label: "Laporan Draft",
        value: laporan.filter((l) => l.status === "Draft").length,
        icon: FileText,
        tone: "bg-purple-50 text-purple-600",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Sekretaris</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan kegiatan, pengumuman, dan laporan organisasi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Section title="Kegiatan Terdekat" count={mendatang.length}>
          {mendatang.length === 0 ? (
            <Empty text="Belum ada kegiatan." />
          ) : (
            <ul className="space-y-4">
              {mendatang.map((k) => (
                <li key={k.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-10 w-1 shrink-0 rounded-full ${
                      k.status === "Berlangsung" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">{k.judul}</p>
                      <Badge className={statusKegiatanStyle[k.status]}>{k.status}</Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
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
            <ul className="divide-y divide-slate-100">
              {pengumumanTerbaru.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium text-slate-900">{p.judul}</p>
                  <p className="mt-1 text-xs text-slate-500">
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
            <ul className="divide-y divide-slate-100">
              {laporanTerbaru.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{l.judul}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatTanggal(l.tanggal)}</p>
                  </div>
                  <Badge className={statusLaporanStyle[l.status]}>{l.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}