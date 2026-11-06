import { useMemo, useState } from "react";

type Kategori = "Umum" | "Kegiatan" | "Keuangan";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: Kategori;
  tanggal: string; // ISO date
  penulis: string;
  isi: string;
}

// TODO: ganti dengan data dari API
const dataPengumuman: Pengumuman[] = [
  {
    id: 1,
    judul: "Jadwal Rapat Bulan November",
    kategori: "Kegiatan",
    tanggal: "2026-11-05",
    penulis: "Sekretaris",
    isi: "Rapat bulanan akan dilaksanakan pada tanggal 12 November 2026 pukul 19:00 WIB di Aula Utama. Seluruh anggota diharapkan hadir tepat waktu dan membawa laporan masing-masing divisi.",
  },
  {
    id: 2,
    judul: "Pembayaran Iuran Anggota",
    kategori: "Keuangan",
    tanggal: "2026-11-02",
    penulis: "Bendahara",
    isi: "Iuran bulan November dapat dibayarkan langsung kepada bendahara atau melalui transfer paling lambat tanggal 15 November 2026.",
  },
  {
    id: 3,
    judul: "Pembaruan Tata Tertib Organisasi",
    kategori: "Umum",
    tanggal: "2026-10-28",
    penulis: "Admin",
    isi: "Tata tertib organisasi telah diperbarui. Silakan baca dokumen lengkapnya di sekretariat atau hubungi pengurus untuk informasi lebih lanjut.",
  },
];

const kategoriOptions: ("Semua" | Kategori)[] = ["Semua", "Umum", "Kegiatan", "Keuangan"];

const badgeStyle: Record<Kategori, string> = {
  Umum: "bg-gray-100 text-gray-700",
  Kegiatan: "bg-blue-100 text-blue-700",
  Keuangan: "bg-amber-100 text-amber-700",
};

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function Pengumuman() {
  const [filter, setFilter] = useState<"Semua" | Kategori>("Semua");
  const [search, setSearch] = useState("");
  const [terbuka, setTerbuka] = useState<number | null>(null);

  const hasil = useMemo(
    () =>
      dataPengumuman
        .filter(
          (p) =>
            (filter === "Semua" || p.kategori === filter) &&
            p.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [filter, search]
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengumuman</h1>
        <p className="text-gray-500">Informasi terbaru dari pengurus organisasi.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengumuman..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2 flex-wrap">
          {kategoriOptions.map((opt) => (
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
        <p className="text-center text-gray-400 py-10">Tidak ada pengumuman ditemukan.</p>
      ) : (
        <div className="space-y-3">
          {hasil.map((p) => {
            const open = terbuka === p.id;
            return (
              <article key={p.id} className="bg-white border rounded-xl shadow-sm">
                <button
                  onClick={() => setTerbuka(open ? null : p.id)}
                  className="w-full text-left p-5 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${badgeStyle[p.kategori]}`}>
                        {p.kategori}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTanggal(p.tanggal)} • {p.penulis}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{p.judul}</h3>
                    {!open && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.isi}</p>}
                  </div>
                  <span className="text-gray-400">{open ? "▲" : "▼"}</span>
                </button>
                {open && <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">{p.isi}</div>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}