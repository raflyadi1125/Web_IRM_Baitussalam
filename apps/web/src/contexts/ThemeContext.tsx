import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark'

/** Titik awal lingkaran animasi (koordinat layar, biasanya pusat tombol) */
export interface ThemeToggleOrigin {
  x: number
  y: number
}

interface ThemeContextValue {
  theme: Theme
  toggleTheme: (origin?: ThemeToggleOrigin) => void
}

const THEME_STORAGE_KEY = 'irm-baitussalam:theme'
const TRANSITION_DURATION = 650 // ms
const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = (origin?: ThemeToggleOrigin) => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Fallback: browser belum mendukung View Transitions atau animasi dimatikan
    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme)
      return
    }

    const x = origin?.x ?? window.innerWidth / 2
    const y = origin?.y ?? window.innerHeight / 2

    // Radius sampai sudut layar terjauh, supaya lingkaran menutupi seluruh layar
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme))
      root.dataset.theme = nextTheme
    })

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: TRANSITION_DURATION,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider')
  }

  return context
}