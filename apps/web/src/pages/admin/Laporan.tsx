import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck,
  CalendarX,
  Download,
  Printer,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file dashboard Anda
import { useTheme } from "../../contexts/ThemeContext";

// ===================== Types =====================
type TabLaporan = "Keuangan" | "Kegiatan" | "Keanggotaan";

interface LaporanKeuanganBulanan {
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
}

interface LaporanKegiatanBulanan {
  bulan: string;
  terlaksana: number;
  dibatalkan: number;
  peserta: number;
}

interface LaporanAnggotaBulanan {
  bulan: string;
  anggotaBaru: number;
  keluar: number;
  totalAktif: number;
}

interface DataTahunan {
  keuangan: LaporanKeuanganBulanan[];
  kegiatan: LaporanKegiatanBulanan[];
  anggota: LaporanAnggotaBulanan[];
}

// ===================== Data contoh =====================
// Ganti dengan data dari API/backend Anda.
const DATA_LAPORAN: Record<string, DataTahunan> = {
  "2026": {
    keuangan: [
      { bulan: "Juli", pemasukan: 2200000, pengeluaran: 1400000 },
      { bulan: "Agustus", pemasukan: 2250000, pengeluaran: 1900000 },
      { bulan: "September", pemasukan: 2300000, pengeluaran: 1100000 },
      { bulan: "Oktober", pemasukan: 5400000, pengeluaran: 1830000 },
      { bulan: "November", pemasukan: 4000000, pengeluaran: 625000 },
    ],
    kegiatan: [
      { bulan: "Juli", terlaksana: 2, dibatalkan: 0, peserta: 48 },
      { bulan: "Agustus", terlaksana: 3, dibatalkan: 1, peserta: 95 },
      { bulan: "September", terlaksana: 2, dibatalkan: 0, peserta: 60 },
      { bulan: "Oktober", terlaksana: 3, dibatalkan: 1, peserta: 120 },
      { bulan: "November", terlaksana: 1, dibatalkan: 0, peserta: 35 },
    ],
    anggota: [
      { bulan: "Juli", anggotaBaru: 4, keluar: 1, totalAktif: 78 },
      { bulan: "Agustus", anggotaBaru: 6, keluar: 0, totalAktif: 84 },
      { bulan: "September", anggotaBaru: 3, keluar: 2, totalAktif: 85 },
      { bulan: "Oktober", anggotaBaru: 5, keluar: 1, totalAktif: 89 },
      { bulan: "November", anggotaBaru: 2, keluar: 0, totalAktif: 91 },
    ],
  },
  "2025": {
    keuangan: [
      { bulan: "Oktober", pemasukan: 2000000, pengeluaran: 1300000 },
      { bulan: "November", pemasukan: 2100000, pengeluaran: 900000 },
      { bulan: "Desember", pemasukan: 3500000, pengeluaran: 2800000 },
    ],
    kegiatan: [
      { bulan: "Oktober", terlaksana: 2, dibatalkan: 0, peserta: 52 },
      { bulan: "November", terlaksana: 2, dibatalkan: 1, peserta: 64 },
      { bulan: "Desember", terlaksana: 4, dibatalkan: 0, peserta: 140 },
    ],
    anggota: [
      { bulan: "Oktober", anggotaBaru: 3, keluar: 1, totalAktif: 66 },
      { bulan: "November", anggotaBaru: 2, keluar: 0, totalAktif: 68 },
      { bulan: "Desember", anggotaBaru: 5, keluar: 1, totalAktif: 72 },
    ],
  },
};

const TAHUN = Object.keys(DATA_LAPORAN).sort((a, b) => Number(b) - Number(a));
const TABS: readonly TabLaporan[] = ["Keuangan", "Kegiatan", "Keanggotaan"];

