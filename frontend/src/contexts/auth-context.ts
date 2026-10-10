import { createContext } from 'react'
import type { Session, User } from '../lib/types'

export interface AuthContextValue {
  session: Session | null
  user: User | undefined
  isAuthenticated: boolean
  startSession: (user: User) => void
  logout: () => void
  refreshSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
