import type { ActivityItem, TransactionItem } from '../types'

// Data berikut adalah data contoh untuk prototipe UI, bukan data organisasi sebenarnya.
export const activityData: ActivityItem[] = [
  {
    id: 1,
    title: 'Pengajian Rutin Remaja',
    dateLabel: 'Kamis, 29 Okt',
    time: '19.30 WIB',
    location: 'Masjid Baitussalam',
    category: 'Pengajian',
    attendees: '—',
  },
  {
    id: 2,
    title: 'Roan dan Bersih-Bersih',
    dateLabel: 'Jumat, 30 Okt',
    time: '06.00 WIB',
    location: 'Area masjid',
    category: 'Sosial',
    attendees: '—',
  },
  {
    id: 3,
    title: 'Latihan Hadroh',
    dateLabel: 'Sabtu, 31 Okt',
    time: '19.45 WIB',
    location: 'Serambi masjid',
    category: 'Hadroh',
    attendees: '—',
  },
]

export const transactionData: TransactionItem[] = [
  {
    id: 1,
    title: 'Infak anggota',
    description: 'Kas masuk · contoh data',
    dateLabel: '27 Okt 2026',
    amount: 350000,
    direction: 'in',
  },
  {
    id: 2,
    title: 'Konsumsi pengajian',
    description: 'Kas keluar · contoh data',
    dateLabel: '25 Okt 2026',
    amount: 125000,
    direction: 'out',
  },
  {
    id: 3,
    title: 'Donasi warga',
    description: 'Kas masuk · contoh data',
    dateLabel: '23 Okt 2026',
    amount: 500000,
    direction: 'in',
  },
]

export const attendanceWeekly = [
  { day: 'Sen', value: 48 },
  { day: 'Sel', value: 66 },
  { day: 'Rab', value: 54 },
  { day: 'Kam', value: 82 },
  { day: 'Jum', value: 73 },
  { day: 'Sab', value: 92 },
  { day: 'Min', value: 61 },
]
