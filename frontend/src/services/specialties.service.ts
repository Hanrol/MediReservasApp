import { mockSpecialties } from '../data/mockSpecialties.ts'
import { getSpecialties as readSpecialties, hasStoredSpecialties, saveSpecialties } from '../storage/specialties.storage.ts'
import type { Specialty, SpecialtyValues } from '../types/specialty.ts'

export function getSpecialties(): Specialty[] {
  return readSpecialties()
}

export function getSpecialtyById(specialtyId: number): Specialty | null {
  return readSpecialties().find((specialty) => specialty.specialtyId === Number(specialtyId)) ?? null
}

export function createSpecialty(values: SpecialtyValues): Specialty {
  const created: Specialty = { ...values, specialtyId: getNextSpecialtyId() }
  saveSpecialties([...readSpecialties(), created])
  return created
}

export function editSpecialty(specialtyId: number, changes: Omit<Specialty, 'specialtyId'>): Specialty | null {
  return updateSpecialtyRecord(specialtyId, changes)
}

export function setSpecialtyStatus(specialtyId: number, active: boolean): boolean {
  return Boolean(updateSpecialtyRecord(specialtyId, { active }))
}

export function isSpecialtyNameTaken(name: string, excludedId?: number): boolean {
  const normalized = name.trim().toLowerCase()
  return readSpecialties().some(
    (specialty) =>
      specialty.specialtyId !== excludedId &&
      specialty.specialtyName.trim().toLowerCase() === normalized,
  )
}

export function initializeSpecialties(): void {
  if (hasStoredSpecialties()) return
  saveSpecialties(mockSpecialties.map((specialty) => ({ ...specialty })))
}

function updateSpecialtyRecord(
  specialtyId: number,
  changes: Partial<Omit<Specialty, 'specialtyId'>>,
): Specialty | null {
  const specialties = readSpecialties()
  const index = specialties.findIndex((specialty) => specialty.specialtyId === Number(specialtyId))
  if (index < 0) return null

  specialties[index] = { ...specialties[index], ...changes, specialtyId: Number(specialtyId) }
  saveSpecialties(specialties)
  return specialties[index]
}

function getNextSpecialtyId(): number {
  return readSpecialties().reduce((max, specialty) => Math.max(max, specialty.specialtyId), 0) + 1
}
