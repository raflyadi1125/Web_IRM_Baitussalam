import { useState, type FormEvent } from 'react'
import {
  AlertCircle,
  ClipboardList,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getNavigationForRole, ROLE_META } from '../routes/config'
import type { AppRole } from '../routes/types'
import { DEMO_ACCOUNTS, LoginError } from '../services/auth'

interface RoleLoginMeta {
  icon: LucideIcon
  caption: string
  description: string
}

const LOGIN_ROLES: readonly AppRole[] = ['admin', 'sekretaris', 'bendahara', 'anggota']

const ROLE_LOGIN_META: Record<AppRole, RoleLoginMeta> = {
  admin: {
    icon: ShieldCheck,
    caption: 'Administrator',
    description: 'Kelola data anggota, pengurus, kegiatan, keuangan, dan laporan organisasi.',
  },
  sekretaris: {
    icon: ClipboardList,
    caption: 'Administrasi',
    description: 'Kelola kegiatan dan absensi, pengumuman, serta laporan administrasi.',
  },
  bendahara: {
    icon: Wallet,
    caption: 'Keuangan',
    description: 'Catat pemasukan dan pengeluaran, serta pantau laporan keuangan.',
  },
  anggota: {
    icon: UserRound,
    caption: 'User',
    description: 'Lihat jadwal kegiatan dan pengumuman terbaru organisasi.',
  },
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email.trim()) errors.email = 'Email wajib diisi.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Format email belum benar.'
  if (!password) errors.password = 'Kata sandi wajib diisi.'
  return errors
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const { theme } = useTheme()
  const [selectedRole, setSelectedRole] = useState<AppRole>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const roleMeta = ROLE_META[selectedRole]
  const loginMeta = ROLE_LOGIN_META[selectedRole]
  const demoAccount = DEMO_ACCOUNTS.find((account) => account.role === selectedRole)
  const accessibleMenus = getNavigationForRole(selectedRole).map((item) => item.label)

  const changeRole = (role: AppRole) => {
    setSelectedRole(role)
    setError('')
    setFieldErrors({})
  }

  const fillDemoAccount = () => {
    if (!demoAccount) return
    setEmail(demoAccount.email)
    setPassword(demoAccount.password)
    setError('')
    setFieldErrors({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextFieldErrors = validate(email, password)
    setFieldErrors(nextFieldErrors)
    setError('')
    if (nextFieldErrors.email || nextFieldErrors.password) return

    setSubmitting(true)
    try {
      await signIn({ role: selectedRole, email, password }, remember)
      // Berhasil: AppRoutes langsung menampilkan dashboard, halaman ini dilepas.
    } catch (caught) {
      setError(caught instanceof LoginError ? caught.message : 'Terjadi kesalahan saat masuk. Silakan coba lagi.')
      setSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-800 ${
      hasError ? 'border-red-300' : 'border-slate-200'
    }`

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrandPanel />

        <div className="relative flex flex-col">
          <header className="flex items-center gap-3 bg-linear-to-br from-[#14342a] to-[#2f6857] px-5 py-4 text-white lg:hidden">
            <BrandLogo className="h-10 w-10" />
            <div>
              <p className="text-sm font-bold leading-tight">IRM Baitussalam</p>
              <p className="text-[11px] text-emerald-100/80">Sistem Informasi</p>
            </div>
          </header>

          <div className="absolute right-4 top-4 z-10 lg:right-6 lg:top-6">
            <ThemeToggle />
          </div>

          <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              <div className="eyebrow">
                <span className="eyebrow-dot" /> MASUK KE SISTEM
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Masuk sebagai {roleMeta.label}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{loginMeta.description}</p>

              <fieldset className="mt-6">
                <legend className="mb-2 text-xs font-semibold text-slate-700">Pilih peran</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {LOGIN_ROLES.map((role) => {
                    const Icon = ROLE_LOGIN_META[role].icon
                    const selected = role === selectedRole
                    return (
                      <label
                        key={role}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition focus-within:ring-2 focus-within:ring-emerald-400 ${
                          selected
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="login-role"
                          value={role}
                          checked={selected}
                          onChange={() => changeRole(role)}
                          className="sr-only"
                        />
                        <Icon size={18} aria-hidden="true" />
                        <span className="text-xs font-semibold">{ROLE_META[role].label}</span>
                        <span className={`text-[10px] ${selected ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {ROLE_LOGIN_META[role].caption}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                      className={inputClass(Boolean(fieldErrors.email))}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="login-email-error" className="mt-1.5 text-xs text-red-700">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Kata sandi
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                      className={`${inputClass(Boolean(fieldErrors.password))} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="login-password-error" className="mt-1.5 text-xs text-red-700">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded accent-emerald-800"
                    />
                    Ingat saya di perangkat ini
                  </label>
                  <span className="text-xs text-slate-500">Lupa kata sandi? Hubungi admin.</span>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-800"
                  >
                    <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} aria-hidden="true" className="animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn size={17} aria-hidden="true" /> Masuk sebagai {roleMeta.label}
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">Menu yang tersedia:</span> {accessibleMenus.join(', ')}.
              </p>

              {demoAccount && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <KeyRound size={15} aria-hidden="true" /> Akun demo {roleMeta.label}
                  </div>
                  <p className="mt-1.5">
                    Email <code className="font-mono">{demoAccount.email}</code> · Kata sandi{' '}
                    <code className="font-mono">{demoAccount.password}</code>
                  </p>
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    Isi otomatis
                  </button>
                  <p className="mt-2 opacity-80">
                    Mode demo untuk pratinjau frontend. Autentikasi sebenarnya akan ditangani backend.
                  </p>
                </div>
              )}

              <p className="mt-8 text-center text-[11px] text-slate-500">
                © {new Date().getFullYear()} IRM Baitussalam
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-linear-to-br from-[#14342a] via-[#1d4a3c] to-[#2f6857] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[260px] w-[260px] rounded-full border border-dashed border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full border border-white/10"
      />

      <div className="relative flex items-center gap-3">
        <BrandLogo className="h-12 w-12" />
        <div>
          <p className="text-base font-bold leading-tight">IRM Baitussalam</p>
          <p className="text-xs text-emerald-100/80">Sistem Informasi</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-200/80">RUANG PENGURUS</p>
        <p className="mt-4 text-4xl font-bold leading-tight tracking-tight">Kelola organisasi dengan lebih tertata.</p>
        <p className="mt-4 text-sm leading-7 text-emerald-50/80">
          Data anggota, kegiatan dan absensi, pengumuman, hingga keuangan IRM Baitussalam dalam satu sistem.
        </p>
      </div>

      <p className="relative text-xs text-emerald-100/60">© {new Date().getFullYear()} IRM Baitussalam</p>
    </aside>
  )
}

function BrandLogo({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/25 ${className}`}
    >
      {failed ? (
        <span className="text-sm font-bold text-white">IRM</span>
      ) : (
        <img
          src="/Logo_Prismaba.jpg"
          alt="Logo IRM Baitussalam"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}