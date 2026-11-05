import { configureApi, http, type ApiError } from './api'
import { ROLE_META } from '../routes/config'
import type { AppRole } from '../routes/types'


export interface AuthSession {
  role: AppRole
  name: string
  email: string
  /** Token JWT dari API. Kosong pada sesi mode demo. */
  token?: string
}

export interface LoginCredentials {
  /** Opsional: bila diisi, peran akun harus sama. Bila kosong, peran ditentukan oleh akun itu sendiri. */
  role?: AppRole
  email: string
  password: string
}

export interface RegisterPayload {
  nama: string
  email: string
  password: string
}

export type LoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'WRONG_ROLE'
  | 'NETWORK'
  | 'SERVER'
  | 'EMAIL_TAKEN'
  | 'VALIDATION'

export class LoginError extends Error {
  readonly code: LoginErrorCode

  constructor(code: LoginErrorCode, message: string) {
    super(message)
    this.name = 'LoginError'
    this.code = code
  }
}

interface DemoAccount extends AuthSession {
  password: string
}

/**
 * Akun DEMO. Dipakai hanya saat VITE_USE_DEMO_AUTH=true (backend belum siap).
 * Untuk mode API, akun yang sama harus ada di tabel User (seed) bila kotak demo
 * di halaman login ingin tetap dipakai.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { role: 'admin', name: 'Admin IRM', email: 'admin@irm.test', password: 'admin123' },
  { role: 'sekretaris', name: 'Sekretaris IRM', email: 'sekretaris@irm.test', password: 'sekretaris123' },
  { role: 'bendahara', name: 'Bendahara IRM', email: 'bendahara@irm.test', password: 'bendahara123' },
  { role: 'anggota', name: 'Anggota IRM', email: 'anggota@irm.test', password: 'anggota123' },
]

const USE_DEMO_AUTH = import.meta.env.VITE_USE_DEMO_AUTH === 'true'

function assertRole(account: AuthSession, role?: AppRole) {
  if (role && account.role !== role) {
    throw new LoginError(
      'WRONG_ROLE',
      `Akun ini terdaftar sebagai ${ROLE_META[account.role].label}, bukan ${ROLE_META[role].label}. Pilih peran yang sesuai.`,
    )
  }
}

async function loginDemo({ role, email, password }: LoginCredentials): Promise<AuthSession> {
  await new Promise((resolve) => window.setTimeout(resolve, 600))

  const normalizedEmail = email.trim().toLowerCase()
  const account = DEMO_ACCOUNTS.find((item) => item.email === normalizedEmail && item.password === password)

  if (!account) {
    throw new LoginError('INVALID_CREDENTIALS', 'Email atau kata sandi salah. Periksa kembali lalu coba lagi.')
  }
  assertRole(account, role)

  return { role: account.role, name: account.name, email: account.email }
}

/**
 * Kontrak backend:
 *   POST /auth/login  { email, password }
 *   200 -> { success: true, data: { token: string, user: { nama, email, role } } }
 *   401 -> email/sandi salah, 403 -> akun pending/nonaktif
 */
interface LoginApiUser {
  nama?: string
  name?: string
  email: string
  role: string
}

interface LoginApiBody {
  token: string
  user: LoginApiUser
}

async function loginApi({ role, email, password }: LoginCredentials): Promise<AuthSession> {
  let body: LoginApiBody
  try {
    const res = await http.post<LoginApiBody & { data?: LoginApiBody }>('/auth/login', {
      email: email.trim(),
      password,
    })
    body = res.data ?? res
  } catch (caught) {
    const err = caught as ApiError
    if (err.status === 400 || err.status === 401) {
      throw new LoginError('INVALID_CREDENTIALS', 'Email atau kata sandi salah. Periksa kembali lalu coba lagi.')
    }
    if (err.status === 0) {
      throw new LoginError('NETWORK', 'Tidak dapat terhubung ke server. Pastikan API sedang berjalan.')
    }
    throw new LoginError('SERVER', err.message || 'Terjadi kesalahan pada server. Silakan coba lagi.')
  }

  const apiRole = body?.user?.role?.toLowerCase()
  if (!body?.token || !apiRole || !Object.hasOwn(ROLE_META, apiRole)) {
    throw new LoginError('SERVER', 'Respons server tidak sesuai atau peran akun tidak dikenali.')
  }

  const session: AuthSession = {
    role: apiRole as AppRole,
    name: body.user.nama ?? body.user.name ?? body.user.email,
    email: body.user.email,
    token: body.token,
  }
  assertRole(session, role)

  return session
}

