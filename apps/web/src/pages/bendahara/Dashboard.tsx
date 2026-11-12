import { useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
// NOTE: sesuaikan path import ini dengan lokasi file Anda
import { useTheme } from "../../contexts/ThemeContext";
import { useTransaksi } from "../../data/keuangan";

// TODO: ganti dengan data dari API
const iuranBelumBayar = 7;

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// "T00:00:00" supaya tanggal dibaca sebagai waktu lokal (bukan UTC)
const formatTanggal = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const namaBulan = (key: string) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("id-ID", { month: "short" });

export default function DashboardBendahara() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Data keuangan diambil dari keuangan.ts (sama persis dengan halaman Keuangan)
  const transaksi = useTransaksi();

  const { saldo, masukBulanIni, keluarBulanIni, grafik } = useMemo(() => {
    const now = new Date();
    const keyNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let saldo = 0;
    let masukBulanIni = 0;
    let keluarBulanIni = 0;
    const perBulan: Record<string, { masuk: number; keluar: number }> = {};

    transaksi.forEach((t) => {
      const key = t.tanggal.slice(0, 7);
      perBulan[key] ??= { masuk: 0, keluar: 0 };
      if (t.jenis === "Pemasukan") {
        saldo += t.jumlah;
        perBulan[key].masuk += t.jumlah;
        if (key === keyNow) masukBulanIni += t.jumlah;
      } else {
        saldo -= t.jumlah;
        perBulan[key].keluar += t.jumlah;
        if (key === keyNow) keluarBulanIni += t.jumlah;
      }
    });

    const grafik = Object.keys(perBulan)
      .sort()
      .slice(-6)
      .map((k) => ({ bulan: namaBulan(k), ...perBulan[k] }));

    return { saldo, masukBulanIni, keluarBulanIni, grafik };
  }, [transaksi]);

  const maxGrafik = Math.max(...grafik.flatMap((g) => [g.masuk, g.keluar]), 1);
  const terbaru = useMemo(
    () => [...transaksi].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id).slice(0, 5),
    [transaksi]
  );

  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Saldo Kas", value: rupiah(saldo), icon: Wallet },
    { label: "Pemasukan Bulan Ini", value: rupiah(masukBulanIni), icon: TrendingUp },
    { label: "Pengeluaran Bulan Ini", value: rupiah(keluarBulanIni), icon: TrendingDown },
    { label: "Iuran Belum Bayar", value: `${iuranBelumBayar} anggota`, icon: Users },
  ];

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        divider: "divide-white/10",
        grid: "border-white/10",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        barIn: "bg-lime-300",
        barOut: "bg-rose-400",
        dotIn: "bg-lime-300",
        dotOut: "bg-rose-400",
        inIcon: "bg-lime-300/15 text-lime-300",
        outIcon: "bg-rose-400/15 text-rose-300",
        inText: "text-lime-300",
        outText: "text-rose-300",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        divider: "divide-slate-100",
        grid: "border-slate-200",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        barIn: "bg-lime-500",
        barOut: "bg-red-400",
        dotIn: "bg-lime-500",
        dotOut: "bg-red-400",
        inIcon: "bg-lime-100 text-lime-700",
        outIcon: "bg-red-100 text-red-600",
        inText: "text-lime-700",
        outText: "text-red-600",
      };

  const card = `rounded-3xl border p-6 ${c.card}`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

        <h1 className="relative max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Dashboard Bendahara
        </h1>
        <p className="relative mt-3 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          Ringkasan kondisi keuangan organisasi.
        </p>
      </section>

      {/* Statistik */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={`${card} min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <p className={`text-sm font-medium ${c.text}`}>{label}</p>
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className={`mt-4 truncate text-2xl font-semibold tracking-tight ${c.title}`} title={value}>
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {/* Grafik sederhana */}
        <div className={card}>
          <h2 className={`text-lg font-semibold ${c.title}`}>Arus Kas 6 Bulan Terakhir</h2>
          <div className={`mt-2 flex gap-4 text-xs ${c.muted}`}>
            <span className="flex items-center gap-1.5">
              <i className={`inline-block h-2.5 w-2.5 rounded-full ${c.dotIn}`} /> Pemasukan
            </span>
            <span className="flex items-center gap-1.5">
              <i className={`inline-block h-2.5 w-2.5 rounded-full ${c.dotOut}`} /> Pengeluaran
            </span>
          </div>

          <div className={`mt-5 flex h-52 items-end gap-4 border-b ${c.grid}`}>
            {grafik.map((g) => (
              <div key={g.bulan} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className={`w-1/3 rounded-t-md ${c.barIn}`}
                    style={{ height: `${(g.masuk / maxGrafik) * 100}%` }}
                    title={rupiah(g.masuk)}
                  />
                  <div
                    className={`w-1/3 rounded-t-md ${c.barOut}`}
                    style={{ height: `${(g.keluar / maxGrafik) * 100}%` }}
                    title={rupiah(g.keluar)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-4">
            {grafik.map((g) => (
              <span key={g.bulan} className={`flex-1 text-center text-xs ${c.muted}`}>
                {g.bulan}
              </span>
            ))}
          </div>
        </div>

        {/* Transaksi terbaru */}
        <div className={card}>
          <h2 className={`text-lg font-semibold ${c.title}`}>Transaksi Terbaru</h2>
          <ul className={`mt-4 divide-y ${c.divider}`}>
            {terbaru.map((t) => {
              const masuk = t.jenis === "Pemasukan";
              return (
                <li key={t.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                      masuk ? c.inIcon : c.outIcon
                    }`}
                  >
                    {masuk ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${c.title}`}>{t.keterangan}</p>
                    <p className={`text-xs ${c.muted}`}>{formatTanggal(t.tanggal)}</p>
                  </div>
                  <span
                    className={`whitespace-nowrap font-semibold ${masuk ? c.inText : c.outText}`}
                  >
                    {masuk ? "+" : "-"} {rupiah(t.jumlah)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}