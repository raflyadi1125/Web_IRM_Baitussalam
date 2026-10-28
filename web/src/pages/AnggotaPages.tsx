import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Filter,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  UserRoundX,
  Users,
  X,
} from 'lucide-react'

type MemberStatus = 'Aktif' | 'Nonaktif'
type StatusFilter = 'Semua status' | MemberStatus

interface Member {
  id: number
  code: string
  name: string
  email: string
  phone: string
  joinedAt: string
  status: MemberStatus
}

interface MemberFormValues {
  name: string
  email: string
  phone: string
  joinedAt: string
  status: MemberStatus
}

const MEMBERS_STORAGE_KEY = 'irm-baitussalam:anggota:v1'

const initialMembers: Member[] = [
  { id: 1, code: 'IRM-001', name: 'Ahmad Fauzan', email: 'ahmad.fauzan@example.com', phone: '0812-3456-7810', joinedAt: '2025-01-12', status: 'Aktif' },
  { id: 2, code: 'IRM-002', name: 'Nur Aisyah', email: 'nur.aisyah@example.com', phone: '0813-4567-8910', joinedAt: '2025-02-04', status: 'Aktif' },
  { id: 3, code: 'IRM-003', name: 'Muhammad Rizky', email: 'm.rizky@example.com', phone: '0821-2345-6789', joinedAt: '2025-02-18', status: 'Aktif' },
  { id: 4, code: 'IRM-004', name: 'Siti Nurhaliza', email: 'siti.nurhaliza@example.com', phone: '0857-1234-5678', joinedAt: '2025-03-06', status: 'Nonaktif' },
  { id: 5, code: 'IRM-005', name: 'Dimas Ramadhan', email: 'dimas.ramadhan@example.com', phone: '0812-9876-5432', joinedAt: '2025-04-22', status: 'Aktif' },
  { id: 6, code: 'IRM-006', name: 'Putri Amelia', email: 'putri.amelia@example.com', phone: '0822-1122-3344', joinedAt: '2025-05-10', status: 'Aktif' },
  { id: 7, code: 'IRM-007', name: 'Fajar Maulana', email: 'fajar.maulana@example.com', phone: '0819-2233-4455', joinedAt: '2025-06-15', status: 'Aktif' },
  { id: 8, code: 'IRM-008', name: 'Intan Permata', email: 'intan.permata@example.com', phone: '0852-3344-5566', joinedAt: '2025-07-02', status: 'Aktif' },
]

const emptyForm: MemberFormValues = {
  name: '',
  email: '',
  phone: '',
  joinedAt: new Date().toISOString().slice(0, 10),
  status: 'Aktif',
}

