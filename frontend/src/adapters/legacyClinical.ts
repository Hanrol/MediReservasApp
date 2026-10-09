import type { Role } from '../lib/types'

const APPOINTMENTS_KEY = 'medireservas_appointments'
const MEDICAL_RECORDS_KEY = 'medireservas_medical_records'
const MEDICAL_VISITS_KEY = 'medireservas_medical_visits'
const DIAGNOSES_KEY = 'medireservas_diagnoses'

interface LegacyMedicalRecord {
  medicalRecordId: number
  patientId: number
}

interface LegacyMedicalVisit {
  medicalVisitId: number
  medicalRecordId: number
  appointmentId: number | string
  doctorId: number
  visitDate: string
  visitReason?: string
  observations?: string
  treatment?: string
}

interface LegacyDiagnosis {
  medicalVisitId: number
  diagnosisDescription?: string
}

interface LegacyAppointment {
  appointmentId?: number | string
  id?: number | string
  patientUserId?: number
  patientName?: string
  patientRun?: string
  doctorName?: string
  specialtyName?: string
  date?: string
  reason?: string
}

export interface LegacyClinicalConsultation {
  id: number
  patientName: string
  patientRun: string
  doctorName: string
  specialtyName: string
  date: string
  reason: string
  diagnosis: string
  observations: string
  treatment: string
}

function readCollection<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value as T[] : []
  } catch {
    return []
  }
}

function numericId(value: number | string | undefined) {
  return Number(String(value ?? '').replace(/\D/g, ''))
}

export function getLegacyClinicalHistory(userId: number, role: Role, doctorId?: number) {
  const records = readCollection<LegacyMedicalRecord>(MEDICAL_RECORDS_KEY)
  const visits = readCollection<LegacyMedicalVisit>(MEDICAL_VISITS_KEY)
  const diagnoses = readCollection<LegacyDiagnosis>(DIAGNOSES_KEY)
  const appointments = readCollection<LegacyAppointment>(APPOINTMENTS_KEY)
  const patientRecordIds = new Set(
    records.filter((record) => Number(record.patientId) === userId).map((record) => Number(record.medicalRecordId)),
  )

  return visits
    .filter((visit) => role === 'DOCTOR'
      ? Number(visit.doctorId) === doctorId
      : patientRecordIds.has(Number(visit.medicalRecordId)))
    .map((visit): LegacyClinicalConsultation | null => {
      const appointmentId = numericId(visit.appointmentId)
      const appointment = appointments.find((item) => numericId(item.appointmentId ?? item.id) === appointmentId)
      const diagnosis = diagnoses.find((item) => Number(item.medicalVisitId) === Number(visit.medicalVisitId))
      if (!appointment || !diagnosis) return null

      return {
        id: Number(visit.medicalVisitId),
        patientName: appointment.patientName ?? 'Sin información',
        patientRun: appointment.patientRun ?? 'Sin información',
        doctorName: appointment.doctorName ?? 'Sin información',
        specialtyName: appointment.specialtyName ?? 'Atención médica',
        date: visit.visitDate || appointment.date || '',
        reason: visit.visitReason || appointment.reason || 'Sin información',
        diagnosis: diagnosis.diagnosisDescription || 'Sin información',
        observations: visit.observations || 'Sin información',
        treatment: visit.treatment || 'Sin información',
      }
    })
    .filter((consultation): consultation is LegacyClinicalConsultation => consultation !== null)
    .sort((first, second) => second.date.localeCompare(first.date))
}
