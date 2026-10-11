import type { Specialty } from '../types/specialty.ts'
import { STORAGE_KEYS } from './storageKeys'

export function getSpecialties(): Specialty[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.specialties) ?? '[]')
    if (!Array.isArray(stored)) return []
    return stored.map(({ id, ...specialty }, index) => ({
      ...specialty,
      specialtyId: Number(specialty.specialtyId ?? id ?? index + 1),
    })) as Specialty[]
  } catch {
    return []
  }
}

export function saveSpecialties(specialties: Specialty[]): void {
  localStorage.setItem(STORAGE_KEYS.specialties, JSON.stringify(specialties))
}

export function hasStoredSpecialties(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEYS.specialties))
}
