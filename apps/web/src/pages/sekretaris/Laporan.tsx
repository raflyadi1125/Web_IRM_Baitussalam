import { type FormEvent, useMemo, useState } from "react";
import { Search, Plus, Save, Pencil, Trash2, Eye, Printer, X } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";

type Status = "Draft" | "Final";

interface Laporan {
  id: number;
  judul: string;
  kegiatan: string;
  tanggal: string; // ISO date
  peserta: number;
  ringkasan: string;
  status: Status;
}

// TODO: ganti dengan data dari API
const dataAwal: Laporan[] = [
  {
    id: 1,
    judul: "Laporan Gotong Royong",
    kegiatan: "Gotong Royong",
    tanggal: "2026-10-26",
    peserta: 42,
    ringkasan:
      "Kegiatan berjalan lancar. Lingkungan sekretariat berhasil dibersihkan dan area parkir ditata ulang.",
    status: "Final",
  },
  {
    id: 2,
    judul: "Laporan Pelatihan Kepemimpinan",
    kegiatan: "Pelatihan Kepemimpinan",
    tanggal: "2026-11-06",
    peserta: 30,
    ringkasan: "Pelatihan hari pertama membahas dasar komunikasi dan manajemen tim.",
    status: "Draft",
  },
];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const hariIni = () => new Date().toISOString().slice(0, 10);

const formKosong = {
  judul: "",
  kegiatan: "",
  tanggal: hariIni(),
  peserta: "",
  ringkasan: "",
  status: "Draft" as Status,
};

