import { useSyncExternalStore } from "react";

/**
 * Data kegiatan bersama untuk DashboardAdmin dan KegiatanAdmin.
 * Ini hanya state di memori (bukan database/backend), jadi data kembali
 * ke DATA_AWAL saat halaman di-refresh.
 *
 * Simpan sebagai: src/data/kegiatan.ts
 */

export type StatusKegiatan = "Akan Datang" | "Berlangsung" | "Selesai" | "Dibatalkan";

export interface Kegiatan {
  id: number;
  nama: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm
  lokasi: string;
  penanggungJawab: string;
  deskripsi: string;
  status: StatusKegiatan;
}

export type KegiatanInput = Omit<Kegiatan, "id">;

export const DAFTAR_STATUS: StatusKegiatan[] = [
  "Akan Datang",
  "Berlangsung",
  "Selesai",
  "Dibatalkan",
];

const DATA_AWAL: Kegiatan[] = [
  { id: 1, nama: "Rapat Evaluasi Bulanan", tanggal: "2026-11-10", waktu: "19:30", lokasi: "Aula Utama", penanggungJawab: "Budi Santoso", deskripsi: "Evaluasi program kerja bulan Oktober dan perencanaan bulan berikutnya.", status: "Akan Datang" },
  { id: 2, nama: "Bakti Sosial Lingkungan", tanggal: "2026-11-15", waktu: "07:00", lokasi: "Taman Kota", penanggungJawab: "Rizky Pratama", deskripsi: "Kegiatan bersih-bersih taman kota bersama warga sekitar.", status: "Akan Datang" },
  { id: 3, nama: "Pelatihan Kepemimpinan", tanggal: "2026-11-06", waktu: "09:00", lokasi: "Ruang Serbaguna", penanggungJawab: "Ahmad Fauzi", deskripsi: "Pelatihan dasar kepemimpinan untuk anggota baru.", status: "Berlangsung" },
  { id: 4, nama: "Seminar Literasi Digital", tanggal: "2026-10-20", waktu: "13:00", lokasi: "Gedung A Lt. 2", penanggungJawab: "Siti Nurhaliza", deskripsi: "Seminar tentang keamanan dan etika bermedia digital.", status: "Selesai" },
  { id: 5, nama: "Turnamen Futsal Antar Anggota", tanggal: "2026-10-05", waktu: "15:00", lokasi: "Lapangan Futsal", penanggungJawab: "Dimas Saputra", deskripsi: "Turnamen persahabatan antar anggota.", status: "Dibatalkan" },
];

let state: Kegiatan[] = DATA_AWAL;
const listeners = new Set<() => void>();

function commit(next: Kegiatan[]) {
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

/** Hook: seluruh kegiatan. Otomatis ter-update di semua halaman yang memakainya. */
export function useKegiatan(): Kegiatan[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Aksi tambah / ubah / hapus. */
export const kegiatan = {
  add(input: KegiatanInput): Kegiatan {
    const id = state.length ? Math.max(...state.map((k) => k.id)) + 1 : 1;
    const baru: Kegiatan = { id, ...input };
    commit([...state, baru]);
    return baru;
  },
  update(id: number, input: KegiatanInput) {
    commit(state.map((k) => (k.id === id ? { ...k, ...input } : k)));
  },
  remove(id: number) {
    commit(state.filter((k) => k.id !== id));
  },
};