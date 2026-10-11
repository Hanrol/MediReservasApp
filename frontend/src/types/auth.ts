import type { Role } from './role'

export interface Session {
  token: string
  userId: number
  firstName: string
  lastName: string
  email: string
  role: Role
}

export interface LoginValues {
  email: string
  password: string
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>
