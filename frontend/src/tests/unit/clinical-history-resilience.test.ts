import { describe, expect, it, vi } from 'vitest'

import { apiRequest } from '../../services/api-client'
import { getPatientAppointments } from '../../services/patient-appointments.service'
import { getPatientClinicalHistory } from '../../services/patient-clinical-history.service'
import { getDoctorAppointments, getDoctorClinicalHistory } from '../../services/doctor-workflow.service'

vi.mock('../../services/api-client', () => ({ apiRequest: vi.fn() }))
vi.mock('../../services/patient-appointments.service', () => ({ getPatientAppointments: vi.fn() }))
vi.mock('../../services/doctor-workflow.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/doctor-workflow.service')>()
  return { ...actual, getDoctorAppointments: vi.fn() }
})

describe('tolerancia a fallos en enriquecimiento de historial clínico', () => {
  it('muestra el historial del paciente aunque falle la consulta de citas', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      code: 200,
      message: 'ok',
      data: [{
        medicalVisitId: 7,
        appointmentId: 9,
        doctorId: 3,
        visitDate: '2026-10-10',
        visitReason: 'Control',
        observations: '',
        treatment: '',
        diagnoses: [],
      }],
    })
    vi.mocked(getPatientAppointments).mockRejectedValueOnce(new Error('appointments offline'))

    const history = await getPatientClinicalHistory('token', 4, 'Paciente Test', '12345678-9')

    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      doctorName: 'Médico no disponible',
      specialtyName: 'Especialidad no disponible',
      reason: 'Control',
    })
  })

  it('muestra el historial del médico aunque fallen citas y especialidades', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      code: 200,
      message: 'ok',
      data: [{
        medicalRecordId: 1,
        patientUserId: 4,
        visits: [{
          medicalVisitId: 7,
          appointmentId: 9,
          doctorId: 3,
          visitDate: '2026-10-10',
          visitReason: 'Control',
          observations: '',
          treatment: '',
          createdAt: '2026-10-10',
          diagnoses: [],
        }],
      }],
    })
    vi.mocked(getDoctorAppointments).mockRejectedValueOnce(new Error('catalog offline'))

    const history = await getDoctorClinicalHistory('token', 'Doctora Test')

    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      patientName: 'Paciente no disponible',
      specialtyName: 'Especialidad no disponible',
      reason: 'Control',
    })
  })
})
