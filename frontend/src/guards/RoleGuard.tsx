import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession, getUserById } from '../lib/storage'
import type { Role } from '../lib/types'

interface RoleGuardProps {
  allowedRoles: readonly Role[]
  children: ReactNode
}

function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const session = getSession()
  const user = session ? getUserById(session.userId) : undefined

  if (!session || !user || !user.active) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/acceso-denegado" replace />
  }

  return children
}

export default RoleGuard