/** Satu-satunya titik masuk login; komponen lain tidak perlu tahu sumber datanya. */
export function login(credentials: LoginCredentials): Promise<AuthSession> {
  return USE_DEMO_AUTH ? loginDemo(credentials) : loginApi(credentials)
}

async function registerDemo({ email }: RegisterPayload): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 600))

  const normalizedEmail = email.trim().toLowerCase()
  if (DEMO_ACCOUNTS.some((item) => item.email === normalizedEmail)) {
    throw new LoginError('EMAIL_TAKEN', 'Email ini sudah terdaftar. Gunakan email lain atau masuk.')
  }
  // Mode demo: pendaftaran hanya disimulasikan, tidak ada data yang disimpan.
}

/**
 * Kontrak backend:
 *   POST /auth/register  { nama, email, password }
 *   201/200 -> akun dibuat (peran "anggota" ditetapkan oleh server)
 *   409 -> email sudah terdaftar, 400/422 -> data tidak valid
 */
async function registerApi({ nama, email, password }: RegisterPayload): Promise<void> {
  try {
    await http.post('/auth/register', {
      nama: nama.trim(),
      email: email.trim(),
      password,
    })
  } catch (caught) {
    const err = caught as ApiError
    if (err.status === 409) {
      throw new LoginError('EMAIL_TAKEN', 'Email ini sudah terdaftar. Gunakan email lain atau masuk.')
    }
    if (err.status === 400 || err.status === 422) {
      throw new LoginError('VALIDATION', err.message || 'Data pendaftaran belum valid. Periksa kembali isian Anda.')
    }
    if (err.status === 0) {
      throw new LoginError('NETWORK', 'Tidak dapat terhubung ke server. Pastikan API sedang berjalan.')
    }
    throw new LoginError('SERVER', err.message || 'Terjadi kesalahan pada server. Silakan coba lagi.')
  }
}

/** Satu-satunya titik masuk pendaftaran. Peran tidak dikirim: server menetapkannya sebagai anggota. */
export function register(payload: RegisterPayload): Promise<void> {
  return USE_DEMO_AUTH ? registerDemo(payload) : registerApi(payload)
}

const SESSION_STORAGE_KEY = 'irm-baitussalam:session'

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.role === 'string' &&
    Object.hasOwn(ROLE_META, candidate.role) &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.token === undefined || typeof candidate.token === 'string')
  )
}

const storageAccessors: ReadonlyArray<() => Storage> = [() => window.localStorage, () => window.sessionStorage]

export function readSession(): AuthSession | null {
  for (const getStorage of storageAccessors) {
    try {
      const raw = getStorage().getItem(SESSION_STORAGE_KEY)
      if (!raw) continue
      const parsed: unknown = JSON.parse(raw)
      if (isAuthSession(parsed)) return parsed
    } catch {
      // Penyimpanan tidak tersedia atau isinya rusak: anggap belum login.
    }
  }
  return null
}

/** `remember` true menyimpan di localStorage (bertahan setelah browser ditutup), false di sessionStorage. */
export function saveSession(session: AuthSession, remember: boolean) {
  clearSession()
  try {
    const storage = remember ? window.localStorage : window.sessionStorage
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Tanpa penyimpanan, sesi hanya hidup selama halaman terbuka.
  }
}

export function clearSession() {
  for (const getStorage of storageAccessors) {
    try {
      getStorage().removeItem(SESSION_STORAGE_KEY)
    } catch {
      // Abaikan: tidak ada yang perlu dihapus.
    }
  }
}

// Hubungkan axios dengan sesi: token dibaca dari sesi, dan token yang ditolak server
// (kedaluwarsa/tidak valid) menghapus sesi lalu memuat ulang agar kembali ke halaman login.
configureApi({
  getToken: () => readSession()?.token ?? null,
  onUnauthorized: () => {
    clearSession()
    window.location.reload()
  },
})