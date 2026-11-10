import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  FileText,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file dashboard Anda
import { useTheme } from "../../contexts/ThemeContext";

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

const FILTER_KATEGORI: readonly (KategoriPengumuman | "Semua")[] = ["Semua", ...DAFTAR_KATEGORI];
const FILTER_STATUS: readonly (StatusPengumuman | "Semua")[] = ["Semua", "Terbit", "Draft"];

const FORM_KOSONG: PengumumanForm = {
  judul: "",
  isi: "",
  kategori: "Umum",
  target: "Semua",
  status: "Draft",
};

// Ganti dengan data dari API/backend Anda.
const DATA_AWAL: Pengumuman[] = [
  { id: 1, judul: "Rapat Evaluasi Bulanan", isi: "Diberitahukan kepada seluruh pengurus bahwa rapat evaluasi bulanan akan dilaksanakan pada Selasa, 10 November 2026 pukul 19.30 WIB di Aula Utama. Mohon hadir tepat waktu.", kategori: "Penting", target: "Pengurus", status: "Terbit", tanggal: "2026-11-05" },
  { id: 2, judul: "Jadwal Bakti Sosial Lingkungan", isi: "Kegiatan bakti sosial akan dilaksanakan pada 15 November 2026 di Taman Kota. Anggota yang ingin ikut dapat mendaftar ke sekretariat paling lambat 12 November.", kategori: "Kegiatan", target: "Semua", status: "Terbit", tanggal: "2026-11-03" },
  { id: 3, judul: "Pengingat Iuran Bulan November", isi: "Mohon kepada seluruh anggota untuk melunasi iuran bulan November paling lambat tanggal 15 melalui bendahara.", kategori: "Keuangan", target: "Anggota", status: "Terbit", tanggal: "2026-11-01" },
  { id: 4, judul: "Perubahan Jam Sekretariat", isi: "Mulai Desember 2026, sekretariat buka pukul 09.00–16.00 WIB pada hari kerja.", kategori: "Umum", target: "Semua", status: "Draft", tanggal: "2026-11-06" },
];

// ===================== Token warna sesuai tema =====================
// Pola yang sama dengan AdminDashboard: gelap = kartu kaca + aksen lime-300,
// terang = kartu putih + aksen lime-400/700.
const DARK = {
  panel: "rounded-3xl border border-white/10 bg-white/[0.04] p-6",
  title: "text-white",
  text: "text-white/70",
  muted: "text-white/45",
  line: "border-white/10",
  iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
  segment: "border-white/10 bg-white/[0.04]",
  segActive: "bg-lime-300 text-[#10150c]",
  segIdle: "text-white/60 hover:text-white",
  input:
    "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-lime-300/50 focus:ring-2 focus:ring-lime-300/20 [color-scheme:dark]",
  btnPrimary:
    "bg-lime-300 text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] hover:bg-lime-200",
  btnGhost:
    "border-white/15 bg-white/[0.06] text-white hover:border-lime-300/40 hover:text-lime-300",
  btnGhostDanger:
    "border-white/10 bg-white/[0.06] text-red-300 hover:border-red-400/40 hover:bg-red-400/10",
  btnDanger: "bg-red-500 text-white hover:bg-red-400",
  iconBtn:
    "border-white/10 bg-white/[0.06] text-white/60 enabled:hover:border-lime-300/40 enabled:hover:text-lime-300",
  modal: "border-white/10 bg-[#12170e] text-white",
  overlay: "bg-black/70 backdrop-blur-sm",
  tone: {
    lime: "bg-lime-300/15 text-lime-300",
    red: "bg-red-400/15 text-red-300",
    amber: "bg-amber-300/15 text-amber-300",
    neutral: "bg-white/[0.06] text-white/70",
  },
};

const LIGHT: typeof DARK = {
  panel: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
  title: "text-slate-900",
  text: "text-slate-600",
  muted: "text-slate-400",
  line: "border-slate-200",
  iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
  segment: "border-slate-200 bg-slate-50",
  segActive: "bg-lime-400 text-[#10150c]",
  segIdle: "text-slate-500 hover:text-slate-800",
  input:
    "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 [color-scheme:light]",
  btnPrimary: "bg-lime-400 text-[#10150c] shadow-sm hover:bg-lime-300",
  btnGhost:
    "border-slate-200 bg-white text-slate-700 hover:border-lime-400 hover:text-lime-700",
  btnGhostDanger:
    "border-red-200 bg-white text-red-500 hover:border-red-300 hover:bg-red-50",
  btnDanger: "bg-red-500 text-white hover:bg-red-600",
  iconBtn:
    "border-slate-200 bg-white text-slate-500 enabled:hover:border-lime-400 enabled:hover:text-lime-700",
  modal: "border-slate-200 bg-white text-slate-900",
  overlay: "bg-slate-900/40 backdrop-blur-sm",
  tone: {
    lime: "bg-lime-100 text-lime-800",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-700",
    neutral: "bg-slate-100 text-slate-600",
  },
};

