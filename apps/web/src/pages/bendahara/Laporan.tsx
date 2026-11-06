import { useMemo, useState } from "react";

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

  return (
    <div className="p-6 space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h1>
        <p className="text-gray-500">Rekap pemasukan dan pengeluaran per periode.</p>
      </div>

      {/* Kontrol */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end print:hidden">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Bulan</label>
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={-1}>Satu Tahun Penuh</option>
            {BULAN.map((b, i) => (
              <option key={b} value={i}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tahun</label>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {daftarTahun.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={exportCSV}
            disabled={hasil.length === 0}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Cetak
          </button>
        </div>
      </div>

      {/* Isi laporan */}
      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">Laporan Keuangan</h2>
          <p className="text-gray-500">Periode: {periode}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Pemasukan</p>
            <p className="text-lg font-semibold text-green-600">{rupiah(totalMasuk)}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Pengeluaran</p>
            <p className="text-lg font-semibold text-red-600">{rupiah(totalKeluar)}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Selisih</p>
            <p className={`text-lg font-semibold ${selisih >= 0 ? "text-gray-800" : "text-red-600"}`}>{rupiah(selisih)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Pemasukan</th>
                <th className="px-4 py-3 text-right">Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hasil.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                hasil.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatTanggal(t.tanggal)}</td>
                    <td className="px-4 py-3">{t.keterangan}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {t.jenis === "Pemasukan" ? rupiah(t.jumlah) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {t.jenis === "Pengeluaran" ? rupiah(t.jumlah) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {hasil.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">{rupiah(totalMasuk)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{rupiah(totalKeluar)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}