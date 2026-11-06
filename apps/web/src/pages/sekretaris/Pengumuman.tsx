import { FormEvent, useMemo, useState } from "react";

type Kategori = "Umum" | "Kegiatan" | "Keuangan";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: Kategori;
  tanggal: string; // ISO date
  isi: string;
  penting: boolean;
}

// TODO: ganti dengan data dari API
const dataAwal: Pengumuman[] = [
  {
    id: 1,
    judul: "Jadwal Rapat Bulan November",
    kategori: "Kegiatan",
    tanggal: "2026-11-05",
    isi: "Rapat bulanan akan dilaksanakan pada 12 November 2026 pukul 19:00 WIB di Aula Utama. Seluruh anggota diharapkan hadir tepat waktu.",
    penting: true,
  },
  {
    id: 2,
    judul: "Pembayaran Iuran Anggota",
    kategori: "Keuangan",
    tanggal: "2026-11-02",
    isi: "Iuran bulan November dapat dibayarkan kepada bendahara paling lambat tanggal 15 November 2026.",
    penting: false,
  },
  {
    id: 3,
    judul: "Pembaruan Tata Tertib Organisasi",
    kategori: "Umum",
    tanggal: "2026-10-28",
    isi: "Tata tertib organisasi telah diperbarui. Dokumen lengkap tersedia di sekretariat.",
    penting: false,
  },
];

const KATEGORI: Kategori[] = ["Umum", "Kegiatan", "Keuangan"];

const badgeStyle: Record<Kategori, string> = {
  Umum: "bg-gray-100 text-gray-700",
  Kegiatan: "bg-blue-100 text-blue-700",
  Keuangan: "bg-amber-100 text-amber-700",
};

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const hariIni = () => new Date().toISOString().slice(0, 10);

const formKosong = { judul: "", kategori: "Umum" as Kategori, isi: "", penting: false };

export default function Pengumuman() {
  const [data, setData] = useState<Pengumuman[]>(dataAwal);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Kategori>("Semua");

  const hasil = useMemo(
    () =>
      data
        .filter(
          (p) =>
            (filter === "Semua" || p.kategori === filter) &&
            p.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => Number(b.penting) - Number(a.penting) || b.tanggal.localeCompare(a.tanggal)),
    [data, search, filter]
  );

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(formKosong);
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim()) return setError("Judul wajib diisi.");
    if (!form.isi.trim()) return setError("Isi pengumuman wajib diisi.");

    const payload = { ...form, judul: form.judul.trim(), isi: form.isi.trim() };

    if (editId !== null) {
      // TODO: panggil API update
      setData((prev) => prev.map((p) => (p.id === editId ? { ...p, ...payload } : p)));
    } else {
      // TODO: panggil API create, pakai id dari server
      setData((prev) => [...prev, { id: Date.now(), tanggal: hariIni(), ...payload }]);
    }
    tutupForm();
  };

  const handleEdit = (p: Pengumuman) => {
    setEditId(p.id);
    setForm({ judul: p.judul, kategori: p.kategori, isi: p.isi, penting: p.penting });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus pengumuman ini?")) return;
    // TODO: panggil API hapus
    setData((prev) => prev.filter((p) => p.id !== id));
    if (editId === id) tutupForm();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengumuman</h1>
          <p className="text-gray-500">Buat dan kelola pengumuman untuk anggota.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            + Buat Pengumuman
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">{editId !== null ? "Edit Pengumuman" : "Buat Pengumuman"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Judul</label>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value as Kategori })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {KATEGORI.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Isi Pengumuman</label>
              <textarea
                rows={5}
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.penting}
              onChange={(e) => setForm({ ...form, penting: e.target.checked })}
            />
            Tandai sebagai penting (tampil paling atas)
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              {editId !== null ? "Simpan Perubahan" : "Publikasikan"}
            </button>
            <button type="button" onClick={tutupForm} className="px-5 py-2 rounded-lg border hover:bg-gray-50">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengumuman..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2 flex-wrap">
          {(["Semua", ...KATEGORI] as const).map((opt) => (
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
        <p className="text-center text-gray-400 py-10">Tidak ada pengumuman.</p>
      ) : (
        <div className="space-y-3">
          {hasil.map((p) => (
            <article
              key={p.id}
              className={`bg-white border rounded-xl p-5 ${p.penting ? "border-l-4 border-l-red-500" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${badgeStyle[p.kategori]}`}>{p.kategori}</span>
                    {p.penting && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Penting</span>
                    )}
                    <span className="text-xs text-gray-400">{formatTanggal(p.tanggal)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{p.judul}</h3>
                </div>
                <div className="text-sm whitespace-nowrap">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-3">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{p.isi}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}