import { type FormEvent, useMemo, useState } from "react";
import { Search, Plus, Send, Save, Pencil, Trash2, CalendarDays, Star } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";

type Kategori = "Umum" | "Kegiatan" | "Keuangan";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: Kategori;
  tanggal: string; // ISO date
  isi: string;
  penting: boolean;
}

// TODO: ganti dengan data dari API
const dataAwal: Pengumuman[] = [
  {
    id: 1,
    judul: "Jadwal Rapat Bulan November",
    kategori: "Kegiatan",
    tanggal: "2026-11-05",
    isi: "Rapat bulanan akan dilaksanakan pada 12 November 2026 pukul 19:00 WIB di Aula Utama. Seluruh anggota diharapkan hadir tepat waktu.",
    penting: true,
  },
  {
    id: 2,
    judul: "Pembayaran Iuran Anggota",
    kategori: "Keuangan",
    tanggal: "2026-11-02",
    isi: "Iuran bulan November dapat dibayarkan kepada bendahara paling lambat tanggal 15 November 2026.",
    penting: false,
  },
  {
    id: 3,
    judul: "Pembaruan Tata Tertib Organisasi",
    kategori: "Umum",
    tanggal: "2026-10-28",
    isi: "Tata tertib organisasi telah diperbarui. Dokumen lengkap tersedia di sekretariat.",
    penting: false,
  },
];

const KATEGORI: Kategori[] = ["Umum", "Kegiatan", "Keuangan"];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const hariIni = () => new Date().toISOString().slice(0, 10);

const formKosong = { judul: "", kategori: "Umum" as Kategori, isi: "", penting: false };

