import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

// ===================== Types =====================
type Jabatan =
  | "Ketua"
  | "Wakil Ketua"
  | "Sekretaris"
  | "Bendahara"
  | "Koordinator Seksi"
  | "Anggota Seksi";

type Status = "Aktif" | "Nonaktif";

interface Pengurus {
  id: number;
  nama: string;
  jabatan: Jabatan;
  email: string;
  noHp: string;
  periode: string;
  status: Status;
}

type PengurusForm = Omit<Pengurus, "id">;

// ===================== Constants =====================
const DAFTAR_JABATAN: Jabatan[] = [
  "Ketua",
  "Wakil Ketua",
  "Sekretaris",
  "Bendahara",
  "Koordinator Seksi",
  "Anggota Seksi",
];

const ITEMS_PER_PAGE = 5;

const FORM_KOSONG: PengurusForm = {
  nama: "",
  jabatan: "Anggota Seksi",
  email: "",
  noHp: "",
  periode: "2025/2026",
  status: "Aktif",
};

const DATA_AWAL: Pengurus[] = [
  { id: 1, nama: "Ahmad Fauzi", jabatan: "Ketua", email: "ahmad.fauzi@mail.com", noHp: "081234567801", periode: "2025/2026", status: "Aktif" },
  { id: 2, nama: "Siti Nurhaliza", jabatan: "Wakil Ketua", email: "siti.nur@mail.com", noHp: "081234567802", periode: "2025/2026", status: "Aktif" },
  { id: 3, nama: "Budi Santoso", jabatan: "Sekretaris", email: "budi.s@mail.com", noHp: "081234567803", periode: "2025/2026", status: "Aktif" },
  { id: 4, nama: "Dewi Lestari", jabatan: "Bendahara", email: "dewi.l@mail.com", noHp: "081234567804", periode: "2025/2026", status: "Aktif" },
  { id: 5, nama: "Rizky Pratama", jabatan: "Koordinator Seksi", email: "rizky.p@mail.com", noHp: "081234567805", periode: "2025/2026", status: "Aktif" },
  { id: 6, nama: "Anisa Rahma", jabatan: "Anggota Seksi", email: "anisa.r@mail.com", noHp: "081234567806", periode: "2024/2025", status: "Nonaktif" },
  { id: 7, nama: "Dimas Saputra", jabatan: "Anggota Seksi", email: "dimas.s@mail.com", noHp: "081234567807", periode: "2025/2026", status: "Aktif" },
];

// ===================== Helpers =====================
const badgeJabatan: Record<Jabatan, string> = {
  Ketua: "bg-purple-100 text-purple-700",
  "Wakil Ketua": "bg-indigo-100 text-indigo-700",
  Sekretaris: "bg-blue-100 text-blue-700",
  Bendahara: "bg-emerald-100 text-emerald-700",
  "Koordinator Seksi": "bg-amber-100 text-amber-700",
  "Anggota Seksi": "bg-gray-100 text-gray-700",
};

const inisial = (nama: string): string =>
  nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

// ===================== Component =====================
export default function DataPengurus() {
  const [data, setData] = useState<Pengurus[]>(DATA_AWAL);
  const [search, setSearch] = useState<string>("");
  const [filterJabatan, setFilterJabatan] = useState<Jabatan | "Semua">("Semua");
  const [filterStatus, setFilterStatus] = useState<Status | "Semua">("Semua");
  const [page, setPage] = useState<number>(1);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PengurusForm>(FORM_KOSONG);
  const [deleteTarget, setDeleteTarget] = useState<Pengurus | null>(null);

  // ---------- Filter + pagination ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      const cocokSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.noHp.includes(q);
      const cocokJabatan = filterJabatan === "Semua" || p.jabatan === filterJabatan;
      const cocokStatus = filterStatus === "Semua" || p.status === filterStatus;
      return cocokSearch && cocokJabatan && cocokStatus;
    });
  }, [data, search, filterJabatan, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalAktif = data.filter((p) => p.status === "Aktif").length;

  // ---------- Handlers ----------
  const resetPage = () => setPage(1);

  const bukaTambah = () => {
    setEditId(null);
    setForm(FORM_KOSONG);
    setShowForm(true);
  };

  const bukaEdit = (p: Pengurus) => {
    const { id, ...rest } = p;
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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editId !== null) {
      setData((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...form } : p))
      );
    } else {
      const idBaru = data.length ? Math.max(...data.map((p) => p.id)) + 1 : 1;
      setData((prev) => [...prev, { id: idBaru, ...form }]);
    }
    tutupForm();
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
          <h1 className="text-2xl font-bold text-gray-800">Data Pengurus</h1>
          <p className="text-sm text-gray-500">
            Kelola data pengurus organisasi.
          </p>
        </div>
        <button
          onClick={bukaTambah}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
        >
          <span className="text-lg leading-none">+</span> Tambah Pengurus
        </button>
      </div>

      {/* Ringkasan */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Pengurus</p>
          <p className="text-2xl font-bold text-gray-800">{data.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Aktif</p>
          <p className="text-2xl font-bold text-emerald-600">{totalAktif}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Nonaktif</p>
          <p className="text-2xl font-bold text-red-500">
            {data.length - totalAktif}
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
          placeholder="Cari nama, email, atau no. HP..."
          className={`${inputClass} md:flex-1`}
        />
        <select
          value={filterJabatan}
          onChange={(e) => {
            setFilterJabatan(e.target.value as Jabatan | "Semua");
            resetPage();
          }}
          className={`${inputClass} md:w-48`}
        >
          <option value="Semua">Semua Jabatan</option>
          {DAFTAR_JABATAN.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as Status | "Semua");
            resetPage();
          }}
          className={`${inputClass} md:w-40`}
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Data pengurus tidak ditemukan.
                  </td>
                </tr>
              ) : (
                pageData.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {inisial(p.nama)}
                        </div>
                        <span className="font-medium text-gray-800">{p.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeJabatan[p.jabatan]}`}
                      >
                        {p.jabatan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{p.email}</p>
                      <p className="text-xs text-gray-500">{p.noHp}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.periode}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.status === "Aktif"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => bukaEdit(p)}
                          className="rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                        >
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
            Menampilkan{" "}
            {filtered.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} dari{" "}
            {filtered.length} data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`rounded-md border px-3 py-1 ${
                  n === currentPage
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}
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
              {editId !== null ? "Edit Pengurus" : "Tambah Pengurus"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Jabatan
                  </label>
                  <select
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {DAFTAR_JABATAN.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Periode
                  </label>
                  <input
                    name="periode"
                    value={form.periode}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="2025/2026"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="nama@email.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    No. HP
                  </label>
                  <input
                    name="noHp"
                    value={form.noHp}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={tutupForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
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
            <h2 className="text-lg font-semibold text-gray-800">Hapus Pengurus?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Data <span className="font-semibold">{deleteTarget.nama}</span>{" "}
              akan dihapus dan tidak dapat dikembalikan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiHapus}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}