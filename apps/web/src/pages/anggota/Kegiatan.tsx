import { useMemo, useState } from "react";
import { Search, CalendarDays, Clock, MapPin } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";

type Status = "Akan Datang" | "Berlangsung" | "Selesai";

interface Kegiatan {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: string; // ISO date
  waktu: string;
  lokasi: string;
  status: Status;
}

// TODO: ganti dengan data dari API
const dataKegiatan: Kegiatan[] = [
  {
    id: 1,
    judul: "Rapat Bulanan Anggota",
    deskripsi: "Evaluasi program kerja bulan lalu dan perencanaan bulan berikutnya.",
    tanggal: "2026-11-12",
    waktu: "19:00 WIB",
    lokasi: "Aula Utama",
    status: "Akan Datang",
  },
  {
    id: 2,
    judul: "Bakti Sosial",
    deskripsi: "Kegiatan pembagian bantuan kepada warga sekitar.",
    tanggal: "2026-11-20",
    waktu: "08:00 WIB",
    lokasi: "Desa Cibiru",
    status: "Akan Datang",
  },
  {
    id: 3,
    judul: "Pelatihan Kepemimpinan",
    deskripsi: "Pelatihan soft skill dan kepemimpinan untuk seluruh anggota.",
    tanggal: "2026-11-06",
    waktu: "09:00 WIB",
    lokasi: "Ruang Seminar",
    status: "Berlangsung",
  },
  {
    id: 4,
    judul: "Gotong Royong",
    deskripsi: "Membersihkan lingkungan sekretariat bersama.",
    tanggal: "2026-10-25",
    waktu: "07:30 WIB",
    lokasi: "Sekretariat",
    status: "Selesai",
  },
];

const filterOptions: ("Semua" | Status)[] = ["Semua", "Akan Datang", "Berlangsung", "Selesai"];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function Kegiatan() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | Status>("Semua");
  const [terdaftar, setTerdaftar] = useState<number[]>([3]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasil = useMemo(
    () =>
      dataKegiatan.filter(
        (k) =>
          (filter === "Semua" || k.status === filter) &&
          k.judul.toLowerCase().includes(search.toLowerCase())
      ),
    [search, filter]
  );

  const toggleDaftar = (id: number) =>
    setTerdaftar((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30",
        segment: "border-white/10 bg-white/[0.04]",
        segActive: "bg-lime-300 text-[#10150c]",
        segIdle: "text-white/60 hover:text-white",
        iconMuted: "text-lime-300",
        btnJoin: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        btnCancel: "bg-red-400/10 text-red-300 hover:bg-red-400/20",
        status: {
          "Akan Datang": "bg-sky-300/15 text-sky-300",
          Berlangsung: "bg-lime-300/15 text-lime-300",
          Selesai: "bg-white/[0.08] text-white/50",
        } as Record<Status, string>,
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        input:
          "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50",
        segment: "border-slate-200 bg-slate-50",
        segActive: "bg-lime-400 text-[#10150c]",
        segIdle: "text-slate-500 hover:text-slate-800",
        iconMuted: "text-lime-700",
        btnJoin: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        btnCancel: "bg-red-50 text-red-600 hover:bg-red-100",
        status: {
          "Akan Datang": "bg-sky-100 text-sky-700",
          Berlangsung: "bg-lime-100 text-lime-800",
          Selesai: "bg-slate-100 text-slate-500",
        } as Record<Status, string>,
      };

  const card = `rounded-3xl border p-6 ${c.card}`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Kegiatan
        </h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Lihat dan daftar kegiatan organisasi.
        </p>
      </section>

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
            className={`w-full rounded-full border py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 ${c.input}`}
          />
        </div>
        <div className={`flex flex-wrap rounded-full border p-1 ${c.segment}`}>
          {filterOptions.map((opt) => (
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

      {/* Daftar kegiatan */}
      {hasil.length === 0 ? (
        <p className={`py-10 text-center text-sm ${c.muted}`}>Tidak ada kegiatan ditemukan.</p>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {hasil.map((k) => {
            const sudahDaftar = terdaftar.includes(k.id);
            return (
              <div key={k.id} className={`${card} flex flex-col`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className={`text-lg font-semibold ${c.title}`}>{k.judul}</h3>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${c.status[k.status]}`}
                  >
                    {k.status}
                  </span>
                </div>

                <p className={`mt-2 flex-1 text-sm leading-relaxed ${c.text}`}>{k.deskripsi}</p>

                <div className={`mt-4 space-y-1.5 text-sm ${c.muted}`}>
                  <p className="flex items-center gap-2">
                    <CalendarDays className={`h-4 w-4 shrink-0 ${c.iconMuted}`} />
                    {formatTanggal(k.tanggal)}
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {k.waktu}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className={`h-4 w-4 shrink-0 ${c.iconMuted}`} />
                    {k.lokasi}
                  </p>
                </div>

                {k.status !== "Selesai" && (
                  <button
                    type="button"
                    onClick={() => toggleDaftar(k.id)}
                    className={`mt-5 w-full rounded-full py-2.5 text-sm font-semibold transition-colors ${
                      sudahDaftar ? c.btnCancel : c.btnJoin
                    }`}
                  >
                    {sudahDaftar ? "Batalkan Pendaftaran" : "Daftar Kegiatan"}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}