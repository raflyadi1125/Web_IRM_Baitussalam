import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Plus,
  Sparkles,
  Users,
  Wallet,
  CalendarDays,
  Box,
  Megaphone,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file dashboard Anda
import { useTheme } from "../../contexts/ThemeContext";

/* ---------- Tipe & data contoh (ganti dengan data dari API) ---------- */

interface StatCard {
  label: string;
  value: string;
  sub: string;
  badge: string;
  icon: LucideIcon;
}

type Category = "Semua" | "Kajian" | "Sosial & Seni";
type AgendaCategory = Exclude<Category, "Semua">;

interface Agenda {
  title: string;
  iso: string; // yyyy-mm-dd, dipakai untuk mengurutkan
  date: string; // tampilan, mis. "7 Nov"
  time: string;
  place: string;
  category: AgendaCategory;
}

/** Data yang dikirim form "Tambah Kegiatan Baru" */
export interface NewActivity {
  judul: string;
  tanggal: string; // yyyy-mm-dd
  waktu: string; // HH:mm
  tempat: string;
  kategori: AgendaCategory;
}

/** Data yang dikirim form "Catat Kas Masuk" */
export interface NewCash {
  keterangan: string;
  jumlah: number;
  tanggal: string; // yyyy-mm-dd
}

const AGENDA: Agenda[] = [
  { title: "Kajian Rutin Malam Sabtu", iso: "2026-11-07", date: "7 Nov", time: "19.30 WIB", place: "Aula Masjid", category: "Kajian" },
  { title: "Latihan Hadroh Remaja", iso: "2026-11-09", date: "9 Nov", time: "16.00 WIB", place: "Teras Masjid", category: "Sosial & Seni" },
  { title: "Bakti Sosial Warga", iso: "2026-11-14", date: "14 Nov", time: "08.00 WIB", place: "Balai RW", category: "Sosial & Seni" },
  { title: "Tahsin Al-Qur'an", iso: "2026-11-16", date: "16 Nov", time: "18.45 WIB", place: "Ruang Utama", category: "Kajian" },
];

const ANNOUNCEMENTS = [
  { title: "Rapat Persiapan Maulid", body: "Seluruh pengurus diharapkan hadir Ahad ini ba'da Ashar." },
  { title: "Pengumpulan Infaq Pembangunan", body: "Kas khusus dibuka sampai akhir bulan." },
];

const FILTERS: Category[] = ["Semua", "Kajian", "Sosial & Seni"];
const CATEGORIES: AgendaCategory[] = ["Kajian", "Sosial & Seni"];

// Nilai awal contoh (ganti dengan data dari API)
const SALDO_AWAL = 14_250_000;
const PEMASUKAN_AWAL = 3_200_000;
const KEGIATAN_SELESAI = 2;

/* ---------- Helper ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "T00:00:00" supaya tanggal dibaca sebagai waktu lokal (bukan UTC)
const toAgenda = (d: NewActivity): Agenda => {
  const dt = new Date(`${d.tanggal}T00:00:00`);
  return {
    title: d.judul.trim(),
    iso: d.tanggal,
    date: `${dt.getDate()} ${dt.toLocaleDateString("id-ID", { month: "short" })}`,
    time: `${d.waktu.replace(":", ".")} WIB`,
    place: d.tempat.trim(),
    category: d.kategori,
  };
};

const formatKas = (n: number) => `Rp ${Math.round(n / 1000).toLocaleString("id-ID")}k`;

const formatRupiah = (n: number) =>
  n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

/* ---------- Token warna sesuai tema ---------- */

