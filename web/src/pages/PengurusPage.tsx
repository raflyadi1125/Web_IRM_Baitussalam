import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  ArrowDownToLine,
  Check,
  ChevronDown,
  ClipboardList,
  Crown,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react'

type AccessRole = 'ADMIN' | 'SEKRETARIS' | 'BENDAHARA' | 'ANGGOTA'
type OfficerStatus = 'Aktif' | 'Nonaktif'
type RoleFilter = 'Semua role' | AccessRole
type StatusFilter = 'Semua status' | OfficerStatus

interface Officer {
  id: number
  memberCode: string
  name: string
  email: string
  phone: string
  position: string
  role: AccessRole
  since: string
  status: OfficerStatus
}

interface MemberOption {
  code: string
  name: string
  email: string
  phone: string
}

interface OfficerFormValues {
  memberCode: string
  position: string
  role: AccessRole
  since: string
  status: OfficerStatus
}

const OFFICERS_STORAGE_KEY = 'irm-baitussalam:pengurus:v1'
const MEMBERS_STORAGE_KEY = 'irm-baitussalam:anggota:v1'

const fallbackMembers: MemberOption[] = [
  { code: 'IRM-001', name: 'Ahmad Fauzan', email: 'ahmad.fauzan@example.com', phone: '0812-3456-7810' },
  { code: 'IRM-002', name: 'Nur Aisyah', email: 'nur.aisyah@example.com', phone: '0813-4567-8910' },
  { code: 'IRM-003', name: 'Muhammad Rizky', email: 'm.rizky@example.com', phone: '0821-2345-6789' },
  { code: 'IRM-004', name: 'Siti Nurhaliza', email: 'siti.nurhaliza@example.com', phone: '0857-1234-5678' },
  { code: 'IRM-005', name: 'Dimas Ramadhan', email: 'dimas.ramadhan@example.com', phone: '0812-9876-5432' },
  { code: 'IRM-006', name: 'Putri Amelia', email: 'putri.amelia@example.com', phone: '0822-1122-3344' },
  { code: 'IRM-007', name: 'Fajar Maulana', email: 'fajar.maulana@example.com', phone: '0819-2233-4455' },
  { code: 'IRM-008', name: 'Intan Permata', email: 'intan.permata@example.com', phone: '0852-3344-5566' },
]

const initialOfficers: Officer[] = [
  { id: 1, memberCode: 'IRM-001', name: 'Ahmad Fauzan', email: 'ahmad.fauzan@example.com', phone: '0812-3456-7810', position: 'Ketua', role: 'ADMIN', since: '2025-01-12', status: 'Aktif' },
  { id: 2, memberCode: 'IRM-002', name: 'Nur Aisyah', email: 'nur.aisyah@example.com', phone: '0813-4567-8910', position: 'Sekretaris', role: 'SEKRETARIS', since: '2025-01-12', status: 'Aktif' },
  { id: 3, memberCode: 'IRM-003', name: 'Muhammad Rizky', email: 'm.rizky@example.com', phone: '0821-2345-6789', position: 'Bendahara', role: 'BENDAHARA', since: '2025-01-12', status: 'Aktif' },
  { id: 4, memberCode: 'IRM-005', name: 'Dimas Ramadhan', email: 'dimas.ramadhan@example.com', phone: '0812-9876-5432', position: 'Koordinator Kegiatan', role: 'ANGGOTA', since: '2025-02-01', status: 'Aktif' },
  { id: 5, memberCode: 'IRM-006', name: 'Putri Amelia', email: 'putri.amelia@example.com', phone: '0822-1122-3344', position: 'Koordinator Humas', role: 'ANGGOTA', since: '2025-02-01', status: 'Aktif' },
  { id: 6, memberCode: 'IRM-007', name: 'Fajar Maulana', email: 'fajar.maulana@example.com', phone: '0819-2233-4455', position: 'Koordinator Hadroh', role: 'ANGGOTA', since: '2025-02-01', status: 'Nonaktif' },
]

const roles: { value: AccessRole; label: string; description: string }[] = [
  { value: 'ADMIN', label: 'Admin', description: 'Akses penuh dan verifikasi laporan keuangan.' },
  { value: 'SEKRETARIS', label: 'Sekretaris', description: 'Mengelola jadwal, pengumuman, serta rekap kegiatan dan absensi.' },
  { value: 'BENDAHARA', label: 'Bendahara', description: 'Mencatat transaksi dan menyusun laporan keuangan.' },
  { value: 'ANGGOTA', label: 'Anggota', description: 'Melihat informasi organisasi dan mengakses absensi pribadi.' },
]

