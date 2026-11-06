import { useState } from "react";

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
const TABS: TabLaporan[] = ["Keuangan", "Kegiatan", "Keanggotaan"];

// ===================== Helpers =====================
const formatRupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

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
interface KartuProps {
  label: string;
  nilai: string;
  warna?: string;
}

function Kartu({ label, nilai, warna = "text-gray-800" }: KartuProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${warna}`}>{nilai}</p>
    </div>
  );
}

// ===================== Component =====================
export default function Laporan() {
  const [tahun, setTahun] = useState<string>(TAHUN[0]);
  const [tab, setTab] = useState<TabLaporan>("Keuangan");

  const { keuangan, kegiatan, anggota } = DATA_LAPORAN[tahun];

  // --- Keuangan ---
  const totalMasuk = sum(keuangan.map((k) => k.pemasukan));
  const totalKeluar = sum(keuangan.map((k) => k.pengeluaran));
  const maxKeuangan = Math.max(...keuangan.flatMap((k) => [k.pemasukan, k.pengeluaran]), 1);

  // --- Kegiatan ---
  const totalTerlaksana = sum(kegiatan.map((k) => k.terlaksana));
  const totalDibatalkan = sum(kegiatan.map((k) => k.dibatalkan));
  const totalPeserta = sum(kegiatan.map((k) => k.peserta));

  // --- Anggota ---
  const totalBaru = sum(anggota.map((a) => a.anggotaBaru));
  const totalKeluarAnggota = sum(anggota.map((a) => a.keluar));
  const anggotaTerakhir = anggota[anggota.length - 1]?.totalAktif ?? 0;

  const handleExport = () => {
    if (tab === "Keuangan") {
      unduhCSV(
        `laporan-keuangan-${tahun}.csv`,
        ["Bulan", "Pemasukan", "Pengeluaran", "Saldo"],
        keuangan.map((k) => [k.bulan, k.pemasukan, k.pengeluaran, k.pemasukan - k.pengeluaran])
      );
    } else if (tab === "Kegiatan") {
      unduhCSV(
        `laporan-kegiatan-${tahun}.csv`,
        ["Bulan", "Terlaksana", "Dibatalkan", "Peserta"],
        kegiatan.map((k) => [k.bulan, k.terlaksana, k.dibatalkan, k.peserta])
      );
    } else {
      unduhCSV(
        `laporan-keanggotaan-${tahun}.csv`,
        ["Bulan", "Anggota Baru", "Keluar", "Total Aktif"],
        anggota.map((a) => [a.bulan, a.anggotaBaru, a.keluar, a.totalAktif])
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-sm text-gray-500">
            Rekap keuangan, kegiatan, dan keanggotaan tahun {tahun}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {TAHUN.map((t) => (
              <option key={t} value={t}>
                Tahun {t}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            Cetak
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm print:hidden sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-5 py-2 text-sm font-medium transition sm:flex-none ${
              tab === t ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================= Keuangan ================= */}
      {tab === "Keuangan" && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kartu label="Total Pemasukan" nilai={formatRupiah(totalMasuk)} warna="text-emerald-600" />
            <Kartu label="Total Pengeluaran" nilai={formatRupiah(totalKeluar)} warna="text-red-500" />
            <Kartu
              label="Saldo Akhir"
              nilai={formatRupiah(totalMasuk - totalKeluar)}
              warna={totalMasuk - totalKeluar >= 0 ? "text-blue-600" : "text-red-600"}
            />
          </div>

          {/* Grafik batang sederhana */}
          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Grafik Per Bulan</h2>
              <div className="flex gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-emerald-500" /> Pemasukan
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-red-400" /> Pengeluaran
                </span>
              </div>
            </div>
            <div className="flex h-48 items-end gap-3 overflow-x-auto">
              {keuangan.map((k) => (
                <div key={k.bulan} className="flex min-w-[56px] flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-1">
                    <div
                      className="w-5 rounded-t bg-emerald-500"
                      style={{ height: `${(k.pemasukan / maxKeuangan) * 100}%` }}
                      title={`Pemasukan: ${formatRupiah(k.pemasukan)}`}
                    />
                    <div
                      className="w-5 rounded-t bg-red-400"
                      style={{ height: `${(k.pengeluaran / maxKeuangan) * 100}%` }}
                      title={`Pengeluaran: ${formatRupiah(k.pengeluaran)}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{k.bulan}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Bulan</th>
                    <th className="px-4 py-3 text-right">Pemasukan</th>
                    <th className="px-4 py-3 text-right">Pengeluaran</th>
                    <th className="px-4 py-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {keuangan.map((k) => {
                    const saldo = k.pemasukan - k.pengeluaran;
                    return (
                      <tr key={k.bulan} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{k.bulan}</td>
                        <td className="px-4 py-3 text-right text-emerald-600">{formatRupiah(k.pemasukan)}</td>
                        <td className="px-4 py-3 text-right text-red-500">{formatRupiah(k.pengeluaran)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
                          {formatRupiah(saldo)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold text-gray-800">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{formatRupiah(totalMasuk)}</td>
                    <td className="px-4 py-3 text-right">{formatRupiah(totalKeluar)}</td>
                    <td className="px-4 py-3 text-right">{formatRupiah(totalMasuk - totalKeluar)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= Kegiatan ================= */}
      {tab === "Kegiatan" && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kartu label="Kegiatan Terlaksana" nilai={String(totalTerlaksana)} warna="text-emerald-600" />
            <Kartu label="Kegiatan Dibatalkan" nilai={String(totalDibatalkan)} warna="text-red-500" />
            <Kartu label="Total Peserta" nilai={String(totalPeserta)} warna="text-blue-600" />
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Bulan</th>
                    <th className="px-4 py-3 text-right">Terlaksana</th>
                    <th className="px-4 py-3 text-right">Dibatalkan</th>
                    <th className="px-4 py-3 text-right">Peserta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kegiatan.map((k) => (
                    <tr key={k.bulan} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{k.bulan}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{k.terlaksana}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{k.dibatalkan}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{k.peserta}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold text-gray-800">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{totalTerlaksana}</td>
                    <td className="px-4 py-3 text-right">{totalDibatalkan}</td>
                    <td className="px-4 py-3 text-right">{totalPeserta}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= Keanggotaan ================= */}
      {tab === "Keanggotaan" && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kartu label="Anggota Baru" nilai={String(totalBaru)} warna="text-emerald-600" />
            <Kartu label="Anggota Keluar" nilai={String(totalKeluarAnggota)} warna="text-red-500" />
            <Kartu label="Anggota Aktif Saat Ini" nilai={String(anggotaTerakhir)} warna="text-blue-600" />
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Bulan</th>
                    <th className="px-4 py-3 text-right">Anggota Baru</th>
                    <th className="px-4 py-3 text-right">Keluar</th>
                    <th className="px-4 py-3 text-right">Total Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {anggota.map((a) => (
                    <tr key={a.bulan} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{a.bulan}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">+{a.anggotaBaru}</td>
                      <td className="px-4 py-3 text-right text-red-500">-{a.keluar}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{a.totalAktif}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}