function getTokens(isDark: boolean) {
  return isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        badge: "bg-lime-300/15 text-lime-300",
        segment: "border-white/10 bg-white/[0.04]",
        segActive: "bg-lime-300 text-[#10150c]",
        segIdle: "text-white/60 hover:text-white",
        dateTile: "border-lime-300/20 bg-lime-300/10 text-lime-300",
        tag: "bg-white/[0.06] text-white/70",
        note: "border-white/10 bg-white/[0.03]",
        noteIcon: "bg-lime-300/15 text-lime-300",
        // modal & form
        overlay: "bg-black/70",
        panel: "border-white/10 bg-[#141a10]",
        closeBtn: "text-white/50 hover:bg-white/[0.08] hover:text-white",
        label: "text-white/80",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30 [color-scheme:dark]",
        inputError: "border-red-400/50",
        fieldError: "text-red-300",
        cancelBtn: "border-white/15 text-white/70 hover:bg-white/[0.06]",
        primaryBtn: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        toast: "border-lime-300/30 bg-[#141a10] text-lime-300",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "divide-slate-100",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        badge: "bg-lime-100 text-lime-800",
        segment: "border-slate-200 bg-slate-50",
        segActive: "bg-lime-400 text-[#10150c]",
        segIdle: "text-slate-500 hover:text-slate-800",
        dateTile: "border-lime-200 bg-lime-50 text-lime-700",
        tag: "bg-slate-100 text-slate-600",
        note: "border-slate-200 bg-slate-50",
        noteIcon: "bg-lime-100 text-lime-700",
        // modal & form
        overlay: "bg-black/40",
        panel: "border-slate-200 bg-white",
        closeBtn: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
        label: "text-slate-700",
        input:
          "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50",
        inputError: "border-red-300",
        fieldError: "text-red-700",
        cancelBtn: "border-slate-200 text-slate-600 hover:bg-slate-50",
        primaryBtn: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        toast: "border-lime-300 bg-white text-lime-800 shadow-lg",
      };
}

type Tokens = ReturnType<typeof getTokens>;

const inputCls = (c: Tokens, hasError: boolean) =>
  `h-11 w-full min-w-0 rounded-xl border px-4 text-sm outline-none transition focus:ring-2 ${c.input} ${
    hasError ? c.inputError : ""
  }`;

/* ---------- Komponen modal & field ---------- */

function Modal({
  open,
  title,
  onClose,
  c,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  c: Tokens;
  children: ReactNode;
}) {
  // Tutup dengan tombol Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
        className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border p-6 shadow-2xl ${c.panel}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className={`text-lg font-semibold ${c.title}`}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${c.closeBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  c,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  c: Tokens;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className={`mb-1.5 block text-xs font-semibold ${c.label}`}>
        {label}
      </label>
      {children}
      {error && <p className={`mt-1.5 text-xs ${c.fieldError}`}>{error}</p>}
    </div>
  );
}

function FormActions({ c, submitLabel, onCancel }: { c: Tokens; submitLabel: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${c.cancelBtn}`}
      >
        Batal
      </button>
      <button
        type="submit"
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${c.primaryBtn}`}
      >
        {submitLabel}
      </button>
    </div>
  );
}

/* ---------- Form Tambah Kegiatan ---------- */

function ActivityForm({
  c,
  onSubmit,
  onCancel,
}: {
  c: Tokens;
  onSubmit: (data: NewActivity) => void;
  onCancel: () => void;
}) {
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());
  const [waktu, setWaktu] = useState("19:30");
  const [tempat, setTempat] = useState("");
  const [kategori, setKategori] = useState<AgendaCategory>("Kajian");
  const [errors, setErrors] = useState<Partial<Record<"judul" | "tanggal" | "waktu" | "tempat", string>>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!judul.trim()) next.judul = "Nama kegiatan wajib diisi.";
    if (!tanggal) next.tanggal = "Tanggal wajib diisi.";
    if (!waktu) next.waktu = "Waktu wajib diisi.";
    if (!tempat.trim()) next.tempat = "Tempat wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ judul, tanggal, waktu, tempat, kategori });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Nama kegiatan" htmlFor="act-judul" error={errors.judul} c={c}>
        <input
          id="act-judul"
          type="text"
          autoFocus
          placeholder="Mis. Kajian Rutin Malam Sabtu"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className={inputCls(c, Boolean(errors.judul))}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tanggal" htmlFor="act-tanggal" error={errors.tanggal} c={c}>
          <input
            id="act-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputCls(c, Boolean(errors.tanggal))}
          />
        </Field>
        <Field label="Waktu" htmlFor="act-waktu" error={errors.waktu} c={c}>
          <input
            id="act-waktu"
            type="time"
            value={waktu}
            onChange={(e) => setWaktu(e.target.value)}
            className={inputCls(c, Boolean(errors.waktu))}
          />
        </Field>
      </div>

      <Field label="Tempat" htmlFor="act-tempat" error={errors.tempat} c={c}>
        <input
          id="act-tempat"
          type="text"
          placeholder="Mis. Aula Masjid"
          value={tempat}
          onChange={(e) => setTempat(e.target.value)}
          className={inputCls(c, Boolean(errors.tempat))}
        />
      </Field>

      <Field label="Kategori" htmlFor="act-kategori" c={c}>
        <select
          id="act-kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value as AgendaCategory)}
          className={inputCls(c, false)}
        >
          {CATEGORIES.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </Field>

      <FormActions c={c} submitLabel="Simpan Kegiatan" onCancel={onCancel} />
    </form>
  );
}

