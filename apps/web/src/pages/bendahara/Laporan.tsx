import { useMemo, useState } from "react";
import { Download, Printer, TrendingUp, TrendingDown, Scale } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";

interface Transaksi {
  id: number;
  tanggal: string; // ISO date
  keterangan: string;
  jenis: "Pemasukan" | "Pengeluaran";
  jumlah: number;
}

// TODO: ganti dengan data dari API
const transaksi: Transaksi[] = [
  { id: 1, tanggal: "2026-11-05", keterangan: "Iuran anggota - November", jenis: "Pemasukan", jumlah: 1500000 },
  { id: 2, tanggal: "2026-11-04", keterangan: "Konsumsi rapat", jenis: "Pengeluaran", jumlah: 350000 },
  { id: 3, tanggal: "2026-11-02", keterangan: "Donasi sponsor", jenis: "Pemasukan", jumlah: 2000000 },
  { id: 4, tanggal: "2026-10-28", keterangan: "Sewa aula", jenis: "Pengeluaran", jumlah: 800000 },
  { id: 5, tanggal: "2026-10-15", keterangan: "Iuran anggota - Oktober", jenis: "Pemasukan", jumlah: 1800000 },
  { id: 6, tanggal: "2026-09-20", keterangan: "Perlengkapan kegiatan", jenis: "Pengeluaran", jumlah: 600000 },
  { id: 7, tanggal: "2026-09-10", keterangan: "Iuran anggota - September", jenis: "Pemasukan", jumlah: 1600000 },
];

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function Laporan() {
  const now = new Date();
  const [bulan, setBulan] = useState<number>(now.getMonth()); // 0-11, atau -1 = satu tahun penuh
  const [tahun, setTahun] = useState<number>(now.getFullYear());
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const daftarTahun = useMemo(() => {
    const set = new Set(transaksi.map((t) => Number(t.tanggal.slice(0, 4))));
    set.add(now.getFullYear());
    return [...set].sort((a, b) => b - a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasil = useMemo(
    () =>
      transaksi
        .filter((t) => {
          const d = new Date(t.tanggal);
          return d.getFullYear() === tahun && (bulan === -1 || d.getMonth() === bulan);
        })
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    [bulan, tahun]
  );

  const totalMasuk = hasil.filter((t) => t.jenis === "Pemasukan").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = hasil.filter((t) => t.jenis === "Pengeluaran").reduce((s, t) => s + t.jumlah, 0);
  const selisih = totalMasuk - totalKeluar;

  const periode = bulan === -1 ? `Tahun ${tahun}` : `${BULAN[bulan]} ${tahun}`;

  const exportCSV = () => {
    const header = ["Tanggal", "Keterangan", "Jenis", "Jumlah"];
    const rows = hasil.map((t) => [t.tanggal, `"${t.keterangan.replace(/"/g, '""')}"`, t.jenis, t.jumlah]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${periode.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Token warna sesuai tema (sama dengan dashboard admin).
  // Kelas print: memastikan hasil cetak tetap putih-hitam meski tema gelap aktif.
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04] print:border-slate-300 print:bg-white",
        inner: "border-white/10 bg-white/[0.03] print:border-slate-300 print:bg-white",
        title: "text-white print:text-black",
        text: "text-white/70 print:text-slate-700",
        muted: "text-white/45 print:text-slate-500",
        divider: "divide-white/10 print:divide-slate-200",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300 print:border-slate-300 print:bg-white print:text-black",
        input:
          "border-white/10 bg-white/[0.04] text-white focus:border-lime-300/50 focus:ring-lime-300/30 [color-scheme:dark]",
        option: "bg-[#121a0e] text-white",
        btnPrimary: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        btnGhost: "border-white/15 bg-white/[0.06] text-white hover:border-lime-300/40 hover:text-lime-300",
        thead: "bg-white/[0.04] text-white/60 print:bg-slate-100 print:text-slate-700",
        inText: "text-lime-300 print:text-green-700",
        outText: "text-rose-300 print:text-red-700",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm print:shadow-none",
        inner: "border-slate-200 bg-slate-50 print:bg-white",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400 print:text-slate-500",
        divider: "divide-slate-100 print:divide-slate-200",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700 print:border-slate-300 print:bg-white print:text-black",
        input:
          "border-slate-200 bg-white text-slate-900 focus:border-lime-500 focus:ring-lime-300/50",
        option: "bg-white text-slate-900",
        btnPrimary: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        btnGhost: "border-slate-200 bg-white text-slate-700 hover:border-lime-500 hover:text-lime-700",
        thead: "bg-slate-50 text-slate-500 print:bg-slate-100 print:text-slate-700",
        inText: "text-lime-700 print:text-green-700",
        outText: "text-red-600 print:text-red-700",
      };

  const card = `rounded-3xl border p-6 ${c.card}`;
  const selectClass = `h-11 rounded-full border px-4 text-sm outline-none transition focus:ring-2 ${c.input}`;
  const labelClass = `mb-1.5 block text-xs font-semibold ${c.text}`;

  const ringkasan = [
    { label: "Total Pemasukan", value: rupiah(totalMasuk), icon: TrendingUp, tone: c.inText },
    { label: "Total Pengeluaran", value: rupiah(totalKeluar), icon: TrendingDown, tone: c.outText },
    { label: "Selisih", value: rupiah(selisih), icon: Scale, tone: selisih >= 0 ? c.title : c.outText },
  ];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10 print:hidden">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Laporan Keuangan
        </h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Rekap pemasukan dan pengeluaran per periode.
        </p>
      </section>

      {/* Kontrol */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end print:hidden">
        <div>
          <label htmlFor="lap-bulan" className={labelClass}>
            Bulan
          </label>
          <select
            id="lap-bulan"
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className={selectClass}
          >
            <option value={-1} className={c.option}>
              Satu Tahun Penuh
            </option>
            {BULAN.map((b, i) => (
              <option key={b} value={i} className={c.option}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lap-tahun" className={labelClass}>
            Tahun
          </label>
          <select
            id="lap-tahun"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className={selectClass}
          >
            {daftarTahun.map((y) => (
              <option key={y} value={y} className={c.option}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={exportCSV}
            disabled={hasil.length === 0}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${c.btnGhost}`}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${c.btnPrimary}`}
          >
            <Printer className="h-4 w-4" /> Cetak
          </button>
        </div>
      </section>

      {/* Isi laporan */}
      <section className={`${card} space-y-6`}>
        <div className="text-center">
          <h2 className={`text-xl font-semibold ${c.title}`}>Laporan Keuangan</h2>
          <p className={`mt-1 text-sm ${c.muted}`}>Periode: {periode}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ringkasan.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`min-w-0 rounded-2xl border p-4 ${c.inner}`}>
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-medium ${c.text}`}>{label}</p>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className={`mt-3 truncate text-xl font-semibold tracking-tight ${tone}`} title={value}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className={`overflow-x-auto rounded-2xl border ${c.inner}`}>
          <table className="w-full text-sm">
            <thead className={`text-left ${c.thead}`}>
              <tr>
                <th className="px-5 py-3.5 font-medium">Tanggal</th>
                <th className="px-5 py-3.5 font-medium">Keterangan</th>
                <th className="px-5 py-3.5 text-right font-medium">Pemasukan</th>
                <th className="px-5 py-3.5 text-right font-medium">Pengeluaran</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {hasil.length === 0 ? (
                <tr>
                  <td colSpan={4} className={`px-5 py-10 text-center ${c.muted}`}>
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                hasil.map((t) => (
                  <tr key={t.id}>
                    <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>{formatTanggal(t.tanggal)}</td>
                    <td className={`px-5 py-4 font-medium ${c.title}`}>{t.keterangan}</td>
                    <td className={`whitespace-nowrap px-5 py-4 text-right ${c.inText}`}>
                      {t.jenis === "Pemasukan" ? rupiah(t.jumlah) : "-"}
                    </td>
                    <td className={`whitespace-nowrap px-5 py-4 text-right ${c.outText}`}>
                      {t.jenis === "Pengeluaran" ? rupiah(t.jumlah) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {hasil.length > 0 && (
              <tfoot className={`font-semibold ${c.thead}`}>
                <tr>
                  <td colSpan={2} className={`px-5 py-3.5 text-right ${c.title}`}>
                    Total
                  </td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right ${c.inText}`}>{rupiah(totalMasuk)}</td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right ${c.outText}`}>{rupiah(totalKeluar)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}