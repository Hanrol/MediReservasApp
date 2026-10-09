import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession, getUserById } from '../lib/storage'

interface AuthGuardProps {
  children: ReactNode
}

function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const session = getSession()
  const user = session ? getUserById(session.userId) : undefined

  if (!session || !user || !user.active) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default AuthGuard
