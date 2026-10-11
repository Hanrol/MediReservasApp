import { saveSession } from '../storage/session.storage'
import type { Session } from '../types/auth'
import type { User } from '../types/user'
import { getUsers } from './users.service'

export function authenticate(email: string, password: string): User | undefined {
  const normalizedEmail = email.trim().toLowerCase()
  return getUsers().find(
    (user) => user.active && user.email.toLowerCase() === normalizedEmail && user.password === password,
  )
}

export function createSession(user: User): Session {
  const session: Session = {
    token: globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`,
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  }
  saveSession(session)
  return session
}
