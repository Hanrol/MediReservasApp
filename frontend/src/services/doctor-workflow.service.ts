import { ApiError, apiRequest } from './api-client'
import type { Appointment } from '../types/appointment'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface DoctorProfile {
  doctorId: number
  userId: number
  medicalLicenseNumber: string
  active: boolean
  specialtyIds: number[]
}

interface ApiAppointment {
  appointmentId: number
  patientUserId: number
  doctorId: number
  specialtyId: number
  scheduleSlotId: number
  appointmentStatus: Appointment['appointmentStatus']
  reason: string | null
}

interface ApiScheduleSlot {
  scheduleSlotId: number
  slotDate: string
  startTime: string
}

interface ApiSpecialty {
  specialtyId: number
  specialtyName: string
}

interface MedicalVisit {
  medicalVisitId: number
  appointmentId: number
  doctorId: number
  visitDate: string
  visitReason: string
  observations: string
  treatment: string
  createdAt: string
  diagnoses: Diagnosis[]
}

interface MedicalRecordDetail {
  medicalRecordId: number
  patientUserId: number
  visits: MedicalVisit[]
}

interface Diagnosis {
  diagnosisId: number
  diagnosisDescription: string
  diagnosisNotes: string | null
}

export interface DoctorObservation {
  diagnosis: string
  notes: string
  treatment: string
  createdAt: string
}

export async function getDoctorAppointments(
  token: string,
  doctorName: string,
): Promise<{ doctor: DoctorProfile; appointments: Appointment[] }> {
  const doctor = await apiRequest<DoctorProfile>('/doctors/me', { token })
  const [appointmentResponse, slotResponse, specialtyResponse] = await Promise.all([
    apiRequest<ApiResponse<ApiAppointment[]>>(`/appointments/doctor/${doctor.doctorId}`, { token }),
    apiRequest<ApiResponse<ApiScheduleSlot[]>>('/schedule-slots', { token }),
    apiRequest<ApiResponse<ApiSpecialty[]>>('/specialties', { token }),
  ])

  const slots = new Map(slotResponse.data.map((slot) => [slot.scheduleSlotId, slot]))
  const specialties = new Map(specialtyResponse.data.map((specialty) => [
    specialty.specialtyId,
    specialty.specialtyName,
  ]))
  const appointments = appointmentResponse.data.map((item): Appointment => {
    const slot = slots.get(item.scheduleSlotId)
    return {
      appointmentId: item.appointmentId,
      patientUserId: item.patientUserId,
      patientName: `Paciente #${item.patientUserId}`,
      doctorId: item.doctorId,
      doctorName,
      specialtyId: item.specialtyId,
      specialtyName: specialties.get(item.specialtyId) ?? `Especialidad #${item.specialtyId}`,
      scheduleSlotId: item.scheduleSlotId,
      date: slot?.slotDate ?? '',
      time: slot?.startTime?.slice(0, 5) ?? '',
      reason: item.reason ?? '',
      appointmentStatus: item.appointmentStatus,
    }
  })

  return { doctor, appointments }
}

export async function getDoctorObservation(
  token: string,
  appointment: Appointment,
): Promise<DoctorObservation | null> {
  try {
    const response = await apiRequest<ApiResponse<MedicalVisit[]>>(
      `/medical-visit/${appointment.patientUserId}`,
      { token },
    )
    const visit = response.data.find((item) => item.appointmentId === appointment.appointmentId)
    if (!visit) return null
    return {
      diagnosis: visit.diagnoses?.[0]?.diagnosisDescription ?? '',
      notes: visit.observations ?? '',
      treatment: visit.treatment ?? '',
      createdAt: visit.createdAt,
    }
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 404) return null
    throw cause
  }
}

export async function saveDoctorObservation(
  token: string,
  appointment: Appointment,
  doctorId: number,
  input: Pick<DoctorObservation, 'diagnosis' | 'notes' | 'treatment'>,
): Promise<void> {
  const recordResponse = await apiRequest<ApiResponse<{ medicalRecordId: number }>>(
    `/medical-records/for-appointment/${appointment.appointmentId}`,
    { method: 'POST', token },
  )
  const recordId = recordResponse.data.medicalRecordId
  const visitsResponse = await apiRequest<ApiResponse<MedicalVisit[]>>(
    `/medical-visit/${appointment.patientUserId}`,
    { token },
  )
  let visit = visitsResponse.data.find((item) => item.appointmentId === appointment.appointmentId)
  const visitValues = {
    visitReason: appointment.reason.trim() || 'Atención médica',
    observations: input.notes.trim(),
    treatment: input.treatment.trim(),
  }

  if (visit) {
    await apiRequest(`/medical-visit/${visit.medicalVisitId}`, {
      method: 'PUT',
      token,
      body: visitValues,
    })
    visit = { ...visit, ...visitValues }
  } else {
    const response = await apiRequest<ApiResponse<MedicalVisit>>('/medical-visit', {
      method: 'POST',
      token,
      body: {
        medicalRecordId: recordId,
        appointmentId: appointment.appointmentId,
        doctorId,
        visitDate: `${appointment.date} ${appointment.time}:00`,
        ...visitValues,
      },
    })
    visit = response.data
  }

  if (!visit.diagnoses?.length) {
    await apiRequest('/diagnoses', {
      method: 'POST',
      token,
      body: {
        medicalVisitId: visit.medicalVisitId,
        diagnosisDescription: input.diagnosis.trim(),
        diagnosisNotes: '',
      },
    })
  }

  await apiRequest(`/appointments/${appointment.appointmentId}/complete`, {
    method: 'PATCH',
    token,
    body: { changeReason: 'Atención clínica registrada por el médico' },
  })
}

export async function getDoctorClinicalHistory(
  token: string,
  doctorName: string,
): Promise<Array<{
  id: string
  patientName: string
  patientRun: string
  doctorName: string
  specialtyName: string
  date: string
  reason: string
  diagnosis: string
  observations: string
  treatment: string
}>> {
  const response = await apiRequest<ApiResponse<MedicalRecordDetail[]>>('/medical-records', { token })
  return response.data.flatMap((record) => record.visits.map((visit) => ({
    id: String(visit.medicalVisitId),
    patientName: `Paciente #${record.patientUserId}`,
    patientRun: 'No disponible',
    doctorName,
    specialtyName: 'Atención médica',
    date: visit.visitDate,
    reason: visit.visitReason,
    diagnosis: visit.diagnoses?.map((diagnosis) => diagnosis.diagnosisDescription).join(', ') || 'Sin diagnóstico',
    observations: visit.observations || 'Sin observaciones',
    treatment: visit.treatment,
  }))).sort((a, b) => b.date.localeCompare(a.date))
}
