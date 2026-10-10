import { mockDoctors } from '../data/mockDoctors.ts'
import { getDoctors as readDoctors, hasStoredDoctors, saveDoctors } from '../storage/doctors.storage.ts'
import type { Doctor } from '../types/doctor.ts'
import type { User } from '../types/user.ts'

export function getDoctors(): Doctor[] {
  return readDoctors()
}

export function getDoctorById(doctorId: number): Doctor | null {
  return readDoctors().find((doctor) => doctor.doctorId === Number(doctorId)) ?? null
}

export function getDoctorForUser(user: User | null | undefined): Doctor | null {
  if (!user) return null

  const normalizedEmail = String(user.email ?? '').trim().toLowerCase()
  const normalizedRun = String(user.run ?? '').trim().toLowerCase()
  const normalizedName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim().toLowerCase()

  return (
    readDoctors().find((doctor) => {
      const doctorName = `${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`.trim().toLowerCase()

      return (
        doctor.userId === Number(user.userId) ||
        (normalizedEmail !== '' && doctor.email?.trim().toLowerCase() === normalizedEmail) ||
        (normalizedRun !== '' && doctor.run?.trim().toLowerCase() === normalizedRun) ||
        (normalizedName !== '' && doctorName === normalizedName)
      )
    }) ?? null
  )
}

export function createDoctor(doctor: Doctor): Doctor {
  const created: Doctor = { ...doctor, doctorId: getNextDoctorId() }
  saveDoctors([...readDoctors(), created])
  return created
}

export function editDoctor(doctorId: number, changes: Omit<Doctor, 'doctorId'>): Doctor | null {
  return updateDoctorRecord(doctorId, changes)
}

export function setDoctorStatus(doctorId: number, active: boolean): boolean {
  return Boolean(updateDoctorRecord(doctorId, { active }))
}

export function isDoctorDataTaken(run: string, license: string, excludedId?: number): boolean {
  const normalizedRun = run.trim().toLowerCase()
  const normalizedLicense = license.trim().toLowerCase()
  return readDoctors().some(
    (doctor) =>
      doctor.doctorId !== excludedId &&
      (doctor.run.trim().toLowerCase() === normalizedRun ||
        doctor.medicalLicenseNumber.trim().toLowerCase() === normalizedLicense),
  )
}

export function initializeDoctors(): void {
  if (hasStoredDoctors()) return
  saveDoctors(mockDoctors.map((doctor) => ({ ...doctor })))
}

function updateDoctorRecord(doctorId: number, changes: Partial<Omit<Doctor, 'doctorId'>>): Doctor | null {
  const doctors = readDoctors()
  const index = doctors.findIndex((doctor) => doctor.doctorId === Number(doctorId))
  if (index < 0) return null

  doctors[index] = { ...doctors[index], ...changes, doctorId: Number(doctorId) }
  saveDoctors(doctors)
  return doctors[index]
}

function getNextDoctorId(): number {
  return readDoctors().reduce((max, doctor) => Math.max(max, doctor.doctorId), 0) + 1
}
