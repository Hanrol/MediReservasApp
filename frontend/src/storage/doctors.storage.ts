import { mockDoctors } from '../data/mockDoctors.ts'
import type { Doctor } from '../types/doctor.ts'
import { STORAGE_KEYS } from './storageKeys'

function normalizeDoctorId(doctorId: unknown): number | null {
  const normalized = Number(String(doctorId).replace('doctor-', ''))
  return Number.isFinite(normalized) ? normalized : null
}

export function getDoctors(): Doctor[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.doctors) ?? '[]')
    if (!Array.isArray(stored)) return []
    return stored.map(({ specialtyId, extraSpecialtyIds, ...doctor }, index) => {
      const doctorId = normalizeDoctorId(doctor.doctorId) ?? index + 1
      const numericUserId = Number(doctor.userId)
      const baseDoctor = mockDoctors.find((item) => item.doctorId === doctorId)

      return {
        ...doctor,
        doctorId,
        userId: Number.isFinite(numericUserId) ? numericUserId : (baseDoctor?.userId ?? 0),
        specialtyIds: doctor.specialtyIds ?? [specialtyId, ...(extraSpecialtyIds ?? [])].filter((id) => Boolean(id)),
      } as Doctor
    })
  } catch {
    return []
  }
}

export function saveDoctors(doctors: Doctor[]): void {
  localStorage.setItem(STORAGE_KEYS.doctors, JSON.stringify(doctors))
}

export function hasStoredDoctors(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEYS.doctors))
}