export default function Pengumuman() {
  const [data, setData] = useState<Pengumuman[]>(dataAwal);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Kategori>("Semua");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasil = useMemo(
    () =>
      data
        .filter(
          (p) =>
            (filter === "Semua" || p.kategori === filter) &&
            p.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => Number(b.penting) - Number(a.penting) || b.tanggal.localeCompare(a.tanggal)),
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
    if (!form.judul.trim()) return setError("Judul wajib diisi.");
    if (!form.isi.trim()) return setError("Isi pengumuman wajib diisi.");

    const payload = { ...form, judul: form.judul.trim(), isi: form.isi.trim() };

    if (editId !== null) {
      // TODO: panggil API update
      setData((prev) => prev.map((p) => (p.id === editId ? { ...p, ...payload } : p)));
    } else {
      // TODO: panggil API create, pakai id dari server
      setData((prev) => [...prev, { id: Date.now(), tanggal: hariIni(), ...payload }]);
    }
    tutupForm();
  };

  const handleEdit = (p: Pengumuman) => {
    setEditId(p.id);
    setForm({ judul: p.judul, kategori: p.kategori, isi: p.isi, penting: p.penting });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus pengumuman ini?")) return;
    // TODO: panggil API hapus
    setData((prev) => prev.filter((p) => p.id !== id));
    if (editId === id) tutupForm();
  };

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30 [color-scheme:dark]",
        option: "bg-[#121a0e] text-white",
        segment: "border-white/10 bg-white/[0.04]",
        segActive: "bg-lime-300 text-[#10150c]",
        segIdle: "text-white/60 hover:text-white",
        btnPrimary: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        btnGhost: "border-white/15 bg-white/[0.06] text-white hover:border-lime-300/40 hover:text-lime-300",
        fieldError: "text-red-300",
        checkbox: "accent-lime-300",
        kategori: {
          Umum: "bg-white/[0.08] text-white/70",
          Kegiatan: "bg-sky-300/15 text-sky-300",
          Keuangan: "bg-amber-300/15 text-amber-300",
        } as Record<Kategori, string>,
        penting: "bg-rose-400/15 text-rose-300",
        pentingBorder: "border-l-rose-400",
        actEdit: "text-lime-300 hover:bg-lime-300/10",
        actDel: "text-rose-300 hover:bg-rose-400/10",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        input:
          "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50",
        option: "bg-white text-slate-900",
        segment: "border-slate-200 bg-slate-50",
        segActive: "bg-lime-400 text-[#10150c]",
        segIdle: "text-slate-500 hover:text-slate-800",
        btnPrimary: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        btnGhost: "border-slate-200 bg-white text-slate-700 hover:border-lime-500 hover:text-lime-700",
        fieldError: "text-red-700",
        checkbox: "accent-lime-600",
        kategori: {
          Umum: "bg-slate-100 text-slate-600",
          Kegiatan: "bg-sky-100 text-sky-700",
          Keuangan: "bg-amber-100 text-amber-700",
        } as Record<Kategori, string>,
        penting: "bg-red-100 text-red-700",
        pentingBorder: "border-l-red-400",
        actEdit: "text-lime-700 hover:bg-lime-50",
        actDel: "text-red-600 hover:bg-red-50",
      };

  const card = `rounded-3xl border p-6 ${c.card}`;
  const inputClass = `h-11 w-full rounded-full border px-4 text-sm outline-none transition focus:ring-2 ${c.input}`;
  const labelClass = `mb-1.5 block text-xs font-semibold ${c.text}`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">Pengumuman</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
              Buat dan kelola pengumuman untuk anggota.
            </p>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] transition-colors hover:bg-lime-200"
            >
              <Plus className="h-4 w-4" />
              Buat Pengumuman
            </button>
          )}
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4`}>
          <h2 className={`text-lg font-semibold ${c.title}`}>
            {editId !== null ? "Edit Pengumuman" : "Buat Pengumuman"}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="pg-judul" className={labelClass}>
                Judul
              </label>
              <input
                id="pg-judul"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pg-kategori" className={labelClass}>
                Kategori
              </label>
              <select
                id="pg-kategori"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value as Kategori })}
                className={inputClass}
              >
                {KATEGORI.map((k) => (
                  <option key={k} className={c.option}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label htmlFor="pg-isi" className={labelClass}>
                Isi Pengumuman
              </label>
              <textarea
                id="pg-isi"
                rows={5}
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${c.input}`}
              />
            </div>
          </div>
          <label className={`flex cursor-pointer items-center gap-2 text-sm ${c.text}`}>
            <input
              type="checkbox"
              checked={form.penting}
              onChange={(e) => setForm({ ...form, penting: e.target.checked })}
              className={`h-4 w-4 rounded ${c.checkbox}`}
            />
            Tandai sebagai penting (tampil paling atas)
          </label>
          {error && (
            <p role="alert" className={`text-sm ${c.fieldError}`}>
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className={`inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors ${c.btnPrimary}`}
            >
              {editId !== null ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {editId !== null ? "Simpan Perubahan" : "Publikasikan"}
            </button>
            <button
              type="button"
              onClick={tutupForm}
              className={`h-11 rounded-full border px-6 text-sm font-semibold transition-colors ${c.btnGhost}`}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Pencarian & filter */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengumuman..."
            className={`${inputClass} pl-11`}
          />
        </div>
        <div className={`flex flex-wrap rounded-full border p-1 ${c.segment}`}>
          {(["Semua", ...KATEGORI] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === opt ? c.segActive : c.segIdle
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Daftar pengumuman */}
      {hasil.length === 0 ? (
        <p className={`py-10 text-center text-sm ${c.muted}`}>Tidak ada pengumuman.</p>
      ) : (
        <section className="space-y-4">
          {hasil.map((p) => (
            <article
              key={p.id}
              className={`${card} ${p.penting ? `border-l-4 ${c.pentingBorder}` : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.kategori[p.kategori]}`}>
                      {p.kategori}
                    </span>
                    {p.penting && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${c.penting}`}
                      >
                        <Star className="h-3 w-3" aria-hidden="true" /> Penting
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 text-xs ${c.muted}`}>
                      <CalendarDays className="h-3.5 w-3.5" /> {formatTanggal(p.tanggal)}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold ${c.title}`}>{p.judul}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    aria-label={`Edit ${p.judul}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actEdit}`}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    aria-label={`Hapus ${p.judul}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actDel}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
              <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed ${c.text}`}>{p.isi}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}