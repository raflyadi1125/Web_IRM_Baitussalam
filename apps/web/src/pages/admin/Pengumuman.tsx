import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

// ===================== Types =====================
type KategoriPengumuman = "Umum" | "Penting" | "Kegiatan" | "Keuangan";
type TargetPengumuman = "Semua" | "Pengurus" | "Anggota";
type StatusPengumuman = "Terbit" | "Draft";

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  kategori: KategoriPengumuman;
  target: TargetPengumuman;
  status: StatusPengumuman;
  tanggal: string; // YYYY-MM-DD
}

type PengumumanForm = Omit<Pengumuman, "id" | "tanggal">;

// ===================== Constants =====================
const DAFTAR_KATEGORI: KategoriPengumuman[] = ["Umum", "Penting", "Kegiatan", "Keuangan"];
const DAFTAR_TARGET: TargetPengumuman[] = ["Semua", "Pengurus", "Anggota"];

const FORM_KOSONG: PengumumanForm = {
  judul: "",
  isi: "",
  kategori: "Umum",
  target: "Semua",
  status: "Draft",
};

const DATA_AWAL: Pengumuman[] = [
  { id: 1, judul: "Rapat Evaluasi Bulanan", isi: "Diberitahukan kepada seluruh pengurus bahwa rapat evaluasi bulanan akan dilaksanakan pada Selasa, 10 November 2026 pukul 19.30 WIB di Aula Utama. Mohon hadir tepat waktu.", kategori: "Penting", target: "Pengurus", status: "Terbit", tanggal: "2026-11-05" },
  { id: 2, judul: "Jadwal Bakti Sosial Lingkungan", isi: "Kegiatan bakti sosial akan dilaksanakan pada 15 November 2026 di Taman Kota. Anggota yang ingin ikut dapat mendaftar ke sekretariat paling lambat 12 November.", kategori: "Kegiatan", target: "Semua", status: "Terbit", tanggal: "2026-11-03" },
  { id: 3, judul: "Pengingat Iuran Bulan November", isi: "Mohon kepada seluruh anggota untuk melunasi iuran bulan November paling lambat tanggal 15 melalui bendahara.", kategori: "Keuangan", target: "Anggota", status: "Terbit", tanggal: "2026-11-01" },
  { id: 4, judul: "Perubahan Jam Sekretariat", isi: "Mulai Desember 2026, sekretariat buka pukul 09.00–16.00 WIB pada hari kerja.", kategori: "Umum", target: "Semua", status: "Draft", tanggal: "2026-11-06" },
];

// ===================== Helpers =====================
const badgeKategori: Record<KategoriPengumuman, string> = {
  Umum: "bg-gray-100 text-gray-700",
  Penting: "bg-red-100 text-red-600",
  Kegiatan: "bg-blue-100 text-blue-700",
  Keuangan: "bg-emerald-100 text-emerald-700",
};

const formatTanggal = (tanggal: string): string =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

// ===================== Component =====================
export default function PengumumanAdmin() {
  const [data, setData] = useState<Pengumuman[]>(DATA_AWAL);
  const [search, setSearch] = useState<string>("");
  const [filterKategori, setFilterKategori] = useState<KategoriPengumuman | "Semua">("Semua");
  const [filterStatus, setFilterStatus] = useState<StatusPengumuman | "Semua">("Semua");

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PengumumanForm>(FORM_KOSONG);
  const [deleteTarget, setDeleteTarget] = useState<Pengumuman | null>(null);
  const [detail, setDetail] = useState<Pengumuman | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((p) => {
        const cocokSearch =
          !q || p.judul.toLowerCase().includes(q) || p.isi.toLowerCase().includes(q);
        const cocokKategori = filterKategori === "Semua" || p.kategori === filterKategori;
        const cocokStatus = filterStatus === "Semua" || p.status === filterStatus;
        return cocokSearch && cocokKategori && cocokStatus;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);
  }, [data, search, filterKategori, filterStatus]);

  const totalTerbit = data.filter((p) => p.status === "Terbit").length;

  // ---------- Handlers ----------
  const bukaTambah = () => {
    setEditId(null);
    setForm(FORM_KOSONG);
    setShowForm(true);
  };

  const bukaEdit = (p: Pengumuman) => {
    const { id, tanggal, ...rest } = p;
    setEditId(id);
    setForm(rest);
    setShowForm(true);
  };

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(FORM_KOSONG);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editId !== null) {
      setData((prev) => prev.map((p) => (p.id === editId ? { ...p, ...form } : p)));
    } else {
      const idBaru = data.length ? Math.max(...data.map((p) => p.id)) + 1 : 1;
      const hariIni = new Date().toISOString().slice(0, 10);
      setData((prev) => [...prev, { id: idBaru, tanggal: hariIni, ...form }]);
    }
    tutupForm();
  };

  const toggleStatus = (id: number) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "Terbit" ? "Draft" : "Terbit" } : p
      )
    );
  };

  const konfirmasiHapus = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengumuman</h1>
          <p className="text-sm text-gray-500">
            {totalTerbit} terbit, {data.length - totalTerbit} draft.
          </p>
        </div>
        <button
          onClick={bukaTambah}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
        >
          <span className="text-lg leading-none">+</span> Buat Pengumuman
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau isi pengumuman..."
          className={`${inputClass} md:flex-1`}
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value as KategoriPengumuman | "Semua")}
          className={`${inputClass} md:w-44`}
        >
          <option value="Semua">Semua Kategori</option>
          {DAFTAR_KATEGORI.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusPengumuman | "Semua")}
          className={`${inputClass} md:w-40`}
        >
          <option value="Semua">Semua Status</option>
          <option value="Terbit">Terbit</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Daftar */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-400 shadow-sm">
          Pengumuman tidak ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeKategori[p.kategori]}`}>
                  {p.kategori}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  Untuk: {p.target}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.status === "Terbit" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {p.status}
                </span>
                <span className="ml-auto text-xs text-gray-400">{formatTanggal(p.tanggal)}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{p.judul}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.isi}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setDetail(p)}
                  className="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
                >
                  Lihat
                </button>
                <button
                  onClick={() => toggleStatus(p.id)}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  {p.status === "Terbit" ? "Jadikan Draft" : "Terbitkan"}
                </button>
                <button
                  onClick={() => bukaEdit(p)}
                  className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeKategori[detail.kategori]}`}>
                {detail.kategori}
              </span>
              <span className="text-xs text-gray-400">{formatTanggal(detail.tanggal)}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{detail.judul}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{detail.isi}</p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editId !== null ? "Edit Pengumuman" : "Buat Pengumuman"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
                <input name="judul" value={form.judul} onChange={handleChange} required className={inputClass} placeholder="Judul pengumuman" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Isi Pengumuman</label>
                <textarea name="isi" value={form.isi} onChange={handleChange} required rows={5} className={inputClass} placeholder="Tulis isi pengumuman..." />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
                  <select name="kategori" value={form.kategori} onChange={handleChange} className={inputClass}>
                    {DAFTAR_KATEGORI.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ditujukan</label>
                  <select name="target" value={form.target} onChange={handleChange} className={inputClass}>
                    {DAFTAR_TARGET.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                    <option value="Draft">Draft</option>
                    <option value="Terbit">Terbit</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={tutupForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Batal
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {editId !== null ? "Simpan Perubahan" : "Simpan"}
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
            <h2 className="text-lg font-semibold text-gray-800">Hapus Pengumuman?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Pengumuman <span className="font-semibold">{deleteTarget.judul}</span> akan dihapus dan tidak dapat dikembalikan.
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