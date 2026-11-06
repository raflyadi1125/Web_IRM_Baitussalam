import { FormEvent, useMemo, useState } from "react";

type Jenis = "Pemasukan" | "Pengeluaran";

interface Transaksi {
  id: number;
  tanggal: string; // ISO date
  keterangan: string;
  jenis: Jenis;
  jumlah: number;
}

// TODO: ganti dengan data dari API
const dataAwal: Transaksi[] = [
  { id: 1, tanggal: "2026-11-05", keterangan: "Iuran anggota - November", jenis: "Pemasukan", jumlah: 1500000 },
  { id: 2, tanggal: "2026-11-04", keterangan: "Konsumsi rapat", jenis: "Pengeluaran", jumlah: 350000 },
  { id: 3, tanggal: "2026-11-02", keterangan: "Donasi sponsor", jenis: "Pemasukan", jumlah: 2000000 },
  { id: 4, tanggal: "2026-10-28", keterangan: "Sewa aula", jenis: "Pengeluaran", jumlah: 800000 },
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const hariIni = () => new Date().toISOString().slice(0, 10);

const formKosong = { tanggal: hariIni(), keterangan: "", jenis: "Pemasukan" as Jenis, jumlah: "" };

export default function Keuangan() {
  const [data, setData] = useState<Transaksi[]>(dataAwal);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Jenis>("Semua");

  const hasil = useMemo(
    () =>
      data
        .filter(
          (t) =>
            (filter === "Semua" || t.jenis === filter) &&
            t.keterangan.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [data, search, filter]
  );

  const totalMasuk = data.filter((t) => t.jenis === "Pemasukan").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = data.filter((t) => t.jenis === "Pengeluaran").reduce((s, t) => s + t.jumlah, 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const jumlah = Number(form.jumlah);

    if (!form.keterangan.trim()) return setError("Keterangan wajib diisi.");
    if (!form.tanggal) return setError("Tanggal wajib diisi.");
    if (!jumlah || jumlah <= 0) return setError("Jumlah harus lebih dari 0.");
    setError("");

    if (editId !== null) {
      setData((prev) =>
        prev.map((t) => (t.id === editId ? { ...t, ...form, keterangan: form.keterangan.trim(), jumlah } : t))
      );
    } else {
      // TODO: kirim ke API, lalu pakai id dari server
      setData((prev) => [...prev, { id: Date.now(), ...form, keterangan: form.keterangan.trim(), jumlah }]);
    }
    setForm({ ...formKosong, tanggal: hariIni() });
    setEditId(null);
  };

  const handleEdit = (t: Transaksi) => {
    setEditId(t.id);
    setForm({ tanggal: t.tanggal, keterangan: t.keterangan, jenis: t.jenis, jumlah: String(t.jumlah) });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    // TODO: panggil API hapus
    setData((prev) => prev.filter((t) => t.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({ ...formKosong, tanggal: hariIni() });
    }
  };

  const batalEdit = () => {
    setEditId(null);
    setForm({ ...formKosong, tanggal: hariIni() });
    setError("");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
        <p className="text-gray-500">Catat dan kelola pemasukan serta pengeluaran.</p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Pemasukan</p>
          <p className="text-lg font-semibold text-green-600">{rupiah(totalMasuk)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Pengeluaran</p>
          <p className="text-lg font-semibold text-red-600">{rupiah(totalKeluar)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className="text-lg font-semibold text-gray-800">{rupiah(totalMasuk - totalKeluar)}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 space-y-4" noValidate>
        <h2 className="font-semibold text-gray-800">{editId !== null ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm text-gray-600 mb-1">Jenis</label>
            <select
              value={form.jenis}
              onChange={(e) => setForm({ ...form, jenis: e.target.value as Jenis })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Pemasukan</option>
              <option>Pengeluaran</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Keterangan</label>
            <input
              type="text"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Contoh: Iuran anggota"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Jumlah (Rp)</label>
            <input
              type="number"
              min={0}
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
              placeholder="0"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            {editId !== null ? "Simpan Perubahan" : "Tambah"}
          </button>
          {editId !== null && (
            <button type="button" onClick={batalEdit} className="px-5 py-2 rounded-lg border hover:bg-gray-50">
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari transaksi..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          {(["Semua", "Pemasukan", "Pengeluaran"] as const).map((opt) => (
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

      {/* Tabel */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hasil.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada transaksi.
                </td>
              </tr>
            ) : (
              hasil.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatTanggal(t.tanggal)}</td>
                  <td className="px-4 py-3">{t.keterangan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        t.jenis === "Pemasukan" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.jenis}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{rupiah(t.jumlah)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(t)} className="text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">
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