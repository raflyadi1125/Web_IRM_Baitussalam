import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file halaman Anda
import { useTheme } from "../../contexts/ThemeContext";

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
const BADGE_JABATAN_DARK: Record<Jabatan, string> = {
  Ketua: "bg-purple-400/15 text-purple-300",
  "Wakil Ketua": "bg-indigo-400/15 text-indigo-300",
  Sekretaris: "bg-sky-400/15 text-sky-300",
  Bendahara: "bg-emerald-400/15 text-emerald-300",
  "Koordinator Seksi": "bg-amber-400/15 text-amber-300",
  "Anggota Seksi": "bg-white/[0.06] text-white/60",
};

const BADGE_JABATAN_LIGHT: Record<Jabatan, string> = {
  Ketua: "bg-purple-100 text-purple-700",
  "Wakil Ketua": "bg-indigo-100 text-indigo-700",
  Sekretaris: "bg-sky-100 text-sky-700",
  Bendahara: "bg-emerald-100 text-emerald-700",
  "Koordinator Seksi": "bg-amber-100 text-amber-700",
  "Anggota Seksi": "bg-slate-100 text-slate-600",
};

const inisial = (nama: string): string =>
  nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

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

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Token warna sesuai tema (tidak bergantung pada CSS tema lama)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        line: "border-white/10",
        divider: "divide-white/10",
        thead: "bg-white/[0.03] text-white/50",
        rowHover: "hover:bg-white/[0.03]",
        field:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/60 focus:ring-lime-300/20 [color-scheme:dark]",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        avatar: "bg-lime-300 text-[#10150c]",
        badgeOn: "bg-lime-300/15 text-lime-300",
        badgeOff: "bg-red-400/15 text-red-300",
        jabatan: BADGE_JABATAN_DARK,
        ghost: "border-white/10 text-white/70 hover:bg-white/[0.06]",
        pageOn: "border-lime-300 bg-lime-300 text-[#10150c]",
        edit: "text-white/50 hover:bg-lime-300/10 hover:text-lime-300",
        del: "text-white/50 hover:bg-red-500/10 hover:text-red-400",
        primary: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        danger: "bg-red-500 text-white hover:bg-red-400",
        modal: "border border-white/10 bg-[#141811] text-white",
        backdrop: "bg-black/60",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        line: "border-slate-100",
        divider: "divide-slate-100",
        thead: "bg-slate-50 text-slate-500",
        rowHover: "hover:bg-slate-50",
        field:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        avatar: "bg-lime-400 text-[#10150c]",
        badgeOn: "bg-lime-100 text-lime-800",
        badgeOff: "bg-red-100 text-red-600",
        jabatan: BADGE_JABATAN_LIGHT,
        ghost: "border-slate-200 text-slate-600 hover:bg-slate-50",
        pageOn: "border-lime-400 bg-lime-400 text-[#10150c]",
        edit: "text-slate-500 hover:bg-lime-50 hover:text-lime-700",
        del: "text-slate-500 hover:bg-red-50 hover:text-red-600",
        primary: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
        modal: "border border-slate-200 bg-white text-slate-900",
        backdrop: "bg-slate-900/40",
      };

  const field = `w-full border text-sm focus:outline-none focus:ring-2 ${c.field}`;

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

  const ringkasan = [
    { label: "Total Pengurus", nilai: data.length, icon: Users },
    { label: "Aktif", nilai: totalAktif, icon: UserCheck },
    { label: "Nonaktif", nilai: data.length - totalAktif, icon: UserX },
  ];

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
    <div className="space-y-5">
      {/* Judul */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-semibold ${c.title}`}>Data Pengurus</h2>
          <p className={`mt-0.5 text-sm ${c.muted}`}>
            Kelola data pengurus organisasi.
          </p>
        </div>
        <button
          type="button"
          onClick={bukaTambah}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${c.primary}`}
        >
          <Plus className="h-4 w-4" />
          Tambah Pengurus
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-5 sm:grid-cols-3">
        {ringkasan.map(({ label, nilai, icon: Icon }) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-4 rounded-3xl border p-6 ${c.card}`}
          >
            <div>
              <p className={`text-sm font-medium ${c.text}`}>{label}</p>
              <p
                className={`mt-2 text-3xl font-semibold tracking-tight ${c.title}`}
              >
                {nilai}
              </p>
            </div>
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className={`overflow-hidden rounded-3xl border ${c.card}`}>
        {/* Toolbar */}
        <div className={`flex flex-wrap items-center gap-3 border-b p-5 ${c.line}`}>
          <div className="relative min-w-[240px] flex-1">
            <Search
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Cari nama, email, atau no. HP..."
              className={`${field} rounded-full py-2.5 pl-11 pr-4`}
            />
          </div>
          <select
            value={filterJabatan}
            onChange={(e) => {
              setFilterJabatan(e.target.value as Jabatan | "Semua");
              resetPage();
            }}
            className={`${field} !w-auto rounded-full px-4 py-2.5`}
          >
            <option value="Semua">Semua jabatan</option>
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
            className={`${field} !w-auto rounded-full px-4 py-2.5`}
          >
            <option value="Semua">Semua status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className={c.thead}>
              <tr>
                <th className="px-5 py-3 font-medium">No</th>
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Jabatan</th>
                <th className="px-5 py-3 font-medium">Kontak</th>
                <th className="px-5 py-3 font-medium">Periode</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-5 py-12 text-center ${c.muted}`}>
                    Data pengurus tidak ditemukan.
                  </td>
                </tr>
              ) : (
                pageData.map((p, i) => (
                  <tr key={p.id} className={`transition-colors ${c.rowHover}`}>
                    <td className={`px-5 py-4 ${c.muted}`}>
                      {startIndex + i + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${c.avatar}`}
                        >
                          {inisial(p.nama)}
                        </div>
                        <span
                          className={`whitespace-nowrap font-medium ${c.title}`}
                        >
                          {p.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${c.jabatan[p.jabatan]}`}
                      >
                        {p.jabatan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className={c.text}>{p.email}</p>
                      <p className={`text-xs ${c.muted}`}>{p.noHp}</p>
                    </td>
                    <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>
                      {p.periode}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.status === "Aktif" ? c.badgeOn : c.badgeOff
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => bukaEdit(p)}
                          aria-label={`Ubah ${p.nama}`}
                          className={`rounded-full p-2 transition-colors ${c.edit}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          aria-label={`Hapus ${p.nama}`}
                          className={`rounded-full p-2 transition-colors ${c.del}`}
                        >
                          <Trash2 className="h-4 w-4" />
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
        <div
          className={`flex flex-col items-center justify-between gap-3 border-t px-5 py-4 text-sm sm:flex-row ${c.line} ${c.muted}`}
        >
          <p>
            Menampilkan {filtered.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} dari{" "}
            {filtered.length} data
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Halaman sebelumnya"
              className={`rounded-full border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${c.ghost}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={`h-9 min-w-9 rounded-full border px-3 text-sm font-medium transition-colors ${
                  n === currentPage ? c.pageOn : c.ghost
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Halaman berikutnya"
              className={`rounded-full border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${c.ghost}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${c.backdrop}`}
        >
          <div
            className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-7 shadow-2xl ${c.modal}`}
          >
            <h2 className="mb-5 text-xl font-semibold">
              {editId !== null ? "Edit Pengurus" : "Tambah Pengurus"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Nama Lengkap
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  className={`${field} rounded-xl px-4 py-2.5`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                    Jabatan
                  </label>
                  <select
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleChange}
                    className={`${field} rounded-xl px-4 py-2.5`}
                  >
                    {DAFTAR_JABATAN.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                    Periode
                  </label>
                  <input
                    name="periode"
                    value={form.periode}
                    onChange={handleChange}
                    required
                    className={`${field} rounded-xl px-4 py-2.5`}
                    placeholder="2025/2026"
                  />
                </div>
              </div>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`${field} rounded-xl px-4 py-2.5`}
                  placeholder="nama@email.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                    No. HP
                  </label>
                  <input
                    name="noHp"
                    value={form.noHp}
                    onChange={handleChange}
                    required
                    className={`${field} rounded-xl px-4 py-2.5`}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${field} rounded-xl px-4 py-2.5`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={tutupForm}
                  className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${c.ghost}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${c.primary}`}
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
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${c.backdrop}`}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-7 shadow-2xl ${c.modal}`}
          >
            <h2 className="text-xl font-semibold">Hapus Pengurus?</h2>
            <p className={`mt-2 text-sm ${c.text}`}>
              Data <span className="font-semibold">{deleteTarget.nama}</span>{" "}
              akan dihapus dan tidak dapat dikembalikan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${c.ghost}`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={konfirmasiHapus}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${c.danger}`}
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