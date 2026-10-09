import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../lib/types'

interface RoleGuardProps {
  allowedRoles: readonly Role[]
  children: ReactNode
}

function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/acceso-denegado" replace />
  }

  return children
}

export default RoleGuard