const positions = ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Koordinator Kegiatan', 'Koordinator Humas', 'Koordinator Hadroh', 'Seksi Sosial', 'Seksi Perlengkapan', 'Lainnya']

type PermissionValue = boolean | 'read'

const rolePermissions: { label: string; admin: PermissionValue; sekretaris: PermissionValue; bendahara: PermissionValue; anggota: PermissionValue }[] = [
  { label: 'Data anggota & pengurus', admin: true, sekretaris: false, bendahara: false, anggota: false },
  { label: 'Jadwal kegiatan', admin: true, sekretaris: true, bendahara: false, anggota: 'read' },
  { label: 'Pengumuman organisasi', admin: true, sekretaris: true, bendahara: false, anggota: 'read' },
  { label: 'Rekap absensi & kegiatan', admin: true, sekretaris: true, bendahara: false, anggota: false },
  { label: 'Catat kas masuk/keluar', admin: true, sekretaris: false, bendahara: true, anggota: false },
  { label: 'Lihat laporan keuangan', admin: true, sekretaris: false, bendahara: true, anggota: false },
  { label: 'Verifikasi laporan keuangan', admin: true, sekretaris: false, bendahara: false, anggota: false },
  { label: 'Absensi & riwayat pribadi', admin: true, sekretaris: false, bendahara: false, anggota: true },
]

const emptyForm: OfficerFormValues = {
  memberCode: '',
  position: 'Koordinator Kegiatan',
  role: 'ANGGOTA',
  since: new Date().toISOString().slice(0, 10),
  status: 'Aktif',
}

function readStoredOfficers(): Officer[] {
  try {
    const stored = window.localStorage.getItem(OFFICERS_STORAGE_KEY)
    if (!stored) return initialOfficers
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return initialOfficers
    const valid = parsed.every((item) => typeof item === 'object' && item !== null && 'id' in item && 'memberCode' in item && 'name' in item && 'email' in item && 'phone' in item && 'position' in item && 'role' in item && 'since' in item && 'status' in item)
    return valid ? parsed as Officer[] : initialOfficers
  } catch {
    return initialOfficers
  }
}