/* ---------- Form Catat Kas Masuk ---------- */

function CashForm({
  c,
  onSubmit,
  onCancel,
}: {
  c: Tokens;
  onSubmit: (data: NewCash) => void;
  onCancel: () => void;
}) {
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());
  const [errors, setErrors] = useState<Partial<Record<"keterangan" | "jumlah" | "tanggal", string>>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nominal = Number(jumlah);
    const next: typeof errors = {};
    if (!keterangan.trim()) next.keterangan = "Keterangan wajib diisi.";
    if (!jumlah || !Number.isFinite(nominal) || nominal <= 0) next.jumlah = "Jumlah harus lebih dari 0.";
    if (!tanggal) next.tanggal = "Tanggal wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ keterangan: keterangan.trim(), jumlah: nominal, tanggal });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Keterangan" htmlFor="cash-ket" error={errors.keterangan} c={c}>
        <input
          id="cash-ket"
          type="text"
          autoFocus
          placeholder="Mis. Infaq Jumat, iuran anggota"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className={inputCls(c, Boolean(errors.keterangan))}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Jumlah (Rp)" htmlFor="cash-jumlah" error={errors.jumlah} c={c}>
          <input
            id="cash-jumlah"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="100000"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className={inputCls(c, Boolean(errors.jumlah))}
          />
        </Field>
        <Field label="Tanggal" htmlFor="cash-tanggal" error={errors.tanggal} c={c}>
          <input
            id="cash-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputCls(c, Boolean(errors.tanggal))}
          />
        </Field>
      </div>

      <FormActions c={c} submitLabel="Simpan Kas" onCancel={onCancel} />
    </form>
  );
}

/* ---------- Dashboard ---------- */

interface AdminDashboardProps {
  /** Dipanggil setelah kegiatan baru disimpan (mis. untuk kirim ke API) */
  onActivityAdded?: (data: NewActivity) => void;
  /** Dipanggil setelah kas masuk disimpan (mis. untuk kirim ke API) */
  onCashAdded?: (data: NewCash) => void;
}

