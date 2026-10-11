import { beforeEach, describe, expect, it } from 'vitest'

import { appointmentsService } from '../../services/appointments.service'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { schedulesStorage } from '../../storage/schedules.storage'

const newAppointment = {
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

describe('Gestión de citas y horarios', () => {
  beforeEach(() => {
    localStorage.clear()
    appointmentsStorage.reset()
    schedulesStorage.reset()
  })

  it('CP-018 · RF-15 · crea una cita pendiente y ocupa el horario', () => {
    const created = appointmentsService.create(newAppointment)

    expect(created).toMatchObject({ appointmentId: 6, appointmentStatus: 'PENDING' })
    expect(schedulesStorage.getAll().find((schedule) => schedule.id === 3)?.available).toBe(false)
  })

  it('CP-019 · RF-15/RF-16 · rechaza un horario no disponible', () => {
    expect(() => appointmentsService.create({
      ...newAppointment,
      scheduleSlotId: 1,
      date: '2026-10-09',
      time: '09:00',
    })).toThrow('El horario seleccionado ya no está disponible.')
  })

  it('CP-020 · RF-17 · devuelve solamente las citas del paciente solicitado', () => {
    const appointments = appointmentsService.getByPatient(4)

    expect(appointments).not.toHaveLength(0)
    expect(appointments.every((appointment) => appointment.patientUserId === 4)).toBe(true)
  })

  it('CP-021 · RF-18 · cancela una cita pendiente y libera su horario', () => {
    const cancelled = appointmentsService.cancel(2)

    expect(cancelled.appointmentStatus).toBe('CANCELLED')
    expect(schedulesStorage.getAll().find((schedule) => schedule.id === 6)?.available).toBe(true)
  })

  it('CP-022 · RF-18 · impide cancelar una cita completada', () => {
    expect(() => appointmentsService.cancel(4)).toThrow('Solo se pueden cancelar citas pendientes.')
  })

  it('CP-023 · RF-20 · confirma una cita pendiente', () => {
    expect(appointmentsService.confirm(2).appointmentStatus).toBe('CONFIRMED')
  })

  it('CP-024 · RF-21 · reagenda una cita y sincroniza ambos horarios', () => {
    const updated = appointmentsService.reschedule(2, 7)
    const schedules = schedulesStorage.getAll()

    expect(updated).toMatchObject({ scheduleSlotId: 7, date: '2026-10-12', time: '11:30' })
    expect(schedules.find((schedule) => schedule.id === 6)?.available).toBe(true)
    expect(schedules.find((schedule) => schedule.id === 7)?.available).toBe(false)
  })

  it('CP-025 · RF-22 · recepción cancela una cita confirmada', () => {
    const cancelled = appointmentsService.cancelByStaff(1)

    expect(cancelled.appointmentStatus).toBe('CANCELLED')
    expect(schedulesStorage.getAll().find((schedule) => schedule.id === 1)?.available).toBe(true)
  })
})
