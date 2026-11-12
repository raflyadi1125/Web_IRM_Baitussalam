import { type FormEvent, useMemo, useState } from "react";
import { Search, Plus, Save, Pencil, Trash2 } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";
import {
  DAFTAR_STATUS,
  kegiatan,
  useKegiatan,
  type Kegiatan,
  type KegiatanInput,
  type StatusKegiatan,
} from "../../data/kegiatan";

// "T00:00:00" supaya tanggal dibaca sebagai waktu lokal (bukan UTC)
const formatTanggal = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formKosong: KegiatanInput = {
  nama: "",
  deskripsi: "",
  tanggal: "",
  waktu: "",
  lokasi: "",
  penanggungJawab: "",
  status: "Akan Datang",
};

export default function KegiatanSekretaris() {
  // Data diambil dari kegiatan.ts (sama persis dengan halaman admin)
  const data = useKegiatan();

  const [form, setForm] = useState<KegiatanInput>(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | StatusKegiatan>("Semua");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasil = useMemo(
    () =>
      data
        .filter(
          (k) =>
            (filter === "Semua" || k.status === filter) &&
            k.nama.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
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
    if (!form.nama.trim()) return setError("Judul kegiatan wajib diisi.");
    if (!form.tanggal) return setError("Tanggal wajib diisi.");
    if (!form.lokasi.trim()) return setError("Lokasi wajib diisi.");
    if (!form.penanggungJawab.trim()) return setError("Penanggung jawab wajib diisi.");

    const payload: KegiatanInput = {
      ...form,
      nama: form.nama.trim(),
      lokasi: form.lokasi.trim(),
      penanggungJawab: form.penanggungJawab.trim(),
      deskripsi: form.deskripsi.trim(),
    };

    if (editId !== null) {
      kegiatan.update(editId, payload);
    } else {
      kegiatan.add(payload);
    }
    tutupForm();
  };

  const handleEdit = (k: Kegiatan) => {
    const { id, ...rest } = k;
    setEditId(id);
    setForm(rest);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus kegiatan ini?")) return;
    kegiatan.remove(id);
    if (editId === id) tutupForm();
  };

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30 [color-scheme:dark]",
        option: "bg-[#121a0e] text-white",
        segment: "border-white/10 bg-white/[0.04]",
        segActive: "bg-lime-300 text-[#10150c]",
        segIdle: "text-white/60 hover:text-white",
        btnPrimary: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        btnGhost: "border-white/15 bg-white/[0.06] text-white hover:border-lime-300/40 hover:text-lime-300",
        thead: "bg-white/[0.04] text-white/60",
        row: "hover:bg-white/[0.03]",
        fieldError: "text-red-300",
        status: {
          "Akan Datang": "bg-sky-300/15 text-sky-300",
          Berlangsung: "bg-lime-300/15 text-lime-300",
          Selesai: "bg-white/[0.08] text-white/50",
          Dibatalkan: "bg-red-400/15 text-red-300",
        } as Record<StatusKegiatan, string>,
        actEdit: "text-lime-300 hover:bg-lime-300/10",
        actDel: "text-rose-300 hover:bg-rose-400/10",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "divide-slate-100",
        input:
          "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50",
        option: "bg-white text-slate-900",
        segment: "border-slate-200 bg-slate-50",
        segActive: "bg-lime-400 text-[#10150c]",
        segIdle: "text-slate-500 hover:text-slate-800",
        btnPrimary: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        btnGhost: "border-slate-200 bg-white text-slate-700 hover:border-lime-500 hover:text-lime-700",
        thead: "bg-slate-50 text-slate-500",
        row: "hover:bg-slate-50",
        fieldError: "text-red-700",
        status: {
          "Akan Datang": "bg-sky-100 text-sky-700",
          Berlangsung: "bg-lime-100 text-lime-800",
          Selesai: "bg-slate-100 text-slate-500",
          Dibatalkan: "bg-red-100 text-red-600",
        } as Record<StatusKegiatan, string>,
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
            <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">Kegiatan</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
              Kelola jadwal dan data kegiatan organisasi.
            </p>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] transition-colors hover:bg-lime-200"
            >
              <Plus className="h-4 w-4" />
              Tambah Kegiatan
            </button>
          )}
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4`}>
          <h2 className={`text-lg font-semibold ${c.title}`}>
            {editId !== null ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="kg-judul" className={labelClass}>
                Judul
              </label>
              <input
                id="kg-judul"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="kg-deskripsi" className={labelClass}>
                Deskripsi
              </label>
              <textarea
                id="kg-deskripsi"
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${c.input}`}
              />
            </div>
            <div>
              <label htmlFor="kg-tanggal" className={labelClass}>
                Tanggal
              </label>
              <input
                id="kg-tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="kg-waktu" className={labelClass}>
                Waktu
              </label>
              <input
                id="kg-waktu"
                type="time"
                value={form.waktu}
                onChange={(e) => setForm({ ...form, waktu: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="kg-lokasi" className={labelClass}>
                Lokasi
              </label>
              <input
                id="kg-lokasi"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="kg-pj" className={labelClass}>
                Penanggung Jawab
              </label>
              <input
                id="kg-pj"
                value={form.penanggungJawab}
                onChange={(e) => setForm({ ...form, penanggungJawab: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="kg-status" className={labelClass}>
                Status
              </label>
              <select
                id="kg-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusKegiatan })}
                className={inputClass}
              >
                {DAFTAR_STATUS.map((s) => (
                  <option key={s} className={c.option}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <Save className="h-4 w-4" />
              {editId !== null ? "Simpan Perubahan" : "Simpan"}
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
            placeholder="Cari kegiatan..."
            className={`${inputClass} pl-11`}
          />
        </div>
        <div className={`flex flex-wrap rounded-full border p-1 ${c.segment}`}>
          {(["Semua", ...DAFTAR_STATUS] as const).map((opt) => (
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

      {/* Tabel */}
      <section className={`overflow-hidden rounded-3xl border ${c.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`text-left ${c.thead}`}>
              <tr>
                <th className="px-5 py-3.5 font-medium">Kegiatan</th>
                <th className="px-5 py-3.5 font-medium">Tanggal</th>
                <th className="px-5 py-3.5 font-medium">Lokasi</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {hasil.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-5 py-10 text-center ${c.muted}`}>
                    Tidak ada kegiatan.
                  </td>
                </tr>
              ) : (
                hasil.map((k) => (
                  <tr key={k.id} className={`transition-colors ${c.row}`}>
                    <td className="px-5 py-4">
                      <p className={`font-medium ${c.title}`}>{k.nama}</p>
                      {k.deskripsi && <p className={`line-clamp-1 text-xs ${c.muted}`}>{k.deskripsi}</p>}
                    </td>
                    <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>
                      {formatTanggal(k.tanggal)}
                      {k.waktu && <span className={c.muted}> • {k.waktu}</span>}
                    </td>
                    <td className={`px-5 py-4 ${c.text}`}>
                      <p>{k.lokasi}</p>
                      <p className={`text-xs ${c.muted}`}>PJ: {k.penanggungJawab}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${c.status[k.status]}`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleEdit(k)}
                        aria-label={`Edit ${k.nama}`}
                        className={`mr-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actEdit}`}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(k.id)}
                        aria-label={`Hapus ${k.nama}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actDel}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}