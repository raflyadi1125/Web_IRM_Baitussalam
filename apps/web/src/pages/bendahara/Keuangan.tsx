import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { Search, Wallet, TrendingUp, TrendingDown, Pencil, Trash2, Plus, Save } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";
import {
  KATEGORI,
  keuangan,
  useTransaksi,
  type Jenis,
  type Transaksi,
} from "../../data/keuangan";

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// "T00:00:00" supaya tanggal dibaca sebagai waktu lokal (bukan UTC)
const formatTanggal = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

// Tanggal hari ini (zona waktu lokal). toISOString() memakai UTC sehingga dini hari WIB bisa terbaca kemarin.
const hariIni = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

interface FormState {
  tanggal: string;
  keterangan: string;
  jenis: Jenis;
  kategori: string;
  jumlah: string;
}

const formKosong = (): FormState => ({
  tanggal: hariIni(),
  keterangan: "",
  jenis: "Pemasukan",
  kategori: KATEGORI.Pemasukan[0],
  jumlah: "",
});

export default function KeuanganBendahara() {
  // Data diambil dari keuangan.ts (sama persis dengan DashboardBendahara dan halaman admin)
  const data = useTransaksi();

  const [form, setForm] = useState<FormState>(formKosong);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Jenis>("Semua");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasil = useMemo(
    () =>
      data
        .filter(
          (t) =>
            (filter === "Semua" || t.jenis === filter) &&
            t.keterangan.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id),
    [data, search, filter]
  );

  const totalMasuk = data.filter((t) => t.jenis === "Pemasukan").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = data.filter((t) => t.jenis === "Pengeluaran").reduce((s, t) => s + t.jumlah, 0);

  const handleJenisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const jenis = e.target.value as Jenis;
    // Reset kategori ke kategori pertama dari jenis yang dipilih
    setForm((prev) => ({ ...prev, jenis, kategori: KATEGORI[jenis][0] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const jumlah = Number(form.jumlah);

    if (!form.keterangan.trim()) return setError("Keterangan wajib diisi.");
    if (!form.tanggal) return setError("Tanggal wajib diisi.");
    if (!jumlah || jumlah <= 0) return setError("Jumlah harus lebih dari 0.");
    setError("");

    const payload = {
      tanggal: form.tanggal,
      keterangan: form.keterangan.trim(),
      kategori: form.kategori,
      jenis: form.jenis,
      jumlah,
    };

    if (editId !== null) {
      keuangan.update(editId, payload);
    } else {
      keuangan.add(payload);
    }
    setForm(formKosong());
    setEditId(null);
  };

  const handleEdit = (t: Transaksi) => {
    setEditId(t.id);
    setForm({
      tanggal: t.tanggal,
      keterangan: t.keterangan,
      jenis: t.jenis,
      kategori: t.kategori,
      jumlah: String(t.jumlah),
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    keuangan.remove(id);
    if (editId === id) {
      setEditId(null);
      setForm(formKosong());
    }
  };

  const batalEdit = () => {
    setEditId(null);
    setForm(formKosong());
    setError("");
  };

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
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
        inText: "text-lime-300",
        outText: "text-rose-300",
        badgeIn: "bg-lime-300/15 text-lime-300",
        badgeOut: "bg-rose-400/15 text-rose-300",
        actEdit: "text-lime-300 hover:bg-lime-300/10",
        actDel: "text-rose-300 hover:bg-rose-400/10",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "divide-slate-100",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
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
        inText: "text-lime-700",
        outText: "text-red-600",
        badgeIn: "bg-lime-100 text-lime-800",
        badgeOut: "bg-red-100 text-red-700",
        actEdit: "text-lime-700 hover:bg-lime-50",
        actDel: "text-red-600 hover:bg-red-50",
      };

  const card = `rounded-3xl border p-6 ${c.card}`;
  const inputClass = `h-11 w-full rounded-full border px-4 text-sm outline-none transition focus:ring-2 ${c.input}`;
  const labelClass = `mb-1.5 block text-xs font-semibold ${c.text}`;

  const ringkasan = [
    { label: "Total Pemasukan", value: rupiah(totalMasuk), icon: TrendingUp, tone: c.inText },
    { label: "Total Pengeluaran", value: rupiah(totalKeluar), icon: TrendingDown, tone: c.outText },
    { label: "Saldo", value: rupiah(totalMasuk - totalKeluar), icon: Wallet, tone: c.title },
  ];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">Keuangan</h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Catat dan kelola pemasukan serta pengeluaran.
        </p>
      </section>

      {/* Ringkasan */}
      <section className="grid gap-5 sm:grid-cols-3">
        {ringkasan.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`${card} min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <p className={`text-sm font-medium ${c.text}`}>{label}</p>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className={`mt-4 truncate text-2xl font-semibold tracking-tight ${tone}`} title={value}>
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className={`${card} space-y-4`} noValidate>
        <h2 className={`text-lg font-semibold ${c.title}`}>
          {editId !== null ? "Edit Transaksi" : "Tambah Transaksi"}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="keu-tanggal" className={labelClass}>
              Tanggal
            </label>
            <input
              id="keu-tanggal"
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="keu-jenis" className={labelClass}>
              Jenis
            </label>
            <select
              id="keu-jenis"
              value={form.jenis}
              onChange={handleJenisChange}
              className={inputClass}
            >
              <option className={c.option}>Pemasukan</option>
              <option className={c.option}>Pengeluaran</option>
            </select>
          </div>
          <div>
            <label htmlFor="keu-kategori" className={labelClass}>
              Kategori
            </label>
            <select
              id="keu-kategori"
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className={inputClass}
            >
              {KATEGORI[form.jenis].map((k) => (
                <option key={k} className={c.option}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="keu-jumlah" className={labelClass}>
              Jumlah (Rp)
            </label>
            <input
              id="keu-jumlah"
              type="number"
              min={0}
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-4">
            <label htmlFor="keu-keterangan" className={labelClass}>
              Keterangan
            </label>
            <input
              id="keu-keterangan"
              type="text"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Contoh: Iuran anggota"
              className={inputClass}
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
            {editId !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editId !== null ? "Simpan Perubahan" : "Tambah"}
          </button>
          {editId !== null && (
            <button
              type="button"
              onClick={batalEdit}
              className={`h-11 rounded-full border px-6 text-sm font-semibold transition-colors ${c.btnGhost}`}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Filter */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className={`${inputClass} pl-11`}
          />
        </div>
        <div className={`flex flex-wrap rounded-full border p-1 ${c.segment}`}>
          {(["Semua", "Pemasukan", "Pengeluaran"] as const).map((opt) => (
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
                <th className="px-5 py-3.5 font-medium">Tanggal</th>
                <th className="px-5 py-3.5 font-medium">Keterangan</th>
                <th className="px-5 py-3.5 font-medium">Jenis</th>
                <th className="px-5 py-3.5 text-right font-medium">Jumlah</th>
                <th className="px-5 py-3.5 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {hasil.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-5 py-10 text-center ${c.muted}`}>
                    Tidak ada transaksi.
                  </td>
                </tr>
              ) : (
                hasil.map((t) => {
                  const masuk = t.jenis === "Pemasukan";
                  return (
                    <tr key={t.id} className={`transition-colors ${c.row}`}>
                      <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>{formatTanggal(t.tanggal)}</td>
                      <td className="px-5 py-4">
                        <p className={`font-medium ${c.title}`}>{t.keterangan}</p>
                        <p className={`text-xs ${c.muted}`}>{t.kategori}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            masuk ? c.badgeIn : c.badgeOut
                          }`}
                        >
                          {t.jenis}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${
                          masuk ? c.inText : c.outText
                        }`}
                      >
                        {rupiah(t.jumlah)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleEdit(t)}
                          aria-label={`Edit ${t.keterangan}`}
                          className={`mr-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actEdit}`}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          aria-label={`Hapus ${t.keterangan}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${c.actDel}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}