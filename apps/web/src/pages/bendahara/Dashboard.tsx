import { useMemo } from "react";

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

const iuranBelumBayar = 7;

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const namaBulan = (key: string) =>
  new Date(`${key}-01`).toLocaleDateString("id-ID", { month: "short" });

export default function Dashboard() {
  const { saldo, masukBulanIni, keluarBulanIni, grafik } = useMemo(() => {
    const now = new Date();
    const keyNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let saldo = 0;
    let masukBulanIni = 0;
    let keluarBulanIni = 0;
    const perBulan: Record<string, { masuk: number; keluar: number }> = {};

    transaksi.forEach((t) => {
      const key = t.tanggal.slice(0, 7);
      perBulan[key] ??= { masuk: 0, keluar: 0 };
      if (t.jenis === "Pemasukan") {
        saldo += t.jumlah;
        perBulan[key].masuk += t.jumlah;
        if (key === keyNow) masukBulanIni += t.jumlah;
      } else {
        saldo -= t.jumlah;
        perBulan[key].keluar += t.jumlah;
        if (key === keyNow) keluarBulanIni += t.jumlah;
      }
    });

    const grafik = Object.keys(perBulan)
      .sort()
      .slice(-6)
      .map((k) => ({ bulan: namaBulan(k), ...perBulan[k] }));

    return { saldo, masukBulanIni, keluarBulanIni, grafik };
  }, []);

  const maxGrafik = Math.max(...grafik.flatMap((g) => [g.masuk, g.keluar]), 1);
  const terbaru = [...transaksi].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5);

  const stats = [
    { label: "Saldo Kas", value: rupiah(saldo), color: "bg-blue-500" },
    { label: "Pemasukan Bulan Ini", value: rupiah(masukBulanIni), color: "bg-green-500" },
    { label: "Pengeluaran Bulan Ini", value: rupiah(keluarBulanIni), color: "bg-red-500" },
    { label: "Iuran Belum Bayar", value: `${iuranBelumBayar} anggota`, color: "bg-amber-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Bendahara</h1>
        <p className="text-gray-500">Ringkasan kondisi keuangan organisasi.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
            <div className={`${s.color} w-12 h-12 rounded-lg shrink-0`} />
            <div className="min-w-0">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-lg font-semibold text-gray-800 truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik sederhana */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Arus Kas 6 Bulan Terakhir</h2>
          <div className="flex gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1"><i className="w-3 h-3 bg-green-500 inline-block rounded-sm" /> Pemasukan</span>
            <span className="flex items-center gap-1"><i className="w-3 h-3 bg-red-500 inline-block rounded-sm" /> Pengeluaran</span>
          </div>
          <div className="flex items-end gap-4 h-48">
            {grafik.map((g) => (
              <div key={g.bulan} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1 w-full h-full justify-center">
                  <div
                    className="w-1/3 bg-green-500 rounded-t"
                    style={{ height: `${(g.masuk / maxGrafik) * 100}%` }}
                    title={rupiah(g.masuk)}
                  />
                  <div
                    className="w-1/3 bg-red-500 rounded-t"
                    style={{ height: `${(g.keluar / maxGrafik) * 100}%` }}
                    title={rupiah(g.keluar)}
                  />
                </div>
                <span className="text-xs text-gray-500">{g.bulan}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Transaksi terbaru */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaksi Terbaru</h2>
          <ul className="divide-y">
            {terbaru.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{t.keterangan}</p>
                  <p className="text-xs text-gray-400">{formatTanggal(t.tanggal)}</p>
                </div>
                <span className={`font-semibold whitespace-nowrap ${t.jenis === "Pemasukan" ? "text-green-600" : "text-red-600"}`}>
                  {t.jenis === "Pemasukan" ? "+" : "-"} {rupiah(t.jumlah)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}