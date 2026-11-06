import { useMemo } from "react";

interface Kegiatan {
  id: number;
  judul: string;
  tanggal: string; // ISO date
  lokasi: string;
  status: "Akan Datang" | "Berlangsung" | "Selesai";
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

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function Dashboard() {
  const stats = useMemo(
    () => [
      { label: "Total Kegiatan", value: kegiatan.length, color: "bg-blue-500" },
      {
        label: "Kegiatan Mendatang",
        value: kegiatan.filter((k) => k.status === "Akan Datang").length,
        color: "bg-green-500",
      },
      { label: "Pengumuman", value: pengumuman.length, color: "bg-amber-500" },
      {
        label: "Laporan Draft",
        value: laporan.filter((l) => l.status === "Draft").length,
        color: "bg-purple-500",
      },
    ],
    []
  );

  const mendatang = kegiatan
    .filter((k) => k.status !== "Selesai")
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const pengumumanTerbaru = [...pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5);
  const laporanTerbaru = [...laporan].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Sekretaris</h1>
        <p className="text-gray-500">Ringkasan kegiatan, pengumuman, dan laporan organisasi.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
            <div className={`${s.color} w-12 h-12 rounded-lg`} />
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-semibold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Kegiatan Terdekat</h2>
          <ul className="space-y-3">
            {mendatang.map((k) => (
              <li key={k.id} className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-gray-800">{k.judul}</p>
                <p className="text-sm text-gray-500">
                  {formatTanggal(k.tanggal)} • {k.lokasi}
                </p>
              </li>
            ))}
            {mendatang.length === 0 && <p className="text-sm text-gray-400">Belum ada kegiatan.</p>}
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengumuman Terbaru</h2>
          <ul className="space-y-3">
            {pengumumanTerbaru.map((p) => (
              <li key={p.id}>
                <p className="font-medium text-gray-800">{p.judul}</p>
                <p className="text-xs text-gray-400">
                  {formatTanggal(p.tanggal)} • {p.kategori}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Laporan Terbaru</h2>
          <ul className="space-y-3">
            {laporanTerbaru.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{l.judul}</p>
                  <p className="text-xs text-gray-400">{formatTanggal(l.tanggal)}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    l.status === "Final" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {l.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}