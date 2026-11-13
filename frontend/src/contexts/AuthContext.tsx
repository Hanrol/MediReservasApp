import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { createSession } from '../services/auth.service'
import { getSession, removeSession } from '../storage/session.storage'
import { USERS_CHANGED_EVENT } from '../storage/users.storage'
import type { Session } from '../types/auth'
import type { User } from '../types/user'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(getSession)
  const user: User | undefined = useMemo(() => session ? {
    userId: session.userId,
    authUserId: session.authUserId,
    run: session.run,
    firstName: session.firstName,
    lastName: session.lastName,
    email: session.email,
    password: '',
    role: session.role,
    active: session.active,
    birthDate: session.birthDate,
    phone: session.phone,
    address: session.address,
  } : undefined, [session])
  const isAuthenticated = Boolean(session && user?.active)

  const startSession = useCallback((authenticatedUser: User, token?: string) => {
    setSession(createSession(authenticatedUser, token))
  }, [])

  const logout = useCallback(() => {
    removeSession()
    setSession(null)
    navigate(ROUTES.login, { replace: true, state: null })
  }, [navigate])

  const refreshSession = useCallback(() => {
    setSession(getSession())
  }, [])

  useEffect(() => {
    const synchronizeSession = () => setSession(getSession())
    window.addEventListener('storage', synchronizeSession)
    window.addEventListener(USERS_CHANGED_EVENT, synchronizeSession)
    return () => {
      window.removeEventListener('storage', synchronizeSession)
      window.removeEventListener(USERS_CHANGED_EVENT, synchronizeSession)
    }
  }, [])

  const value = useMemo(() => ({
    session,
    user,
    isAuthenticated,
    startSession,
    logout,
    refreshSession,
  }), [session, user, isAuthenticated, startSession, logout, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
