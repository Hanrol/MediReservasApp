import { BASE_USERS } from './data'
import type { Role, User } from './types'

const USERS_KEY = 'medireservas_users'
const legacyRoles: Record<string, Role> = {
  ADMINISTRADOR: 'ADMIN',
  RECEPCIONISTA: 'RECEPTIONIST',
  MEDICO: 'DOCTOR',
  PACIENTE: 'PATIENT',
}

export function getUsers(): User[] {
  try {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
    if (!Array.isArray(users)) return []
    return users.map((user, index) => ({
      ...user,
      userId: Number(user.userId ?? index + 1),
      authUserId: Number(user.authUserId ?? user.userId ?? index + 1),
      role: legacyRoles[user.role] ?? user.role,
    }))
  } catch {
    return []
  }
}

export function initializeBaseUsers() {
  const users = getUsers()
  const emails = new Set(users.map((user) => user.email.toLowerCase()))
  let nextId = users.reduce((max, user) => Math.max(max, user.userId), 0) + 1
  const usedIds = new Set(users.map((user) => user.userId))
  const missing = BASE_USERS.filter((user) => !emails.has(user.email.toLowerCase()))
    .map((user) => {
      const userId = usedIds.has(user.userId) ? nextId++ : user.userId
      usedIds.add(userId)
      nextId = Math.max(nextId, userId + 1)
      return { ...user, userId, authUserId: userId }
    })
  if (missing.length) localStorage.setItem(USERS_KEY, JSON.stringify([...users, ...missing]))
}

export function userExists(run: string, email: string) {
  return getUsers().some((user) =>
    user.run === run || user.email.toLowerCase() === email.trim().toLowerCase(),
  )
}

export function getNextUserId() {
  return getUsers().reduce((max, user) => Math.max(max, user.userId), 0) + 1
}

export function saveUser(user: User) {
  localStorage.setItem(USERS_KEY, JSON.stringify([...getUsers(), user]))
}
