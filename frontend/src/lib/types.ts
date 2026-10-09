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

export interface Specialty {
  specialtyId: number
  specialtyName: string
  description: string
  active: boolean
}

export type SpecialtyValues = Specialty
export type SpecialtyErrors = Partial<Record<'specialtyName' | 'description', string>>

export interface Doctor {
  doctorId: number
  userId: number
  firstName: string
  lastName: string
  run: string
  email: string
  phone: string
  medicalLicenseNumber: string
  specialtyIds: number[]
  admissionDate: string
  active: boolean
}

export interface DoctorValues extends Omit<Doctor, 'specialtyIds'> {
  specialtyId: number
  extraSpecialtyIds: number[]
}

export type DoctorErrors = Partial<Record<keyof DoctorValues, string>>
