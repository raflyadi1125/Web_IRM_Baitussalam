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
  UserRound,
  X,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";
import { KATEGORI, keuangan, ringkasan, useTransaksi, type Jenis } from "../../data/keuangan";
import {
  DAFTAR_STATUS,
  kegiatan,
  useKegiatan,
  type KegiatanInput,
  type StatusKegiatan,
} from "../../data/kegiatan";

/* ---------- Tipe & data contoh ---------- */

interface StatCard {
  label: string;
  value: string;
  sub: string;
  badge: string;
  icon: LucideIcon;
}

/** Filter jadwal terdekat: hanya kegiatan yang belum selesai */
type FilterAgenda = "Semua" | "Akan Datang" | "Berlangsung";
const FILTERS: FilterAgenda[] = ["Semua", "Akan Datang", "Berlangsung"];

/** Data yang dikirim form "Tambah Kegiatan Baru" (sama dengan form di halaman Kegiatan) */
export type NewActivity = KegiatanInput;

/** Data yang dikirim form "Catat Kas Masuk" / "Catat Kas Keluar" */
export interface NewCash {
  jenis: Jenis;
  keterangan: string;
  kategori: string;
  jumlah: number;
  tanggal: string; // yyyy-mm-dd
}

const ANNOUNCEMENTS = [
  { title: "Rapat Persiapan Maulid", body: "Seluruh pengurus diharapkan hadir Ahad ini ba'da Ashar." },
  { title: "Pengumpulan Infaq Pembangunan", body: "Kas khusus dibuka sampai akhir bulan." },
];

/* ---------- Helper ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatKas = (n: number) => `Rp ${Math.round(n / 1000).toLocaleString("id-ID")}k`;

const formatRupiah = (n: number) =>
  n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

// "T00:00:00" supaya tanggal dibaca sebagai waktu lokal (bukan UTC)
const tileTanggal = (iso: string) => {
  const dt = new Date(`${iso}T00:00:00`);
  return {
    hari: String(dt.getDate()),
    bulan: dt.toLocaleDateString("id-ID", { month: "short" }),
  };
};

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

const textareaCls = (c: Tokens) =>
  `w-full min-w-0 rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${c.input}`;

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

/* ---------- Form Tambah Kegiatan (field sama dengan halaman Kegiatan) ---------- */

type ActivityErrors = Partial<
  Record<"nama" | "tanggal" | "waktu" | "lokasi" | "penanggungJawab", string>
>;

function ActivityForm({
  c,
  onSubmit,
  onCancel,
}: {
  c: Tokens;
  onSubmit: (data: NewActivity) => void;
  onCancel: () => void;
}) {
  const [nama, setNama] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());
  const [waktu, setWaktu] = useState("08:00");
  const [lokasi, setLokasi] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [status, setStatus] = useState<StatusKegiatan>("Akan Datang");
  const [deskripsi, setDeskripsi] = useState("");
  const [errors, setErrors] = useState<ActivityErrors>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: ActivityErrors = {};
    if (!nama.trim()) next.nama = "Nama kegiatan wajib diisi.";
    if (!tanggal) next.tanggal = "Tanggal wajib diisi.";
    if (!waktu) next.waktu = "Waktu wajib diisi.";
    if (!lokasi.trim()) next.lokasi = "Lokasi wajib diisi.";
    if (!penanggungJawab.trim()) next.penanggungJawab = "Penanggung jawab wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      nama: nama.trim(),
      tanggal,
      waktu,
      lokasi: lokasi.trim(),
      penanggungJawab: penanggungJawab.trim(),
      deskripsi: deskripsi.trim(),
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Nama kegiatan" htmlFor="act-nama" error={errors.nama} c={c}>
        <input
          id="act-nama"
          type="text"
          autoFocus
          placeholder="Masukkan nama kegiatan"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className={inputCls(c, Boolean(errors.nama))}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Lokasi" htmlFor="act-lokasi" error={errors.lokasi} c={c}>
          <input
            id="act-lokasi"
            type="text"
            placeholder="Tempat kegiatan"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className={inputCls(c, Boolean(errors.lokasi))}
          />
        </Field>
        <Field label="Penanggung jawab" htmlFor="act-pj" error={errors.penanggungJawab} c={c}>
          <input
            id="act-pj"
            type="text"
            placeholder="Nama PJ"
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            className={inputCls(c, Boolean(errors.penanggungJawab))}
          />
        </Field>
      </div>

      <Field label="Status" htmlFor="act-status" c={c}>
        <select
          id="act-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusKegiatan)}
          className={inputCls(c, false)}
        >
          {DAFTAR_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Deskripsi" htmlFor="act-deskripsi" c={c}>
        <textarea
          id="act-deskripsi"
          rows={3}
          placeholder="Deskripsi singkat kegiatan"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className={textareaCls(c)}
        />
      </Field>

      <FormActions c={c} submitLabel="Simpan Kegiatan" onCancel={onCancel} />
    </form>
  );
}

/* ---------- Form Catat Kas Masuk / Keluar ---------- */