function readMemberOptions(): MemberOption[] {
  try {
    const stored = window.localStorage.getItem(MEMBERS_STORAGE_KEY)
    if (!stored) return fallbackMembers
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallbackMembers
    const mapped = parsed.filter((item) => typeof item === 'object' && item !== null && 'code' in item && 'name' in item).map((item) => {
      const member = item as Partial<MemberOption>
      return {
        code: String(member.code ?? ''),
        name: String(member.name ?? ''),
        email: String(member.email ?? ''),
        phone: String(member.phone ?? ''),
      }
    }).filter((member) => member.code && member.name)
    return mapped.length ? mapped : fallbackMembers
  } catch {
    return fallbackMembers
  }
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function roleLabel(role: AccessRole) {
  return roles.find((item) => item.value === role)?.label ?? role
}

function defaultRoleForPosition(position: string): AccessRole {
  if (position === 'Ketua' || position === 'Wakil Ketua') return 'ADMIN'
  if (position === 'Sekretaris') return 'SEKRETARIS'
  if (position === 'Bendahara') return 'BENDAHARA'
  return 'ANGGOTA'
}

function downloadCsv(officers: Officer[]) {
  const header = ['ID Anggota', 'Nama', 'Email', 'Nomor HP', 'Jabatan', 'Role Sistem', 'Tanggal Menjabat', 'Status']
  const rows = officers.map((item) => [item.memberCode, item.name, item.email, item.phone, item.position, item.role, item.since, item.status])
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'data-pengurus-irm-baitussalam.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function PengurusPage({ searchQuery = '' }: { searchQuery?: string }) {
  const [officers, setOfficers] = useState<Officer[]>(readStoredOfficers)
  const [memberOptions] = useState<MemberOption[]>(readMemberOptions)
  const [localSearch, setLocalSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('Semua role')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua status')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null)
  const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null)
  const [formValues, setFormValues] = useState<OfficerFormValues>(emptyForm)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const resolvedOfficers = useMemo(() => officers.map((officer) => {
    const member = memberOptions.find((item) => item.code === officer.memberCode)
    return member ? { ...officer, name: member.name, email: member.email, phone: member.phone } : officer
  }), [officers, memberOptions])

  const filteredOfficers = useMemo(() => {
    const queries = [searchQuery, localSearch].map((query) => query.trim().toLocaleLowerCase('id-ID')).filter(Boolean)
    return resolvedOfficers.filter((officer) => {
      const searchableValues = [officer.memberCode, officer.name, officer.email, officer.phone, officer.position, roleLabel(officer.role)].map((value) => value.toLocaleLowerCase('id-ID'))
      const matchesQuery = queries.every((query) => searchableValues.some((value) => value.includes(query)))
      const matchesRole = roleFilter === 'Semua role' || officer.role === roleFilter
      const matchesStatus = statusFilter === 'Semua status' || officer.status === statusFilter
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [resolvedOfficers, localSearch, searchQuery, roleFilter, statusFilter])

  useEffect(() => {
    try {
      window.localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(officers))
    } catch {
      setNotice('Penyimpanan lokal browser tidak tersedia. Perubahan hanya aktif selama halaman ini terbuka.')
    }
  }, [officers])

  const activeCount = resolvedOfficers.filter((officer) => officer.status === 'Aktif').length
  const adminCount = resolvedOfficers.filter((officer) => officer.role === 'ADMIN' && officer.status === 'Aktif').length
  const availableMembers = memberOptions.filter((member) => !resolvedOfficers.some((officer) => officer.memberCode === member.code && officer.id !== editingOfficer?.id))
  const selectedMember = memberOptions.find((member) => member.code === formValues.memberCode)

  const openCreateModal = () => {
    setEditingOfficer(null)
    const notYetOfficer = memberOptions.find((member) => !resolvedOfficers.some((officer) => officer.memberCode === member.code))
    setFormValues({ ...emptyForm, memberCode: notYetOfficer?.code ?? memberOptions[0]?.code ?? '' })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (officer: Officer) => {
    setEditingOfficer(officer)
    setFormValues({ memberCode: officer.memberCode, position: officer.position, role: officer.role, since: officer.since, status: officer.status })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOfficer(null)
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    const member = memberOptions.find((item) => item.code === formValues.memberCode)
    if (!member) {
      setFormError('Pilih anggota yang terdaftar terlebih dahulu.')
      return
    }
    const duplicated = officers.some((item) => item.memberCode === member.code && item.id !== editingOfficer?.id)
    if (duplicated) {
      setFormError('Anggota ini sudah tercatat sebagai pengurus. Pilih anggota lain.')
      return
    }

    const normalized: Officer = {
      id: editingOfficer?.id ?? officers.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      memberCode: member.code,
      name: member.name,
      email: member.email,
      phone: member.phone,
      position: formValues.position.trim(),
      role: formValues.role,
      since: formValues.since,
      status: formValues.status,
    }
    if (editingOfficer) {
      setOfficers((current) => current.map((item) => item.id === editingOfficer.id ? normalized : item))
      setNotice(`Data ${normalized.name} berhasil diperbarui di penyimpanan lokal browser.`)
    } else {
      setOfficers((current) => [normalized, ...current])
      setNotice(`${normalized.name} ditambahkan sebagai pengurus di penyimpanan lokal browser.`)
    }
    closeModal()
    window.setTimeout(() => setNotice(''), 4000)
  }

  const confirmDelete = () => {
    if (!officerToDelete) return
    setOfficers((current) => current.filter((item) => item.id !== officerToDelete.id))
    setNotice(`Data pengurus ${officerToDelete.name} berhasil dihapus dari penyimpanan lokal browser.`)
    setOfficerToDelete(null)
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Data Pengurus</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Atur struktur kepengurusan IRM Baitussalam, jabatan, dan role akses sistem sesuai tanggung jawabnya.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => downloadCsv(filteredOfficers)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <ArrowDownToLine size={16} /> Ekspor CSV
            </button>
            <button type="button" onClick={openCreateModal} disabled={availableMembers.length === 0} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={17} /> Tambah Pengurus
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span><strong>Mode prototipe:</strong> data pengurus masih contoh. Role di sini hanya konfigurasi tampilan dan belum membatasi halaman secara nyata karena autentikasi belum dibuat.</span>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Ringkasan pengurus">
          <SummaryCard label="Total Pengurus" value={resolvedOfficers.length} helper="Terdaftar pada struktur" icon={<Users size={19} />} tint="green" />
          <SummaryCard label="Pengurus Aktif" value={activeCount} helper={`${resolvedOfficers.length - activeCount} nonaktif`} icon={<UserCog size={19} />} tint="blue" />
          <SummaryCard label="Role Admin Aktif" value={adminCount} helper="Memiliki akses administrasi" icon={<ShieldCheck size={19} />} tint="amber" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Struktur kepengurusan</h2>
              <p className="mt-1 text-xs text-slate-500">Menampilkan {filteredOfficers.length} dari {officers.length} pengurus.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block sm:w-56">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari nama atau jabatan..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50" />
              </label>
              <label className="relative block sm:w-40">
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50">
                  <option>Semua role</option>
                  {roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </label>
              <label className="relative block sm:w-40">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50">
                  <option>Semua status</option><option>Aktif</option><option>Nonaktif</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead className="bg-slate-50/80">
                <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-3.5">Pengurus</th><th className="px-4 py-3.5">Jabatan</th><th className="px-4 py-3.5">Role akses</th><th className="px-4 py-3.5">Kontak</th><th className="px-4 py-3.5">Mulai menjabat</th><th className="px-4 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="group transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${officer.role === 'ADMIN' ? 'bg-amber-50 text-amber-800' : officer.role === 'SEKRETARIS' ? 'bg-blue-50 text-blue-700' : officer.role === 'BENDAHARA' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-800'}`}>{getInitials(officer.name)}</div>
                        <div className="min-w-0"><p className="whitespace-nowrap text-sm font-semibold text-slate-800">{officer.name}</p><p className="mt-0.5 text-[11px] text-slate-400">{officer.memberCode}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">{officer.position}</span></td>
                    <td className="px-4 py-4"><RoleBadge role={officer.role} /></td>
                    <td className="px-4 py-4"><p className="whitespace-nowrap text-xs font-medium text-slate-700">{officer.email}</p><p className="mt-1 text-[11px] text-slate-400">{officer.phone || 'Nomor belum diisi'}</p></td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">{formatDate(officer.since)}</td>
                    <td className="px-4 py-4"><StatusBadge status={officer.status} /></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => openEditModal(officer)} aria-label={`Edit ${officer.name}`} title="Edit data" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"><Pencil size={14} /></button><button type="button" onClick={() => setOfficerToDelete(officer)} aria-label={`Hapus ${officer.name}`} title="Hapus data" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
                {filteredOfficers.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-400"><Search size={20} /></div><p className="mt-3 text-sm font-semibold text-slate-700">Pengurus tidak ditemukan</p><p className="mt-1 text-xs text-slate-500">Coba ubah kata kunci atau filter yang digunakan.</p></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3.5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Data contoh untuk prototipe antarmuka.</span><span>Gunakan tombol edit untuk mengubah jabatan dan role akses.</span></div>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700"><LockKeyhole size={13} /> Keamanan & Hak Akses</div><h2 className="text-lg font-bold text-slate-900">Ringkasan izin berdasarkan role</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Gambaran akses sesuai kebutuhan SRS. Otorisasi nyata akan diterapkan saat autentikasi dan backend tersedia.</p></div><div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 sm:flex"><KeyRound size={14} /> Role-based access</div></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {roles.map((role) => <RoleCard key={role.value} role={role.value} description={role.description} />)}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">Fungsi sistem</th>{roles.map((role) => <th key={role.value} className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">{role.label}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{rolePermissions.map((permission) => <tr key={permission.label}><td className="px-4 py-3 text-xs font-medium text-slate-700 sm:px-5">{permission.label}</td>{([['admin', permission.admin], ['sekretaris', permission.sekretaris], ['bendahara', permission.bendahara], ['anggota', permission.anggota]] as const).map(([key, allowed]) => <td key={key} className="px-3 py-3 text-center">{allowed === true ? <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={14} /></span> : allowed === 'read' ? <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">Lihat</span> : <span className="text-slate-300">—</span>}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>

      {notice && <div role="status" className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100%-2rem)] items-start gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg shadow-slate-900/10"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check size={12} /></span><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Tutup notifikasi" className="ml-2 text-slate-400 hover:text-slate-700"><X size={15} /></button></div>}

      {isModalOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
        <section role="dialog" aria-modal="true" aria-labelledby="officer-modal-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Manajemen organisasi</p><h2 id="officer-modal-title" className="mt-1 text-lg font-bold text-slate-900">{editingOfficer ? 'Edit data pengurus' : 'Tambah pengurus'}</h2><p className="mt-1 text-xs text-slate-500">Pilih anggota terdaftar, lalu tentukan jabatan dan akses sistem.</p></div><button type="button" onClick={closeModal} aria-label="Tutup form" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Anggota <span className="text-rose-500">*</span></span><select required value={formValues.memberCode} onChange={(event) => setFormValues((current) => ({ ...current, memberCode: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"><option value="">Pilih anggota...</option>{(editingOfficer ? memberOptions.filter((member) => member.code === editingOfficer.memberCode || !resolvedOfficers.some((item) => item.memberCode === member.code)) : availableMembers).map((member) => <option key={member.code} value={member.code}>{member.name} · {member.code}</option>)}</select>{selectedMember && <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500"><Mail size={12} /> {selectedMember.email || 'Email belum diisi'} · {selectedMember.phone || 'No. HP belum diisi'}</span>}</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Jabatan <span className="text-rose-500">*</span></span><select required value={formValues.position} onChange={(event) => setFormValues((current) => ({ ...current, position: event.target.value, role: defaultRoleForPosition(event.target.value) }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50">{positions.map((position) => <option key={position}>{position}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Role akses sistem <span className="text-rose-500">*</span></span><select required value={formValues.role} onChange={(event) => setFormValues((current) => ({ ...current, role: event.target.value as AccessRole }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50">{roles.map((role) => <option key={role.value} value={role.value}>{role.label} ({role.value})</option>)}</select><span className="mt-1.5 block text-[11px] leading-4 text-slate-500">Role menentukan ruang lingkup akses saat otorisasi backend sudah diterapkan.</span></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Tanggal mulai menjabat <span className="text-rose-500">*</span></span><input type="date" required value={formValues.since} onChange={(event) => setFormValues((current) => ({ ...current, since: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Status kepengurusan</span><select value={formValues.status} onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value as OfficerStatus }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"><option>Aktif</option><option>Nonaktif</option></select></label>
            </div>
            {formError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700">{formError}</p>}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeModal} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button><button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900"><Check size={15} /> {editingOfficer ? 'Simpan perubahan' : 'Tambah pengurus'}</button></div>
          </form>
        </section>
      </div>}

      {officerToDelete && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-officer-title" className="w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 sm:mx-0"><Trash2 size={22} /></div><h2 id="delete-officer-title" className="mt-4 text-lg font-bold text-slate-900">Hapus data pengurus?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Data <strong className="text-slate-700">{officerToDelete.name}</strong> akan dihapus dari daftar pengurus pada browser ini. Data anggota di modul Data Anggota tidak ikut terhapus.</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setOfficerToDelete(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button><button onClick={confirmDelete} className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700">Ya, hapus</button></div></section></div>}
    </main>
  )
}

function SummaryCard({ label, value, helper, icon, tint }: { label: string; value: number; helper: string; icon: ReactNode; tint: 'green' | 'blue' | 'amber' }) {
  const colors = { green: 'bg-emerald-50 text-emerald-800', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-800' }
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[tint]}`}>{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-500">{helper}</p></div>
}

function RoleBadge({ role }: { role: AccessRole }) {
  const styles: Record<AccessRole, string> = { ADMIN: 'bg-amber-50 text-amber-800 ring-amber-200', SEKRETARIS: 'bg-blue-50 text-blue-700 ring-blue-200', BENDAHARA: 'bg-violet-50 text-violet-700 ring-violet-200', ANGGOTA: 'bg-emerald-50 text-emerald-800 ring-emerald-200' }
  return <span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${styles[role]}`}>{role === 'ADMIN' ? <ShieldCheck size={12} /> : role === 'SEKRETARIS' ? <ClipboardList size={12} /> : role === 'BENDAHARA' ? <Crown size={12} /> : <Users size={12} />}{roleLabel(role)}</span>
}

function StatusBadge({ status }: { status: OfficerStatus }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${status === 'Aktif' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}><span className={`h-1.5 w-1.5 rounded-full ${status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{status}</span>
}

function RoleCard({ role, description }: { role: AccessRole; description: string }) {
  const colors: Record<AccessRole, string> = { ADMIN: 'bg-amber-50 text-amber-800', SEKRETARIS: 'bg-blue-50 text-blue-700', BENDAHARA: 'bg-violet-50 text-violet-700', ANGGOTA: 'bg-emerald-50 text-emerald-800' }
  const Icon = role === 'ADMIN' ? ShieldCheck : role === 'SEKRETARIS' ? ClipboardList : role === 'BENDAHARA' ? Crown : Users
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${colors[role]}`}><Icon size={18} /></span><div><p className="text-sm font-bold text-slate-800">{roleLabel(role)}</p><p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-400">{role}</p></div></div><p className="mt-3 text-xs leading-5 text-slate-500">{description}</p></div>
}
