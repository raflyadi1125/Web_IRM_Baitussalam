import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

// ===================== Types =====================
type Jenis = "Pemasukan" | "Pengeluaran";

interface Transaksi {
  id: number;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  kategori: string;
  jenis: Jenis;
  jumlah: number;
}

interface TransaksiForm {
  tanggal: string;
  keterangan: string;
  kategori: string;
  jenis: Jenis;
  jumlah: string; // string agar mudah diketik di input
}

// ===================== Constants =====================
const KATEGORI: Record<Jenis, string[]> = {
  Pemasukan: ["Iuran Anggota", "Donasi", "Sponsor", "Lainnya"],
  Pengeluaran: ["Operasional", "Kegiatan", "Konsumsi", "Perlengkapan", "Lainnya"],
};

const ITEMS_PER_PAGE = 8;

const FORM_KOSONG: TransaksiForm = {
  tanggal: "",
  keterangan: "",
  kategori: "Iuran Anggota",
  jenis: "Pemasukan",
  jumlah: "",
};

const DATA_AWAL: Transaksi[] = [
  { id: 1, tanggal: "2026-11-01", keterangan: "Iuran anggota bulan November", kategori: "Iuran Anggota", jenis: "Pemasukan", jumlah: 2500000 },
  { id: 2, tanggal: "2026-11-02", keterangan: "Konsumsi rapat bulanan", kategori: "Konsumsi", jenis: "Pengeluaran", jumlah: 350000 },
  { id: 3, tanggal: "2026-11-03", keterangan: "Donasi dari alumni", kategori: "Donasi", jenis: "Pemasukan", jumlah: 1500000 },
  { id: 4, tanggal: "2026-11-04", keterangan: "Cetak banner kegiatan", kategori: "Perlengkapan", jenis: "Pengeluaran", jumlah: 275000 },
  { id: 5, tanggal: "2026-10-28", keterangan: "Sponsor seminar literasi digital", kategori: "Sponsor", jenis: "Pemasukan", jumlah: 3000000 },
  { id: 6, tanggal: "2026-10-25", keterangan: "Sewa gedung seminar", kategori: "Kegiatan", jenis: "Pengeluaran", jumlah: 1200000 },
  { id: 7, tanggal: "2026-10-20", keterangan: "Biaya listrik dan internet sekretariat", kategori: "Operasional", jenis: "Pengeluaran", jumlah: 450000 },
  { id: 8, tanggal: "2026-10-01", keterangan: "Iuran anggota bulan Oktober", kategori: "Iuran Anggota", jenis: "Pemasukan", jumlah: 2400000 },
  { id: 9, tanggal: "2026-10-12", keterangan: "Alat tulis dan perlengkapan", kategori: "Perlengkapan", jenis: "Pengeluaran", jumlah: 180000 },
  { id: 10, tanggal: "2026-09-30", keterangan: "Iuran anggota bulan September", kategori: "Iuran Anggota", jenis: "Pemasukan", jumlah: 2300000 },
];

// ===================== Helpers =====================
const formatRupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatTanggal = (tanggal: string): string =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