export default function Laporan() {
  const [data, setData] = useState<Laporan[]>(dataAwal);
  const [form, setForm] = useState(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Status>("Semua");
  const [detail, setDetail] = useState<Laporan | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasil = useMemo(
    () =>
      data
        .filter(
          (l) =>
            (filter === "Semua" || l.status === filter) &&
            l.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [data, search, filter]
  );

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...formKosong, tanggal: hariIni() });
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const peserta = Number(form.peserta);

    if (!form.judul.trim()) return setError("Judul laporan wajib diisi.");
    if (!form.kegiatan.trim()) return setError("Nama kegiatan wajib diisi.");
    if (!form.tanggal) return setError("Tanggal wajib diisi.");
    if (!Number.isFinite(peserta) || peserta < 0) return setError("Jumlah peserta tidak valid.");
    if (!form.ringkasan.trim()) return setError("Ringkasan laporan wajib diisi.");

    const payload = {
      ...form,
      judul: form.judul.trim(),
      kegiatan: form.kegiatan.trim(),
      ringkasan: form.ringkasan.trim(),
      peserta,
    };

    if (editId !== null) {
      // TODO: panggil API update
      setData((prev) => prev.map((l) => (l.id === editId ? { ...l, ...payload } : l)));
    } else {
      // TODO: panggil API create, pakai id dari server
      setData((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    tutupForm();
  };

  const handleEdit = (l: Laporan) => {
    setEditId(l.id);
    setForm({
      judul: l.judul,
      kegiatan: l.kegiatan,
      tanggal: l.tanggal,
      peserta: String(l.peserta),
      ringkasan: l.ringkasan,
      status: l.status,
    });
    setDetail(null);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus laporan ini?")) return;
    // TODO: panggil API hapus
    setData((prev) => prev.filter((l) => l.id !== id));
    if (editId === id) tutupForm();
    if (detail?.id === id) setDetail(null);
  };

  // Token warna sesuai tema (sama dengan dashboard admin).
  // Kelas print: memastikan detail laporan tetap putih-hitam saat dicetak di tema gelap.
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        printCard: "border-white/10 bg-white/[0.04] print:border-slate-300 print:bg-white",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        printTitle: "text-white print:text-black",
        printText: "text-white/70 print:text-slate-700",
        printMuted: "text-white/45 print:text-slate-500",
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
          Final: "bg-lime-300/15 text-lime-300 print:bg-green-100 print:text-green-800",
          Draft: "bg-amber-300/15 text-amber-300 print:bg-amber-100 print:text-amber-800",
        } as Record<Status, string>,
        actView: "text-white/70 hover:bg-white/[0.08] hover:text-white",
        actEdit: "text-lime-300 hover:bg-lime-300/10",
        actDel: "text-rose-300 hover:bg-rose-400/10",
        innerBox: "border-white/10 bg-white/[0.03] print:border-slate-300 print:bg-white",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        printCard: "border-slate-200 bg-white shadow-sm print:shadow-none",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        printTitle: "text-slate-900",
        printText: "text-slate-600",
        printMuted: "text-slate-500",
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
          Final: "bg-lime-100 text-lime-800",
          Draft: "bg-amber-100 text-amber-800",
        } as Record<Status, string>,
        actView: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        actEdit: "text-lime-700 hover:bg-lime-50",
        actDel: "text-red-600 hover:bg-red-50",
        innerBox: "border-slate-200 bg-slate-50 print:bg-white",
      };

  const card = `rounded-3xl border p-6 ${c.card}`;
  const inputClass = `h-11 w-full rounded-full border px-4 text-sm outline-none transition focus:ring-2 ${c.input}`;
  const labelClass = `mb-1.5 block text-xs font-semibold ${c.text}`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10 print:hidden">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">Laporan Kegiatan</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
              Susun dan arsipkan laporan setiap kegiatan.
            </p>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] transition-colors hover:bg-lime-200"
            >
              <Plus className="h-4 w-4" />
              Buat Laporan
            </button>
          )}
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4 print:hidden`}>
          <h2 className={`text-lg font-semibold ${c.title}`}>{editId !== null ? "Edit Laporan" : "Buat Laporan"}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="lp-judul" className={labelClass}>
                Judul Laporan
              </label>
              <input
                id="lp-judul"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lp-kegiatan" className={labelClass}>
                Nama Kegiatan
              </label>
              <input
                id="lp-kegiatan"
                value={form.kegiatan}
                onChange={(e) => setForm({ ...form, kegiatan: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lp-tanggal" className={labelClass}>
                Tanggal Pelaksanaan
              </label>
              <input
                id="lp-tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lp-peserta" className={labelClass}>
                Jumlah Peserta
              </label>
              <input
                id="lp-peserta"
                type="number"
                min={0}
                value={form.peserta}
                onChange={(e) => setForm({ ...form, peserta: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lp-status" className={labelClass}>
                Status
              </label>
              <select
                id="lp-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className={inputClass}
              >
                <option className={c.option}>Draft</option>
                <option className={c.option}>Final</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lp-ringkasan" className={labelClass}>
                Ringkasan / Hasil Kegiatan
              </label>
              <textarea
                id="lp-ringkasan"
                rows={5}
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${c.input}`}
              />
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
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
        <div className="relative flex-1">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari laporan..."
            className={`${inputClass} pl-11`}
          />
        </div>
        <div className={`flex flex-wrap rounded-full border p-1 ${c.segment}`}>
          {(["Semua", "Draft", "Final"] as const).map((opt) => (
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

      {/* Detail laporan (bisa dicetak) */}
      {detail && (
        <section className={`space-y-5 rounded-3xl border p-6 ${c.printCard}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className={`text-xl font-semibold ${c.printTitle}`}>{detail.judul}</h2>
              <p className={`mt-1 text-sm ${c.printMuted}`}>
                {detail.kegiatan} • {formatTanggal(detail.tanggal)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${c.status[detail.status]}`}
            >
              {detail.status}
            </span>
          </div>

          <div className={`rounded-2xl border px-4 py-3 text-sm ${c.innerBox} ${c.printText}`}>
            <span className={`font-medium ${c.printTitle}`}>Jumlah peserta:</span> {detail.peserta} orang
          </div>

          <div>
            <p className={`mb-1 text-sm font-medium ${c.printTitle}`}>Ringkasan</p>
            <p className={`whitespace-pre-line text-sm leading-relaxed ${c.printText}`}>{detail.ringkasan}</p>
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className={`inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors ${c.btnPrimary}`}
            >
              <Printer className="h-4 w-4" /> Cetak
            </button>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors ${c.btnGhost}`}
            >
              <X className="h-4 w-4" /> Tutup
            </button>
          </div>
        </section>
      )}

      {/* Tabel */}
      <section className={`overflow-hidden rounded-3xl border ${c.card} print:hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`text-left ${c.thead}`}>
              <tr>
                <th className="px-5 py-3.5 font-medium">Laporan</th>
                <th className="px-5 py-3.5 font-medium">Tanggal</th>
                <th className="px-5 py-3.5 text-right font-medium">Peserta</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {hasil.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-5 py-10 text-center ${c.muted}`}>
                    Tidak ada laporan.
                  </td>
                </tr>
              ) : (
                hasil.map((l) => (
                  <tr key={l.id} className={`transition-colors ${c.row}`}>
                    <td className="px-5 py-4">
                      <p className={`font-medium ${c.title}`}>{l.judul}</p>
                      <p className={`text-xs ${c.muted}`}>{l.kegiatan}</p>
                    </td>
                    <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>{formatTanggal(l.tanggal)}</td>
                    <td className={`px-5 py-4 text-right ${c.text}`}>{l.peserta}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${c.status[l.status]}`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(l)}
                        aria-label={`Lihat ${l.judul}`}
                        className={`mr-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actView}`}
                      >
                        <Eye className="h-3.5 w-3.5" /> Lihat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(l)}
                        aria-label={`Edit ${l.judul}`}
                        className={`mr-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actEdit}`}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(l.id)}
                        aria-label={`Hapus ${l.judul}`}
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