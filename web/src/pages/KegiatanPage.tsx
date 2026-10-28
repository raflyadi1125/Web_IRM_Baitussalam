import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertCircle,
  ArrowDownToLine,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  MapPin,
  Plus,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'

type ActivityCategory = 'Pengajian' | 'Sosial' | 'Organisasi' | 'Hadroh' | 'PHBI' | 'Lainnya'
type ActivityStatus = 'Akan Datang' | 'Berlangsung' | 'Selesai'
type ActiveTab = 'kegiatan' | 'absensi'

type Activity = {
  id: number
  title: string
  category: ActivityCategory
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  qrToken: string
}

type MemberOption = {
  code: string
  name: string
  email: string
  phone: string
  status: string
}

type Attendance = {
  id: number
  activityId: number
  memberCode: string
  memberName: string
  checkedInAt: string
}

type ActivityFormValues = Omit<Activity, 'id' | 'qrToken'>

const ACTIVITY_STORAGE_KEY = 'irm-baitussalam:kegiatan:v1'
const ATTENDANCE_STORAGE_KEY = 'irm-baitussalam:absensi:v1'
const MEMBERS_STORAGE_KEY = 'irm-baitussalam:anggota:v1'

const fallbackMembers: MemberOption[] = [
  { code: 'IRM-001', name: 'Ahmad Fauzan', email: 'ahmad.fauzan@example.com', phone: '0812-3456-7810', status: 'Aktif' },
  { code: 'IRM-002', name: 'Nur Aisyah', email: 'nur.aisyah@example.com', phone: '0813-4567-8910', status: 'Aktif' },
  { code: 'IRM-003', name: 'Muhammad Rizky', email: 'm.rizky@example.com', phone: '0821-2345-6789', status: 'Aktif' },
  { code: 'IRM-004', name: 'Siti Nurhaliza', email: 'siti.nurhaliza@example.com', phone: '0857-1234-5678', status: 'Nonaktif' },
  { code: 'IRM-005', name: 'Dimas Ramadhan', email: 'dimas.ramadhan@example.com', phone: '0812-9876-5432', status: 'Aktif' },
  { code: 'IRM-006', name: 'Putri Amelia', email: 'putri.amelia@example.com', phone: '0822-1122-3344', status: 'Aktif' },
  { code: 'IRM-007', name: 'Fajar Maulana', email: 'fajar.maulana@example.com', phone: '0819-2233-4455', status: 'Aktif' },
  { code: 'IRM-008', name: 'Intan Permata', email: 'intan.permata@example.com', phone: '0852-3344-5566', status: 'Aktif' },
]

const initialActivities: Activity[] = [
  {
    id: 1,
    title: 'Pengajian Rutin Remaja',
    category: 'Pengajian',
    date: '2026-10-26',
    startTime: '19:30',
    endTime: '21:00',
    location: 'Masjid Baitussalam',
    description: 'Pengajian rutin dan kajian keislaman untuk anggota remaja masjid.',
    qrToken: 'IRM-26OCT-91A7C3D0',
  },
  {
    id: 2,
    title: 'Pengajian Rutin Remaja',
    category: 'Pengajian',
    date: '2026-10-29',
    startTime: '19:30',
    endTime: '21:00',
    location: 'Masjid Baitussalam',
    description: 'Pengajian rutin dan kajian keislaman untuk anggota remaja masjid.',
    qrToken: 'IRM-29OCT-6E2B8F41',
  },
  {
    id: 3,
    title: 'Roan dan Bersih-Bersih',
    category: 'Sosial',
    date: '2026-10-30',
    startTime: '06:00',
    endTime: '08:00',
    location: 'Area Masjid Baitussalam',
    description: 'Kerja bakti membersihkan area masjid bersama anggota.',
    qrToken: 'IRM-30OCT-A73D91C5',
  },
  {
    id: 4,
    title: 'Latihan Hadroh',
    category: 'Hadroh',
    date: '2026-10-31',
    startTime: '19:45',
    endTime: '21:30',
    location: 'Serambi Masjid Baitussalam',
    description: 'Latihan rutin tim hadroh dan persiapan penampilan.',
    qrToken: 'IRM-31OCT-4D0C82BE',
  },
]

const initialAttendance: Attendance[] = [
  { id: 1, activityId: 1, memberCode: 'IRM-001', memberName: 'Ahmad Fauzan', checkedInAt: '2026-10-26T19:24:00+07:00' },
  { id: 2, activityId: 1, memberCode: 'IRM-002', memberName: 'Nur Aisyah', checkedInAt: '2026-10-26T19:26:00+07:00' },
  { id: 3, activityId: 1, memberCode: 'IRM-003', memberName: 'Muhammad Rizky', checkedInAt: '2026-10-26T19:33:00+07:00' },
]

