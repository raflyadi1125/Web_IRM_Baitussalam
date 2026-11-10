import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file dashboard Anda
import { useTheme } from "../../contexts/ThemeContext";

// ===================== Types =====================
type Jenis = "Pemasukan" | "Pengeluaran";

interface Transaksi {
  id: number;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  kategori: string;
  jenis: Jenis;
  jumlah: number;
}

interface TransaksiForm {
  tanggal: string;
  keterangan: string;
  kategori: string;
  jenis: Jenis;
  jumlah: string; // string agar mudah diketik di input
}

// ===================== Constants =====================
const KATEGORI: Record<Jenis, string[]> = {
  Pemasukan: ["Iuran Anggota", "Donasi", "Sponsor", "Lainnya"],
  Pengeluaran: ["Operasional", "Kegiatan", "Konsumsi", "Perlengkapan", "Lainnya"],
};

const FILTER_JENIS: readonly (Jenis | "Semua")[] = ["Semua", "Pemasukan", "Pengeluaran"];

const ITEMS_PER_PAGE = 8;

const FORM_KOSONG: TransaksiForm = {
  tanggal: "",
  keterangan: "",
  kategori: "Iuran Anggota",
  jenis: "Pemasukan",
  jumlah: "",
};

// Ganti dengan data dari API/backend Anda.
const DATA_AWAL: Transaksi[] = [
  { id: 1, tanggal: "2026-11-01", keterangan: "Iuran anggota bulan November", kategori: "Iuran Anggota", jenis: "Pemasukan", jumlah: 2500000 },
  { id: 2, tanggal: "2026-11-02", keterangan: "Konsumsi rapat bulanan", kategori: "Konsumsi", jenis: "Pengeluaran", jumlah: 350000 },
  { id: 3, tanggal: "2026-11-03", keterangan: "Donasi dari alumni", kategori: "Donasi", jenis: "Pemasukan", jumlah: 1500000 },
  { id: 4, tanggal: "2026-11-04", keterangan: "Cetak banner kegiatan", kategori: "Perlengkapan", jenis: "Pengeluaran", jumlah: 275000 },
  { id: 5, tanggal: "2026-10-28", keterangan: "Sponsor seminar literasi digital", kategori: "Sponsor", jenis: "Pemasukan", jumlah: 3000000 },
  { id: 6, tanggal: "2026-10-25", keterangan: "Sewa gedung seminar", kategori: "Kegiatan", jenis: "Pengeluaran", jumlah: 1200000 },
  { id: 7, tanggal: "2026-10-20", keterangan: "Biaya listrik dan internet sekretariat", kategori: "Operasional", jenis: "Pengeluaran", jumlah: 450000 },
  { id: 8, tanggal: "2026-10-01", keterangan: "Iuran anggota bulan Oktober", kategori: "Iuran Anggota", jenis: "Pemasukan", jumlah: 2400000 },
  { id: 9, tanggal: "2026-10-12", keterangan: "Alat tulis dan perlengkapan", kategori: "Perlengkapan", jenis: "Pengeluaran", jumlah: 180000 },
  { id: 10, tanggal: "2026-09-30", keterangan: "Iuran anggota bulan September", kategori: "Iuran Anggota", jenis: "Pemasukan", jumlah: 2300000 },
];

// ===================== Token warna sesuai tema =====================
// Pola yang sama dengan AdminDashboard: gelap = kartu kaca + aksen lime-300,
// terang = kartu putih + aksen lime-400/700.
const DARK = {
  panel: "rounded-3xl border border-white/10 bg-white/[0.04] p-6",
  title: "text-white",
  text: "text-white/70",
  muted: "text-white/45",
  divider: "divide-white/10",
  line: "border-white/10",
  iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
  segment: "border-white/10 bg-white/[0.04]",
  segActive: "bg-lime-300 text-[#10150c]",
  segIdle: "text-white/60 hover:text-white",
  tableHead: "bg-black/20 text-white/45",
  rowHover: "hover:bg-white/[0.03]",
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
  barIn: "bg-gradient-to-t from-lime-300/5 to-lime-300/60 border-t-2 border-lime-300",
  barOut: "bg-gradient-to-t from-red-400/5 to-red-400/50 border-t-2 border-red-300",
  legendIn: "bg-lime-300",
  legendOut: "bg-red-300",
  maxLine: "border-lime-300/60",
  maxChip: "border-lime-300/40 bg-[#12170e] text-lime-300",
  track: "bg-white/15",
  trackFill: "bg-lime-300/60",
  dot: "bg-lime-300/70 ring-4 ring-lime-300/10",
  tone: {
    lime: "bg-lime-300/15 text-lime-300",
    red: "bg-red-400/15 text-red-300",
    neutral: "bg-white/[0.06] text-white/70",
  },
  toneText: {
    lime: "text-lime-300",
    red: "text-red-300",
  },
};