function CashForm({
  c,
  jenis,
  onSubmit,
  onCancel,
}: {
  c: Tokens;
  jenis: Jenis;
  onSubmit: (data: NewCash) => void;
  onCancel: () => void;
}) {
  const isMasuk = jenis === "Pemasukan";
  const [keterangan, setKeterangan] = useState("");
  const [kategori, setKategori] = useState(KATEGORI[jenis][0]);
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
    onSubmit({ jenis, keterangan: keterangan.trim(), kategori, jumlah: nominal, tanggal });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Keterangan" htmlFor="cash-ket" error={errors.keterangan} c={c}>
        <input
          id="cash-ket"
          type="text"
          autoFocus
          placeholder={isMasuk ? "Mis. Infaq Jumat, iuran anggota" : "Mis. Konsumsi rapat, cetak banner"}
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className={inputCls(c, Boolean(errors.keterangan))}
        />
      </Field>

      <Field label="Kategori" htmlFor="cash-kategori" c={c}>
        <select
          id="cash-kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className={inputCls(c, false)}
        >
          {KATEGORI[jenis].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
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

      <FormActions c={c} submitLabel={isMasuk ? "Simpan Kas Masuk" : "Simpan Kas Keluar"} onCancel={onCancel} />
    </form>
  );
}

/* ---------- Dashboard ---------- */

interface DashboardAdminProps {
  /** Dipanggil setelah kegiatan baru disimpan (mis. untuk kirim ke API) */
  onActivityAdded?: (data: NewActivity) => void;
  /** Dipanggil setelah kas masuk/keluar disimpan (mis. untuk kirim ke API) */
  onCashAdded?: (data: NewCash) => void;
}

export default function DashboardAdmin({ onActivityAdded, onCashAdded }: DashboardAdminProps) {
  const [filter, setFilter] = useState<FilterAgenda>("Semua");
  const [modal, setModal] = useState<"kegiatan" | "kas" | "kasKeluar" | null>(null);
  const [notice, setNotice] = useState("");

  // Data keuangan diambil dari keuangan.ts (sama persis dengan halaman Keuangan)
  const transaksi = useTransaksi();
  const bulanIni = todayISO().slice(0, 7);
  const { saldo } = ringkasan(transaksi);
  const { totalMasuk: pemasukan, totalKeluar: pengeluaran } = ringkasan(transaksi, bulanIni);

  // Data kegiatan diambil dari kegiatan.ts (sama persis dengan halaman Kegiatan)
  const semuaKegiatan = useKegiatan();
  const belumSelesai = (s: StatusKegiatan) => s === "Akan Datang" || s === "Berlangsung";
  const agendaTerdekat = semuaKegiatan
    .filter((k) => belumSelesai(k.status))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.waktu.localeCompare(b.waktu));
  const kegiatanBulanIni = semuaKegiatan.filter((k) => k.tanggal.startsWith(bulanIni));
  const mendatangBulanIni = kegiatanBulanIni.filter((k) => belumSelesai(k.status)).length;
  const selesaiBulanIni = kegiatanBulanIni.filter((k) => k.status === "Selesai").length;

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
    // Disimpan ke kegiatan.ts, langsung muncul di halaman Kegiatan
    kegiatan.add(data);
    setModal(null);
    setNotice("Kegiatan baru berhasil ditambahkan.");
    onActivityAdded?.(data);
  };

  const handleAddCash = (data: NewCash) => {
    // Disimpan sebagai transaksi (Pemasukan / Pengeluaran), langsung muncul di halaman Keuangan
    keuangan.add({
      tanggal: data.tanggal,
      keterangan: data.keterangan,
      kategori: data.kategori,
      jenis: data.jenis,
      jumlah: data.jumlah,
    });
    setModal(null);
    setNotice(
      `${data.jenis === "Pemasukan" ? "Kas masuk" : "Kas keluar"} ${formatRupiah(data.jumlah)} berhasil dicatat.`,
    );
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
      sub: `Masuk bln ini: ${formatRupiah(pemasukan)} · Keluar: ${formatRupiah(pengeluaran)}`,
      badge: saldo >= 0 ? "Surplus" : "Defisit",
      icon: Wallet,
    },
    {
      label: "Kegiatan Bulan Ini",
      value: `${kegiatanBulanIni.length} Program`,
      sub: `${mendatangBulanIni} Agenda mendatang`,
      badge: `${selesaiBulanIni} Selesai`,
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

  const filtered = agendaTerdekat.filter((k) => filter === "Semua" || k.status === filter);

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
          <button
            type="button"
            onClick={() => setModal("kasKeluar")}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-red-300/40 hover:text-red-300"
          >
            <Plus className="h-4 w-4" />
            Catat Kas Keluar
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
                Kegiatan yang akan datang dan sedang berlangsung
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
            {filtered.map((k) => {
              const { hari, bulan } = tileTanggal(k.tanggal);
              return (
                <li key={k.id} className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${c.dateTile}`}
                  >
                    <span className="text-lg font-semibold leading-none">{hari}</span>
                    <span className="mt-0.5 text-[11px]">{bulan}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${c.title}`}>{k.nama}</p>
                    <p
                      className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${c.muted}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> {k.waktu.replace(":", ".")} WIB
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {k.lokasi}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-4 w-4" /> {k.penanggungJawab}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-medium sm:inline-block ${c.tag}`}
                  >
                    {k.status}
                  </span>
                </li>
              );
            })}
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
        <CashForm c={c} jenis="Pemasukan" onSubmit={handleAddCash} onCancel={closeModal} />
      </Modal>

      {/* Modal: Catat Kas Keluar */}
      <Modal open={modal === "kasKeluar"} title="Catat Kas Keluar" onClose={closeModal} c={c}>
        <CashForm c={c} jenis="Pengeluaran" onSubmit={handleAddCash} onCancel={closeModal} />
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