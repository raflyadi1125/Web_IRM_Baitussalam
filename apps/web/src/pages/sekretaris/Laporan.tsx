import { FormEvent, useMemo, useState } from "react";

type Status = "Draft" | "Final";

interface Laporan {
  id: number;
  judul: string;
  kegiatan: string;
  tanggal: string; // ISO date
  peserta: number;
  ringkasan: string;
  status: Status;
}

// TODO: ganti dengan data dari API
const dataAwal: Laporan[] = [
  {
    id: 1,
    judul: "Laporan Gotong Royong",
    kegiatan: "Gotong Royong",
    tanggal: "2026-10-26",
    peserta: 42,
    ringkasan:
      "Kegiatan berjalan lancar. Lingkungan sekretariat berhasil dibersihkan dan area parkir ditata ulang.",
    status: "Final",
  },
  {
    id: 2,
    judul: "Laporan Pelatihan Kepemimpinan",
    kegiatan: "Pelatihan Kepemimpinan",
    tanggal: "2026-11-06",
    peserta: 30,
    ringkasan: "Pelatihan hari pertama membahas dasar komunikasi dan manajemen tim.",
    status: "Draft",
  },
];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const hariIni = () => new Date().toISOString().slice(0, 10);

const formKosong = {
  judul: "",
  kegiatan: "",
  tanggal: hariIni(),
  peserta: "",
  ringkasan: "",
  status: "Draft" as Status,
};

export default function Laporan() {
  const [data, setData] = useState<Laporan[]>(dataAwal);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Status>("Semua");
  const [detail, setDetail] = useState<Laporan | null>(null);

  const hasil = useMemo(
    () =>
      data
        .filter(
          (l) =>
            (filter === "Semua" || l.status === filter) &&
            l.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [data, search, filter]
  );

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...formKosong, tanggal: hariIni() });
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const peserta = Number(form.peserta);

    if (!form.judul.trim()) return setError("Judul laporan wajib diisi.");
    if (!form.kegiatan.trim()) return setError("Nama kegiatan wajib diisi.");
    if (!form.tanggal) return setError("Tanggal wajib diisi.");
    if (!Number.isFinite(peserta) || peserta < 0) return setError("Jumlah peserta tidak valid.");
    if (!form.ringkasan.trim()) return setError("Ringkasan laporan wajib diisi.");

    const payload = {
      ...form,
      judul: form.judul.trim(),
      kegiatan: form.kegiatan.trim(),
      ringkasan: form.ringkasan.trim(),
      peserta,
    };

    if (editId !== null) {
      // TODO: panggil API update
      setData((prev) => prev.map((l) => (l.id === editId ? { ...l, ...payload } : l)));
    } else {
      // TODO: panggil API create, pakai id dari server
      setData((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    tutupForm();
  };

  const handleEdit = (l: Laporan) => {
    setEditId(l.id);
    setForm({
      judul: l.judul,
      kegiatan: l.kegiatan,
      tanggal: l.tanggal,
      peserta: String(l.peserta),
      ringkasan: l.ringkasan,
      status: l.status,
    });
    setDetail(null);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus laporan ini?")) return;
    // TODO: panggil API hapus
    setData((prev) => prev.filter((l) => l.id !== id));
    if (editId === id) tutupForm();
    if (detail?.id === id) setDetail(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Kegiatan</h1>
          <p className="text-gray-500">Susun dan arsipkan laporan setiap kegiatan.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            + Buat Laporan
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="bg-white border rounded-xl p-5 space-y-4 print:hidden">
          <h2 className="font-semibold text-gray-800">{editId !== null ? "Edit Laporan" : "Buat Laporan"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Judul Laporan</label>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nama Kegiatan</label>
              <input
                value={form.kegiatan}
                onChange={(e) => setForm({ ...form, kegiatan: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tanggal Pelaksanaan</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Jumlah Peserta</label>
              <input
                type="number"
                min={0}
                value={form.peserta}
                onChange={(e) => setForm({ ...form, peserta: e.target.value })}
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
                <option>Draft</option>
                <option>Final</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Ringkasan / Hasil Kegiatan</label>
              <textarea
                rows={5}
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
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

      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari laporan..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          {(["Semua", "Draft", "Final"] as const).map((opt) => (
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

      {/* Detail laporan (bisa dicetak) */}
      {detail && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{detail.judul}</h2>
              <p className="text-sm text-gray-500">
                {detail.kegiatan} • {formatTanggal(detail.tanggal)}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                detail.status === "Final" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {detail.status}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Jumlah peserta:</span> {detail.peserta} orang
          </p>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Ringkasan</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{detail.ringkasan}</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Cetak
            </button>
            <button onClick={() => setDetail(null)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-x-auto print:hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Laporan</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3 text-right">Peserta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hasil.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada laporan.
                </td>
              </tr>
            ) : (
              hasil.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{l.judul}</p>
                    <p className="text-xs text-gray-500">{l.kegiatan}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatTanggal(l.tanggal)}</td>
                  <td className="px-4 py-3 text-right">{l.peserta}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        l.status === "Final" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setDetail(l)} className="text-gray-600 hover:underline mr-3">
                      Lihat
                    </button>
                    <button onClick={() => handleEdit(l)} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(l.id)} className="text-red-600 hover:underline">
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