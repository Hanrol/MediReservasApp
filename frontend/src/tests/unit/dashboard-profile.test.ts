import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockAppointments } from '../../data/mockAppointments'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import { getDashboardSummary } from '../../services/dashboard.service'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { saveDoctors } from '../../storage/doctors.storage'
import { saveSpecialties } from '../../storage/specialties.storage'
import { saveUsers } from '../../storage/users.storage'
import { createProfileData } from '../../utils/profile'

describe('Resumen de dashboard y perfil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T12:00:00Z'))
    localStorage.clear()
    appointmentsStorage.saveAll(mockAppointments)
    saveDoctors(mockDoctors)
    saveSpecialties(mockSpecialties)
    saveUsers(mockUsers)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('CP-064 · RF-05 · dashboard de administrador resume usuarios y especialidades', () => {
    expect(getDashboardSummary(mockUsers[0]).map((item) => item.label)).toEqual([
      'Perfiles del sistema',
      'Usuarios activos',
      'Especialidades activas',
    ])
  })

  it('CP-065 · RF-05/RF-19 · dashboard de recepción resume estados de citas', () => {
    expect(getDashboardSummary(mockUsers[1])).toEqual([
      { value: 1, label: 'Citas pendientes' },
      { value: 2, label: 'Citas confirmadas' },
      { value: 1, label: 'Citas canceladas' },
    ])
  })

  it('CP-066 · RF-05/RF-23 · dashboard médico considera solo su agenda', () => {
    const summary = getDashboardSummary(mockUsers[2])

    expect(summary.map((item) => item.label)).toEqual([
      'Atenciones de hoy',
      'Observaciones pendientes',
      'Atenciones completadas',
    ])
  })

  it('CP-067 · RF-05/RF-17 · dashboard paciente considera solo sus citas', () => {
    const summary = getDashboardSummary(mockUsers[3])

    expect(summary).toContainEqual({ value: 1, label: 'Solicitudes pendientes' })
    expect(summary).toContainEqual({ value: 1, label: 'Atenciones realizadas' })
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
})