const LIGHT: typeof DARK = {
  panel: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
  title: "text-slate-900",
  text: "text-slate-600",
  muted: "text-slate-400",
  divider: "divide-slate-100",
  line: "border-slate-200",
  iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
  segment: "border-slate-200 bg-slate-50",
  segActive: "bg-lime-400 text-[#10150c]",
  segIdle: "text-slate-500 hover:text-slate-800",
  tableHead: "bg-slate-50 text-slate-500",
  rowHover: "hover:bg-slate-50",
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
  barIn: "bg-gradient-to-t from-lime-100 to-lime-400 border-t-2 border-lime-600",
  barOut: "bg-gradient-to-t from-red-100 to-red-400 border-t-2 border-red-500",
  legendIn: "bg-lime-500",
  legendOut: "bg-red-400",
  maxLine: "border-lime-500/70",
  maxChip: "border-lime-300 bg-white text-lime-700",
  track: "bg-slate-200",
  trackFill: "bg-lime-500/60",
  dot: "bg-lime-500 ring-4 ring-lime-200",
  tone: {
    lime: "bg-lime-100 text-lime-800",
    red: "bg-red-100 text-red-600",
    neutral: "bg-slate-100 text-slate-600",
  },
  toneText: {
    lime: "text-lime-700",
    red: "text-red-500",
  },
};

const useC = () => {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
};

// Kelas bentuk (warna ada di token `c.input`, dll.)
const pillField = "rounded-full border px-4 py-2.5 text-sm outline-none transition-colors";
const fieldBase = "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors";
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";

// ===================== Helpers =====================
const formatRupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatRupiahRingkas = (n: number): string => {
  const f = (v: number, satuan: string) =>
    `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(v)} ${satuan}`;
  if (n >= 1e9) return f(n / 1e9, "M");
  if (n >= 1e6) return f(n / 1e6, "jt");
  if (n >= 1e3) return f(n / 1e3, "rb");
  return `Rp ${n}`;
};

const formatTanggal = (tanggal: string): string =>
  new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatBulanSingkat = (bulan: string): string =>
  new Date(`${bulan}-01T00:00:00`).toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
  });

const kodeTransaksi = (id: number): string => `#TRX-${String(id).padStart(4, "0")}`;

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

// Grafik batang bergaya "Cashflow" pada gambar referensi
interface BarSeries {
  name: string;
  values: number[];
  tone: "in" | "out";
}

interface BarChartProps {
  labels: string[];
  series: BarSeries[];
  format: (n: number) => string;
  ariaLabel: string;
}

