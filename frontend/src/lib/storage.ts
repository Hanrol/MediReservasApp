import { BASE_DOCTORS, BASE_SPECIALTIES, BASE_USERS } from './data'
import type { Doctor, Role, Session, Specialty, User } from './types'

const USERS_KEY = 'medireservas_users'
const SESSION_KEY = 'medireservas_session'
const DOCTORS_KEY = 'medireservas_doctors'
const SPECIALTIES_KEY = 'medireservas_specialties'
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

export function isUserDataTaken(run: string, email: string, excludedUserId?: number) {
  const normalizedEmail = email.trim().toLowerCase()
  return getUsers().some((user) =>
    user.userId !== excludedUserId &&
    (user.run === run || user.email.toLowerCase() === normalizedEmail),
  )
}

export function getNextUserId() {
  return getUsers().reduce((max, user) => Math.max(max, user.userId), 0) + 1
}

export function getUserById(userId: number) {
  return getUsers().find((user) => user.userId === userId)
}

export function saveUser(user: User) {
  localStorage.setItem(USERS_KEY, JSON.stringify([...getUsers(), user]))
}

export function updateUser(userId: number, changes: Partial<Omit<User, 'userId'>>) {
  const users = getUsers()
  const index = users.findIndex((user) => user.userId === userId)
  if (index < 0) return null
  users[index] = { ...users[index], ...changes, userId }
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return users[index]
}

export function updateUserStatus(userId: number, active: boolean) {
  return updateUser(userId, { active })
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    return session && typeof session === 'object' ? session : null
  } catch {
    return null
  }
}

export function removeSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getStoredItems<T>(key: string): T[] {
  try {
    const items = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function getSpecialties(): Specialty[] {
  return getStoredItems<Specialty>(SPECIALTIES_KEY).map((item, index) => ({ ...item, specialtyId: Number(item.specialtyId ?? index + 1) }))
}

export function initializeBaseSpecialties() {
  if (!localStorage.getItem(SPECIALTIES_KEY)) localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(BASE_SPECIALTIES))
}

export function getNextSpecialtyId() {
  return getSpecialties().reduce((max, item) => Math.max(max, item.specialtyId), 0) + 1
}

export function saveSpecialty(specialty: Specialty) {
  localStorage.setItem(SPECIALTIES_KEY, JSON.stringify([...getSpecialties(), specialty]))
}

export function updateSpecialty(specialtyId: number, changes: Partial<Omit<Specialty, 'specialtyId'>>) {
  const items = getSpecialties()
  const index = items.findIndex((item) => item.specialtyId === specialtyId)
  if (index < 0) return null
  items[index] = { ...items[index], ...changes, specialtyId }
  localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(items))
  return items[index]
}

export function isSpecialtyNameTaken(name: string, excludedId?: number) {
  const normalized = name.trim().toLowerCase()
  return getSpecialties().some((item) => item.specialtyId !== excludedId && item.specialtyName.trim().toLowerCase() === normalized)
}

export function getDoctors(): Doctor[] {
  return getStoredItems<Doctor>(DOCTORS_KEY).map((item, index) => ({ ...item, doctorId: Number(item.doctorId ?? index + 1), userId: Number(item.userId), specialtyIds: item.specialtyIds ?? [] }))
}

export function initializeBaseDoctors() {
  if (!localStorage.getItem(DOCTORS_KEY)) localStorage.setItem(DOCTORS_KEY, JSON.stringify(BASE_DOCTORS))
}

export function getNextDoctorId() {
  return getDoctors().reduce((max, item) => Math.max(max, item.doctorId), 0) + 1
}

export function saveDoctor(doctor: Doctor) {
  localStorage.setItem(DOCTORS_KEY, JSON.stringify([...getDoctors(), doctor]))
}

export function updateDoctor(doctorId: number, changes: Partial<Omit<Doctor, 'doctorId'>>) {
  const items = getDoctors()
  const index = items.findIndex((item) => item.doctorId === doctorId)
  if (index < 0) return null
  items[index] = { ...items[index], ...changes, doctorId }
  localStorage.setItem(DOCTORS_KEY, JSON.stringify(items))
  return items[index]
}

export function isDoctorDataTaken(run: string, license: string, excludedId?: number) {
  const normalizedRun = run.trim().toLowerCase()
  const normalizedLicense = license.trim().toLowerCase()
  return getDoctors().some((item) => item.doctorId !== excludedId && (item.run.trim().toLowerCase() === normalizedRun || item.medicalLicenseNumber.trim().toLowerCase() === normalizedLicense))
}
