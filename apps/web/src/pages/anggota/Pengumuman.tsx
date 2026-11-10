import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, CalendarDays, User } from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";

type Kategori = "Umum" | "Kegiatan" | "Keuangan";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: Kategori;
  tanggal: string; // ISO date
  penulis: string;
  isi: string;
}

// TODO: ganti dengan data dari API
const dataPengumuman: Pengumuman[] = [
  {
    id: 1,
    judul: "Jadwal Rapat Bulan November",
    kategori: "Kegiatan",
    tanggal: "2026-11-05",
    penulis: "Sekretaris",
    isi: "Rapat bulanan akan dilaksanakan pada tanggal 12 November 2026 pukul 19:00 WIB di Aula Utama. Seluruh anggota diharapkan hadir tepat waktu dan membawa laporan masing-masing divisi.",
  },
  {
    id: 2,
    judul: "Pembayaran Iuran Anggota",
    kategori: "Keuangan",
    tanggal: "2026-11-02",
    penulis: "Bendahara",
    isi: "Iuran bulan November dapat dibayarkan langsung kepada bendahara atau melalui transfer paling lambat tanggal 15 November 2026.",
  },
  {
    id: 3,
    judul: "Pembaruan Tata Tertib Organisasi",
    kategori: "Umum",
    tanggal: "2026-10-28",
    penulis: "Admin",
    isi: "Tata tertib organisasi telah diperbarui. Silakan baca dokumen lengkapnya di sekretariat atau hubungi pengurus untuk informasi lebih lanjut.",
  },
];

const kategoriOptions: ("Semua" | Kategori)[] = ["Semua", "Umum", "Kegiatan", "Keuangan"];

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function Pengumuman() {
  const [filter, setFilter] = useState<"Semua" | Kategori>("Semua");
  const [search, setSearch] = useState("");
  const [terbuka, setTerbuka] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasil = useMemo(
    () =>
      dataPengumuman
        .filter(
          (p) =>
            (filter === "Semua" || p.kategori === filter) &&
            p.judul.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [filter, search]
  );

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "border-white/10",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30",
        segment: "border-white/10 bg-white/[0.04]",
        segActive: "bg-lime-300 text-[#10150c]",
        segIdle: "text-white/60 hover:text-white",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        kategori: {
          Umum: "bg-white/[0.08] text-white/70",
          Kegiatan: "bg-sky-300/15 text-sky-300",
          Keuangan: "bg-amber-300/15 text-amber-300",
        } as Record<Kategori, string>,
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "border-slate-100",
        input:
          "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50",
        segment: "border-slate-200 bg-slate-50",
        segActive: "bg-lime-400 text-[#10150c]",
        segIdle: "text-slate-500 hover:text-slate-800",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        kategori: {
          Umum: "bg-slate-100 text-slate-600",
          Kegiatan: "bg-sky-100 text-sky-700",
          Keuangan: "bg-amber-100 text-amber-700",
        } as Record<Kategori, string>,
      };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Pengumuman
        </h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Informasi terbaru dari pengurus organisasi.
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
            placeholder="Cari pengumuman..."
            className={`w-full rounded-full border py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 ${c.input}`}
          />
        </div>
        <div className={`flex flex-wrap rounded-full border p-1 ${c.segment}`}>
          {kategoriOptions.map((opt) => (
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
        <p className={`py-10 text-center text-sm ${c.muted}`}>Tidak ada pengumuman ditemukan.</p>
      ) : (
        <section className="space-y-4">
          {hasil.map((p) => {
            const open = terbuka === p.id;
            return (
              <article key={p.id} className={`rounded-3xl border ${c.card}`}>
                <button
                  type="button"
                  onClick={() => setTerbuka(open ? null : p.id)}
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-4 p-6 text-left"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${c.kategori[p.kategori]}`}
                      >
                        {p.kategori}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs ${c.muted}`}>
                        <CalendarDays className="h-3.5 w-3.5" /> {formatTanggal(p.tanggal)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs ${c.muted}`}>
                        <User className="h-3.5 w-3.5" /> {p.penulis}
                      </span>
                    </div>
                    <h3 className={`text-lg font-semibold ${c.title}`}>{p.judul}</h3>
                    {!open && <p className={`mt-1 line-clamp-1 text-sm ${c.muted}`}>{p.isi}</p>}
                  </div>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
                  >
                    {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                {open && (
                  <div
                    className={`mx-6 border-t pb-6 pt-4 text-sm leading-relaxed ${c.divider} ${c.text}`}
                  >
                    {p.isi}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}