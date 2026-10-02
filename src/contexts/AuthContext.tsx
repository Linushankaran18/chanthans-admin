import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { login as loginRequest } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { tokenStorage } from '../utils/tokenStorage'
import { SESSION_EXPIRED_MESSAGE } from '../utils/errors'

interface AuthContextValue {
  isAuthenticated: boolean
  /** Message to show on the login page (e.g. session expired). */
  sessionMessage: string | null
  login: (email: string, password: string) => Promise<void>
  /** Adopts an already-issued dashboard token (e.g. from Google sign-in). */
  loginWithToken: (token: string) => void
  logout: () => void
  clearSessionMessage: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest({ email, password })
    tokenStorage.set(res.access_token)
    setSessionMessage(null)
    setToken(res.access_token)
  }, [])

  const loginWithToken = useCallback((newToken: string) => {
    tokenStorage.set(newToken)
    setSessionMessage(null)
    setToken(newToken)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!tokenStorage.get()) return
      logout()
      setSessionMessage(SESSION_EXPIRED_MESSAGE)
    })
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!token,
      sessionMessage,
      login,
      loginWithToken,
      logout,
      clearSessionMessage: () => setSessionMessage(null),
    }),
    [token, sessionMessage, login, loginWithToken, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
