import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
}

function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return children
}

export default AuthGuard
