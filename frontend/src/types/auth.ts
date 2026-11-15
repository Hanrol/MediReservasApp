import type { Role } from './role'

export interface Session {
  token: string
  userId: number
  authUserId: number
  run: string
  firstName: string
  lastName: string
  email: string
  role: Role
  active: boolean
  birthDate?: string
  phone?: string
  address?: string
}

export interface LoginValues {
  email: string
  password: string
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>