export default function AdminDashboard({ onActivityAdded, onCashAdded }: AdminDashboardProps) {
  const [filter, setFilter] = useState<Category>("Semua");
  const [agenda, setAgenda] = useState<Agenda[]>(AGENDA);
  const [saldo, setSaldo] = useState(SALDO_AWAL);
  const [pemasukan, setPemasukan] = useState(PEMASUKAN_AWAL);
  const [modal, setModal] = useState<"kegiatan" | "kas" | null>(null);
  const [notice, setNotice] = useState("");

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const c = getTokens(isDark);

  // Sembunyikan notifikasi otomatis
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const closeModal = () => setModal(null);

  const handleAddActivity = (data: NewActivity) => {
    // TODO: kirim ke API di sini
    setAgenda((prev) => [...prev, toAgenda(data)].sort((a, b) => a.iso.localeCompare(b.iso)));
    setModal(null);
    setNotice("Kegiatan baru berhasil ditambahkan.");
    onActivityAdded?.(data);
  };

  const handleAddCash = (data: NewCash) => {
    // TODO: kirim ke API di sini
    setSaldo((v) => v + data.jumlah);
    setPemasukan((v) => v + data.jumlah);
    setModal(null);
    setNotice(`Kas masuk ${formatRupiah(data.jumlah)} berhasil dicatat.`);
    onCashAdded?.(data);
  };

  const stats: StatCard[] = [
    {
      label: "Total Anggota Aktif",
      value: "128",
      sub: "72 Remaja Putra, 56 Putri",
      badge: "▲ +12% bln ini",
      icon: Users,
    },
    {
      label: "Saldo Kas IRMA",
      value: formatKas(saldo),
      sub: `Pemasukan bln ini: ${formatRupiah(pemasukan)}`,
      badge: "Segar & Aman",
      icon: Wallet,
    },
    {
      label: "Kegiatan Bulan Ini",
      value: `${agenda.length + KEGIATAN_SELESAI} Program`,
      sub: `${agenda.length} Agenda mendatang`,
      badge: `${KEGIATAN_SELESAI} Selesai`,
      icon: CalendarDays,
    },
    {
      label: "Inventaris Pemuda",
      value: "42 Item",
      sub: "Sound system, alat hadroh, dll",
      badge: "98% Baik",
      icon: Box,
    },
  ];

  const filtered = agenda.filter((a) => filter === "Semua" || a.category === filter);

  const card = `rounded-3xl border p-6 ${c.card}`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <span className="relative inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1.5 text-sm font-medium text-lime-300">
          <Sparkles className="h-4 w-4" />
          Assalamu'alaikum, Akhi & Ukhti
        </span>

        <h2 className="relative mt-4 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Selamat Datang di Portal Pemuda Masjid Baitussalam
        </h2>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          "Barangsiapa memakmurkan masjid-masjid Allah, sesungguhnya mereka
          termasuk orang-orang yang mendapat petunjuk." Mari terus tingkatkan
          semangat ukhuwah dan ketaqwaan.
        </p>

        <div className="relative mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModal("kegiatan")}
            className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] transition-colors hover:bg-lime-200"
          >
            <Plus className="h-4 w-4" />
            Tambah Kegiatan Baru
          </button>
          <button
            type="button"
            onClick={() => setModal("kas")}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-lime-300/40 hover:text-lime-300"
          >
            <Plus className="h-4 w-4" />
            Catat Kas Masuk
          </button>
        </div>
      </section>

      {/* Kartu statistik */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, badge, icon: Icon }) => (
          <div key={label} className={`${card} min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <p className={`text-sm font-medium ${c.text}`}>{label}</p>
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>

            <p
              className={`mt-4 whitespace-nowrap text-3xl font-semibold tracking-tight ${c.title}`}
            >
              {value}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${c.badge}`}
              >
                {badge}
              </span>
              <p className={`min-w-0 text-xs ${c.muted}`}>{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Jadwal & Pengumuman */}
      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-semibold ${c.title}`}>
                Jadwal Kegiatan Terdekat
              </h3>
              <p className={`mt-0.5 text-sm ${c.muted}`}>
                Agenda dakwah & sosial IRMA Baitussalam
              </p>
            </div>
            <div className={`flex rounded-full border p-1 ${c.segment}`}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === f ? c.segActive : c.segIdle
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ul className={`mt-5 divide-y ${c.divider}`}>
            {filtered.map((a) => (
              <li key={`${a.iso}-${a.title}`} className="flex items-center gap-4 py-4">
                <div
                  className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${c.dateTile}`}
                >
                  <span className="text-lg font-semibold leading-none">
                    {a.date.split(" ")[0]}
                  </span>
                  <span className="mt-0.5 text-[11px]">
                    {a.date.split(" ")[1]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${c.title}`}>{a.title}</p>
                  <p
                    className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${c.muted}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {a.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {a.place}
                    </span>
                  </p>
                </div>
                <span
                  className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-medium sm:inline-block ${c.tag}`}
                >
                  {a.category}
                </span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className={`py-8 text-center text-sm ${c.muted}`}>
                Belum ada agenda di kategori ini.
              </li>
            )}
          </ul>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3">
            <span
              className={`grid h-10 w-10 place-items-center rounded-full ${c.noteIcon}`}
            >
              <Megaphone className="h-5 w-5" />
            </span>
            <h3 className={`text-lg font-semibold ${c.title}`}>
              Pengumuman & Info
            </h3>
          </div>

          <div className="mt-5 space-y-3">
            {ANNOUNCEMENTS.map((n) => (
              <div
                key={n.title}
                className={`rounded-2xl border p-4 ${c.note}`}
              >
                <p className={`font-medium ${c.title}`}>{n.title}</p>
                <p className={`mt-1 text-sm ${c.text}`}>{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal: Tambah Kegiatan */}
      <Modal open={modal === "kegiatan"} title="Tambah Kegiatan Baru" onClose={closeModal} c={c}>
        <ActivityForm c={c} onSubmit={handleAddActivity} onCancel={closeModal} />
      </Modal>

      {/* Modal: Catat Kas Masuk */}
      <Modal open={modal === "kas"} title="Catat Kas Masuk" onClose={closeModal} c={c}>
        <CashForm c={c} onSubmit={handleAddCash} onCancel={closeModal} />
      </Modal>

      {/* Notifikasi berhasil */}
      {notice && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium ${c.toast}`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{notice}</span>
        </div>
      )}
    </div>
  );
}