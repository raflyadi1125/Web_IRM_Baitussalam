import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

// ===================== Types =====================
type StatusKegiatan = "Akan Datang" | "Berlangsung" | "Selesai" | "Dibatalkan";

interface Kegiatan {
  id: number;
  nama: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm
  lokasi: string;
  penanggungJawab: string;
  deskripsi: string;
  status: StatusKegiatan;
}

type KegiatanForm = Omit<Kegiatan, "id">;

// ===================== Constants =====================
const DAFTAR_STATUS: StatusKegiatan[] = [
  "Akan Datang",
  "Berlangsung",
  "Selesai",
  "Dibatalkan",
];

const FORM_KOSONG: KegiatanForm = {
  nama: "",
  tanggal: "",
  waktu: "08:00",
  lokasi: "",
  penanggungJawab: "",
  deskripsi: "",
  status: "Akan Datang",
};

const DATA_AWAL: Kegiatan[] = [
  { id: 1, nama: "Rapat Evaluasi Bulanan", tanggal: "2026-11-10", waktu: "19:30", lokasi: "Aula Utama", penanggungJawab: "Budi Santoso", deskripsi: "Evaluasi program kerja bulan Oktober dan perencanaan bulan berikutnya.", status: "Akan Datang" },
  { id: 2, nama: "Bakti Sosial Lingkungan", tanggal: "2026-11-15", waktu: "07:00", lokasi: "Taman Kota", penanggungJawab: "Rizky Pratama", deskripsi: "Kegiatan bersih-bersih taman kota bersama warga sekitar.", status: "Akan Datang" },
  { id: 3, nama: "Pelatihan Kepemimpinan", tanggal: "2026-11-06", waktu: "09:00", lokasi: "Ruang Serbaguna", penanggungJawab: "Ahmad Fauzi", deskripsi: "Pelatihan dasar kepemimpinan untuk anggota baru.", status: "Berlangsung" },
  { id: 4, nama: "Seminar Literasi Digital", tanggal: "2026-10-20", waktu: "13:00", lokasi: "Gedung A Lt. 2", penanggungJawab: "Siti Nurhaliza", deskripsi: "Seminar tentang keamanan dan etika bermedia digital.", status: "Selesai" },
  { id: 5, nama: "Turnamen Futsal Antar Anggota", tanggal: "2026-10-05", waktu: "15:00", lokasi: "Lapangan Futsal", penanggungJawab: "Dimas Saputra", deskripsi: "Turnamen persahabatan antar anggota.", status: "Dibatalkan" },
];

// ===================== Helpers =====================
const badgeStatus: Record<StatusKegiatan, string> = {
  "Akan Datang": "bg-blue-100 text-blue-700",
  Berlangsung: "bg-amber-100 text-amber-700",
  Selesai: "bg-emerald-100 text-emerald-700",
  Dibatalkan: "bg-red-100 text-red-600",
};

const formatTanggal = (tanggal: string): string =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

// ===================== Component =====================
export default function Kegiatan() {
  const [data, setData] = useState<Kegiatan[]>(DATA_AWAL);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<StatusKegiatan | "Semua">("Semua");

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KegiatanForm>(FORM_KOSONG);
  const [deleteTarget, setDeleteTarget] = useState<Kegiatan | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((k) => {
        const cocokSearch =
          !q ||
          k.nama.toLowerCase().includes(q) ||
          k.lokasi.toLowerCase().includes(q) ||
          k.penanggungJawab.toLowerCase().includes(q);
        const cocokStatus = filterStatus === "Semua" || k.status === filterStatus;
        return cocokSearch && cocokStatus;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [data, search, filterStatus]);

  const hitung = (s: StatusKegiatan) => data.filter((k) => k.status === s).length;

  // ---------- Handlers ----------
  const bukaTambah = () => {
    setEditId(null);
    setForm(FORM_KOSONG);
    setShowForm(true);
  };

  const bukaEdit = (k: Kegiatan) => {
    const { id, ...rest } = k;
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
      setData((prev) => prev.map((k) => (k.id === editId ? { ...k, ...form } : k)));
    } else {
      const idBaru = data.length ? Math.max(...data.map((k) => k.id)) + 1 : 1;
      setData((prev) => [...prev, { id: idBaru, ...form }]);
    }
    tutupForm();
  };

  const konfirmasiHapus = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kegiatan</h1>
          <p className="text-sm text-gray-500">Kelola jadwal dan data kegiatan organisasi.</p>
        </div>
        <button
          onClick={bukaTambah}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
        >
          <span className="text-lg leading-none">+</span> Tambah Kegiatan
        </button>
      </div>

      {/* Ringkasan */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DAFTAR_STATUS.map((s) => (
          <div key={s} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{s}</p>
            <p className="text-2xl font-bold text-gray-800">{hitung(s)}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama kegiatan, lokasi, atau penanggung jawab..."
          className={`${inputClass} md:flex-1`}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusKegiatan | "Semua")}
          className={`${inputClass} md:w-48`}
        >
          <option value="Semua">Semua Status</option>
          {DAFTAR_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Daftar Kegiatan */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-400 shadow-sm">
          Kegiatan tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((k) => (
            <div key={k.id} className="flex flex-col rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-800">{k.nama}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badgeStatus[k.status]}`}
                >
                  {k.status}
                </span>
              </div>
              <p className="mb-4 line-clamp-3 text-sm text-gray-600">{k.deskripsi}</p>
              <dl className="mb-4 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-gray-400">Tanggal</dt>
                  <dd className="text-gray-700">{formatTanggal(k.tanggal)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-gray-400">Waktu</dt>
                  <dd className="text-gray-700">{k.waktu} WIB</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-gray-400">Lokasi</dt>
                  <dd className="text-gray-700">{k.lokasi}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-gray-400">PJ</dt>
                  <dd className="text-gray-700">{k.penanggungJawab}</dd>
                </div>
              </dl>
              <div className="mt-auto flex gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => bukaEdit(k)}
                  className="flex-1 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(k)}
                  className="flex-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editId !== null ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Kegiatan</label>
                <input name="nama" value={form.nama} onChange={handleChange} required className={inputClass} placeholder="Masukkan nama kegiatan" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                  <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Waktu</label>
                  <input type="time" name="waktu" value={form.waktu} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi</label>
                  <input name="lokasi" value={form.lokasi} onChange={handleChange} required className={inputClass} placeholder="Tempat kegiatan" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Penanggung Jawab</label>
                  <input name="penanggungJawab" value={form.penanggungJawab} onChange={handleChange} required className={inputClass} placeholder="Nama PJ" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  {DAFTAR_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3} className={inputClass} placeholder="Deskripsi singkat kegiatan" />
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
            <h2 className="text-lg font-semibold text-gray-800">Hapus Kegiatan?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Kegiatan <span className="font-semibold">{deleteTarget.nama}</span> akan dihapus dan tidak dapat dikembalikan.
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