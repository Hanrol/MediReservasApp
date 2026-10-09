import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, getUserById, removeSession } from '../lib/storage'

export function useAuth() {
  const navigate = useNavigate()
  const [session, setSession] = useState(getSession)
  const user = session ? getUserById(session.userId) : undefined
  const isAuthenticated = Boolean(session && user?.active)

  const logout = useCallback(() => {
    removeSession()
    setSession(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const refreshSession = useCallback(() => {
    setSession(getSession())
  }, [])

  return { session, user, isAuthenticated, logout, refreshSession }
}
