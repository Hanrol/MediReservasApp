import type { Session } from '../types/auth'
import { isValidRole } from '../constants/roles'
import { STORAGE_KEYS } from './storageKeys'

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<Session>
  return typeof session.token === 'string' &&
    typeof session.userId === 'number' &&
    typeof session.firstName === 'string' &&
    typeof session.lastName === 'string' &&
    typeof session.email === 'string' &&
    typeof session.role === 'string' &&
    isValidRole(session.role)
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
}

export function getSession(): Session | null {
  try {
    const session: unknown = JSON.parse(localStorage.getItem(STORAGE_KEYS.session) ?? 'null')
    return isSession(session) ? session : null
  } catch {
    return null
  }
}

export function removeSession(): void {
  localStorage.removeItem(STORAGE_KEYS.session)
}
