import { beforeEach, describe, expect, it } from 'vitest'

import { mockUsers } from '../../data/mockUsers'
import { clinicalService } from '../../services/clinical.service'
import { schedulesService } from '../../services/schedules.service'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { clinicalStorage } from '../../storage/clinical.storage'
import { schedulesStorage } from '../../storage/schedules.storage'
import { saveUsers } from '../../storage/users.storage'
import { validateClinicalForm } from '../../utils/clinicalForm'

const observation = {
  appointmentId: 4,
  patientId: 4,
  doctorId: 3,
  diagnosis: 'Artrosis leve',
  notes: 'Paciente presenta dolor articular recurrente.',
  treatment: 'Reposo relativo y control en cuatro semanas.',
}

describe('Agenda e historial clínico', () => {
  beforeEach(() => {
    localStorage.clear()
    appointmentsStorage.reset()
    schedulesStorage.reset()
    clinicalStorage.reset()
    saveUsers(mockUsers)
  })

  it('CP-035 · RF-23 · muestra solo horarios disponibles del médico y fecha', () => {
    expect(schedulesService.getAvailableTimes(1, '2026-10-13')).toEqual(['14:00', '15:00'])
  })

  it('CP-036 · RF-23 · permite ocupar y liberar un horario médico', () => {
    schedulesService.markUnavailable(1, '2026-10-12', '11:30')
    expect(schedulesService.getById(3)?.available).toBe(false)

    schedulesService.markAvailable(1, '2026-10-12', '11:30')
    expect(schedulesService.getById(3)?.available).toBe(true)
  })

  it('CP-037 · RF-24 · informa campos clínicos obligatorios', () => {
    expect(validateClinicalForm({ diagnosis: '', notes: '', treatment: '' })).toEqual({
      diagnosis: 'Ingrese el diagnóstico clínico.',
      notes: 'Ingrese las observaciones clínicas.',
      treatment: 'Ingrese el tratamiento o las indicaciones.',
    })
  })

  it('CP-038 · RF-24 · registra una observación asociada a cita, paciente y médico', () => {
    const created = clinicalService.create(observation)

    expect(created.id).toMatch(/^observation-/)
    expect(clinicalService.getByAppointment(4)).toContainEqual(created)
    expect(clinicalService.getByPatient(4)).toContainEqual(created)
    expect(clinicalService.getByDoctor(3)).toContainEqual(created)
  })

  it('CP-039 · RF-24 · impide duplicar la observación de una cita', () => {
    clinicalService.create(observation)

    expect(() => clinicalService.create(observation)).toThrow(
      'Ya existe una observación registrada para esta cita.',
    )
  })

  it('CP-040 · RF-25 · construye el historial con datos de atención y paciente', () => {
    clinicalService.create(observation)

    expect(clinicalService.getConsultations({ patientId: 4 })).toEqual([
      expect.objectContaining({
        patientName: 'Paula Contreras',
        patientRun: '44444444-4',
        doctorName: 'María Soto',
        diagnosis: observation.diagnosis,
      }),
    ])
  })
})