const useC = () => {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
};

type Tone = keyof typeof DARK.tone;

const toneKategori: Record<KategoriPengumuman, Tone> = {
  Umum: "neutral",
  Penting: "red",
  Kegiatan: "lime",
  Keuangan: "amber",
};

// Kelas bentuk (warna ada di token `c.input`, dll.)
const pillField = "rounded-full border px-4 py-2.5 text-sm outline-none transition-colors";
const fieldBase = "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors";
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";
const btnSmall =
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors";

// ===================== Helpers =====================
const formatTanggal = (tanggal: string): string =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD.
// toISOString() memakai UTC sehingga dini hari WIB bisa terbaca kemarin.
const hariIniLokal = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// ===================== Sub-komponen =====================
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeTone?: "lime" | "red";
  icon: LucideIcon;
  /** Kartu lime penuh, seperti kartu "My Card" pada gambar referensi. */
  accent?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  badge,
  badgeTone = "lime",
  icon: Icon,
  accent = false,
}: StatCardProps) {
  const c = useC();
  const shell = accent
    ? "rounded-3xl border border-lime-300/60 bg-lime-300 p-6 text-[#10150c] shadow-[0_0_32px_rgba(190,242,100,0.18)]"
    : c.panel;
  const labelCls = accent ? "text-[#10150c]/70" : c.text;
  const iconCls = accent ? "border-[#10150c]/15 bg-[#10150c]/10 text-[#10150c]" : c.iconWrap;
  const valueCls = accent ? "text-[#10150c]" : c.title;
  const badgeCls = accent ? "bg-[#10150c]/10 text-[#10150c]" : c.tone[badgeTone];
  const subCls = accent ? "text-[#10150c]/65" : c.muted;

  return (
    <div className={`${shell} min-w-0`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${labelCls}`}>{label}</p>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${iconCls}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className={`mt-4 whitespace-nowrap text-2xl font-semibold tracking-tight sm:text-3xl ${valueCls}`}>
        {value}
      </p>

      {(badge || sub) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {badge && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeCls}`}>{badge}</span>
          )}
          {sub && <p className={`min-w-0 text-xs ${subCls}`}>{sub}</p>}
        </div>
      )}
    </div>
  );
}

interface SegmentProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

