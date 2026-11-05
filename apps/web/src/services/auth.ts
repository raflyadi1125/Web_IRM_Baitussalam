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
  role: AppRole
  email: string
  password: string
}

export type LoginErrorCode = 'INVALID_CREDENTIALS' | 'WRONG_ROLE' | 'NETWORK' | 'SERVER'

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

function assertRole(account: AuthSession, role: AppRole) {
  if (account.role !== role) {
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
 *   200 -> { token: string, user: { name: string, email: string, role: AppRole } }
 *   401 -> email/sandi salah
 */
interface LoginApiResponse {
  token: string
  user: { name: string; email: string; role: string }
}

async function loginApi({ role, email, password }: LoginCredentials): Promise<AuthSession> {
  let data: LoginApiResponse
  try {
    data = await http.post<LoginApiResponse>('/auth/login', { email: email.trim(), password })
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

  if (!Object.hasOwn(ROLE_META, data.user.role)) {
    throw new LoginError('SERVER', 'Peran akun tidak dikenali oleh aplikasi.')
  }

  const session: AuthSession = {
    role: data.user.role as AppRole,
    name: data.user.name,
    email: data.user.email,
    token: data.token,
  }
  assertRole(session, role)

  return session
}

/** Satu-satunya titik masuk login; komponen lain tidak perlu tahu sumber datanya. */
export function login(credentials: LoginCredentials): Promise<AuthSession> {
  return USE_DEMO_AUTH ? loginDemo(credentials) : loginApi(credentials)
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