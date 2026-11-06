import { FormEvent, useMemo, useState } from "react";

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
const dataAwal: Kegiatan[] = [
  {
    id: 1,
    judul: "Rapat Bulanan Anggota",
    deskripsi: "Evaluasi program kerja bulan lalu dan perencanaan bulan berikutnya.",
    tanggal: "2026-11-12",
    waktu: "19:00",
    lokasi: "Aula Utama",
    status: "Akan Datang",
  },
  {
    id: 2,
    judul: "Bakti Sosial",
    deskripsi: "Pembagian bantuan kepada warga sekitar.",
    tanggal: "2026-11-20",
    waktu: "08:00",
    lokasi: "Desa Cibiru",
    status: "Akan Datang",
  },
  {
    id: 3,
    judul: "Gotong Royong",
    deskripsi: "Membersihkan lingkungan sekretariat bersama.",
    tanggal: "2026-10-25",
    waktu: "07:30",
    lokasi: "Sekretariat",
    status: "Selesai",
  },
];

const STATUS: Status[] = ["Akan Datang", "Berlangsung", "Selesai"];

const badgeStyle: Record<Status, string> = {
  "Akan Datang": "bg-blue-100 text-blue-700",
  Berlangsung: "bg-green-100 text-green-700",
  Selesai: "bg-gray-200 text-gray-600",
};

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const formKosong = {
  judul: "",
  deskripsi: "",
  tanggal: "",
  waktu: "",
  lokasi: "",
  status: "Akan Datang" as Status,
};

export default function Kegiatan() {
  const [data, setData] = useState<Kegiatan[]>(dataAwal);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Status>("Semua");

  const hasil = useMemo(
    () =>
      data
        .filter(
          (k) =>
            (filter === "Semua" || k.status === filter) &&
            k.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
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
    if (!form.judul.trim()) return setError("Judul kegiatan wajib diisi.");
    if (!form.tanggal) return setError("Tanggal wajib diisi.");
    if (!form.lokasi.trim()) return setError("Lokasi wajib diisi.");

    const payload = { ...form, judul: form.judul.trim(), lokasi: form.lokasi.trim(), deskripsi: form.deskripsi.trim() };

    if (editId !== null) {
      // TODO: panggil API update
      setData((prev) => prev.map((k) => (k.id === editId ? { ...k, ...payload } : k)));
    } else {
      // TODO: panggil API create, pakai id dari server
      setData((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    tutupForm();
  };

  const handleEdit = (k: Kegiatan) => {
    setEditId(k.id);
    setForm({
      judul: k.judul,
      deskripsi: k.deskripsi,
      tanggal: k.tanggal,
      waktu: k.waktu,
      lokasi: k.lokasi,
      status: k.status,
    });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus kegiatan ini?")) return;
    // TODO: panggil API hapus
    setData((prev) => prev.filter((k) => k.id !== id));
    if (editId === id) tutupForm();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kegiatan</h1>
          <p className="text-gray-500">Kelola jadwal dan data kegiatan organisasi.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            + Tambah Kegiatan
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">{editId !== null ? "Edit Kegiatan" : "Tambah Kegiatan"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Judul</label>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Deskripsi</label>
              <textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Waktu</label>
              <input
                type="time"
                value={form.waktu}
                onChange={(e) => setForm({ ...form, waktu: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lokasi</label>
              <input
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              {editId !== null ? "Simpan Perubahan" : "Simpan"}
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
          placeholder="Cari kegiatan..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2 flex-wrap">
          {(["Semua", ...STATUS] as const).map((opt) => (
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

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Kegiatan</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hasil.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada kegiatan.
                </td>
              </tr>
            ) : (
              hasil.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{k.judul}</p>
                    {k.deskripsi && <p className="text-xs text-gray-500 line-clamp-1">{k.deskripsi}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatTanggal(k.tanggal)}
                    {k.waktu && <span className="text-gray-400"> • {k.waktu}</span>}
                  </td>
                  <td className="px-4 py-3">{k.lokasi}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${badgeStyle[k.status]}`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(k)} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}