// ===================== Token warna sesuai tema =====================
// Pola yang sama dengan AdminDashboard: gelap = kartu kaca + aksen lime-300,
// terang = kartu putih + aksen lime-400/700.
// Varian `print:` menjaga hasil cetak tetap terbaca (latar gelap tidak ikut tercetak).
const DARK = {
  panel:
    "rounded-3xl border border-white/10 bg-white/[0.04] p-6 print:border-slate-300 print:bg-white",
  title: "text-white print:text-slate-900",
  text: "text-white/70 print:text-slate-700",
  muted: "text-white/45 print:text-slate-500",
  divider: "divide-white/10 print:divide-slate-200",
  line: "border-white/10 print:border-slate-300",
  iconWrap: "border-white/10 bg-white/[0.06] text-lime-300 print:text-lime-700",
  segment: "border-white/10 bg-white/[0.04]",
  segActive: "bg-lime-300 text-[#10150c]",
  segIdle: "text-white/60 hover:text-white",
  tableHead: "bg-black/20 text-white/45 print:bg-slate-100 print:text-slate-600",
  tableFoot: "bg-white/[0.03] print:bg-slate-50",
  rowHover: "hover:bg-white/[0.03]",
  input:
    "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-lime-300/50 focus:ring-2 focus:ring-lime-300/20 [color-scheme:dark]",
  btnPrimary:
    "bg-lime-300 text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] hover:bg-lime-200",
  btnGhost:
    "border-white/15 bg-white/[0.06] text-white hover:border-lime-300/40 hover:text-lime-300",
  barIn: "bg-gradient-to-t from-lime-300/5 to-lime-300/60 border-t-2 border-lime-300",
  barOut: "bg-gradient-to-t from-red-400/5 to-red-400/50 border-t-2 border-red-300",
  legendIn: "bg-lime-300",
  legendOut: "bg-red-300",
  maxLine: "border-lime-300/60",
  maxChip: "border-lime-300/40 bg-[#12170e] text-lime-300 print:bg-white print:text-lime-700",
  tone: {
    lime: "bg-lime-300/15 text-lime-300 print:text-lime-800",
    red: "bg-red-400/15 text-red-300 print:text-red-700",
  },
  toneText: {
    lime: "text-lime-300 print:text-lime-700",
    red: "text-red-300 print:text-red-600",
  },
};

const LIGHT: typeof DARK = {
  panel: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
  title: "text-slate-900",
  text: "text-slate-600",
  muted: "text-slate-400",
  divider: "divide-slate-100",
  line: "border-slate-200",
  iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
  segment: "border-slate-200 bg-slate-50",
  segActive: "bg-lime-400 text-[#10150c]",
  segIdle: "text-slate-500 hover:text-slate-800",
  tableHead: "bg-slate-50 text-slate-500",
  tableFoot: "bg-slate-50",
  rowHover: "hover:bg-slate-50",
  input:
    "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 [color-scheme:light]",
  btnPrimary: "bg-lime-400 text-[#10150c] shadow-sm hover:bg-lime-300",
  btnGhost:
    "border-slate-200 bg-white text-slate-700 hover:border-lime-400 hover:text-lime-700",
  barIn: "bg-gradient-to-t from-lime-100 to-lime-400 border-t-2 border-lime-600",
  barOut: "bg-gradient-to-t from-red-100 to-red-400 border-t-2 border-red-500",
  legendIn: "bg-lime-500",
  legendOut: "bg-red-400",
  maxLine: "border-lime-500/70",
  maxChip: "border-lime-300 bg-white text-lime-700",
  tone: {
    lime: "bg-lime-100 text-lime-800",
    red: "bg-red-100 text-red-600",
  },
  toneText: {
    lime: "text-lime-700",
    red: "text-red-500",
  },
};

const useC = () => {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
};

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";

// ===================== Helpers =====================
const formatRupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatRupiahRingkas = (n: number): string => {
  const f = (v: number, satuan: string) =>
    `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(v)} ${satuan}`;
  if (n >= 1e9) return f(n / 1e9, "M");
  if (n >= 1e6) return f(n / 1e6, "jt");
  if (n >= 1e3) return f(n / 1e3, "rb");
  return `Rp ${n}`;
};

const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
const singkat = (bulan: string): string => bulan.slice(0, 3);
const angka = (n: number): string => String(n);

