import { useMemo, useState } from "react";

type Status = "Akan Datang" | "Berlangsung" | "Selesai";

interface Kegiatan {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: string; // ISO date
  waktu: string;
  lokasi: string;
  status: Status;
}

// TODO: ganti dengan data dari API
const dataKegiatan: Kegiatan[] = [
  {
    id: 1,
    judul: "Rapat Bulanan Anggota",
    deskripsi: "Evaluasi program kerja bulan lalu dan perencanaan bulan berikutnya.",
    tanggal: "2026-11-12",
    waktu: "19:00 WIB",
    lokasi: "Aula Utama",
    status: "Akan Datang",
  },
  {
    id: 2,
    judul: "Bakti Sosial",
    deskripsi: "Kegiatan pembagian bantuan kepada warga sekitar.",
    tanggal: "2026-11-20",
    waktu: "08:00 WIB",
    lokasi: "Desa Cibiru",
    status: "Akan Datang",
  },
  {
    id: 3,
    judul: "Pelatihan Kepemimpinan",
    deskripsi: "Pelatihan soft skill dan kepemimpinan untuk seluruh anggota.",
    tanggal: "2026-11-06",
    waktu: "09:00 WIB",
    lokasi: "Ruang Seminar",
    status: "Berlangsung",
  },
  {
    id: 4,
    judul: "Gotong Royong",
    deskripsi: "Membersihkan lingkungan sekretariat bersama.",
    tanggal: "2026-10-25",
    waktu: "07:30 WIB",
    lokasi: "Sekretariat",
    status: "Selesai",
  },
];

const filterOptions: ("Semua" | Status)[] = ["Semua", "Akan Datang", "Berlangsung", "Selesai"];

const badgeStyle: Record<Status, string> = {
  "Akan Datang": "bg-blue-100 text-blue-700",
  Berlangsung: "bg-green-100 text-green-700",
  Selesai: "bg-gray-200 text-gray-600",
};

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function Kegiatan() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Status>("Semua");
  const [terdaftar, setTerdaftar] = useState<number[]>([3]);

  const hasil = useMemo(
    () =>
      dataKegiatan.filter(
        (k) =>
          (filter === "Semua" || k.status === filter) &&
          k.judul.toLowerCase().includes(search.toLowerCase())
      ),
    [search, filter]
  );

  const toggleDaftar = (id: number) =>
    setTerdaftar((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kegiatan</h1>
        <p className="text-gray-500">Lihat dan daftar kegiatan organisasi.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kegiatan..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                filter === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {hasil.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Tidak ada kegiatan ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasil.map((k) => {
            const sudahDaftar = terdaftar.includes(k.id);
            return (
              <div key={k.id} className="bg-white border rounded-xl shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800">{k.judul}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${badgeStyle[k.status]}`}>
                    {k.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex-1">{k.deskripsi}</p>
                <div className="text-sm text-gray-500 mt-3 space-y-1">
                  <p>📅 {formatTanggal(k.tanggal)} • {k.waktu}</p>
                  <p>📍 {k.lokasi}</p>
                </div>
                {k.status !== "Selesai" && (
                  <button
                    onClick={() => toggleDaftar(k.id)}
                    className={`mt-4 w-full py-2 rounded-lg text-sm font-medium ${
                      sudahDaftar
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {sudahDaftar ? "Batalkan Pendaftaran" : "Daftar Kegiatan"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}