const categoryOptions: ActivityCategory[] = ['Pengajian', 'Sosial', 'Organisasi', 'Hadroh', 'PHBI', 'Lainnya']
function getLocalIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyActivityForm: ActivityFormValues = {
  title: '',
  category: 'Pengajian',
  date: getLocalIsoDate(),
  startTime: '19:30',
  endTime: '21:00',
  location: 'Masjid Baitussalam',
  description: '',
}

function createToken() {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()
    : Math.random().toString(36).slice(2, 14).toUpperCase()
  return `IRM-${Date.now().toString(36).toUpperCase()}-${randomPart}`
}

function createQrPayload(activity: Activity) {
  return `IRM-BAITUSSALAM|${activity.id}|${activity.qrToken}`
}

function readArray<T>(key: string, fallback: T[], validator: (value: unknown) => value is T): T[] {
  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return fallback
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every(validator)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

function isActivity(value: unknown): value is Activity {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Activity>
  return typeof item.id === 'number' && typeof item.title === 'string' && typeof item.category === 'string'
    && typeof item.date === 'string' && typeof item.startTime === 'string' && typeof item.endTime === 'string'
    && typeof item.location === 'string' && typeof item.description === 'string' && typeof item.qrToken === 'string'
}

function isAttendance(value: unknown): value is Attendance {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Attendance>
  return typeof item.id === 'number' && typeof item.activityId === 'number' && typeof item.memberCode === 'string'
    && typeof item.memberName === 'string' && typeof item.checkedInAt === 'string'
}

function readMembers(): MemberOption[] {
  const storedMembers = readArray<unknown>(MEMBERS_STORAGE_KEY, [], (value): value is unknown => typeof value === 'object' && value !== null)
  if (!storedMembers.length) return fallbackMembers
  const mapped = storedMembers.map((value) => value as Partial<MemberOption>)
    .filter((member) => typeof member.code === 'string' && typeof member.name === 'string')
    .map((member) => ({
      code: member.code as string,
      name: member.name as string,
      email: typeof member.email === 'string' ? member.email : '',
      phone: typeof member.phone === 'string' ? member.phone : '',
      status: typeof member.status === 'string' ? member.status : 'Aktif',
    }))
  return mapped.length ? mapped : fallbackMembers
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', options).format(date)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

function getActivityStatus(activity: Activity): ActivityStatus {
  const now = new Date()
  const startsAt = new Date(`${activity.date}T${activity.startTime}:00`)
  const endsAt = new Date(`${activity.date}T${activity.endTime}:00`)
  if (now >= endsAt) return 'Selesai'
  if (now >= startsAt && now < endsAt) return 'Berlangsung'
  return 'Akan Datang'
}

function getCategoryStyles(category: ActivityCategory) {
  switch (category) {
    case 'Pengajian': return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
    case 'Sosial': return 'bg-amber-50 text-amber-700 ring-amber-100'
    case 'Organisasi': return 'bg-blue-50 text-blue-700 ring-blue-100'
    case 'Hadroh': return 'bg-violet-50 text-violet-700 ring-violet-100'
    case 'PHBI': return 'bg-rose-50 text-rose-700 ring-rose-100'
    default: return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function SummaryCard({ label, value, note, icon, tone }: { label: string; value: string | number; note: string; icon: ReactNode; tone: 'green' | 'blue' | 'amber' | 'violet' }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">{note}</p>
    </div>
  )
}

function QrScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const callbackRef = useRef(onDetected)
  const [message, setMessage] = useState('Meminta izin akses kamera...')
  const [cameraAvailable, setCameraAvailable] = useState(true)

  useEffect(() => { callbackRef.current = onDetected }, [onDetected])

  useEffect(() => {
    let stopped = false
    let stream: MediaStream | null = null
    let frame = 0
    let detector: { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } | null = null
    let busy = false

    type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
      detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
    }
    const BarcodeDetectorApi = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector

    const start = async () => {
      if (!BarcodeDetectorApi) {
        setCameraAvailable(false)
        setMessage('Fitur pemindaian kamera belum tersedia di browser ini. Kamu tetap bisa memasukkan token QR secara manual.')
        return
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraAvailable(false)
        setMessage('Browser tidak mendukung akses kamera. Masukkan token QR secara manual.')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        detector = new BarcodeDetectorApi({ formats: ['qr_code'] })
        setMessage('Arahkan kamera ke kode QR kegiatan.')

        const scan = async () => {
          if (stopped) return
          const video = videoRef.current
          if (video && video.readyState >= 2 && detector && !busy) {
            busy = true
            try {
              const codes = await detector.detect(video)
              const detected = codes.find((code) => code.rawValue)?.rawValue
              if (detected) {
                setMessage('Kode QR berhasil terbaca. Periksa kegiatan dan anggota sebelum mencatat kehadiran.')
                stream?.getTracks().forEach((track) => track.stop())
                callbackRef.current(detected)
                return
              }
            } catch {
              // Frame yang gagal dibaca akan dicoba kembali pada frame selanjutnya.
            } finally {
              busy = false
            }
          }
          if (!stopped) frame = window.requestAnimationFrame(() => { void scan() })
        }
        frame = window.requestAnimationFrame(() => { void scan() })
      } catch {
        setCameraAvailable(false)
        setMessage('Kamera tidak dapat dibuka. Periksa izin kamera browser atau masukkan token QR secara manual.')
      }
    }

    void start()
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [])

  return (
    <div className="space-y-3">
      {cameraAvailable && <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
        <video ref={videoRef} className="aspect-video max-h-64 w-full object-cover" muted playsInline aria-label="Kamera untuk memindai kode QR" />
      </div>}
      <p className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-5 ${cameraAvailable ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}>
        <ScanLine size={15} className="mt-0.5 shrink-0" /> {message}
      </p>
    </div>
  )
}

export default function KegiatanPage({ searchQuery = '' }: { searchQuery?: string }) {
  const [activities, setActivities] = useState<Activity[]>(() => readArray(ACTIVITY_STORAGE_KEY, initialActivities, isActivity))
  const [attendances, setAttendances] = useState<Attendance[]>(() => readArray(ATTENDANCE_STORAGE_KEY, initialAttendance, isAttendance))
  const [members] = useState<MemberOption[]>(readMembers)
  const [activeTab, setActiveTab] = useState<ActiveTab>('kegiatan')
  const [localSearch, setLocalSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'Semua kategori' | ActivityCategory>('Semua kategori')
  const [statusFilter, setStatusFilter] = useState<'Semua status' | ActivityStatus>('Semua status')
  const [attendanceActivityFilter, setAttendanceActivityFilter] = useState('Semua kegiatan')
  const [attendanceSearch, setAttendanceSearch] = useState('')
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null)
  const [selectedQrActivity, setSelectedQrActivity] = useState<Activity | null>(null)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [formValues, setFormValues] = useState<ActivityFormValues>(emptyActivityForm)
  const [formError, setFormError] = useState('')
  const [checkInError, setCheckInError] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [selectedActivityId, setSelectedActivityId] = useState('')
  const [selectedMemberCode, setSelectedMemberCode] = useState('')
  const [notice, setNotice] = useState('')
  const qrPreviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities)) } catch { /* storage bisa nonaktif di browser tertentu */ }
  }, [activities])

  useEffect(() => {
    try { window.localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendances)) } catch { /* storage bisa nonaktif di browser tertentu */ }
  }, [attendances])

  const resolvedActivities = useMemo(() => activities.map((activity) => ({ ...activity, status: getActivityStatus(activity) })), [activities])
  const filteredActivities = useMemo(() => {
    const query = `${searchQuery} ${localSearch}`.trim().toLocaleLowerCase('id-ID')
    return resolvedActivities.filter((activity) => {
      const matchesQuery = !query || [activity.title, activity.category, activity.location, activity.description].some((value) => value.toLocaleLowerCase('id-ID').includes(query))
      const matchesCategory = categoryFilter === 'Semua kategori' || activity.category === categoryFilter
      const matchesStatus = statusFilter === 'Semua status' || activity.status === statusFilter
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [resolvedActivities, searchQuery, localSearch, categoryFilter, statusFilter])

  const upcomingCount = resolvedActivities.filter((activity) => activity.status === 'Akan Datang').length
  const happeningCount = resolvedActivities.filter((activity) => activity.status === 'Berlangsung').length
  const activeMembers = members.filter((member) => member.status === 'Aktif')
  const selectedQrActivityResolved = selectedQrActivity ? activities.find((activity) => activity.id === selectedQrActivity.id) ?? selectedQrActivity : null

  const filteredAttendances = useMemo(() => {
    const query = `${searchQuery} ${attendanceSearch}`.trim().toLocaleLowerCase('id-ID')
    return [...attendances].filter((item) => {
      const activity = activities.find((candidate) => candidate.id === item.activityId)
      const matchesActivity = attendanceActivityFilter === 'Semua kegiatan' || String(item.activityId) === attendanceActivityFilter
      const matchesQuery = !query || [item.memberCode, item.memberName, activity?.title ?? ''].some((value) => value.toLocaleLowerCase('id-ID').includes(query))
      return matchesActivity && matchesQuery
    }).sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
  }, [attendances, activities, attendanceActivityFilter, attendanceSearch, searchQuery])

  const attendanceCountFor = (activityId: number) => attendances.filter((item) => item.activityId === activityId).length
  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 4500)
  }

  const openCreateActivity = () => {
    setEditingActivity(null)
    setFormValues({ ...emptyActivityForm, date: getLocalIsoDate() })
    setFormError('')
    setIsActivityModalOpen(true)
  }

  const openEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setFormValues({ title: activity.title, category: activity.category, date: activity.date, startTime: activity.startTime, endTime: activity.endTime, location: activity.location, description: activity.description })
    setFormError('')
    setIsActivityModalOpen(true)
  }

  const closeActivityModal = () => {
    setIsActivityModalOpen(false)
    setEditingActivity(null)
    setFormError('')
  }

  const handleActivitySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (formValues.endTime <= formValues.startTime) {
      setFormError('Waktu selesai harus lebih akhir daripada waktu mulai.')
      return
    }
    if (editingActivity) {
      setActivities((current) => current.map((activity) => activity.id === editingActivity.id ? { ...activity, ...formValues } : activity))
      showNotice(`Kegiatan “${formValues.title.trim()}” berhasil diperbarui.`)
    } else {
      const nextId = activities.reduce((max, activity) => Math.max(max, activity.id), 0) + 1
      const newActivity: Activity = { id: nextId, ...formValues, title: formValues.title.trim(), location: formValues.location.trim(), description: formValues.description.trim(), qrToken: createToken() }
      setActivities((current) => [newActivity, ...current])
      showNotice(`Kegiatan “${newActivity.title}” berhasil dibuat dengan kode QR unik.`)
    }
    closeActivityModal()
  }

  const confirmDeleteActivity = () => {
    if (!activityToDelete) return
    setActivities((current) => current.filter((activity) => activity.id !== activityToDelete.id))
    setAttendances((current) => current.filter((item) => item.activityId !== activityToDelete.id))
    if (selectedQrActivity?.id === activityToDelete.id) setSelectedQrActivity(null)
    showNotice(`Kegiatan “${activityToDelete.title}” dan rekap absensinya dihapus dari browser ini.`)
    setActivityToDelete(null)
  }

  const openCheckInModal = (activityId?: number) => {
    setSelectedActivityId(activityId ? String(activityId) : activities[0] ? String(activities[0].id) : '')
    setSelectedMemberCode(activeMembers[0]?.code ?? '')
    setQrInput('')
    setCheckInError('')
    setShowCamera(false)
    setIsCheckInModalOpen(true)
  }

  const handleQrDetected = useCallback((payload: string) => {
    setQrInput(payload)
    const matched = activities.find((activity) => payload.trim() === activity.qrToken || payload.trim() === createQrPayload(activity))
    if (matched) setSelectedActivityId(String(matched.id))
    setCheckInError(matched ? '' : 'Kode QR tidak cocok dengan kegiatan pada prototipe ini.')
  }, [activities])

  const handleCheckIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCheckInError('')
    const token = qrInput.trim()
    const matchedActivity = activities.find((activity) => token === activity.qrToken || token === createQrPayload(activity))
    if (!matchedActivity) {
      setCheckInError('Kode QR tidak valid. Buka QR dari detail kegiatan atau masukkan token yang benar.')
      return
    }
    const chosenActivityId = Number(selectedActivityId)
    if (chosenActivityId && chosenActivityId !== matchedActivity.id) {
      setCheckInError(`Kode QR tersebut milik kegiatan “${matchedActivity.title}”. Pilih kegiatan yang sesuai.`)
      setSelectedActivityId(String(matchedActivity.id))
      return
    }
    const member = activeMembers.find((item) => item.code === selectedMemberCode)
    if (!member) {
      setCheckInError('Pilih anggota aktif terlebih dahulu.')
      return
    }
    const duplicate = attendances.some((item) => item.activityId === matchedActivity.id && item.memberCode === member.code)
    if (duplicate) {
      setCheckInError(`${member.name} sudah tercatat hadir pada kegiatan ini. Absensi ganda ditolak.`)
      return
    }
    const newAttendance: Attendance = {
      id: attendances.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      activityId: matchedActivity.id,
      memberCode: member.code,
      memberName: member.name,
      checkedInAt: new Date().toISOString(),
    }
    setAttendances((current) => [newAttendance, ...current])
    setIsCheckInModalOpen(false)
    setActiveTab('absensi')
    showNotice(`Kehadiran ${member.name} pada “${matchedActivity.title}” berhasil dicatat.`)
  }

  const exportActivities = () => {
    const header = ['Nama Kegiatan', 'Kategori', 'Tanggal', 'Mulai', 'Selesai', 'Lokasi', 'Status', 'Token QR']
    const rows = filteredActivities.map((activity) => [activity.title, activity.category, activity.date, activity.startTime, activity.endTime, activity.location, activity.status, activity.qrToken])
    downloadCsv([header, ...rows], 'kegiatan-irm-baitussalam.csv')
  }

  const exportAttendance = () => {
    const header = ['Tanggal dan Waktu', 'ID Anggota', 'Nama Anggota', 'Kegiatan']
    const rows = filteredAttendances.map((item) => [formatDateTime(item.checkedInAt), item.memberCode, item.memberName, activities.find((activity) => activity.id === item.activityId)?.title ?? 'Kegiatan dihapus'])
    downloadCsv([header, ...rows], 'rekap-absensi-irm-baitussalam.csv')
  }

  const downloadQrSvg = () => {
    const svg = qrPreviewRef.current?.querySelector('svg')
    if (!svg || !selectedQrActivityResolved) return
    const serialized = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qr-${selectedQrActivityResolved.qrToken.toLowerCase()}.svg`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const copyQrToken = async () => {
    if (!selectedQrActivityResolved) return
    try {
      await navigator.clipboard.writeText(createQrPayload(selectedQrActivityResolved))
      showNotice('Isi QR berhasil disalin. Simpan token ini untuk kebutuhan pengujian prototipe.')
    } catch {
      showNotice(`Token QR: ${createQrPayload(selectedQrActivityResolved)}`)
    }
  }

  return (
    <main className="min-h-screen px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Agenda Organisasi
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Kegiatan & Absensi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Atur agenda IRM Baitussalam, buat kode QR unik untuk kegiatan, dan pantau kehadiran anggota dalam satu halaman.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openCheckInModal()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><ScanLine size={16} /> Catat Absensi</button>
            <button type="button" onClick={openCreateActivity} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100"><Plus size={17} /> Tambah Kegiatan</button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span><strong>Mode prototipe:</strong> data kegiatan dan absensi disimpan di browser. Token QR unik dan validasi absensi ganda berjalan di frontend, tetapi belum aman untuk penggunaan nyata sebelum dipindahkan dan divalidasi di backend Go.</span>
        </div>

        {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={17} className="mt-0.5 shrink-0" /><span className="min-w-0 flex-1 break-words">{notice}</span><button type="button" aria-label="Tutup pemberitahuan" className="rounded p-0.5 hover:bg-emerald-100" onClick={() => setNotice('')}><X size={15} /></button></div>}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan kegiatan dan absensi">
          <SummaryCard label="Total Kegiatan" value={activities.length} note="Semua agenda tersimpan" icon={<CalendarDays size={19} />} tone="green" />
          <SummaryCard label="Akan Datang" value={upcomingCount} note="Agenda yang belum dimulai" icon={<Clock3 size={19} />} tone="blue" />
          <SummaryCard label="Sedang Berlangsung" value={happeningCount} note="Sesuai waktu lokal perangkat" icon={<CheckCircle2 size={19} />} tone="amber" />
          <SummaryCard label="Total Kehadiran" value={attendances.length} note="Akumulasi absensi pada semua kegiatan" icon={<Users size={19} />} tone="violet" />
        </section>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
          <button type="button" onClick={() => setActiveTab('kegiatan')} className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'kegiatan' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><CalendarDays size={16} /> Daftar Kegiatan <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === 'kegiatan' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{activities.length}</span></button>
          <button type="button" onClick={() => setActiveTab('absensi')} className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'absensi' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Users size={16} /> Rekap Absensi <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === 'absensi' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{attendances.length}</span></button>
        </div>

        {activeTab === 'kegiatan' ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] lg:flex-row lg:items-center lg:justify-between">
              <div><h2 className="text-base font-bold text-slate-900">Agenda Kegiatan</h2><p className="mt-1 text-xs text-slate-500">Menampilkan {filteredActivities.length} dari {activities.length} kegiatan.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50 sm:w-64"><Search size={16} className="shrink-0" /><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari kegiatan atau lokasi..." className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" aria-label="Cari kegiatan" />{localSearch && <button type="button" aria-label="Hapus pencarian" onClick={() => setLocalSearch('')}><X size={14} /></button>}</label>
                <label className="relative flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><Filter size={15} className="shrink-0 text-slate-400" /><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)} className="w-full appearance-none bg-transparent pr-5 outline-none sm:w-36" aria-label="Filter kategori"><option>Semua kategori</option>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="relative flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><Filter size={15} className="shrink-0 text-slate-400" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="w-full appearance-none bg-transparent pr-5 outline-none sm:w-36" aria-label="Filter status kegiatan"><option>Semua status</option><option>Akan Datang</option><option>Berlangsung</option><option>Selesai</option></select></label>
                <button type="button" onClick={exportActivities} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Download size={15} /> Ekspor</button>
              </div>
            </div>

            {filteredActivities.length ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{filteredActivities.map((activity) => {
              const status = activity.status
              const attendanceTotal = attendanceCountFor(activity.id)
              return <article key={activity.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025] transition hover:border-slate-300">
                <div className="flex items-start gap-4 p-4 sm:p-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800"><CalendarDays size={22} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${getCategoryStyles(activity.category)}`}>{activity.category}</span><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${status === 'Selesai' ? 'bg-slate-100 text-slate-600' : status === 'Berlangsung' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'}`}>{status}</span></div>
                    <h3 className="mt-2 text-base font-bold leading-6 text-slate-900">{activity.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{activity.description || 'Tidak ada deskripsi kegiatan.'}</p>
                  </div>
                  <div className="flex shrink-0 gap-1"><button type="button" onClick={() => openEditActivity(activity)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${activity.title}`} title="Edit kegiatan"><Edit3 size={15} /></button><button type="button" onClick={() => setActivityToDelete(activity)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Hapus ${activity.title}`} title="Hapus kegiatan"><Trash2 size={15} /></button></div>
                </div>
                <div className="grid gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-600 sm:grid-cols-2 sm:px-5">
                  <div className="flex items-center gap-2"><CalendarDays size={14} className="shrink-0 text-slate-400" /><span>{formatDate(activity.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                  <div className="flex items-center gap-2"><Clock3 size={14} className="shrink-0 text-slate-400" /><span>{activity.startTime}–{activity.endTime} WIB</span></div>
                  <div className="flex items-center gap-2 sm:col-span-2"><MapPin size={14} className="shrink-0 text-slate-400" /><span className="truncate">{activity.location}</span></div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="inline-flex items-center gap-2 text-xs text-slate-500"><Users size={15} className="text-slate-400" /><span><strong className="text-slate-800">{attendanceTotal}</strong> kehadiran tercatat</span></div>
                  <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setAttendanceActivityFilter(String(activity.id)); setActiveTab('absensi') }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Lihat rekap</button><button type="button" onClick={() => setSelectedQrActivity(activity)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-xs font-semibold text-white transition hover:bg-emerald-900"><QrCode size={14} /> Kode QR</button></div>
                </div>
              </article>
            })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Search size={21} /></div><h3 className="mt-3 text-sm font-bold text-slate-800">Kegiatan tidak ditemukan</h3><p className="mt-1 text-xs text-slate-500">Coba ubah kata kunci atau filter yang dipilih.</p></div>}
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-base font-bold text-slate-900">Rekap Kehadiran</h2><p className="mt-1 text-xs text-slate-500">Daftar kehadiran per anggota, termasuk waktu pemindaian dan kegiatan terkait.</p></div><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-emerald-400 focus-within:bg-white sm:w-64"><Search size={16} className="shrink-0" /><input value={attendanceSearch} onChange={(event) => setAttendanceSearch(event.target.value)} placeholder="Cari nama anggota..." className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" aria-label="Cari absensi" /></label><label className="relative flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><Filter size={15} className="shrink-0 text-slate-400" /><select value={attendanceActivityFilter} onChange={(event) => setAttendanceActivityFilter(event.target.value)} className="w-full max-w-52 appearance-none bg-transparent pr-5 outline-none" aria-label="Filter kegiatan"><option>Semua kegiatan</option>{activities.map((activity) => <option key={activity.id} value={String(activity.id)}>{activity.title} · {formatDate(activity.date, { day: '2-digit', month: 'short' })}</option>)}</select></label><button type="button" onClick={exportAttendance} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><FileSpreadsheet size={15} /> Ekspor CSV</button><button type="button" onClick={() => openCheckInModal(attendanceActivityFilter !== 'Semua kegiatan' ? Number(attendanceActivityFilter) : undefined)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900"><Plus size={16} /> Catat Absensi</button></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left"><thead><tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="px-5 py-3">Anggota</th><th className="px-5 py-3">Kegiatan</th><th className="px-5 py-3">Tanggal & Waktu</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredAttendances.map((item) => {
              const activity = activities.find((candidate) => candidate.id === item.activityId)
              return <tr key={item.id} className="transition hover:bg-slate-50/80"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-800">{item.memberName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><p className="text-xs font-bold text-slate-800">{item.memberName}</p><p className="mt-1 text-[10px] text-slate-400">{item.memberCode}</p></div></div></td><td className="px-5 py-4"><p className="text-xs font-semibold text-slate-700">{activity?.title ?? 'Kegiatan dihapus'}</p><p className="mt-1 text-[10px] text-slate-400">{activity?.category ?? '—'}</p></td><td className="px-5 py-4 text-xs text-slate-600">{formatDateTime(item.checkedInAt)}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 size={12} /> Hadir</span></td></tr>
            })}</tbody></table></div>
            {filteredAttendances.length === 0 && <div className="px-5 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Users size={21} /></div><h3 className="mt-3 text-sm font-bold text-slate-800">Belum ada data absensi</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">Setelah anggota melakukan scan QR dan validasi berhasil, data kehadiran akan muncul di sini.</p><button type="button" onClick={() => openCheckInModal()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-800 px-3.5 text-xs font-semibold text-white hover:bg-emerald-900"><ScanLine size={14} /> Catat absensi pertama</button></div>}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400"><span>Menampilkan {filteredAttendances.length} catatan</span><span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Validasi duplikasi aktif pada prototipe</span></div>
          </section>
        )}
        <div className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400 sm:flex-row"><span>Sistem Informasi IRM Baitussalam · Modul kegiatan & absensi</span><span>Data contoh untuk prototipe frontend</span></div>
      </div>

      {isActivityModalOpen && <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeActivityModal() }}><section role="dialog" aria-modal="true" aria-labelledby="activity-modal-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Agenda organisasi</p><h2 id="activity-modal-title" className="mt-1 text-xl font-bold text-slate-900">{editingActivity ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{editingActivity ? 'Perbarui detail agenda. Kode QR lama tetap digunakan.' : 'Kode QR unik akan dibuat otomatis setelah kegiatan disimpan.'}</p></div><button type="button" onClick={closeActivityModal} aria-label="Tutup form" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div><form onSubmit={handleActivitySubmit} className="space-y-4"><div><label htmlFor="activity-title" className="mb-1.5 block text-xs font-semibold text-slate-700">Nama kegiatan <span className="text-rose-500">*</span></label><input id="activity-title" required maxLength={100} value={formValues.title} onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))} placeholder="Contoh: Pengajian Rutin Remaja" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="activity-category" className="mb-1.5 block text-xs font-semibold text-slate-700">Kategori <span className="text-rose-500">*</span></label><select id="activity-category" value={formValues.category} onChange={(event) => setFormValues((current) => ({ ...current, category: event.target.value as ActivityCategory }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50">{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select></div><div><label htmlFor="activity-date" className="mb-1.5 block text-xs font-semibold text-slate-700">Tanggal <span className="text-rose-500">*</span></label><input id="activity-date" type="date" required value={formValues.date} onChange={(event) => setFormValues((current) => ({ ...current, date: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div><div><label htmlFor="activity-start" className="mb-1.5 block text-xs font-semibold text-slate-700">Waktu mulai <span className="text-rose-500">*</span></label><input id="activity-start" type="time" required value={formValues.startTime} onChange={(event) => setFormValues((current) => ({ ...current, startTime: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div><div><label htmlFor="activity-end" className="mb-1.5 block text-xs font-semibold text-slate-700">Waktu selesai <span className="text-rose-500">*</span></label><input id="activity-end" type="time" required value={formValues.endTime} onChange={(event) => setFormValues((current) => ({ ...current, endTime: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div></div><div><label htmlFor="activity-location" className="mb-1.5 block text-xs font-semibold text-slate-700">Lokasi <span className="text-rose-500">*</span></label><input id="activity-location" required maxLength={120} value={formValues.location} onChange={(event) => setFormValues((current) => ({ ...current, location: event.target.value }))} placeholder="Lokasi kegiatan" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div><div><label htmlFor="activity-description" className="mb-1.5 block text-xs font-semibold text-slate-700">Deskripsi <span className="font-normal text-slate-400">(opsional)</span></label><textarea id="activity-description" maxLength={500} rows={3} value={formValues.description} onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))} placeholder="Jelaskan agenda atau informasi tambahan..." className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></div>{formError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{formError}</p>}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeActivityModal} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900"><Check size={16} /> {editingActivity ? 'Simpan Perubahan' : 'Simpan Kegiatan'}</button></div></form></section></div>}

      {selectedQrActivityResolved && <div className="fixed inset-0 z-[85] flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedQrActivity(null) }}><section role="dialog" aria-modal="true" aria-labelledby="qr-modal-title" className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Absensi digital</p><h2 id="qr-modal-title" className="mt-1 text-lg font-bold text-slate-900">Kode QR Kegiatan</h2><p className="mt-1 text-xs text-slate-500">{selectedQrActivityResolved.title}</p></div><button type="button" onClick={() => setSelectedQrActivity(null)} aria-label="Tutup QR" className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><div ref={qrPreviewRef} className="mx-auto my-5 flex w-fit flex-col items-center rounded-2xl border border-slate-100 bg-white p-4"><QRCodeSVG value={createQrPayload(selectedQrActivityResolved)} size={220} bgColor="#ffffff" fgColor="#101d2e" level="H" includeMargin /><p className="mt-3 max-w-56 text-center text-xs font-bold text-slate-800">{selectedQrActivityResolved.title}</p><p className="mt-1 text-center text-[10px] text-slate-400">{formatDate(selectedQrActivityResolved.date)} · {selectedQrActivityResolved.startTime} WIB</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Token unik kegiatan</p><p className="mt-1 break-all font-mono text-xs font-semibold text-slate-800">{selectedQrActivityResolved.qrToken}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Satu token digunakan untuk mengenali kegiatan ini di prototipe.</p></div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={downloadQrSvg} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowDownToLine size={15} /> Unduh QR (SVG)</button><button type="button" onClick={copyQrToken} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3 text-xs font-semibold text-white hover:bg-emerald-900"><QrCode size={15} /> Salin isi QR</button></div><button type="button" onClick={() => { const activityId = selectedQrActivityResolved.id; setSelectedQrActivity(null); openCheckInModal(activityId) }} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"><ScanLine size={15} /> Uji alur absensi kegiatan ini</button></section></div>}

      {isCheckInModalOpen && <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCheckInModalOpen(false) }}><section role="dialog" aria-modal="true" aria-labelledby="checkin-modal-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Validasi kehadiran</p><h2 id="checkin-modal-title" className="mt-1 text-xl font-bold text-slate-900">Catat Absensi Anggota</h2><p className="mt-1 text-xs leading-5 text-slate-500">Pindai QR kegiatan atau masukkan token, kemudian pilih anggota untuk simulasi absensi.</p></div><button type="button" onClick={() => setIsCheckInModalOpen(false)} aria-label="Tutup absensi" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><form onSubmit={handleCheckIn} className="space-y-4"><div><label htmlFor="checkin-activity" className="mb-1.5 block text-xs font-semibold text-slate-700">Kegiatan <span className="text-rose-500">*</span></label><select id="checkin-activity" required value={selectedActivityId} onChange={(event) => setSelectedActivityId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"><option value="">Pilih kegiatan</option>{activities.map((activity) => <option key={activity.id} value={String(activity.id)}>{activity.title} · {formatDate(activity.date)}</option>)}</select></div><div><div className="mb-1.5 flex items-center justify-between gap-2"><label htmlFor="checkin-token" className="block text-xs font-semibold text-slate-700">Token / isi kode QR <span className="text-rose-500">*</span></label><button type="button" onClick={() => setShowCamera((current) => !current)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900"><ScanLine size={14} /> {showCamera ? 'Tutup kamera' : 'Scan dengan kamera'}</button></div>{showCamera && <div className="mb-3"><QrScanner onDetected={handleQrDetected} /></div>}<input id="checkin-token" required value={qrInput} onChange={(event) => setQrInput(event.target.value)} placeholder="Contoh: IRM-29OCT-6E2B8F41" className="h-11 w-full rounded-xl border border-slate-200 px-3 font-mono text-xs outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /><p className="mt-1.5 text-[10px] leading-4 text-slate-400">Token dapat diperoleh dari tombol Kode QR pada kartu kegiatan. QR dapat diunduh sebagai SVG untuk diuji dengan kamera.</p></div><div><label htmlFor="checkin-member" className="mb-1.5 block text-xs font-semibold text-slate-700">Anggota yang melakukan absensi <span className="text-rose-500">*</span></label><select id="checkin-member" required value={selectedMemberCode} onChange={(event) => setSelectedMemberCode(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"><option value="">Pilih anggota aktif</option>{activeMembers.map((member) => <option key={member.code} value={member.code}>{member.name} · {member.code}</option>)}</select><p className="mt-1.5 text-[10px] leading-4 text-slate-400">Pemilihan anggota hanya simulasi untuk prototipe; nantinya identitas diambil dari sesi login.</p></div>{checkInError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700">{checkInError}</p>}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsCheckInModalOpen(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900"><CheckCircle2 size={16} /> Validasi & Catat Kehadiran</button></div></form></section></div>}

      {activityToDelete && <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActivityToDelete(null) }}><section role="dialog" aria-modal="true" aria-labelledby="delete-activity-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"><div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={20} /></div><h2 id="delete-activity-title" className="mt-4 text-base font-bold text-slate-900">Hapus kegiatan?</h2><p className="mt-2 text-xs leading-5 text-slate-500">Kegiatan <strong className="text-slate-700">{activityToDelete.title}</strong> dan semua catatan absensi yang terkait akan dihapus dari penyimpanan lokal browser.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setActivityToDelete(null)} className="h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="button" onClick={confirmDeleteActivity} className="h-10 rounded-xl bg-rose-600 px-3.5 text-xs font-semibold text-white hover:bg-rose-700">Ya, hapus</button></div></section></div>}
    </main>
  )
}