function readStoredMembers(): Member[] {
  try {
    const stored = window.localStorage.getItem(MEMBERS_STORAGE_KEY)
    if (!stored) return initialMembers
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return initialMembers
    const valid = parsed.every((item) =>
      typeof item === 'object' && item !== null &&
      'id' in item && 'code' in item && 'name' in item &&
      'email' in item && 'phone' in item && 'joinedAt' in item && 'status' in item
    )
    return valid ? parsed as Member[] : initialMembers
  } catch {
    return initialMembers
  }
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function downloadCsv(members: Member[]) {
  const header = ['ID Anggota', 'Nama', 'Email', 'Nomor HP', 'Tanggal Bergabung', 'Status']
  const rows = members.map((member) => [member.code, member.name, member.email, member.phone, member.joinedAt, member.status])
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'data-anggota-irm-baitussalam.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function AnggotaPage({ searchQuery = '' }: { searchQuery?: string }) {
  const [members, setMembers] = useState<Member[]>(readStoredMembers)
  const [localSearch, setLocalSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua status')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [formValues, setFormValues] = useState<MemberFormValues>(emptyForm)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const filteredMembers = useMemo(() => {
    const query = `${searchQuery} ${localSearch}`.trim().toLocaleLowerCase('id-ID')
    return members.filter((member) => {
      const matchesQuery = !query || [member.code, member.name, member.email, member.phone].some((value) => value.toLocaleLowerCase('id-ID').includes(query))
      const matchesStatus = statusFilter === 'Semua status' || member.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [members, localSearch, searchQuery, statusFilter])

  useEffect(() => {
    try {
      window.localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members))
    } catch {
      setNotice('Penyimpanan lokal browser tidak tersedia. Perubahan hanya tersimpan selama halaman ini aktif.')
    }
  }, [members])

  const activeCount = members.filter((member) => member.status === 'Aktif').length
  const inactiveCount = members.length - activeCount

  const openCreateModal = () => {
    setEditingMember(null)
    setFormValues({ ...emptyForm, joinedAt: new Date().toISOString().slice(0, 10) })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setFormValues({ name: member.name, email: member.email, phone: member.phone, joinedAt: member.joinedAt, status: member.status })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMember(null)
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const normalizedEmail = formValues.email.trim().toLocaleLowerCase('id-ID')
    const duplicateEmail = members.some((member) => member.email.toLocaleLowerCase('id-ID') === normalizedEmail && member.id !== editingMember?.id)
    if (duplicateEmail) {
      setFormError('Email ini sudah digunakan anggota lain. Gunakan email yang berbeda.')
      return
    }

    if (editingMember) {
      setMembers((current) => current.map((member) => member.id === editingMember.id
        ? { ...member, ...formValues, name: formValues.name.trim(), email: normalizedEmail, phone: formValues.phone.trim() }
        : member))
      setNotice(`Data ${formValues.name.trim()} berhasil diperbarui di penyimpanan lokal browser.`)
    } else {
      const nextId = members.reduce((maxId, member) => Math.max(maxId, member.id), 0) + 1
      const newMember: Member = {
        id: nextId,
        code: `IRM-${String(nextId).padStart(3, '0')}`,
        ...formValues,
        name: formValues.name.trim(),
        email: normalizedEmail,
        phone: formValues.phone.trim(),
      }
      setMembers((current) => [newMember, ...current])
      setNotice(`Anggota ${newMember.name} berhasil ditambahkan ke penyimpanan lokal browser.`)
    }
    closeModal()
    window.setTimeout(() => setNotice(''), 4000)
  }

  const confirmDelete = () => {
    if (!memberToDelete) return
    setMembers((current) => current.filter((member) => member.id !== memberToDelete.id))
    setNotice(`Data ${memberToDelete.name} dihapus dari penyimpanan lokal browser.`)
    setMemberToDelete(null)
    window.setTimeout(() => setNotice(''), 4000)
  }

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Manajemen Organisasi
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Data Anggota</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Kelola profil anggota IRM Baitussalam, perbarui informasi kontak, dan pantau status keanggotaan dalam satu tempat.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => downloadCsv(filteredMembers)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Download size={16} /> <span>Ekspor CSV</span>
            </button>
            <button type="button" onClick={openCreateModal} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100">
              <Plus size={17} /> Tambah Anggota
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 sm:flex sm:items-center sm:gap-2">
          <AlertCircle size={16} className="mb-1 shrink-0 sm:mb-0" />
          <span><strong>Mode prototipe:</strong> data di halaman ini masih contoh dan hanya tersimpan selama halaman tidak dimuat ulang. Belum terhubung ke backend Go atau PostgreSQL.</span>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Ringkasan anggota">
          <SummaryCard label="Total Anggota" value={members.length} description="Seluruh data anggota" icon={<Users size={19} />} tint="green" />
          <SummaryCard label="Anggota Aktif" value={activeCount} description="Status keanggotaan aktif" icon={<UserCheck size={19} />} tint="blue" />
          <SummaryCard label="Anggota Nonaktif" value={inactiveCount} description="Perlu ditinjau bila ada perubahan" icon={<UserRoundX size={19} />} tint="amber" />
        </section>

        {notice && (
          <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <Check size={17} className="mt-0.5 shrink-0" /> <span>{notice}</span>
            <button type="button" aria-label="Tutup pemberitahuan" className="ml-auto rounded p-0.5 hover:bg-emerald-100" onClick={() => setNotice('')}><X size={15} /></button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Anggota</h2>
              <p className="mt-1 text-xs text-slate-500">Menampilkan {filteredMembers.length} dari {members.length} anggota contoh.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50 sm:w-72">
                <Search size={16} className="shrink-0" />
                <input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari nama, ID, email..." className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" aria-label="Cari anggota" />
                {localSearch && <button type="button" onClick={() => setLocalSearch('')} aria-label="Hapus pencarian" className="text-slate-400 hover:text-slate-700"><X size={14} /></button>}
              </label>
              <label className="relative flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600">
                <Filter size={15} className="shrink-0 text-slate-400" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="w-full appearance-none bg-transparent pr-5 outline-none sm:w-36" aria-label="Filter status anggota">
                  <option>Semua status</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 text-slate-400" />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-5 py-3.5">Anggota</th>
                  <th scope="col" className="px-4 py-3.5">ID Anggota</th>
                  <th scope="col" className="px-4 py-3.5">Kontak</th>
                  <th scope="col" className="px-4 py-3.5">Tanggal Bergabung</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="transition hover:bg-emerald-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-100 bg-emerald-50 text-xs font-bold text-emerald-800">{getInitials(member.name)}</div>
                        <div className="min-w-0"><p className="font-semibold text-slate-800">{member.name}</p><p className="mt-1 text-xs text-slate-400">Anggota IRM</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">{member.code}</span></td>
                    <td className="px-4 py-4"><div className="space-y-1.5"><p className="flex items-center gap-2 text-xs text-slate-600"><Mail size={13} className="text-slate-400" />{member.email}</p><p className="flex items-center gap-2 text-xs text-slate-500"><Phone size={13} className="text-slate-400" />{member.phone || 'Belum diisi'}</p></div></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-xs text-slate-600"><CalendarDays size={14} className="text-slate-400" />{formatDate(member.joinedAt)}</span></td>
                    <td className="px-4 py-4"><StatusBadge status={member.status} /></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => openEditModal(member)} aria-label={`Edit ${member.name}`} title="Edit data" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"><Pencil size={14} /></button><button type="button" onClick={() => setMemberToDelete(member)} aria-label={`Hapus ${member.name}`} title="Hapus data" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><UserRound size={22} /></div>
                <h3 className="text-sm font-semibold text-slate-700">Anggota tidak ditemukan</h3>
                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Coba ubah kata kunci pencarian atau filter status yang dipilih.</p>
                <button type="button" onClick={() => { setLocalSearch(''); setStatusFilter('Semua status') }} className="mt-3 text-xs font-semibold text-emerald-800 hover:text-emerald-950">Reset pencarian</button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>Data ditampilkan: <strong className="font-semibold text-slate-700">{filteredMembers.length}</strong> anggota</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Data contoh · tersimpan lokal di browser</span>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
          <section role="dialog" aria-modal="true" aria-labelledby="member-modal-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Manajemen Anggota</p><h2 id="member-modal-title" className="mt-1 text-lg font-bold text-slate-900">{editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}</h2><p className="mt-1 text-xs text-slate-500">Lengkapi informasi berikut dengan benar.</p></div>
              <button type="button" onClick={closeModal} aria-label="Tutup formulir" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
              {formError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">{formError}</div>}
              <div><label htmlFor="member-name" className="mb-1.5 block text-xs font-semibold text-slate-700">Nama lengkap <span className="text-rose-500">*</span></label><input id="member-name" required minLength={3} maxLength={80} autoFocus value={formValues.name} onChange={(event) => setFormValues({ ...formValues, name: event.target.value })} placeholder="Contoh: Ahmad Fauzan" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div>
              <div><label htmlFor="member-email" className="mb-1.5 block text-xs font-semibold text-slate-700">Email <span className="text-rose-500">*</span></label><input id="member-email" required type="email" maxLength={120} value={formValues.email} onChange={(event) => setFormValues({ ...formValues, email: event.target.value })} placeholder="nama@email.com" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div>
              <div><label htmlFor="member-phone" className="mb-1.5 block text-xs font-semibold text-slate-700">Nomor HP</label><input id="member-phone" type="tel" maxLength={20} value={formValues.phone} onChange={(event) => setFormValues({ ...formValues, phone: event.target.value })} placeholder="08xx-xxxx-xxxx" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="member-joined" className="mb-1.5 block text-xs font-semibold text-slate-700">Tanggal bergabung <span className="text-rose-500">*</span></label><input id="member-joined" required type="date" value={formValues.joinedAt} onChange={(event) => setFormValues({ ...formValues, joinedAt: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div><div><label htmlFor="member-status" className="mb-1.5 block text-xs font-semibold text-slate-700">Status anggota</label><select id="member-status" value={formValues.status} onChange={(event) => setFormValues({ ...formValues, status: event.target.value as MemberStatus })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"><option>Aktif</option><option>Nonaktif</option></select></div></div>
              {!editingMember && <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">ID anggota akan dibuat otomatis setelah data ditambahkan.</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeModal} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Batal</button><button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900"><Check size={16} />{editingMember ? 'Simpan Perubahan' : 'Simpan Anggota'}</button></div>
            </form>
          </section>
        </div>
      )}

      {memberToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 size={21} /></div>
            <h2 id="delete-dialog-title" className="mt-4 text-center text-lg font-bold text-slate-900">Hapus data anggota?</h2>
            <p className="mt-2 text-center text-sm leading-6 text-slate-500">Data <strong className="font-semibold text-slate-800">{memberToDelete.name}</strong> akan dihapus dari data prototipe ini. Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row"><button type="button" onClick={() => setMemberToDelete(null)} className="h-10 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="button" onClick={confirmDelete} className="h-10 flex-1 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700">Ya, hapus data</button></div>
          </section>
        </div>
      )}
    </main>
  )
}

function SummaryCard({ label, value, description, icon, tint }: { label: string; value: number; description: string; icon: ReactNode; tint: 'green' | 'blue' | 'amber' }) {
  const tintClasses = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    blue: 'bg-sky-50 text-sky-700 ring-sky-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  }
  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.025] sm:p-5">
      <div className="min-w-0"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[11px] leading-5 text-slate-400">{description}</p></div>
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${tintClasses[tint]}`}>{icon}</div>
    </article>
  )
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const isActive = status === 'Aktif'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100' : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'}`}><span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />{status}</span>
}
