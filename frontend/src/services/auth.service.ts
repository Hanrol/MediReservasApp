import { isValidRole } from '../constants/roles'
import { apiRequest } from './api-client'
import { saveSession } from '../storage/session.storage'
import type { Session } from '../types/auth'
import type { Role } from '../types/role'
import type { User } from '../types/user'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface AuthPayload {
  authUserId: number
  email: string
  token: string
  roles: string[]
}

interface CurrentUserPayload {
  userId: number
  authUserId: number
  run: string
  email: string
  active: boolean
  firstName: string
  lastName: string
  phone?: string | null
  birthDate?: string | null
  address?: string | null
}

export interface AuthenticatedUser {
  user: User
  token: string
}

export async function authenticate(email: string, password: string): Promise<AuthenticatedUser> {
  const loginResponse = await apiRequest<ApiResponse<AuthPayload>>('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  })
  const login = loginResponse.data
  const role = login.roles
    .map((candidate) => candidate.toUpperCase())
    .find((candidate): candidate is Role => isValidRole(candidate))

  if (!login.token || !role) {
    throw new Error('La cuenta no tiene un perfil activo. Contacta con la administración.')
  }

  const currentUserResponse = await apiRequest<ApiResponse<CurrentUserPayload>>('/users/me', {
    token: login.token,
  })
  const profile = currentUserResponse.data

  if (!profile.active) {
    throw new Error('La cuenta está deshabilitada. Contacta con la administración.')
  }

  return {
    token: login.token,
    user: {
      userId: profile.userId,
      authUserId: profile.authUserId,
      run: profile.run,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      password: '',
      role,
      active: profile.active,
      birthDate: profile.birthDate ?? undefined,
      phone: profile.phone ?? undefined,
      address: profile.address ?? undefined,
    },
  }
}

export function createSession(user: User, token?: string): Session {
  const session: Session = {
    token: token ?? globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`,
    userId: user.userId,
    authUserId: user.authUserId,
    run: user.run,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    active: user.active,
    ...(user.birthDate ? { birthDate: user.birthDate } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.address ? { address: user.address } : {}),
  }
  saveSession(session)
  return session
}
