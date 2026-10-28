import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import type { AppRole } from '../routes/types'
import { downloadCsv, formatIndonesianDate, getLocalDateValue } from '../data/finance'

type AnnouncementCategory = 'Kegiatan' | 'Informasi' | 'Administrasi' | 'Penting'
type AnnouncementStatus = 'Terbit' | 'Draft'

interface Announcement {
  id: number
  title: string
  category: AnnouncementCategory
  content: string
  date: string
  status: AnnouncementStatus
  author: string
}

interface AnnouncementForm {
  title: string
  category: AnnouncementCategory
  content: string
  date: string
  status: AnnouncementStatus
}

const STORAGE_KEY = 'irm-baitussalam:pengumuman:v1'
const initialAnnouncements: Announcement[] = [
  { id: 1, title: 'Pengajian rutin Kamis malam', category: 'Kegiatan', content: 'Anggota IRM Baitussalam diharapkan hadir pada pengajian rutin hari Kamis pukul 19.30 WIB di Masjid Baitussalam. Mohon hadir tepat waktu dan membawa perlengkapan catatan masing-masing.', date: '2026-10-27', status: 'Terbit', author: 'Sekretaris' },
  { id: 2, title: 'Kerja bakti area masjid', category: 'Kegiatan', content: 'Kegiatan roan dilaksanakan pada Jumat pagi. Anggota diharapkan membawa alat kebersihan seperlunya dan berkumpul di halaman masjid sebelum kegiatan dimulai.', date: '2026-10-25', status: 'Terbit', author: 'Sekretaris' },
  { id: 3, title: 'Pengumpulan data anggota', category: 'Administrasi', content: 'Silakan periksa kembali data nama, nomor telepon, dan alamat email pada profil masing-masing. Hubungi sekretaris apabila terdapat data yang perlu diperbarui.', date: '2026-10-22', status: 'Terbit', author: 'Sekretaris' },
  { id: 4, title: 'Persiapan rapat koordinasi', category: 'Penting', content: 'Pengurus diminta menyiapkan catatan evaluasi kegiatan dan usulan program kerja untuk dibahas pada rapat koordinasi berikutnya.', date: '2026-10-20', status: 'Draft', author: 'Admin' },
]

const emptyForm: AnnouncementForm = { title: '', category: 'Informasi', content: '', date: getLocalDateValue(), status: 'Terbit' }
const categories: AnnouncementCategory[] = ['Kegiatan', 'Informasi', 'Administrasi', 'Penting']

function readAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return initialAnnouncements
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialAnnouncements
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return initialAnnouncements
    const valid = parsed.every((item) => {
      if (typeof item !== 'object' || item === null) return false
      const value = item as Partial<Announcement>
      return typeof value.id === 'number' && typeof value.title === 'string'
        && typeof value.category === 'string' && typeof value.content === 'string'
        && typeof value.date === 'string' && (value.status === 'Terbit' || value.status === 'Draft')
        && typeof value.author === 'string'
    })
    return valid ? parsed as Announcement[] : initialAnnouncements
  } catch {
    return initialAnnouncements
  }
}

function categoryStyle(category: AnnouncementCategory) {
  if (category === 'Kegiatan') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (category === 'Administrasi') return 'bg-blue-50 text-blue-700 ring-blue-100'
  if (category === 'Penting') return 'bg-rose-50 text-rose-700 ring-rose-100'
  return 'bg-amber-50 text-amber-700 ring-amber-100'
}

