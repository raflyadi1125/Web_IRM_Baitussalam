import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  clearSession,
  login,
  readSession,
  saveSession,
  type AuthSession,
  type LoginCredentials,
} from '../services/auth'

interface AuthContextValue {
  session: AuthSession | null
  signIn: (credentials: LoginCredentials, remember: boolean) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readSession)

 const signIn = useCallback(async (credentials: LoginCredentials, remember: boolean) => {
  console.log('1. mulai login')
  const nextSession = await login(credentials)
  console.log('2. respons login:', nextSession)
  saveSession(nextSession, remember)
  setSession(nextSession)
  console.log('3. session tersimpan')
}, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }

  return context
}