function Segment<T extends string>({ options, value, onChange, label }: SegmentProps<T>) {
  const c = useC();
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex max-w-full overflow-x-auto rounded-full border p-1 ${c.segment}`}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === o ? c.segActive : c.segIdle
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "lg";
}

function Modal({ title, onClose, children, size = "lg" }: ModalProps) {
  const c = useC();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${c.overlay}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl border p-6 shadow-2xl ${
          size === "sm" ? "max-w-sm" : "max-w-lg"
        } ${c.modal}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${c.iconBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ===================== Component =====================
export default function PengumumanAdmin() {
  const c = useC();

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
  const totalDraft = data.length - totalTerbit;
  const totalPenting = data.filter(
    (p) => p.status === "Terbit" && p.kategori === "Penting",
  ).length;

  // ---------- Handlers ----------
  const bukaTambah = () => {
    setEditId(null);
    setForm(FORM_KOSONG);
    setShowForm(true);
  };

  const bukaEdit = (p: Pengumuman) => {
    setEditId(p.id);
    setForm({
      judul: p.judul,
      isi: p.isi,
      kategori: p.kategori,
      target: p.target,
      status: p.status,
    });
    setShowForm(true);
  };

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(FORM_KOSONG);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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
      setData((prev) => [...prev, { id: idBaru, tanggal: hariIniLokal(), ...form }]);
    }
    tutupForm();
  };

  const toggleStatus = (id: number) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "Terbit" ? "Draft" : "Terbit" } : p,
      ),
    );
  };

  const konfirmasiHapus = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ---------- Render ----------
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${c.title}`}>
              Pengumuman
            </h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.tone.lime}`}>
              {totalTerbit} terbit
            </span>
          </div>
          <p className={`mt-1 text-sm ${c.muted}`}>
            Buat, terbitkan, dan kelola informasi untuk pengurus dan anggota.
          </p>
        </div>

        <button type="button" onClick={bukaTambah} className={`${btnBase} ${c.btnPrimary}`}>
          <Plus className="h-4 w-4" />
          Buat Pengumuman
        </button>
      </div>

      {/* Kartu statistik */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent
          label="Total Pengumuman"
          value={String(data.length)}
          sub="Semua kategori"
          icon={Megaphone}
        />
        <StatCard
          label="Sudah Terbit"
          value={String(totalTerbit)}
          sub="Terlihat oleh target"
          icon={Send}
        />
        <StatCard
          label="Masih Draft"
          value={String(totalDraft)}
          sub="Belum diterbitkan"
          icon={FileText}
        />
        <StatCard
          label="Penting Aktif"
          value={String(totalPenting)}
          badgeTone="red"
          sub="Terbit, kategori Penting"
          icon={Bell}
        />
      </section>

      {/* Filter */}
      <section className={`${c.panel} space-y-4`}>
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
          />
          <input
            type="search"
            aria-label="Cari pengumuman"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau isi pengumuman"
            className={`${pillField} w-full pl-10 ${c.input}`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segment
            label="Filter kategori"
            options={FILTER_KATEGORI}
            value={filterKategori}
            onChange={setFilterKategori}
          />
          <Segment
            label="Filter status"
            options={FILTER_STATUS}
            value={filterStatus}
            onChange={setFilterStatus}
          />
        </div>
      </section>

      {/* Daftar */}
      {filtered.length === 0 ? (
        <div className={`${c.panel} py-12 text-center text-sm ${c.muted}`}>
          Pengumuman tidak ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const tone = toneKategori[p.kategori];
            return (
              <article key={p.id} className={`${c.panel} flex gap-4`}>
                <span
                  className={`hidden h-11 w-11 shrink-0 place-items-center rounded-full sm:grid ${c.tone[tone]}`}
                >
                  <Megaphone className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.tone[tone]}`}>
                      {p.kategori}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.tone.neutral}`}>
                      Untuk: {p.target}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.status === "Terbit"
                          ? c.tone.lime
                          : `border border-dashed ${c.line} ${c.tone.neutral}`
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className={`ml-auto text-xs ${c.muted}`}>{formatTanggal(p.tanggal)}</span>
                  </div>

                  <h3 className={`mt-3 text-lg font-semibold ${c.title}`}>{p.judul}</h3>
                  <p className={`mt-1 line-clamp-2 text-sm leading-relaxed ${c.text}`}>{p.isi}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setDetail(p)} className={`${btnSmall} ${c.btnGhost}`}>
                      <Eye className="h-3.5 w-3.5" />
                      Lihat
                    </button>
                    <button type="button" onClick={() => toggleStatus(p.id)} className={`${btnSmall} ${c.btnGhost}`}>
                      {p.status === "Terbit" ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Jadikan Draft
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Terbitkan
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => bukaEdit(p)} className={`${btnSmall} ${c.btnGhost}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(p)} className={`${btnSmall} ${c.btnGhostDanger}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Detail */}
      {detail && (
        <Modal title="Detail Pengumuman" onClose={() => setDetail(null)}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${c.tone[toneKategori[detail.kategori]]}`}
            >
              {detail.kategori}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.tone.neutral}`}>
              Untuk: {detail.target}
            </span>
            <span className={`ml-auto text-xs ${c.muted}`}>{formatTanggal(detail.tanggal)}</span>
          </div>
          <h3 className={`mt-4 text-xl font-semibold ${c.title}`}>{detail.judul}</h3>
          <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed ${c.text}`}>{detail.isi}</p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setDetail(null)} className={`${btnBase} border ${c.btnGhost}`}>
              Tutup
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Tambah / Edit */}
      {showForm && (
        <Modal title={editId !== null ? "Edit Pengumuman" : "Buat Pengumuman"} onClose={tutupForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="judul" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                Judul
              </label>
              <input id="judul" name="judul" value={form.judul} onChange={handleChange} required className={`${fieldBase} ${c.input}`} placeholder="Judul pengumuman" />
            </div>
            <div>
              <label htmlFor="isi" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                Isi Pengumuman
              </label>
              <textarea id="isi" name="isi" value={form.isi} onChange={handleChange} required rows={5} className={`${fieldBase} ${c.input}`} placeholder="Tulis isi pengumuman..." />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="kategori" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Kategori
                </label>
                <select id="kategori" name="kategori" value={form.kategori} onChange={handleChange} className={`${fieldBase} ${c.input}`}>
                  {DAFTAR_KATEGORI.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="target" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Ditujukan
                </label>
                <select id="target" name="target" value={form.target} onChange={handleChange} className={`${fieldBase} ${c.input}`}>
                  {DAFTAR_TARGET.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Status
                </label>
                <select id="status" name="status" value={form.status} onChange={handleChange} className={`${fieldBase} ${c.input}`}>
                  <option value="Draft">Draft</option>
                  <option value="Terbit">Terbit</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={tutupForm} className={`${btnBase} border ${c.btnGhost}`}>
                Batal
              </button>
              <button type="submit" className={`${btnBase} ${c.btnPrimary}`}>
                {editId !== null ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <Modal title="Hapus Pengumuman?" size="sm" onClose={() => setDeleteTarget(null)}>
          <p className={`text-sm ${c.text}`}>
            Pengumuman <span className={`font-semibold ${c.title}`}>{deleteTarget.judul}</span> akan
            dihapus dan tidak dapat dikembalikan.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className={`${btnBase} border ${c.btnGhost}`}>
              Batal
            </button>
            <button type="button" onClick={konfirmasiHapus} className={`${btnBase} ${c.btnDanger}`}>
              Hapus
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}