import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileBarChart2,
  FileDown,
  Printer,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { downloadCsv, formatIndonesianDate, formatRupiah, getLocalMonthValue, readFinanceTransactions, type FinanceTransaction } from '../data/finance'
import type { AppRole } from '../routes/types'

type ReportReviewStatus = 'Menunggu Verifikasi' | 'Disetujui' | 'Perlu Revisi'
type ReviewAction = 'Disetujui' | 'Perlu Revisi'

interface ReportReview {
  status: ReportReviewStatus
  verifiedAt?: string
  verifiedBy?: string
  note?: string
}

interface ActivityReportItem {
  id: number
  title: string
  category: string
  date: string
  startTime: string
  location: string
  description?: string
  qrToken?: string
}

interface AttendanceReportItem {
  id: number
  activityId: number
  memberCode: string
  memberName: string
  checkedInAt: string
}

interface MemberReportItem {
  id?: number
  code?: string
  name?: string
  status?: string
}

const ACTIVITY_STORAGE_KEY = 'irm-baitussalam:kegiatan:v1'
const ATTENDANCE_STORAGE_KEY = 'irm-baitussalam:absensi:v1'
const MEMBERS_STORAGE_KEY = 'irm-baitussalam:anggota:v1'
const REVIEW_STORAGE_KEY = 'irm-baitussalam:laporan-verifikasi:v1'

const fallbackActivities: ActivityReportItem[] = [
  { id: 1, title: 'Pengajian Rutin Remaja', category: 'Pengajian', date: '2026-10-26', startTime: '19:30', location: 'Masjid Baitussalam' },
  { id: 2, title: 'Pengajian Rutin Remaja', category: 'Pengajian', date: '2026-10-29', startTime: '19:30', location: 'Masjid Baitussalam' },
  { id: 3, title: 'Roan dan Bersih-Bersih', category: 'Sosial', date: '2026-10-30', startTime: '06:00', location: 'Area Masjid Baitussalam' },
  { id: 4, title: 'Latihan Hadroh', category: 'Hadroh', date: '2026-10-31', startTime: '19:45', location: 'Serambi Masjid Baitussalam' },
]
const fallbackAttendances: AttendanceReportItem[] = [
  { id: 1, activityId: 1, memberCode: 'IRM-001', memberName: 'Ahmad Fauzan', checkedInAt: '2026-10-26T19:24:00+07:00' },
  { id: 2, activityId: 1, memberCode: 'IRM-002', memberName: 'Nur Aisyah', checkedInAt: '2026-10-26T19:26:00+07:00' },
  { id: 3, activityId: 1, memberCode: 'IRM-003', memberName: 'Muhammad Rizky', checkedInAt: '2026-10-26T19:33:00+07:00' },
]

function readLocalArray<T>(key: string, fallback: T[], validator: (value: unknown) => value is T): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(validator)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

function isActivity(value: unknown): value is ActivityReportItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<ActivityReportItem>
  return typeof item.id === 'number' && typeof item.title === 'string' && typeof item.category === 'string'
    && typeof item.date === 'string' && typeof item.startTime === 'string' && typeof item.location === 'string'
}

function isAttendance(value: unknown): value is AttendanceReportItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<AttendanceReportItem>
  return typeof item.id === 'number' && typeof item.activityId === 'number'
    && typeof item.memberCode === 'string' && typeof item.memberName === 'string' && typeof item.checkedInAt === 'string'
}

function isMember(value: unknown): value is MemberReportItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as MemberReportItem
  return typeof item.name === 'string' && typeof item.status === 'string'
}

function readReviews(): Record<string, ReportReview> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    const result: Record<string, ReportReview> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'object' || value === null) continue
      const row = value as Partial<ReportReview>
      if (row.status === 'Menunggu Verifikasi' || row.status === 'Disetujui' || row.status === 'Perlu Revisi') {
        result[key] = { status: row.status, verifiedAt: row.verifiedAt, verifiedBy: row.verifiedBy, note: row.note }
      }
    }
    return result
  } catch {
    return {}
  }
}

