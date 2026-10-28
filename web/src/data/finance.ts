export type FinanceDirection = 'Masuk' | 'Keluar'
export type FinanceCategory = 'Saldo Awal' | 'Infak' | 'Donasi' | 'Iuran Anggota' | 'Konsumsi' | 'Perlengkapan' | 'Transportasi' | 'Sosial' | 'Lainnya'

export interface FinanceTransaction {
  id: number
  date: string
  direction: FinanceDirection
  category: FinanceCategory
  description: string
  amount: number
  relatedActivity: string
  createdBy: string
}

export const FINANCE_STORAGE_KEY = 'irm-baitussalam:keuangan:v1'

// Contoh data untuk prototipe; bukan catatan keuangan resmi organisasi.
export const initialFinanceTransactions: FinanceTransaction[] = [
  { id: 1, date: '2026-10-01', direction: 'Masuk', category: 'Saldo Awal', description: 'Saldo awal kas periode', amount: 4125000, relatedActivity: 'Saldo awal', createdBy: 'Bendahara' },
  { id: 2, date: '2026-10-23', direction: 'Masuk', category: 'Donasi', description: 'Donasi warga', amount: 500000, relatedActivity: 'Donasi umum', createdBy: 'Bendahara' },
  { id: 3, date: '2026-10-27', direction: 'Masuk', category: 'Infak', description: 'Infak anggota', amount: 350000, relatedActivity: 'Pengajian rutin', createdBy: 'Bendahara' },
  { id: 4, date: '2026-10-25', direction: 'Keluar', category: 'Konsumsi', description: 'Konsumsi pengajian', amount: 125000, relatedActivity: 'Pengajian Rutin Remaja', createdBy: 'Bendahara' },
]

export function readFinanceTransactions(): FinanceTransaction[] {
  if (typeof window === 'undefined') return initialFinanceTransactions
  try {
    const stored = window.localStorage.getItem(FINANCE_STORAGE_KEY)
    if (!stored) return initialFinanceTransactions
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return initialFinanceTransactions
    const valid = parsed.every((value) => {
      if (typeof value !== 'object' || value === null) return false
      const row = value as Partial<FinanceTransaction>
      return typeof row.id === 'number' && typeof row.date === 'string'
        && (row.direction === 'Masuk' || row.direction === 'Keluar')
        && typeof row.category === 'string' && typeof row.description === 'string'
        && typeof row.amount === 'number' && typeof row.relatedActivity === 'string'
        && typeof row.createdBy === 'string'
    })
    return valid ? parsed as FinanceTransaction[] : initialFinanceTransactions
  } catch {
    return initialFinanceTransactions
  }
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export function getLocalDateValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getLocalMonthValue(date = new Date()): string {
  return getLocalDateValue(date).slice(0, 7)
}

export function formatIndonesianDate(value: string): string {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function downloadCsv(rows: Array<Array<string | number>>, filename: string): void {
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
