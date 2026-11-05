import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export interface ApiError {
  status: number
  message: string
  details?: unknown
}

interface ApiHooks {
  /** Mengambil token JWT aktif (dari sesi). */
  getToken?: () => string | null
  /** Dipanggil saat request yang membawa token ditolak server (401). */
  onUnauthorized?: () => void
}

let hooks: ApiHooks = {}

/** Dipanggil sekali oleh services/auth.ts agar api.ts tidak perlu mengimpor auth.ts. */
export function configureApi(next: ApiHooks) {
  hooks = next
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = hooks.getToken?.()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status ?? 0

    // Hanya anggap sesi berakhir bila request memang membawa token.
    // Login dengan sandi salah (401 tanpa token) tidak boleh memicu logout.
    if (status === 401 && error.config?.headers?.Authorization) {
      hooks.onUnauthorized?.()
    }

    const apiError: ApiError = {
      status,
      message:
        error.response?.data?.message ??
        error.response?.data?.error ??
        (error.code === 'ECONNABORTED' ? 'Request timeout' : error.message || 'Terjadi kesalahan jaringan'),
      details: error.response?.data,
    }

    return Promise.reject(apiError)
  },
)

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, body, config).then((r) => r.data),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, body, config).then((r) => r.data),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, body, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) => api.delete<T>(url, config).then((r) => r.data),
}

export default api