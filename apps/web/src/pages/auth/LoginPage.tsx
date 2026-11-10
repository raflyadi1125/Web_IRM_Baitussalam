import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { LoginError } from '../../services/auth'

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
  const { session, signIn } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextFieldErrors = validate(email, password)
    setFieldErrors(nextFieldErrors)
    setError('')
    if (nextFieldErrors.email || nextFieldErrors.password) return

    setSubmitting(true)
    try {
      // Peran tidak dikirim: ditentukan oleh akun (dari backend).
      // Setelah signIn sukses, session terisi dan redirect di bawah
      // otomatis membawa user ke dashboard sesuai perannya.
      await signIn({ email, password }, remember)
    } catch (caught) {
      setError(caught instanceof LoginError ? caught.message : 'Terjadi kesalahan saat masuk. Silakan coba lagi.')
      setSubmitting(false)
    }
  }

  // Sudah login -> pindah ke dashboard sesuai role.
  // Sesuaikan dengan bentuk AuthSession (jika role ada langsung di session, pakai session?.role).
  const role = session?.role
  if (role) {
    return <Navigate to={`/${role}`} replace />
  }

  // Token warna sesuai tema (sama dengan dashboard admin)
  const c = isDark
    ? {
        page: 'bg-[#0c0f0b]',
        title: 'text-white',
        text: 'text-white/70',
        muted: 'text-white/45',
        label: 'text-white/80',
        icon: 'text-white/40',
        pill: 'border-lime-300/30 bg-lime-300/10 text-lime-300',
        input:
          'border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30',
        inputError: 'border-red-400/50',
        eyeBtn: 'text-white/50 hover:bg-white/[0.08] hover:text-white',
        fieldError: 'text-red-300',
        alert: 'border-red-400/30 bg-red-400/10 text-red-300',
        link: 'text-lime-300',
        checkbox: 'accent-lime-300',
        btn: 'bg-lime-300 text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] hover:bg-lime-200',
      }
    : {
        page: 'bg-slate-50',
        title: 'text-slate-900',
        text: 'text-slate-600',
        muted: 'text-slate-500',
        label: 'text-slate-700',
        icon: 'text-slate-400',
        pill: 'border-lime-300 bg-lime-100 text-lime-800',
        input:
          'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50',
        inputError: 'border-red-300',
        eyeBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        fieldError: 'text-red-700',
        alert: 'border-red-200 bg-red-50 text-red-800',
        link: 'text-lime-700',
        checkbox: 'accent-lime-600',
        btn: 'bg-lime-400 text-[#10150c] shadow-sm hover:bg-lime-300',
      }

  const inputClass = (hasError: boolean) =>
    `box-border h-11 w-full min-w-0 rounded-full border pl-11 pr-4 text-sm outline-none transition focus:ring-2 ${c.input} ${
      hasError ? c.inputError : ''
    }`

  return (
    <div className={`app-shell w-full max-w-full overflow-x-hidden ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* grid-cols-1 + minmax(0, ...) mencegah kolom melebar melebihi layar sehingga sisi kanan terpotong */}
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrandPanel />

        <div className={`relative flex min-h-screen min-w-0 flex-col ${c.page}`}>
          <header className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-5 py-4 text-white lg:hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-lime-300/10 blur-3xl"
            />
            <BrandLogo className="relative h-10 w-10" />
            <div className="relative min-w-0">
              <p className="truncate text-sm font-bold leading-tight">IRM Baitussalam</p>
              <p className="text-[11px] text-white/60">Sistem Informasi</p>
            </div>
          </header>

          <div className="absolute right-4 top-4 z-10 lg:right-6 lg:top-6">
            <ThemeToggle />
          </div>

          <main className="flex min-w-0 flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full min-w-0 max-w-md">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${c.pill}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" /> MASUK KE SISTEM
              </span>
              <h1 className={`mt-4 text-2xl font-semibold tracking-tight sm:text-3xl ${c.title}`}>
                Masuk ke akun Anda
              </h1>
              <p className={`mt-2 text-sm leading-6 ${c.text}`}>
                Gunakan email dan kata sandi akun Anda. Menu yang tampil menyesuaikan peran akun
                (Admin, Sekretaris, Bendahara, atau Anggota).
              </p>

              <form className="mt-6 w-full min-w-0 space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="min-w-0">
                  <label htmlFor="login-email" className={`mb-1.5 block text-xs font-semibold ${c.label}`}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${c.icon}`}
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
                    <p id="login-email-error" className={`mt-1.5 text-xs ${c.fieldError}`}>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="login-password" className={`mb-1.5 block text-xs font-semibold ${c.label}`}>
                    Kata sandi
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${c.icon}`}
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
                      className={`${inputClass(Boolean(fieldErrors.password))} !pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-pressed={showPassword}
                      className={`absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full ${c.eyeBtn}`}
                    >
                      {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="login-password-error" className={`mt-1.5 text-xs ${c.fieldError}`}>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <label className={`flex cursor-pointer items-center gap-2 text-xs ${c.text}`}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className={`h-4 w-4 rounded ${c.checkbox}`}
                    />
                    Ingat saya di perangkat ini
                  </label>
                  <span className={`text-xs ${c.muted}`}>Lupa kata sandi? Hubungi admin.</span>
                </div>

                {error && (
                  <div
                    role="alert"
                    className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs leading-5 ${c.alert}`}
                  >
                    <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${c.btn}`}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} aria-hidden="true" className="animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn size={17} aria-hidden="true" /> Masuk
                    </>
                  )}
                </button>

                <p className={`text-center text-sm ${c.muted}`}>
                  Belum punya akun?{' '}
                  <Link to="/register" className={`font-medium hover:underline ${c.link}`}>
                    Daftar di sini
                  </Link>
                </p>
              </form>

              <p className={`mt-8 text-center text-[11px] ${c.muted}`}>
                © {new Date().getFullYear()} IRM Baitussalam
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export function BrandPanel() {
  return (
    <aside className="relative hidden min-w-0 overflow-hidden bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-lime-300/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full border border-white/10"
      />

      <div className="relative flex items-center gap-3">
        <BrandLogo className="h-12 w-12" />
        <div>
          <p className="text-base font-bold leading-tight">IRM Baitussalam</p>
          <p className="text-xs text-white/60">Sistem Informasi</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-1.5 text-sm font-medium text-lime-300">
          RUANG PENGURUS
        </span>
        <p className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
          Kelola organisasi dengan lebih tertata.
        </p>
        <p className="mt-4 text-sm leading-7 text-white/70">
          Data anggota, kegiatan dan absensi, pengumuman, hingga keuangan IRM Baitussalam dalam satu sistem.
        </p>
      </div>

      <p className="relative text-xs text-white/45">© {new Date().getFullYear()} IRM Baitussalam</p>
    </aside>
  )
}

export function BrandLogo({ className = '' }: { className?: string }) {
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