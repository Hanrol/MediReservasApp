import type { Role } from '../types/role.ts'
import type { User } from '../types/user.ts'

const USERS_KEY = 'medireservas_users'

const LEGACY_ROLES: Record<string, Role> = {
  ADMINISTRADOR: 'ADMIN',
  RECEPCIONISTA: 'RECEPTIONIST',
  MEDICO: 'DOCTOR',
  PACIENTE: 'PATIENT',
}

function normalizeStoredRole(role: string): Role {
  return LEGACY_ROLES[role] ?? (role as Role)
}

export function getUsers(): User[] {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []
    return stored.map((item, index) => {
      const user = { ...item }
      delete user.id
      return {
        ...user,
        userId: Number(user.userId ?? index + 1),
        authUserId: Number(user.authUserId ?? user.userId ?? index + 1),
        role: normalizeStoredRole(user.role),
      } as User
    })
  } catch {
    return []
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
