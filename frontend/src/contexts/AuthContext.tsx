import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../lib/auth'
import { getSession, getUserById, removeSession } from '../lib/storage'
import type { Session, User } from '../lib/types'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(getSession)
  const user = session ? getUserById(session.userId) : undefined
  const isAuthenticated = Boolean(session && user?.active)

  const startSession = useCallback((authenticatedUser: User) => {
    setSession(createSession(authenticatedUser))
  }, [])

  const logout = useCallback(() => {
    removeSession()
    setSession(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const refreshSession = useCallback(() => {
    setSession(getSession())
  }, [])

  useEffect(() => {
    const synchronizeSession = () => setSession(getSession())
    window.addEventListener('storage', synchronizeSession)
    return () => window.removeEventListener('storage', synchronizeSession)
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
