export type Role = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PATIENT'

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

export interface RegistrationValues {
  run: string
  firstName: string
  lastName: string
  birthDate: string
  phone: string
  address: string
  email: string
  password: string
  passwordConfirmation: string
  terms: boolean
}

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>

export interface LoginValues {
  email: string
  password: string
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>

export interface Session {
  token: string
  userId: number
  firstName: string
  lastName: string
  email: string
  role: Role
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

export interface ContactValues {
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>
