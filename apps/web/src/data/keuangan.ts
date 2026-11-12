import { useSyncExternalStore } from "react";

/**
 * Data keuangan bersama untuk DashboardAdmin dan KeuanganAdmin.
 * Ini hanya state di memori (bukan database/backend), jadi data kembali
 * ke DATA_AWAL saat halaman di-refresh.
 *
 * Simpan sebagai: src/data/keuangan.ts
 */

export type Jenis = "Pemasukan" | "Pengeluaran";

export interface Transaksi {
  id: number;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  kategori: string;
  jenis: Jenis;
  jumlah: number;
}

export type TransaksiInput = Omit<Transaksi, "id">;

export const KATEGORI: Record<Jenis, string[]> = {
  Pemasukan: ["Iuran Anggota", "Donasi", "Sponsor", "Lainnya"],
  Pengeluaran: ["Operasional", "Kegiatan", "Konsumsi", "Perlengkapan", "Lainnya"],
};

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

let state: Transaksi[] = DATA_AWAL;
const listeners = new Set<() => void>();

function commit(next: Transaksi[]) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

/** Hook: seluruh transaksi. Otomatis ter-update di semua halaman yang memakainya. */
export function useTransaksi(): Transaksi[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Aksi tambah / ubah / hapus. */
export const keuangan = {
  add(input: TransaksiInput): Transaksi {
    const id = state.length ? Math.max(...state.map((t) => t.id)) + 1 : 1;
    const baru: Transaksi = { id, ...input };
    commit([...state, baru]);
    return baru;
  },
  update(id: number, input: TransaksiInput) {
    commit(state.map((t) => (t.id === id ? { ...t, ...input } : t)));
  },
  remove(id: number) {
    commit(state.filter((t) => t.id !== id));
  },
};

/** Total pemasukan, pengeluaran, dan saldo. Isi `bulan` (YYYY-MM) untuk membatasi ke satu bulan. */
export function ringkasan(data: Transaksi[], bulan?: string) {
  const list = bulan ? data.filter((t) => t.tanggal.startsWith(bulan)) : data;
  const totalMasuk = list.filter((t) => t.jenis === "Pemasukan").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = list.filter((t) => t.jenis === "Pengeluaran").reduce((s, t) => s + t.jumlah, 0);
  return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar };
}