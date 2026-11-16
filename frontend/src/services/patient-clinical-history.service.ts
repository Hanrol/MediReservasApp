import type { ClinicalConsultation } from '../types/clinical'
import { getPatientAppointments } from './patient-appointments.service'
import { apiRequest } from './api-client'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface ApiVisit {
  medicalVisitId: number
  appointmentId: number
  doctorId: number
  visitDate: string
  visitReason: string
  observations: string
  treatment: string
  diagnoses: Array<{ diagnosisId: number; diagnosisDescription: string; diagnosisNotes: string | null }>
}

export async function getPatientClinicalHistory(
  token: string,
  patientUserId: number,
  patientName: string,
  patientRun: string,
): Promise<ClinicalConsultation[]> {
  const [visitsResponse, appointments] = await Promise.all([
    apiRequest<ApiResponse<ApiVisit[]>>('/medical-records/me', { token }),
    getPatientAppointments(token, patientUserId),
  ])
  const appointmentsById = new Map(appointments.map((appointment) => [
    appointment.appointmentId,
    appointment,
  ]))

  return visitsResponse.data.map((visit) => {
    const appointment = appointmentsById.get(visit.appointmentId)
    return {
      id: String(visit.medicalVisitId),
      patientName,
      patientRun,
      doctorName: appointment?.doctorName ?? 'Médico no disponible',
      specialtyName: appointment?.specialtyName ?? '',
      date: visit.visitDate,
      reason: visit.visitReason,
      diagnosis: visit.diagnoses?.map((diagnosis) => diagnosis.diagnosisDescription).join(', ') || 'Sin diagnóstico',
      observations: visit.observations || 'Sin observaciones',
      treatment: visit.treatment || 'Sin tratamiento registrado',
    }
  }).sort((first, second) => second.date.localeCompare(first.date))
}
