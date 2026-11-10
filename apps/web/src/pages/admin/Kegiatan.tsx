import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarClock,
  Radio,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock,
  MapPin,
  UserRound,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file halaman Anda
import { useTheme } from "../../contexts/ThemeContext";

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

const IKON_STATUS: Record<StatusKegiatan, LucideIcon> = {
  "Akan Datang": CalendarClock,
  Berlangsung: Radio,
  Selesai: CheckCircle2,
  Dibatalkan: XCircle,
};

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
const BADGE_STATUS_DARK: Record<StatusKegiatan, string> = {
  "Akan Datang": "bg-sky-400/15 text-sky-300",
  Berlangsung: "bg-amber-400/15 text-amber-300",
  Selesai: "bg-lime-300/15 text-lime-300",
  Dibatalkan: "bg-red-400/15 text-red-300",
};

const BADGE_STATUS_LIGHT: Record<StatusKegiatan, string> = {
  "Akan Datang": "bg-sky-100 text-sky-700",
  Berlangsung: "bg-amber-100 text-amber-700",
  Selesai: "bg-lime-100 text-lime-800",
  Dibatalkan: "bg-red-100 text-red-600",
};

const formatTanggal = (tanggal: string): string =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ===================== Component =====================
export default function Kegiatan() {
  const [data, setData] = useState<Kegiatan[]>(DATA_AWAL);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<StatusKegiatan | "Semua">("Semua");

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KegiatanForm>(FORM_KOSONG);
  const [deleteTarget, setDeleteTarget] = useState<Kegiatan | null>(null);

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
        field:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/60 focus:ring-lime-300/20 [color-scheme:dark]",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        badge: BADGE_STATUS_DARK,
        ghost: "border-white/10 text-white/70 hover:bg-white/[0.06]",
        edit: "border-white/10 text-white/70 hover:border-lime-300/40 hover:bg-lime-300/10 hover:text-lime-300",
        del: "border-white/10 text-white/70 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400",
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
        field:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        badge: BADGE_STATUS_LIGHT,
        ghost: "border-slate-200 text-slate-600 hover:bg-slate-50",
        edit: "border-slate-200 text-slate-600 hover:border-lime-400 hover:bg-lime-50 hover:text-lime-700",
        del: "border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600",
        primary: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
        modal: "border border-slate-200 bg-white text-slate-900",
        backdrop: "bg-slate-900/40",
      };

  const field = `w-full border text-sm focus:outline-none focus:ring-2 ${c.field}`;

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

  const label = `mb-1.5 block text-sm font-medium ${c.text}`;

  // ---------- Render ----------
  return (
    <div className="space-y-5">
      {/* Judul */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-semibold ${c.title}`}>Kegiatan</h2>
          <p className={`mt-0.5 text-sm ${c.muted}`}>
            Kelola jadwal dan data kegiatan organisasi.
          </p>
        </div>
        <button
          type="button"
          onClick={bukaTambah}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${c.primary}`}
        >
          <Plus className="h-4 w-4" />
          Tambah Kegiatan
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {DAFTAR_STATUS.map((s) => {
          const Icon = IKON_STATUS[s];
          return (
            <div
              key={s}
              className={`flex items-center justify-between gap-4 rounded-3xl border p-6 ${c.card}`}
            >
              <div>
                <p className={`text-sm font-medium ${c.text}`}>{s}</p>
                <p
                  className={`mt-2 text-3xl font-semibold tracking-tight ${c.title}`}
                >
                  {hitung(s)}
                </p>
              </div>
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-3 rounded-3xl border p-5 ${c.card}`}
      >
        <div className="relative min-w-[240px] flex-1">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kegiatan, lokasi, atau penanggung jawab..."
            className={`${field} rounded-full py-2.5 pl-11 pr-4`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as StatusKegiatan | "Semua")
          }
          className={`${field} !w-auto rounded-full px-4 py-2.5`}
        >
          <option value="Semua">Semua status</option>
          {DAFTAR_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Daftar Kegiatan */}
      {filtered.length === 0 ? (
        <div
          className={`rounded-3xl border p-12 text-center ${c.card} ${c.muted}`}
        >
          Kegiatan tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((k) => (
            <div
              key={k.id}
              className={`flex flex-col rounded-3xl border p-6 ${c.card}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className={`font-semibold ${c.title}`}>{k.nama}</h3>
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${c.badge[k.status]}`}
                >
                  {k.status}
                </span>
              </div>
              <p className={`mb-4 line-clamp-3 text-sm ${c.text}`}>
                {k.deskripsi}
              </p>

              <ul className={`mb-5 space-y-2 text-sm ${c.text}`}>
                <li className="flex items-center gap-2.5">
                  <CalendarDays className={`h-4 w-4 shrink-0 ${c.muted}`} />
                  {formatTanggal(k.tanggal)}
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className={`h-4 w-4 shrink-0 ${c.muted}`} />
                  {k.waktu} WIB
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className={`h-4 w-4 shrink-0 ${c.muted}`} />
                  {k.lokasi}
                </li>
                <li className="flex items-center gap-2.5">
                  <UserRound className={`h-4 w-4 shrink-0 ${c.muted}`} />
                  PJ: {k.penanggungJawab}
                </li>
              </ul>

              <div className={`mt-auto flex gap-2 border-t pt-4 ${c.line}`}>
                <button
                  type="button"
                  onClick={() => bukaEdit(k)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${c.edit}`}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(k)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${c.del}`}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${c.backdrop}`}
        >
          <div
            className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-7 shadow-2xl ${c.modal}`}
          >
            <h2 className="mb-5 text-xl font-semibold">
              {editId !== null ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={label}>Nama Kegiatan</label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  className={`${field} rounded-xl px-4 py-2.5`}
                  placeholder="Masukkan nama kegiatan"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    required
                    className={`${field} rounded-xl px-4 py-2.5`}
                  />
                </div>
                <div>
                  <label className={label}>Waktu</label>
                  <input
                    type="time"
                    name="waktu"
                    value={form.waktu}
                    onChange={handleChange}
                    required
                    className={`${field} rounded-xl px-4 py-2.5`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Lokasi</label>
                  <input
                    name="lokasi"
                    value={form.lokasi}
                    onChange={handleChange}
                    required
                    className={`${field} rounded-xl px-4 py-2.5`}
                    placeholder="Tempat kegiatan"
                  />
                </div>
                <div>
                  <label className={label}>Penanggung Jawab</label>
                  <input
                    name="penanggungJawab"
                    value={form.penanggungJawab}
                    onChange={handleChange}
                    required
                    className={`${field} rounded-xl px-4 py-2.5`}
                    placeholder="Nama PJ"
                  />
                </div>
              </div>
              <div>
                <label className={label}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`${field} rounded-xl px-4 py-2.5`}
                >
                  {DAFTAR_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  rows={3}
                  className={`${field} rounded-xl px-4 py-2.5`}
                  placeholder="Deskripsi singkat kegiatan"
                />
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
            <h2 className="text-xl font-semibold">Hapus Kegiatan?</h2>
            <p className={`mt-2 text-sm ${c.text}`}>
              Kegiatan <span className="font-semibold">{deleteTarget.nama}</span>{" "}
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