function BarChart({ labels, series, format, ariaLabel }: BarChartProps) {
  const c = useC();
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const barCls = { in: c.barIn, out: c.barOut };

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="relative mt-6 h-48">
        {[0, 25, 50, 75].map((p) => (
          <div
            key={p}
            className={`absolute inset-x-0 border-t ${c.line}`}
            style={{ bottom: `${p}%` }}
          />
        ))}
        <div className={`absolute inset-x-0 top-0 border-t border-dashed ${c.maxLine}`} />
        <span
          className={`absolute left-0 top-0 -translate-y-1/2 rounded-md border px-2 py-0.5 text-[11px] font-medium ${c.maxChip}`}
        >
          {format(max)}
        </span>

        <div className="absolute inset-0 flex items-end gap-2 px-1 sm:gap-4">
          {labels.map((label, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 items-end justify-center gap-1">
              {series.map((s) =>
                s.values[i] > 0 ? (
                  <div
                    key={s.name}
                    className={`w-full max-w-[26px] rounded-t-md ${barCls[s.tone]}`}
                    style={{ height: `${(s.values[i] / max) * 100}%` }}
                    title={`${s.name} ${label}: ${format(s.values[i])}`}
                  />
                ) : null,
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-2 px-1 sm:gap-4">
        {labels.map((label, i) => (
          <span key={i} className={`min-w-0 flex-1 truncate text-center text-xs ${c.muted}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartLegend({ series }: { series: BarSeries[] }) {
  const c = useC();
  return (
    <div className={`flex flex-wrap gap-4 text-xs ${c.text}`}>
      {series.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${s.tone === "in" ? c.legendIn : c.legendOut}`}
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}

// ===================== Component =====================
export default function Keuangan() {
  const c = useC();

  const [data, setData] = useState<Transaksi[]>(DATA_AWAL);
  const [search, setSearch] = useState<string>("");
  const [filterJenis, setFilterJenis] = useState<Jenis | "Semua">("Semua");
  const [filterBulan, setFilterBulan] = useState<string>(""); // YYYY-MM
  const [page, setPage] = useState<number>(1);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TransaksiForm>(FORM_KOSONG);
  const [deleteTarget, setDeleteTarget] = useState<Transaksi | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((t) => {
        const cocokSearch =
          !q ||
          t.keterangan.toLowerCase().includes(q) ||
          t.kategori.toLowerCase().includes(q);
        const cocokJenis = filterJenis === "Semua" || t.jenis === filterJenis;
        const cocokBulan = !filterBulan || t.tanggal.startsWith(filterBulan);
        return cocokSearch && cocokJenis && cocokBulan;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);
  }, [data, search, filterJenis, filterBulan]);

  // Ringkasan dihitung dari data yang sedang terfilter
  const masuk = filtered.filter((t) => t.jenis === "Pemasukan");
  const keluar = filtered.filter((t) => t.jenis === "Pengeluaran");
  const totalMasuk = masuk.reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluar = keluar.reduce((sum, t) => sum + t.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  // Arus kas 6 bulan terakhir (dari seluruh data, tidak terpengaruh filter)
  const arusKas = useMemo(() => {
    const map = new Map<string, { masuk: number; keluar: number }>();
    data.forEach((t) => {
      const key = t.tanggal.slice(0, 7);
      const cur = map.get(key) ?? { masuk: 0, keluar: 0 };
      if (t.jenis === "Pemasukan") cur.masuk += t.jumlah;
      else cur.keluar += t.jumlah;
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([bulan, v]) => ({ bulan, ...v }));
  }, [data]);

  const seriesArusKas: BarSeries[] = [
    { name: "Pemasukan", values: arusKas.map((a) => a.masuk), tone: "in" },
    { name: "Pengeluaran", values: arusKas.map((a) => a.keluar), tone: "out" },
  ];

  // Porsi pengeluaran per kategori (dari data terfilter)
  const kategoriPengeluaran = useMemo(() => {
    const map = new Map<string, number>();
    filtered
      .filter((t) => t.jenis === "Pengeluaran")
      .forEach((t) => map.set(t.kategori, (map.get(t.kategori) ?? 0) + t.jumlah));
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .map(([nama, jumlah]) => ({
        nama,
        jumlah,
        persen: total ? (jumlah / total) * 100 : 0,
      }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ---------- Handlers ----------
  const resetPage = () => setPage(1);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ ...FORM_KOSONG, tanggal: hariIniLokal() });
    setShowForm(true);
  };

  const bukaEdit = (t: Transaksi) => {
    setEditId(t.id);
    setForm({
      tanggal: t.tanggal,
      keterangan: t.keterangan,
      kategori: t.kategori,
      jenis: t.jenis,
      jumlah: String(t.jumlah),
    });
    setShowForm(true);
  };

  const tutupForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(FORM_KOSONG);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJenisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const jenis = e.target.value as Jenis;
    // Reset kategori ke kategori pertama dari jenis yang dipilih
    setForm((prev) => ({ ...prev, jenis, kategori: KATEGORI[jenis][0] }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const jumlah = Number(form.jumlah);
    if (!jumlah || jumlah <= 0) return;

    const payload = {
      tanggal: form.tanggal,
      keterangan: form.keterangan,
      kategori: form.kategori,
      jenis: form.jenis,
      jumlah,
    };

    if (editId !== null) {
      setData((prev) => prev.map((t) => (t.id === editId ? { ...t, ...payload } : t)));
    } else {
      const idBaru = data.length ? Math.max(...data.map((t) => t.id)) + 1 : 1;
      setData((prev) => [...prev, { id: idBaru, ...payload }]);
    }
    tutupForm();
  };

  const konfirmasiHapus = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((t) => t.id !== deleteTarget.id));
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
              Keuangan
            </h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.tone.lime}`}>
              {filtered.length} transaksi
            </span>
          </div>
          <p className={`mt-1 text-sm ${c.muted}`}>
            Catat dan pantau pemasukan serta pengeluaran organisasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            aria-label="Filter bulan"
            value={filterBulan}
            onChange={(e) => {
              setFilterBulan(e.target.value);
              resetPage();
            }}
            className={`${pillField} ${c.input}`}
          />
          <button type="button" onClick={bukaTambah} className={`${btnBase} ${c.btnPrimary}`}>
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Kartu statistik */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          accent
          label="Saldo"
          value={formatRupiah(saldo)}
          badge={saldo >= 0 ? "Surplus" : "Defisit"}
          sub="Pemasukan dikurangi pengeluaran"
          icon={Wallet}
        />
        <StatCard
          label="Total Pemasukan"
          value={formatRupiah(totalMasuk)}
          badge={`${masuk.length} transaksi`}
          sub="Dana masuk"
          icon={ArrowDownLeft}
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatRupiah(totalKeluar)}
          badge={`${keluar.length} transaksi`}
          badgeTone="red"
          sub="Dana keluar"
          icon={ArrowUpRight}
        />
      </section>

      {/* Arus kas & kategori pengeluaran */}
      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className={c.panel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-lg font-semibold ${c.title}`}>Arus Kas</h3>
              <p className={`mt-0.5 text-sm ${c.muted}`}>
                Hingga 6 bulan terakhir, dari seluruh transaksi
              </p>
            </div>
            <ChartLegend series={seriesArusKas} />
          </div>

          {arusKas.length === 0 ? (
            <p className={`py-16 text-center text-sm ${c.muted}`}>
              Belum ada data untuk ditampilkan.
            </p>
          ) : (
            <BarChart
              labels={arusKas.map((a) => formatBulanSingkat(a.bulan))}
              series={seriesArusKas}
              format={formatRupiahRingkas}
              ariaLabel="Grafik batang pemasukan dan pengeluaran per bulan"
            />
          )}
        </div>

        <div className={c.panel}>
          <h3 className={`text-lg font-semibold ${c.title}`}>Kategori Pengeluaran</h3>
          <p className={`mt-0.5 text-sm ${c.muted}`}>Porsi dari total pengeluaran (sesuai filter)</p>

          {kategoriPengeluaran.length === 0 ? (
            <p className={`py-10 text-center text-sm ${c.muted}`}>Belum ada pengeluaran.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {kategoriPengeluaran.map((k) => {
                const ukuran = 10 + (k.persen / 100) * 14;
                return (
                  <li key={k.nama} className="flex items-center gap-3">
                    <span className={`w-24 shrink-0 truncate text-sm ${c.text}`} title={k.nama}>
                      {k.nama}
                    </span>
                    <div className="relative h-6 min-w-0 flex-1">
                      <div className={`absolute inset-x-0 top-1/2 h-px ${c.track}`} />
                      <div
                        className={`absolute left-0 top-1/2 h-px ${c.trackFill}`}
                        style={{ width: `${k.persen}%` }}
                      />
                      <span
                        className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${c.dot}`}
                        style={{
                          left: `${Math.min(Math.max(k.persen, 4), 96)}%`,
                          width: ukuran,
                          height: ukuran,
                        }}
                      />
                    </div>
                    <span className={`w-11 shrink-0 text-right text-sm tabular-nums ${c.muted}`}>
                      {Math.round(k.persen)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Riwayat transaksi */}
      <section className={c.panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className={`text-lg font-semibold ${c.title}`}>Riwayat Transaksi</h3>
            <p className={`mt-0.5 text-sm ${c.muted}`}>Cari, filter, dan kelola catatan keuangan</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
              />
              <input
                type="search"
                aria-label="Cari transaksi"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                placeholder="Cari keterangan atau kategori"
                className={`${pillField} w-full pl-10 sm:w-64 ${c.input}`}
              />
            </div>
            <Segment
              label="Filter jenis transaksi"
              options={FILTER_JENIS}
              value={filterJenis}
              onChange={(v) => {
                setFilterJenis(v);
                resetPage();
              }}
            />
          </div>
        </div>

        <div className={`mt-5 overflow-x-auto rounded-2xl border ${c.line}`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className={`text-xs uppercase tracking-wide ${c.tableHead}`}>
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Deskripsi</th>
                <th scope="col" className="px-4 py-3 font-medium">ID Transaksi</th>
                <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Jumlah</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-4 py-12 text-center ${c.muted}`}>
                    Transaksi tidak ditemukan.
                  </td>
                </tr>
              ) : (
                pageData.map((t) => {
                  const isMasuk = t.jenis === "Pemasukan";
                  return (
                    <tr key={t.id} className={`transition-colors ${c.rowHover}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                              isMasuk ? c.tone.lime : c.tone.red
                            }`}
                          >
                            {isMasuk ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </span>
                          <div className="min-w-0 max-w-[16rem]">
                            <p className={`truncate font-medium ${c.title}`}>{t.keterangan}</p>
                            <p className={`text-xs ${c.muted}`}>{formatTanggal(t.tanggal)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 tabular-nums ${c.text}`}>
                        {kodeTransaksi(t.id)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.tone.neutral}`}>
                          {t.kategori}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                          isMasuk ? c.toneText.lime : c.toneText.red
                        }`}
                      >
                        <span className="sr-only">{t.jenis}: </span>
                        {isMasuk ? "+" : "-"} {formatRupiah(t.jumlah)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => bukaEdit(t)}
                            aria-label={`Edit transaksi ${t.keterangan}`}
                            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${c.iconBtn}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(t)}
                            aria-label={`Hapus transaksi ${t.keterangan}`}
                            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${c.btnGhostDanger}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className={`text-sm ${c.muted}`}>
            Menampilkan {filtered.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} transaksi
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Halaman sebelumnya"
              className={`grid h-9 w-9 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${c.iconBtn}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`px-2 text-sm tabular-nums ${c.text}`}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Halaman berikutnya"
              className={`grid h-9 w-9 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${c.iconBtn}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal Tambah / Edit */}
      {showForm && (
        <Modal title={editId !== null ? "Edit Transaksi" : "Tambah Transaksi"} onClose={tutupForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tanggal" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Tanggal
                </label>
                <input id="tanggal" type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className={`${fieldBase} ${c.input}`} />
              </div>
              <div>
                <label htmlFor="jenis" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Jenis
                </label>
                <select id="jenis" name="jenis" value={form.jenis} onChange={handleJenisChange} className={`${fieldBase} ${c.input}`}>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="keterangan" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                Keterangan
              </label>
              <input id="keterangan" name="keterangan" value={form.keterangan} onChange={handleChange} required className={`${fieldBase} ${c.input}`} placeholder="Contoh: Iuran anggota bulan November" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kategori" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Kategori
                </label>
                <select id="kategori" name="kategori" value={form.kategori} onChange={handleChange} className={`${fieldBase} ${c.input}`}>
                  {KATEGORI[form.jenis].map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="jumlah" className={`mb-1.5 block text-sm font-medium ${c.text}`}>
                  Jumlah (Rp)
                </label>
                <input id="jumlah" type="number" min={1} name="jumlah" value={form.jumlah} onChange={handleChange} required className={`${fieldBase} ${c.input}`} placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={tutupForm} className={`${btnBase} border ${c.btnGhost}`}>
                Batal
              </button>
              <button type="submit" className={`${btnBase} ${c.btnPrimary}`}>
                {editId !== null ? "Simpan Perubahan" : "Tambah"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <Modal title="Hapus Transaksi?" size="sm" onClose={() => setDeleteTarget(null)}>
          <p className={`text-sm ${c.text}`}>
            Transaksi <span className={`font-semibold ${c.title}`}>{deleteTarget.keterangan}</span>{" "}
            sebesar{" "}
            <span className={`font-semibold ${c.title}`}>{formatRupiah(deleteTarget.jumlah)}</span>{" "}
            akan dihapus.
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