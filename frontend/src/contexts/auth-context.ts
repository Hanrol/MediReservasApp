import { createContext } from 'react'
import type { Session } from '../types/auth'
import type { User } from '../types/user'

interface AuthContextValue {
  session: Session | null
  user: User | undefined
  isAuthenticated: boolean
  startSession: (user: User) => void
  logout: () => void
  refreshSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