const unduhCSV = (namaFile: string, header: string[], baris: (string | number)[][]) => {
  const isi = [header, ...baris]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([isi], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  a.click();
  URL.revokeObjectURL(url);
};

// ===================== Sub-komponen =====================
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeTone?: "lime" | "red";
  icon: LucideIcon;
  /** Kartu lime penuh, seperti kartu "My Card" pada gambar referensi. */
  accent?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  badge,
  badgeTone = "lime",
  icon: Icon,
  accent = false,
}: StatCardProps) {
  const c = useC();
  const shell = accent
    ? "rounded-3xl border border-lime-300/60 bg-lime-300 p-6 text-[#10150c] shadow-[0_0_32px_rgba(190,242,100,0.18)]"
    : c.panel;
  const labelCls = accent ? "text-[#10150c]/70" : c.text;
  const iconCls = accent ? "border-[#10150c]/15 bg-[#10150c]/10 text-[#10150c]" : c.iconWrap;
  const valueCls = accent ? "text-[#10150c]" : c.title;
  const badgeCls = accent ? "bg-[#10150c]/10 text-[#10150c]" : c.tone[badgeTone];
  const subCls = accent ? "text-[#10150c]/65" : c.muted;

  return (
    <div className={`${shell} min-w-0`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${labelCls}`}>{label}</p>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${iconCls}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className={`mt-4 whitespace-nowrap text-2xl font-semibold tracking-tight sm:text-3xl ${valueCls}`}>
        {value}
      </p>

      {(badge || sub) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {badge && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeCls}`}>{badge}</span>
          )}
          {sub && <p className={`min-w-0 text-xs ${subCls}`}>{sub}</p>}
        </div>
      )}
    </div>
  );
}

interface SegmentProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