export default function PengumumanPage({ role, searchQuery = '' }: { role: AppRole; searchQuery?: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(readAnnouncements)
  const [localSearch, setLocalSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'Semua kategori' | AnnouncementCategory>('Semua kategori')
  const [statusFilter, setStatusFilter] = useState<'Semua status' | AnnouncementStatus>('Semua status')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [form, setForm] = useState<AnnouncementForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const canManage = role === 'admin' || role === 'sekretaris'
  const visibleAnnouncements = useMemo(() => {
    const query = `${searchQuery} ${localSearch}`.trim().toLocaleLowerCase('id-ID')
    return announcements.filter((item) => {
      if (role === 'anggota' && item.status !== 'Terbit') return false
      const matchesQuery = !query || [item.title, item.content, item.category, item.author].some((text) => text.toLocaleLowerCase('id-ID').includes(query))
      const matchesCategory = categoryFilter === 'Semua kategori' || item.category === categoryFilter
      const matchesStatus = role === 'anggota' || statusFilter === 'Semua status' || item.status === statusFilter
      return matchesQuery && matchesCategory && matchesStatus
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  }, [announcements, searchQuery, localSearch, categoryFilter, statusFilter, role])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements))
    } catch {
      setNotice('Penyimpanan browser tidak tersedia. Perubahan hanya tersimpan sementara selama halaman ini terbuka.')
    }
  }, [announcements])

  const publishedCount = announcements.filter((item) => item.status === 'Terbit').length
  const draftCount = announcements.filter((item) => item.status === 'Draft').length

  const openCreate = () => {
    setEditingAnnouncement(null)
    setForm({ ...emptyForm, date: getLocalDateValue() })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEdit = (item: Announcement) => {
    setEditingAnnouncement(item)
    setForm({ title: item.title, category: item.category, content: item.content, date: item.date, status: item.status })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAnnouncement(null)
    setFormError('')
  }

  const saveAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.date) {
      setFormError('Judul, isi pengumuman, dan tanggal wajib diisi.')
      return
    }
    const updatedAt = editingAnnouncement
      ? { ...editingAnnouncement, ...form, title: form.title.trim(), content: form.content.trim(), author: role === 'admin' ? 'Admin' : 'Sekretaris' }
      : { ...form, id: Math.max(0, ...announcements.map((item) => item.id)) + 1, title: form.title.trim(), content: form.content.trim(), author: role === 'admin' ? 'Admin' : 'Sekretaris' }
    setAnnouncements((current) => editingAnnouncement
      ? current.map((item) => item.id === editingAnnouncement.id ? updatedAt : item)
      : [updatedAt, ...current])
    setNotice(editingAnnouncement ? 'Pengumuman berhasil diperbarui.' : 'Pengumuman berhasil ditambahkan.')
    closeModal()
  }

  const deleteAnnouncement = (item: Announcement) => {
    if (!window.confirm(`Hapus pengumuman “${item.title}”?`)) return
    setAnnouncements((current) => current.filter((entry) => entry.id !== item.id))
    setNotice('Pengumuman berhasil dihapus.')
  }

  const togglePublish = (item: Announcement) => {
    const nextStatus: AnnouncementStatus = item.status === 'Terbit' ? 'Draft' : 'Terbit'
    setAnnouncements((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus, date: getLocalDateValue() } : entry))
    setNotice(nextStatus === 'Terbit' ? 'Pengumuman sudah diterbitkan.' : 'Pengumuman dipindahkan ke draft.')
  }

  const exportAnnouncements = () => {
    downloadCsv([
      ['Judul', 'Kategori', 'Tanggal', 'Status', 'Penulis', 'Isi'],
      ...visibleAnnouncements.map((item) => [item.title, item.category, item.date, item.status, item.author, item.content]),
    ], 'pengumuman-irm-baitussalam.csv')
  }

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[.16em] text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> INFORMASI ORGANISASI</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Pengumuman</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Sampaikan informasi organisasi dan pastikan anggota mendapat kabar terbaru IRM Baitussalam.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportAnnouncements} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FileText size={16} /> Ekspor CSV</button>
          {canManage && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"><Plus size={16} /> Buat pengumuman</button>}
        </div>
      </section>

      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Tutup pesan"><X size={16} /></button></div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard icon={<Megaphone size={19} />} label="Total pengumuman" value={role === 'anggota' ? publishedCount : announcements.length} tone="green" caption="Seluruh informasi tersimpan" />
        <SummaryCard icon={<BellRing size={19} />} label="Sudah diterbitkan" value={publishedCount} tone="blue" caption="Dapat dibaca anggota" />
        {canManage ? <SummaryCard icon={<FileText size={19} />} label="Draft" value={draftCount} tone="amber" caption="Belum tampil untuk anggota" /> : <SummaryCard icon={<CalendarDays size={19} />} label="Informasi terbaru" value={visibleAnnouncements.length} tone="violet" caption="Sesuai pencarian saat ini" />}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 lg:max-w-lg"><Search size={17} /><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari judul atau isi pengumuman..." className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></label>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Filter kategori" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500"><option>Semua kategori</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            {canManage && <select aria-label="Filter status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500"><option>Semua status</option><option>Terbit</option><option>Draft</option></select>}
          </div>
        </div>
      </section>

      {visibleAnnouncements.length ? <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visibleAnnouncements.map((item) => (
          <article key={item.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:border-emerald-200 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${categoryStyle(item.category)}`}>{item.category}</span>{canManage && <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${item.status === 'Terbit' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span>}</div>
              {canManage && <div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => openEdit(item)} title="Edit pengumuman" aria-label={`Edit ${item.title}`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Edit3 size={16} /></button><button type="button" onClick={() => deleteAnnouncement(item)} title="Hapus pengumuman" aria-label={`Hapus ${item.title}`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /></button></div>}
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{item.title}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{item.content}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatIndonesianDate(item.date)}</span><span>Oleh {item.author}</span>{canManage && <button type="button" onClick={() => togglePublish(item)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50">{item.status === 'Terbit' ? <><FileText size={14} /> Jadikan draft</> : <><Send size={14} /> Terbitkan</>}</button>}</div>
          </article>
        ))}
      </section> : <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Search size={21} /></span><h2 className="mt-4 text-base font-bold text-slate-800">Pengumuman tidak ditemukan</h2><p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Coba ubah kata pencarian atau filter kategori yang kamu pilih.</p></section>}

      <p className="flex items-start gap-2 text-xs leading-5 text-slate-400"><AlertCircle size={15} className="mt-0.5 shrink-0" /> Data pada tahap frontend ini disimpan di browser untuk demo. Pengumuman belum dipublikasikan ke server atau perangkat anggota lain.</p>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
        <section role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title" className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 id="announcement-modal-title" className="text-lg font-bold text-slate-900">{editingAnnouncement ? 'Edit pengumuman' : 'Buat pengumuman'}</h2><p className="mt-1 text-sm text-slate-500">Isi informasi secara jelas agar mudah dipahami anggota.</p></div><button type="button" onClick={closeModal} aria-label="Tutup formulir" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
          <form onSubmit={saveAnnouncement} className="space-y-4 p-5 sm:p-6">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Judul pengumuman *</span><input autoFocus maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" placeholder="Contoh: Pengajian rutin pekan ini" /></label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Kategori</span><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as AnnouncementCategory }))} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-500">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal</span><input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-500" /></label></div>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Isi pengumuman *</span><textarea rows={5} maxLength={2000} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" placeholder="Tuliskan informasi, waktu, lokasi, atau hal yang perlu diperhatikan..." /><span className="mt-1 block text-right text-xs text-slate-400">{form.content.length}/2000 karakter</span></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Status publikasi</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AnnouncementStatus }))} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-500"><option value="Terbit">Terbit — tampil untuk anggota</option><option value="Draft">Draft — belum tampil untuk anggota</option></select></label>
            {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{formError}</p>}
            <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row"><button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"><CheckCircle2 size={16} /> {editingAnnouncement ? 'Simpan perubahan' : 'Simpan pengumuman'}</button></div>
          </form>
        </section>
      </div>}
    </main>
  )
}

function SummaryCard({ icon, label, value, caption, tone }: { icon: ReactNode; label: string; value: number; caption: string; tone: 'green' | 'blue' | 'amber' | 'violet' }) {
  const color = { green: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700' }[tone]
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}>{icon}</span></div><p className="mt-3 text-[11px] text-slate-400">{caption}</p></article>
}
