import type { Role } from './role.ts'

export interface User {
  userId: number
  authUserId: number
  run: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  active: boolean
  birthDate?: string
  phone?: string
  address?: string
}

export interface ManagedUserValues {
  userId: number
  run: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  password: string
}

export type ManagedUserErrors = Partial<Record<Exclude<keyof ManagedUserValues, 'userId'>, string>>
