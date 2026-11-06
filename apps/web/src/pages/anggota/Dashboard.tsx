import { useMemo } from "react";

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

export default function Dashboard() {
  const stats = useMemo(
    () => [
      { label: "Kegiatan Diikuti", value: 8, color: "bg-blue-500" },
      { label: "Kegiatan Mendatang", value: kegiatanMendatang.length, color: "bg-green-500" },
      { label: "Pengumuman Baru", value: pengumumanTerbaru.length, color: "bg-amber-500" },
      { label: "Status Iuran", value: "Lunas", color: "bg-purple-500" },
    ],
    []
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Anggota</h1>
        <p className="text-gray-500">Selamat datang kembali! Berikut ringkasan aktivitas Anda.</p>
      </div>

      {/* Statistik */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kegiatan mendatang */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Kegiatan Mendatang</h2>
          <ul className="space-y-3">
            {kegiatanMendatang.map((k) => (
              <li key={k.id} className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-gray-800">{k.judul}</p>
                <p className="text-sm text-gray-500">
                  {formatTanggal(k.tanggal)} • {k.lokasi}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Pengumuman terbaru */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengumuman Terbaru</h2>
          <ul className="space-y-4">
            {pengumumanTerbaru.map((p) => (
              <li key={p.id}>
                <p className="font-medium text-gray-800">{p.judul}</p>
                <p className="text-xs text-gray-400 mb-1">{formatTanggal(p.tanggal)}</p>
                <p className="text-sm text-gray-600">{p.ringkasan}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}