function Segment<T extends string>({ options, value, onChange, label }: SegmentProps<T>) {
  const c = useC();
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex max-w-full overflow-x-auto rounded-full border p-1 ${c.segment}`}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === o ? c.segActive : c.segIdle
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// Grafik batang bergaya "Cashflow" pada gambar referensi
interface BarSeries {
  name: string;
  values: number[];
  tone: "in" | "out";
}

interface BarChartProps {
  labels: string[];
  series: BarSeries[];
  format: (n: number) => string;
  ariaLabel: string;
}

function BarChart({ labels, series, format, ariaLabel }: BarChartProps) {
  const c = useC();
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const barCls = { in: c.barIn, out: c.barOut };

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]"
    >
      <div className="relative mt-6 h-48">
        {[0, 25, 50, 75].map((p) => (
          <div
            key={p}
            className={`absolute inset-x-0 border-t ${c.line}`}
            style={{ bottom: `${p}%` }}
          />
        ))}
        <div className={`absolute inset-x-0 top-0 border-t border-dashed ${c.maxLine}`} />
        <span
          className={`absolute left-0 top-0 -translate-y-1/2 rounded-md border px-2 py-0.5 text-[11px] font-medium ${c.maxChip}`}
        >
          {format(max)}
        </span>

        <div className="absolute inset-0 flex items-end gap-2 px-1 sm:gap-4">
          {labels.map((label, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 items-end justify-center gap-1">
              {series.map((s) =>
                s.values[i] > 0 ? (
                  <div
                    key={s.name}
                    className={`w-full max-w-[26px] rounded-t-md ${barCls[s.tone]}`}
                    style={{ height: `${(s.values[i] / max) * 100}%` }}
                    title={`${s.name} ${label}: ${format(s.values[i])}`}
                  />
                ) : null,
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-2 px-1 sm:gap-4">
        {labels.map((label, i) => (
          <span key={i} className={`min-w-0 flex-1 truncate text-center text-xs ${c.muted}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartLegend({ series }: { series: BarSeries[] }) {
  const c = useC();
  return (
    <div className={`flex flex-wrap gap-4 text-xs ${c.text}`}>
      {series.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${s.tone === "in" ? c.legendIn : c.legendOut}`}
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}

interface Kolom<T> {
  header: string;
  right?: boolean;
  cell: (row: T) => ReactNode;
  footer?: ReactNode;
}

function TabelLaporan<T extends { bulan: string }>({
  rows,
  kolom,
}: {
  rows: T[];
  kolom: Kolom<T>[];
}) {
  const c = useC();
  const adaFooter = kolom.some((k) => k.footer !== undefined);

  return (
    <div className={`mt-5 overflow-x-auto rounded-2xl border ${c.line}`}>
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className={`text-xs uppercase tracking-wide ${c.tableHead}`}>
          <tr>
            {kolom.map((k) => (
              <th
                key={k.header}
                scope="col"
                className={`px-4 py-3 font-medium ${k.right ? "text-right" : ""}`}
              >
                {k.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${c.divider}`}>
          {rows.map((row) => (
            <tr key={row.bulan} className={`transition-colors ${c.rowHover}`}>
              {kolom.map((k) => (
                <td
                  key={k.header}
                  className={`px-4 py-3 ${k.right ? "text-right tabular-nums" : ""}`}
                >
                  {k.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {adaFooter && (
          <tfoot className={`border-t font-semibold ${c.line} ${c.tableFoot} ${c.title}`}>
            <tr>
              {kolom.map((k) => (
                <td
                  key={k.header}
                  className={`px-4 py-3 ${k.right ? "text-right tabular-nums" : ""}`}
                >
                  {k.footer}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

interface PanelGrafikProps {
  judul: string;
  subjudul: string;
  labels: string[];
  series: BarSeries[];
  format: (n: number) => string;
  ariaLabel: string;
  children?: ReactNode;
}

function PanelGrafik({
  judul,
  subjudul,
  labels,
  series,
  format,
  ariaLabel,
  children,
}: PanelGrafikProps) {
  const c = useC();
  return (
    <section className={c.panel}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`text-lg font-semibold ${c.title}`}>{judul}</h3>
          <p className={`mt-0.5 text-sm ${c.muted}`}>{subjudul}</p>
        </div>
        <ChartLegend series={series} />
      </div>
      <BarChart labels={labels} series={series} format={format} ariaLabel={ariaLabel} />
      {children}
    </section>
  );
}

// ===================== Component =====================
export default function Laporan() {
  const c = useC();
  const [tahun, setTahun] = useState<string>(TAHUN[0]);
  const [tab, setTab] = useState<TabLaporan>("Keuangan");

  const { keuangan, kegiatan, anggota } = DATA_LAPORAN[tahun];

  // --- Keuangan ---
  const totalMasuk = sum(keuangan.map((k) => k.pemasukan));
  const totalKeluar = sum(keuangan.map((k) => k.pengeluaran));
  const saldoAkhir = totalMasuk - totalKeluar;

  // --- Kegiatan ---
  const totalTerlaksana = sum(kegiatan.map((k) => k.terlaksana));
  const totalDibatalkan = sum(kegiatan.map((k) => k.dibatalkan));
  const totalPeserta = sum(kegiatan.map((k) => k.peserta));
  const totalKegiatan = totalTerlaksana + totalDibatalkan;
  const persen = (n: number) => (totalKegiatan ? Math.round((n / totalKegiatan) * 100) : 0);
  const rataPeserta = totalTerlaksana ? Math.round(totalPeserta / totalTerlaksana) : 0;

  // --- Anggota ---
  const totalBaru = sum(anggota.map((a) => a.anggotaBaru));
  const totalKeluarAnggota = sum(anggota.map((a) => a.keluar));
  const anggotaTerakhir = anggota[anggota.length - 1]?.totalAktif ?? 0;

  const handleExport = () => {
    if (tab === "Keuangan") {
      unduhCSV(
        `laporan-keuangan-${tahun}.csv`,
        ["Bulan", "Pemasukan", "Pengeluaran", "Saldo"],
        keuangan.map((k) => [k.bulan, k.pemasukan, k.pengeluaran, k.pemasukan - k.pengeluaran]),
      );
    } else if (tab === "Kegiatan") {
      unduhCSV(
        `laporan-kegiatan-${tahun}.csv`,
        ["Bulan", "Terlaksana", "Dibatalkan", "Peserta"],
        kegiatan.map((k) => [k.bulan, k.terlaksana, k.dibatalkan, k.peserta]),
      );
    } else {
      unduhCSV(
        `laporan-keanggotaan-${tahun}.csv`,
        ["Bulan", "Anggota Baru", "Keluar", "Total Aktif"],
        anggota.map((a) => [a.bulan, a.anggotaBaru, a.keluar, a.totalAktif]),
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${c.title}`}>
              Laporan
            </h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.tone.lime}`}>
              Tahun {tahun}
            </span>
          </div>
          <p className={`mt-1 text-sm ${c.muted}`}>
            Rekap keuangan, kegiatan, dan keanggotaan tahun {tahun}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <select
            aria-label="Pilih tahun laporan"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className={`rounded-full border px-4 py-2.5 text-sm outline-none transition-colors ${c.input}`}
          >
            {TAHUN.map((t) => (
              <option key={t} value={t}>
                Tahun {t}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleExport} className={`${btnBase} border ${c.btnGhost}`}>
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button type="button" onClick={() => window.print()} className={`${btnBase} ${c.btnPrimary}`}>
            <Printer className="h-4 w-4" />
            Cetak
          </button>
        </div>
      </div>

      <div className="print:hidden">
        <Segment label="Jenis laporan" options={TABS} value={tab} onChange={setTab} />
      </div>

      {/* ================= Keuangan ================= */}
      {tab === "Keuangan" && (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              accent
              label="Saldo Akhir"
              value={formatRupiah(saldoAkhir)}
              badge={saldoAkhir >= 0 ? "Surplus" : "Defisit"}
              sub={`Rekap ${keuangan.length} bulan`}
              icon={Wallet}
            />
            <StatCard
              label="Total Pemasukan"
              value={formatRupiah(totalMasuk)}
              sub="Seluruh dana masuk"
              icon={ArrowDownLeft}
            />
            <StatCard
              label="Total Pengeluaran"
              value={formatRupiah(totalKeluar)}
              badgeTone="red"
              sub="Seluruh dana keluar"
              icon={ArrowUpRight}
            />
          </section>

          <PanelGrafik
            judul="Grafik Per Bulan"
            subjudul="Perbandingan pemasukan dan pengeluaran"
            labels={keuangan.map((k) => singkat(k.bulan))}
            series={[
              { name: "Pemasukan", values: keuangan.map((k) => k.pemasukan), tone: "in" },
              { name: "Pengeluaran", values: keuangan.map((k) => k.pengeluaran), tone: "out" },
            ]}
            format={formatRupiahRingkas}
            ariaLabel={`Grafik batang pemasukan dan pengeluaran per bulan tahun ${tahun}`}
          >
            <TabelLaporan
              rows={keuangan}
              kolom={[
                {
                  header: "Bulan",
                  cell: (k) => <span className={`font-medium ${c.title}`}>{k.bulan}</span>,
                  footer: "Total",
                },
                {
                  header: "Pemasukan",
                  right: true,
                  cell: (k) => <span className={c.toneText.lime}>{formatRupiah(k.pemasukan)}</span>,
                  footer: formatRupiah(totalMasuk),
                },
                {
                  header: "Pengeluaran",
                  right: true,
                  cell: (k) => <span className={c.toneText.red}>{formatRupiah(k.pengeluaran)}</span>,
                  footer: formatRupiah(totalKeluar),
                },
                {
                  header: "Saldo",
                  right: true,
                  cell: (k) => {
                    const saldo = k.pemasukan - k.pengeluaran;
                    return (
                      <span className={`font-semibold ${saldo >= 0 ? c.title : c.toneText.red}`}>
                        {formatRupiah(saldo)}
                      </span>
                    );
                  },
                  footer: formatRupiah(saldoAkhir),
                },
              ]}
            />
          </PanelGrafik>
        </>
      )}

      {/* ================= Kegiatan ================= */}
      {tab === "Kegiatan" && (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              accent
              label="Total Peserta"
              value={angka(totalPeserta)}
              sub={`Rata-rata ${rataPeserta} per kegiatan terlaksana`}
              icon={Users}
            />
            <StatCard
              label="Kegiatan Terlaksana"
              value={angka(totalTerlaksana)}
              badge={`${persen(totalTerlaksana)}% dari rencana`}
              icon={CalendarCheck}
            />
            <StatCard
              label="Kegiatan Dibatalkan"
              value={angka(totalDibatalkan)}
              badge={`${persen(totalDibatalkan)}% dari rencana`}
              badgeTone="red"
              icon={CalendarX}
            />
          </section>

          <PanelGrafik
            judul="Kegiatan Per Bulan"
            subjudul="Jumlah kegiatan terlaksana dan dibatalkan"
            labels={kegiatan.map((k) => singkat(k.bulan))}
            series={[
              { name: "Terlaksana", values: kegiatan.map((k) => k.terlaksana), tone: "in" },
              { name: "Dibatalkan", values: kegiatan.map((k) => k.dibatalkan), tone: "out" },
            ]}
            format={angka}
            ariaLabel={`Grafik batang kegiatan terlaksana dan dibatalkan per bulan tahun ${tahun}`}
          >
            <TabelLaporan
              rows={kegiatan}
              kolom={[
                {
                  header: "Bulan",
                  cell: (k) => <span className={`font-medium ${c.title}`}>{k.bulan}</span>,
                  footer: "Total",
                },
                {
                  header: "Terlaksana",
                  right: true,
                  cell: (k) => <span className={c.text}>{k.terlaksana}</span>,
                  footer: totalTerlaksana,
                },
                {
                  header: "Dibatalkan",
                  right: true,
                  cell: (k) => <span className={c.text}>{k.dibatalkan}</span>,
                  footer: totalDibatalkan,
                },
                {
                  header: "Peserta",
                  right: true,
                  cell: (k) => <span className={c.text}>{k.peserta}</span>,
                  footer: totalPeserta,
                },
              ]}
            />
          </PanelGrafik>
        </>
      )}

      {/* ================= Keanggotaan ================= */}
      {tab === "Keanggotaan" && (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              accent
              label="Anggota Aktif Saat Ini"
              value={angka(anggotaTerakhir)}
              sub={`Per ${anggota[anggota.length - 1]?.bulan ?? "-"} ${tahun}`}
              icon={Users}
            />
            <StatCard
              label="Anggota Baru"
              value={angka(totalBaru)}
              sub="Bergabung sepanjang periode"
              icon={UserPlus}
            />
            <StatCard
              label="Anggota Keluar"
              value={angka(totalKeluarAnggota)}
              badgeTone="red"
              sub="Berhenti sepanjang periode"
              icon={UserMinus}
            />
          </section>

          <PanelGrafik
            judul="Pergerakan Anggota"
            subjudul="Anggota baru dan anggota keluar per bulan"
            labels={anggota.map((a) => singkat(a.bulan))}
            series={[
              { name: "Anggota baru", values: anggota.map((a) => a.anggotaBaru), tone: "in" },
              { name: "Anggota keluar", values: anggota.map((a) => a.keluar), tone: "out" },
            ]}
            format={angka}
            ariaLabel={`Grafik batang anggota baru dan keluar per bulan tahun ${tahun}`}
          >
            <TabelLaporan
              rows={anggota}
              kolom={[
                {
                  header: "Bulan",
                  cell: (a) => <span className={`font-medium ${c.title}`}>{a.bulan}</span>,
                },
                {
                  header: "Anggota Baru",
                  right: true,
                  cell: (a) => <span className={c.toneText.lime}>+{a.anggotaBaru}</span>,
                },
                {
                  header: "Keluar",
                  right: true,
                  cell: (a) => <span className={c.toneText.red}>-{a.keluar}</span>,
                },
                {
                  header: "Total Aktif",
                  right: true,
                  cell: (a) => <span className={`font-semibold ${c.title}`}>{a.totalAktif}</span>,
                },
              ]}
            />
          </PanelGrafik>
        </>
      )}
    </div>
  );
}