import type { AppointmentModality } from '../types/appointment'
import type { Doctor } from '../types/doctor'

export interface AppointmentFormValues {
  specialtyId: string
  doctorId: string
  date: string
  time: string
  reason: string
  modality: AppointmentModality | ''
}

export type AppointmentFormErrors = Partial<Record<keyof AppointmentFormValues, string>>

export function validateAppointmentForm(
  values: AppointmentFormValues,
  selectedDoctor: Doctor | undefined,
  availableTimes: string[],
  today: string,
): AppointmentFormErrors {
  const errors: AppointmentFormErrors = {}
  const specialtyId = Number(values.specialtyId)

  if (!values.specialtyId) errors.specialtyId = 'Seleccione una especialidad.'
  if (!values.doctorId) errors.doctorId = 'Seleccione un médico.'
  else if (!selectedDoctor || !selectedDoctor.specialtyIds.includes(specialtyId)) {
    errors.doctorId = 'El médico seleccionado no corresponde a la especialidad.'
  }
  if (!values.date) errors.date = 'Seleccione una fecha.'
  else if (values.date < today) errors.date = 'Seleccione una fecha desde hoy en adelante.'
  if (!values.time) errors.time = 'Seleccione una hora disponible.'
  else if (!availableTimes.includes(values.time)) errors.time = 'Seleccione una hora válida.'

  const reason = values.reason.trim()
  if (!reason) errors.reason = 'Ingrese el motivo de la consulta.'
  else if (reason.length < 5) errors.reason = 'El motivo debe contener al menos 5 caracteres.'
  else if (reason.length > 500) errors.reason = 'El motivo no puede superar los 500 caracteres.'
  if (!values.modality) errors.modality = 'Seleccione una modalidad.'

  return errors
}
