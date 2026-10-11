import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppointments } from '../../hooks/useAppointments'
import { useClinical } from '../../hooks/useClinical'
import { useSchedules } from '../../hooks/useSchedules'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { clinicalStorage } from '../../storage/clinical.storage'
import { schedulesStorage } from '../../storage/schedules.storage'

const appointmentInput = {
  patientUserId: 4,
  patientName: 'Paula Contreras',
  doctorId: 1,
  doctorName: 'Daniela Rojas',
  specialtyId: 1,
  specialtyName: 'Cardiología',
  scheduleSlotId: 3,
  date: '2026-10-12',
  time: '11:30',
  reason: 'Control cardiológico',
  modality: 'presencial' as const,
}

const observationInput = {
  appointmentId: 4,
  patientId: 4,
  doctorId: 3,
  diagnosis: 'Artrosis leve',
  notes: 'Dolor articular recurrente.',
  treatment: 'Reposo relativo.',
}

describe('Hooks de dominio', () => {
  beforeEach(() => {
    localStorage.clear()
    appointmentsStorage.reset()
    schedulesStorage.reset()
    clinicalStorage.reset()
  })

  it('CP-053 · RF-17 · useAppointments aplica filtros del paciente', () => {
    const { result } = renderHook(() => useAppointments({ filters: { patientUserId: 4 } }))

    expect(result.current.appointments).not.toHaveLength(0)
    expect(result.current.appointments.every((item) => item.patientUserId === 4)).toBe(true)
    expect(result.current.loading).toBe(false)
  })

  it('CP-054 · RF-15 · useAppointments crea y refresca una cita', () => {
    const { result } = renderHook(() => useAppointments())
    let created = null

    act(() => {
      created = result.current.createAppointment(appointmentInput)
    })

    expect(created).toMatchObject({ appointmentId: 6, appointmentStatus: 'PENDING' })
    expect(result.current.appointments).toHaveLength(6)
    expect(result.current.error).toBeNull()
  })

  it('CP-055 · RF-15/RF-16 · useAppointments expone errores del servicio', () => {
    const { result } = renderHook(() => useAppointments())

    act(() => {
      result.current.createAppointment({ ...appointmentInput, scheduleSlotId: 999 })
    })

    expect(result.current.error).toBe('El horario seleccionado ya no está disponible.')
  })

  it('CP-056 · RF-18 · useAppointments cancela citas del paciente', () => {
    const { result } = renderHook(() => useAppointments())
    let cancelled = false

    act(() => {
      cancelled = result.current.cancelAppointment(2)
    })

    expect(cancelled).toBe(true)
    expect(result.current.appointments.find((item) => item.appointmentId === 2)?.appointmentStatus).toBe('CANCELLED')
  })

  it('CP-057 · RF-20/RF-22 · useAppointments ejecuta acciones de recepción', () => {
    const { result } = renderHook(() => useAppointments())

    act(() => {
      result.current.confirmAppointment(2)
      result.current.cancelAppointmentByStaff(1)
    })

    expect(result.current.appointments.find((item) => item.appointmentId === 2)?.appointmentStatus).toBe('CONFIRMED')
    expect(result.current.appointments.find((item) => item.appointmentId === 1)?.appointmentStatus).toBe('CANCELLED')
  })

  it('CP-058 · RF-21 · useAppointments reagenda y actualiza citas', () => {
    const { result } = renderHook(() => useAppointments())

    act(() => {
      result.current.rescheduleAppointment(2, 7)
      result.current.updateAppointment(2, { reason: 'Motivo actualizado' })
    })

    expect(result.current.appointments.find((item) => item.appointmentId === 2)).toMatchObject({
      scheduleSlotId: 7,
      reason: 'Motivo actualizado',
    })
  })

  it('CP-059 · RF-15/RF-16 · useSchedules filtra y consulta horas disponibles', () => {
    const { result } = renderHook(() => useSchedules({ filters: { doctorId: 1, available: true } }))

    expect(result.current.schedules.every((item) => item.doctorId === 1 && item.available)).toBe(true)
    expect(result.current.getAvailableTimes(1, '2026-10-13')).toEqual(['14:00', '15:00'])
  })

  it('CP-060 · RF-15/RF-18 · useSchedules ocupa y libera horarios', () => {
    const { result } = renderHook(() => useSchedules())

    act(() => {
      expect(result.current.markUnavailable(1, '2026-10-12', '11:30')).toBe(true)
      expect(result.current.markAvailable(1, '2026-10-12', '11:30')).toBe(true)
    })

    expect(result.current.error).toBeNull()
  })

  it('CP-061 · RF-15/RF-16/RNF-07 · useSchedules informa un horario inexistente', () => {
    const { result } = renderHook(() => useSchedules())

    act(() => {
      expect(result.current.markUnavailable(99, '2026-10-12', '11:30')).toBe(false)
    })

    expect(result.current.error).toBe('No se encontró el horario solicitado.')
  })

  it('CP-062 · RF-24 · useClinical registra y filtra observaciones', () => {
    const { result } = renderHook(() => useClinical({ filters: { patientId: 4 } }))

    act(() => {
      result.current.createObservation(observationInput)
    })

    expect(result.current.observations).toHaveLength(1)
    expect(result.current.observations[0]).toMatchObject(observationInput)
  })

  it('CP-063 · RF-24/RNF-07 · useClinical informa observaciones duplicadas', () => {
    const { result } = renderHook(() => useClinical())

    act(() => {
      result.current.createObservation(observationInput)
      result.current.createObservation(observationInput)
    })

    expect(result.current.error).toBe('Ya existe una observación registrada para esta cita.')
  })
})