// ===================== Component =====================
export default function Keuangan() {
  const [data, setData] = useState<Transaksi[]>(DATA_AWAL);
  const [search, setSearch] = useState<string>("");
  const [filterJenis, setFilterJenis] = useState<Jenis | "Semua">("Semua");
  const [filterBulan, setFilterBulan] = useState<string>(""); // YYYY-MM
  const [page, setPage] = useState<number>(1);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TransaksiForm>(FORM_KOSONG);
  const [deleteTarget, setDeleteTarget] = useState<Transaksi | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((t) => {
        const cocokSearch =
          !q ||
          t.keterangan.toLowerCase().includes(q) ||
          t.kategori.toLowerCase().includes(q);
        const cocokJenis = filterJenis === "Semua" || t.jenis === filterJenis;
        const cocokBulan = !filterBulan || t.tanggal.startsWith(filterBulan);
        return cocokSearch && cocokJenis && cocokBulan;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);
  }, [data, search, filterJenis, filterBulan]);

  // Ringkasan dihitung dari data yang sedang terfilter
  const totalMasuk = filtered
    .filter((t) => t.jenis === "Pemasukan")
    .reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluar = filtered
    .filter((t) => t.jenis === "Pengeluaran")
    .reduce((sum, t) => sum + t.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ---------- Handlers ----------
  const resetPage = () => setPage(1);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ ...FORM_KOSONG, tanggal: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const bukaEdit = (t: Transaksi) => {
    setEditId(t.id);
    setForm({
      tanggal: t.tanggal,
      keterangan: t.keterangan,
      kategori: t.kategori,
      jenis: t.jenis,
      jumlah: String(t.jumlah),
    });
    setShowForm(true);
  };

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(FORM_KOSONG);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJenisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const jenis = e.target.value as Jenis;
    // Reset kategori ke kategori pertama dari jenis yang dipilih
    setForm((prev) => ({ ...prev, jenis, kategori: KATEGORI[jenis][0] }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const jumlah = Number(form.jumlah);
    if (!jumlah || jumlah <= 0) return;

    const payload = {
      tanggal: form.tanggal,
      keterangan: form.keterangan,
      kategori: form.kategori,
      jenis: form.jenis,
      jumlah,
    };

    if (editId !== null) {
      setData((prev) => prev.map((t) => (t.id === editId ? { ...t, ...payload } : t)));
    } else {
      const idBaru = data.length ? Math.max(...data.map((t) => t.id)) + 1 : 1;
      setData((prev) => [...prev, { id: idBaru, ...payload }]);
    }
    tutupForm();
  };

  const konfirmasiHapus = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
          <p className="text-sm text-gray-500">Catat dan pantau pemasukan serta pengeluaran organisasi.</p>
        </div>
        <button
          onClick={bukaTambah}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
        >
          <span className="text-lg leading-none">+</span> Tambah Transaksi
        </button>
      </div>

      {/* Ringkasan */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Pemasukan</p>
          <p className="text-xl font-bold text-emerald-600">{formatRupiah(totalMasuk)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-500">{formatRupiah(totalKeluar)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className={`text-xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          placeholder="Cari keterangan atau kategori..."
          className={`${inputClass} md:flex-1`}
        />
        <input
          type="month"
          value={filterBulan}
          onChange={(e) => {
            setFilterBulan(e.target.value);
            resetPage();
          }}
          className={`${inputClass} md:w-44`}
        />
        <select
          value={filterJenis}
          onChange={(e) => {
            setFilterJenis(e.target.value as Jenis | "Semua");
            resetPage();
          }}
          className={`${inputClass} md:w-44`}
        >
          <option value="Semua">Semua Jenis</option>
          <option value="Pemasukan">Pemasukan</option>
          <option value="Pengeluaran">Pengeluaran</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Transaksi tidak ditemukan.
                  </td>
                </tr>
              ) : (
                pageData.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatTanggal(t.tanggal)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.keterangan}</td>
                    <td className="px-4 py-3 text-gray-600">{t.kategori}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.jenis === "Pemasukan"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t.jenis}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                        t.jenis === "Pemasukan" ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {t.jenis === "Pemasukan" ? "+" : "-"} {formatRupiah(t.jumlah)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => bukaEdit(t)} className="rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200">
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(t)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-600 sm:flex-row">
          <p>
            Menampilkan {filtered.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} transaksi
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editId !== null ? "Edit Transaksi" : "Tambah Transaksi"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                  <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Jenis</label>
                  <select name="jenis" value={form.jenis} onChange={handleJenisChange} className={inputClass}>
                    <option value="Pemasukan">Pemasukan</option>
                    <option value="Pengeluaran">Pengeluaran</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Keterangan</label>
                <input name="keterangan" value={form.keterangan} onChange={handleChange} required className={inputClass} placeholder="Contoh: Iuran anggota bulan November" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
                  <select name="kategori" value={form.kategori} onChange={handleChange} className={inputClass}>
                    {KATEGORI[form.jenis].map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                  <input type="number" min={1} name="jumlah" value={form.jumlah} onChange={handleChange} required className={inputClass} placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={tutupForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Batal
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {editId !== null ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800">Hapus Transaksi?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Transaksi <span className="font-semibold">{deleteTarget.keterangan}</span> sebesar{" "}
              <span className="font-semibold">{formatRupiah(deleteTarget.jumlah)}</span> akan dihapus.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Batal
              </button>
              <button onClick={konfirmasiHapus} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}