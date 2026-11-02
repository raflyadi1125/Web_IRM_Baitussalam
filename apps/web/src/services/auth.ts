import { ROLE_META } from '../routes/config'
import type { AppRole } from '../routes/types'

export interface AuthSession {
  role: AppRole
  name: string
  email: string
}

export interface LoginCredentials {
  role: AppRole
  email: string
  password: string
}

export type LoginErrorCode = 'INVALID_CREDENTIALS' | 'WRONG_ROLE'

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
 * Akun DEMO untuk pratinjau frontend. Backend (apps/api) belum punya endpoint
 * autentikasi, jadi daftar ini hanya menggantikan tabel User sementara.
 * Hapus saat login sudah memakai API.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { role: 'admin', name: 'Admin IRM', email: 'admin@irm.test', password: 'admin123' },
  { role: 'sekretaris', name: 'Sekretaris IRM', email: 'sekretaris@irm.test', password: 'sekretaris123' },
  { role: 'bendahara', name: 'Bendahara IRM', email: 'bendahara@irm.test', password: 'bendahara123' },
  { role: 'anggota', name: 'Anggota IRM', email: 'anggota@irm.test', password: 'anggota123' },
]

/**
 * Satu-satunya titik masuk login. Saat backend siap, ganti isi fungsi ini dengan
 * `fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })`
 * yang mengembalikan AuthSession; komponen lain tidak perlu diubah.
 */
export async function login({ role, email, password }: LoginCredentials): Promise<AuthSession> {
  await new Promise((resolve) => window.setTimeout(resolve, 600))

  const normalizedEmail = email.trim().toLowerCase()
  const account = DEMO_ACCOUNTS.find((item) => item.email === normalizedEmail && item.password === password)

  if (!account) {
    throw new LoginError('INVALID_CREDENTIALS', 'Email atau kata sandi salah. Periksa kembali lalu coba lagi.')
  }

  if (account.role !== role) {
    throw new LoginError(
      'WRONG_ROLE',
      `Akun ini terdaftar sebagai ${ROLE_META[account.role].label}, bukan ${ROLE_META[role].label}. Pilih peran yang sesuai.`,
    )
  }

  return { role: account.role, name: account.name, email: account.email }
}

const SESSION_STORAGE_KEY = 'irm-baitussalam:session'

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.role === 'string' &&
    Object.hasOwn(ROLE_META, candidate.role) &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
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