import type { Specialty } from '../types/specialty.ts'

const SPECIALTIES_KEY = 'medireservas_specialties'

export function getSpecialties(): Specialty[] {
  try {
    const stored = JSON.parse(localStorage.getItem(SPECIALTIES_KEY) ?? '[]')
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
  localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(specialties))
}

export function hasStoredSpecialties(): boolean {
  return Boolean(localStorage.getItem(SPECIALTIES_KEY))
}
