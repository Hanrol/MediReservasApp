import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockUsers } from '../../data/mockUsers'
import { getDashboardSummary } from '../../services/dashboard.service'
import { getReceptionData } from '../../services/reception-api.service'
import { getDoctorAppointments } from '../../services/doctor-workflow.service'
import { getPatientAppointments } from '../../services/patient-appointments.service'
import type { Appointment } from '../../types/appointment'
import { createProfileData } from '../../utils/profile'

vi.mock('../../services/reception-api.service', () => ({ getReceptionData: vi.fn() }))
vi.mock('../../services/doctor-workflow.service', () => ({ getDoctorAppointments: vi.fn() }))
vi.mock('../../services/patient-appointments.service', () => ({ getPatientAppointments: vi.fn() }))

describe('Resumen de dashboard y perfil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 11, 12, 0, 0))
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const appointments: Appointment[] = [
    { appointmentId: 1, patientUserId: 4, patientName: '', doctorId: 1, doctorName: '', specialtyId: 1, specialtyName: '', scheduleSlotId: 1, date: '2026-10-11', time: '09:00', reason: '', appointmentStatus: 'PENDING' },
    { appointmentId: 2, patientUserId: 4, patientName: '', doctorId: 1, doctorName: '', specialtyId: 1, specialtyName: '', scheduleSlotId: 2, date: '2026-10-11', time: '10:00', reason: '', appointmentStatus: 'CONFIRMED' },
    { appointmentId: 3, patientUserId: 5, patientName: '', doctorId: 1, doctorName: '', specialtyId: 1, specialtyName: '', scheduleSlotId: 3, date: '2026-10-12', time: '11:00', reason: '', appointmentStatus: 'CANCELLED' },
    { appointmentId: 4, patientUserId: 4, patientName: '', doctorId: 2, doctorName: '', specialtyId: 1, specialtyName: '', scheduleSlotId: 4, date: '2026-10-10', time: '12:00', reason: '', appointmentStatus: 'COMPLETED' },
  ]

  it('CP-065 · RF-05/RF-19 · recepción obtiene los estados de citas desde su API', async () => {
    vi.mocked(getReceptionData).mockResolvedValue({ appointments, schedules: [], patientRunById: new Map() })
    await expect(getDashboardSummary('token', mockUsers[1])).resolves.toEqual([
      { value: 1, label: 'Citas pendientes' },
      { value: 1, label: 'Citas confirmadas' },
      { value: 1, label: 'Citas canceladas' },
    ])
    expect(getReceptionData).toHaveBeenCalledWith('token')
  })

  it('CP-066 · RF-05/RF-23 · médico resume solo las citas devueltas por su agenda', async () => {
    vi.mocked(getDoctorAppointments).mockResolvedValue({ doctor: { doctorId: 1, userId: 3, medicalLicenseNumber: '', active: true, specialtyIds: [] }, appointments })
    const summary = await getDashboardSummary('token', mockUsers[2])

    expect(summary[0].value).toBe(2)
    expect(summary.map((item) => item.label)).toEqual([
      'Atenciones de hoy',
      'Observaciones pendientes',
      'Atenciones completadas',
    ])
    expect(getDoctorAppointments).toHaveBeenCalledWith('token', 'Daniela Rojas')
  })

  it('CP-067 · RF-05/RF-17 · paciente solicita sus citas al API propio', async () => {
    vi.mocked(getPatientAppointments).mockResolvedValue(appointments.filter((item) => item.patientUserId === mockUsers[3].userId))
    const summary = await getDashboardSummary('token', mockUsers[3])

    expect(summary).toContainEqual({ value: 2, label: 'Próximas citas' })
    expect(summary).toContainEqual({ value: 1, label: 'Solicitudes pendientes' })
    expect(summary).toContainEqual({ value: 1, label: 'Atenciones realizadas' })
    expect(getPatientAppointments).toHaveBeenCalledWith('token', mockUsers[3].userId)
  })

  it('CP-068 · RF-06 · perfil presenta los datos principales del usuario', () => {
    expect(createProfileData(mockUsers[3], 'Paciente')).toMatchObject({
      initials: 'PC',
      fullName: 'Paula Contreras',
      role: 'Paciente',
      email: 'paciente@medireservas.cl',
      status: 'Activa',
    })
  })

  it('CP-069 · RF-06 · perfil reemplaza datos opcionales ausentes', () => {
    expect(createProfileData({ ...mockUsers[3], phone: '', address: '', birthDate: undefined }, '')).toMatchObject({
      role: 'Usuario',
      phone: 'Sin información',
      birthDate: 'Sin información',
      address: 'Sin información',
    })
  })

  it('CP-124 · RF-06 · perfil formatea la fecha de nacimiento disponible', () => {
    expect(createProfileData({ ...mockUsers[3], birthDate: '1990-05-10' }, 'Paciente')).toMatchObject({
      birthDate: '10 de mayo de 1990',
    })
  })
})