function monthLabel(value: string) {
  if (!value) return 'Semua periode'
  const date = new Date(`${value}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
}

function statusStyle(status: ReportReviewStatus) {
  if (status === 'Disetujui') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (status === 'Perlu Revisi') return 'bg-rose-50 text-rose-700 ring-rose-100'
  return 'bg-amber-50 text-amber-800 ring-amber-100'
}

export default function LaporanPage({ role }: { role: AppRole }) {
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthValue())
  const [reviews, setReviews] = useState<Record<string, ReportReview>>(readReviews)
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [notice, setNotice] = useState('')

  const activities = useMemo(() => readLocalArray<ActivityReportItem>(ACTIVITY_STORAGE_KEY, fallbackActivities, isActivity), [])
  const attendances = useMemo(() => readLocalArray<AttendanceReportItem>(ATTENDANCE_STORAGE_KEY, fallbackAttendances, isAttendance), [])
  const members = useMemo(() => readLocalArray<MemberReportItem>(MEMBERS_STORAGE_KEY, [], isMember), [])
  const finance = useMemo<FinanceTransaction[]>(() => readFinanceTransactions(), [])
  const canSeeActivities = role === 'admin' || role === 'sekretaris'
  const canSeeFinance = role === 'admin' || role === 'bendahara'
  const canVerify = role === 'admin'

  const periodActivities = activities.filter((item) => !selectedMonth || item.date.startsWith(selectedMonth))
  const periodAttendances = attendances.filter((item) => !selectedMonth || item.checkedInAt.slice(0, 7) === selectedMonth)
  const periodFinance = finance.filter((item) => !selectedMonth || item.date.startsWith(selectedMonth))
  const totalIncome = periodFinance.filter((item) => item.direction === 'Masuk').reduce((sum, item) => sum + item.amount, 0)
  const totalExpense = periodFinance.filter((item) => item.direction === 'Keluar').reduce((sum, item) => sum + item.amount, 0)
  const totalBalance = finance.reduce((sum, item) => sum + (item.direction === 'Masuk' ? item.amount : -item.amount), 0)
  const activeMemberCount = members.length ? members.filter((item) => item.status === 'Aktif').length : 8
  const attendanceCapacity = periodActivities.length * activeMemberCount
  const attendanceRate = attendanceCapacity > 0 ? Math.min(100, Math.round((periodAttendances.length / attendanceCapacity) * 100)) : 0
  const review = reviews[selectedMonth] ?? { status: 'Menunggu Verifikasi' as const }

  const openReview = (action: ReviewAction) => {
    setReviewAction(action)
    setReviewNote(review.note ?? '')
    setReviewError('')
  }

  const saveReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (reviewAction === 'Perlu Revisi' && !reviewNote.trim()) {
      setReviewError('Tambahkan catatan agar bendahara mengetahui bagian yang perlu diperbaiki.')
      return
    }
    const nextReviews = {
      ...reviews,
      [selectedMonth]: {
        status: reviewAction as ReviewAction,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin',
        note: reviewNote.trim(),
      },
    }
    setReviews(nextReviews)
    try { window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(nextReviews)) } catch { /* storage dapat dinonaktifkan browser */ }
    setNotice(reviewAction === 'Disetujui' ? `Laporan ${monthLabel(selectedMonth)} ditandai disetujui.` : `Laporan ${monthLabel(selectedMonth)} dikembalikan untuk revisi.`)
    setReviewAction(null)
    setReviewError('')
  }

  const exportReport = () => {
    const rows: Array<Array<string | number>> = [['Ringkasan Laporan IRM Baitussalam', monthLabel(selectedMonth)]]
    if (canSeeActivities) {
      rows.push([], ['Rekap Kegiatan', 'Kategori', 'Tanggal', 'Waktu', 'Lokasi'])
      for (const activity of periodActivities) rows.push([activity.title, activity.category, activity.date, activity.startTime, activity.location])
      rows.push([], ['Total Kegiatan', periodActivities.length], ['Total Catatan Kehadiran', periodAttendances.length], ['Jumlah Anggota Acuan', activeMemberCount], ['Perkiraan Rasio Kehadiran', `${attendanceRate}%`])
    }
    if (canSeeFinance) {
      rows.push([], ['Ringkasan Keuangan'], ['Kas Masuk', totalIncome], ['Kas Keluar', totalExpense], ['Netto Periode', totalIncome - totalExpense], ['Saldo Akumulatif', totalBalance], ['Status Verifikasi', review.status], ['Diverifikasi Oleh', review.verifiedBy ?? '—'], ['Catatan Verifikasi', review.note ?? '—'])
      rows.push([], ['Tanggal', 'Arus Kas', 'Kategori', 'Keterangan', 'Nominal', 'Kegiatan Terkait'])
      for (const transaction of periodFinance) rows.push([transaction.date, transaction.direction, transaction.category, transaction.description, transaction.amount, transaction.relatedActivity])
    }
    downloadCsv(rows, `laporan-irm-baitussalam-${selectedMonth || 'semua-periode'}.csv`)
  }

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-[11px] font-bold tracking-[.16em] text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> REKAPITULASI ORGANISASI</div><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Laporan</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Tinjau rekap kegiatan, kehadiran, dan keuangan berdasarkan hak akses peran masing-masing.</p></div><div className="flex flex-wrap gap-2"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><CalendarDays size={16} className="text-slate-400" /><input aria-label="Pilih periode laporan" type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="min-w-0 bg-transparent outline-none" /></label><button type="button" onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Download size={16} /> Ekspor CSV</button><button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"><Printer size={16} /> Cetak / PDF</button></div></section>

      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{notice}</span><button type="button" aria-label="Tutup pesan" onClick={() => setNotice('')}><X size={16} /></button></div>}

      <section className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-emerald-800">Periode laporan</p><h2 className="mt-1 text-xl font-bold text-slate-900">{monthLabel(selectedMonth)}</h2><p className="mt-1 text-sm text-slate-500">Data simulasi dari modul yang tersedia di browser ini.</p></div>{canSeeFinance && <div className="flex items-center gap-3 rounded-xl border border-white bg-white/80 px-4 py-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><FileBarChart2 size={20} /></span><div><p className="text-xs text-slate-500">Status laporan keuangan</p><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyle(review.status)}`}>{review.status}</span></div></div>}</section>

      {canSeeActivities && <>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><ReportStat icon={<CalendarDays size={19} />} label="Kegiatan periode ini" value={String(periodActivities.length)} caption="Agenda yang terdaftar di periode" tone="green" /><ReportStat icon={<Users size={19} />} label="Catatan kehadiran" value={String(periodAttendances.length)} caption="Catatan scan QR yang tersedia" tone="blue" /><ReportStat icon={<Activity size={19} />} label="Rasio kehadiran indikatif" value={`${attendanceRate}%`} caption="Kehadiran dibanding kapasitas kegiatan" tone="violet" /><ReportStat icon={<ClipboardCheck size={19} />} label="Anggota acuan" value={String(activeMemberCount)} caption="Anggota aktif pada data lokal" tone="amber" /></section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]"><div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="text-base font-bold text-slate-900">Rekap kegiatan</h2><p className="mt-1 text-xs text-slate-500">Daftar kegiatan yang terjadwal pada {monthLabel(selectedMonth).toLocaleLowerCase('id-ID')}.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"><CalendarDays size={14} /> {periodActivities.length} kegiatan</span></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left"><thead><tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><th className="px-5 py-3 font-bold">Kegiatan</th><th className="px-5 py-3 font-bold">Kategori</th><th className="px-5 py-3 font-bold">Tanggal</th><th className="px-5 py-3 font-bold">Waktu</th><th className="px-5 py-3 font-bold">Lokasi</th></tr></thead><tbody className="divide-y divide-slate-100">{periodActivities.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 text-sm font-semibold text-slate-800">{item.title}</td><td className="px-5 py-4"><span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{item.category}</span></td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatIndonesianDate(item.date)}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{item.startTime}</td><td className="max-w-56 truncate px-5 py-4 text-xs text-slate-500">{item.location}</td></tr>)}</tbody></table>{periodActivities.length === 0 && <EmptyReport text="Tidak ada kegiatan pada periode ini." />}</div></section>
      </>}

      {canSeeFinance && <>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><ReportStat icon={<ArrowDownLeft size={19} />} label="Kas masuk" value={formatRupiah(totalIncome)} caption="Transaksi pemasukan periode ini" tone="green" /><ReportStat icon={<ArrowUpRight size={19} />} label="Kas keluar" value={formatRupiah(totalExpense)} caption="Transaksi pengeluaran periode ini" tone="rose" /><ReportStat icon={<BarChart3 size={19} />} label="Netto periode" value={formatRupiah(totalIncome - totalExpense)} caption="Pemasukan dikurangi pengeluaran" tone="blue" /><ReportStat icon={<ShieldCheck size={19} />} label="Saldo akumulatif" value={formatRupiah(totalBalance)} caption="Seluruh transaksi yang tersimpan" tone="violet" /></section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]"><div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="text-base font-bold text-slate-900">Ringkasan transaksi keuangan</h2><p className="mt-1 text-xs text-slate-500">Pemasukan dan pengeluaran yang terdaftar pada periode laporan.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"><FileBarChart2 size={14} /> {periodFinance.length} transaksi</span></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-left"><thead><tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><th className="px-5 py-3 font-bold">Tanggal</th><th className="px-5 py-3 font-bold">Keterangan</th><th className="px-5 py-3 font-bold">Kategori</th><th className="px-5 py-3 font-bold">Arus kas</th><th className="px-5 py-3 text-right font-bold">Nominal</th></tr></thead><tbody className="divide-y divide-slate-100">{periodFinance.slice().sort((a, b) => b.date.localeCompare(a.date)).map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatIndonesianDate(item.date)}</td><td className="px-5 py-4 text-sm font-semibold text-slate-800">{item.description}</td><td className="px-5 py-4 text-xs text-slate-500">{item.category}</td><td className="px-5 py-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${item.direction === 'Masuk' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{item.direction}</span></td><td className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold ${item.direction === 'Masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.direction === 'Masuk' ? '+' : '−'}{formatRupiah(item.amount)}</td></tr>)}</tbody></table>{periodFinance.length === 0 && <EmptyReport text="Belum ada transaksi keuangan pada periode ini." />}</div></section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={21} /></span><div><h2 className="text-base font-bold text-slate-900">Verifikasi laporan keuangan</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Admin memeriksa laporan yang disusun Bendahara, kemudian menyetujui atau meminta revisi dengan catatan.</p>{review.verifiedAt && <p className="mt-2 text-xs text-slate-400">Pembaruan terakhir {formatIndonesianDate(review.verifiedAt.slice(0, 10))} oleh {review.verifiedBy ?? 'Admin'}.</p>}{review.note && <div className="mt-3 rounded-xl bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-600"><strong className="text-slate-800">Catatan:</strong> {review.note}</div>}</div></div>{canVerify ? <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => openReview('Perlu Revisi')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50">Minta revisi</button><button type="button" onClick={() => openReview('Disetujui')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"><CheckCircle2 size={16} /> Setujui laporan</button></div> : <span className={`inline-flex w-fit shrink-0 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-inset ${statusStyle(review.status)}`}>{review.status}</span>}</div><p className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400"><AlertCircle size={15} className="mt-0.5 shrink-0" /> {canVerify ? 'Aksi verifikasi pada tahap ini hanya tersimpan di browser. Otorisasi dan jejak audit final harus diterapkan pada backend.' : 'Status verifikasi ditetapkan Admin. Hubungi Admin jika perlu mengoreksi laporan.'}</p></section>
      </>}

      <p className="flex items-start gap-2 text-xs leading-5 text-slate-400"><AlertCircle size={15} className="mt-0.5 shrink-0" /> Laporan dihitung dari data contoh atau data lokal yang tersedia. Sebelum digunakan secara resmi, periksa kesesuaian dengan dokumen kas dan daftar kehadiran organisasi.</p>

      {reviewAction && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6"><section role="dialog" aria-modal="true" aria-labelledby="review-modal-title" className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 id="review-modal-title" className="text-lg font-bold text-slate-900">{reviewAction === 'Disetujui' ? 'Setujui laporan' : 'Minta revisi laporan'}</h2><p className="mt-1 text-sm text-slate-500">Periode {monthLabel(selectedMonth)}.</p></div><button type="button" onClick={() => setReviewAction(null)} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button></div><form onSubmit={saveReview} className="space-y-4 p-5"><div className={`rounded-xl px-3.5 py-3 text-sm leading-6 ${reviewAction === 'Disetujui' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{reviewAction === 'Disetujui' ? 'Konfirmasi bahwa laporan periode ini sudah diperiksa dan disetujui.' : 'Tuliskan catatan perbaikan yang perlu dilakukan Bendahara.'}</div><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Catatan {reviewAction === 'Perlu Revisi' ? '*' : '(opsional)'}</span><textarea rows={4} maxLength={800} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder={reviewAction === 'Perlu Revisi' ? 'Contoh: Mohon lampirkan keterangan transaksi tanggal...' : 'Catatan tambahan untuk arsip verifikasi...'} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-emerald-500" /></label>{reviewError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{reviewError}</p>}<div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row"><button type="button" onClick={() => setReviewAction(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${reviewAction === 'Disetujui' ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-rose-700 hover:bg-rose-800'}`}><CheckCircle2 size={16} /> Simpan keputusan</button></div></form></section></div>}
    </main>
  )
}

function ReportStat({ icon, label, value, caption, tone }: { icon: ReactNode; label: string; value: string; caption: string; tone: 'green' | 'blue' | 'violet' | 'amber' | 'rose' }) {
  const tones = { green: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', violet: 'bg-violet-50 text-violet-700', amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700' }
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{value}</p></div><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span></div><p className="mt-3 text-[11px] leading-4 text-slate-400">{caption}</p></article>
}

function EmptyReport({ text }: { text: string }) {
  return <div className="flex flex-col items-center px-5 py-12 text-center"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><FileDown size={19} /></span><p className="mt-3 text-sm font-semibold text-slate-800">{text}</p></div>
}
