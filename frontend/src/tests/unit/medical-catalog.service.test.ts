import { beforeEach, describe, expect, it } from 'vitest'

import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import {
  createDoctor,
  editDoctor,
  getDoctorForUser,
  getDoctors,
  isDoctorDataTaken,
  setDoctorStatus,
} from '../../services/doctors.service'
import {
  createSpecialty,
  editSpecialty,
  getSpecialties,
  isSpecialtyNameTaken,
  setSpecialtyStatus,
} from '../../services/specialties.service'
import { saveDoctors } from '../../storage/doctors.storage'
import { saveSpecialties } from '../../storage/specialties.storage'

describe('Catálogo y administración médica', () => {
  beforeEach(() => {
    localStorage.clear()
    saveDoctors(mockDoctors)
    saveSpecialties(mockSpecialties)
  })

  it('CP-026 · RF-12 · consulta médicos con sus especialidades asociadas', () => {
    expect(getDoctors()).toHaveLength(mockDoctors.length)
    expect(getDoctors()[0]).toMatchObject({
      firstName: 'Daniela',
      specialtyIds: [1, 5],
    })
  })

  it('CP-027 · RF-23 · relaciona la cuenta autenticada con su ficha médica para filtrar la agenda', () => {
    expect(getDoctorForUser(mockUsers[2])).toMatchObject({ doctorId: 1, userId: 3 })
    expect(getDoctorForUser(null)).toBeNull()
  })

  it('CP-028 · RF-14 · crea un médico con identificador consecutivo', () => {
    const created = createDoctor({
      ...mockDoctors[0],
      doctorId: 0,
      userId: 7,
      run: '12345678-5',
      email: 'nuevo.medico@medireservas.cl',
      medicalLicenseNumber: 'RUM-99999',
    })

    expect(created.doctorId).toBe(4)
    expect(getDoctors()).toContainEqual(created)
  })

  it('CP-029 · RF-14 · edita y desactiva una ficha médica', () => {
    expect(editDoctor(1, { ...mockDoctors[0], phone: '987654321' })).toMatchObject({
      doctorId: 1,
      phone: '987654321',
    })
    expect(setDoctorStatus(1, false)).toBe(true)
    expect(getDoctors().find((doctor) => doctor.doctorId === 1)?.active).toBe(false)
  })

  it('CP-030 · RF-14 · detecta RUN o registro médico duplicado', () => {
    expect(isDoctorDataTaken('33333333-3', 'RUM-NUEVO')).toBe(true)
    expect(isDoctorDataTaken('99999999-9', ' rum-12345 ')).toBe(true)
    expect(isDoctorDataTaken('33333333-3', 'RUM-12345', 1)).toBe(false)
  })

  it('CP-031 · RF-10 · consulta el catálogo de especialidades', () => {
    expect(getSpecialties()).toHaveLength(mockSpecialties.length)
    expect(getSpecialties()[0]?.specialtyName).toBe('Cardiología')
  })

  it('CP-032 · RF-11 · crea una especialidad con identificador consecutivo', () => {
    const created = createSpecialty({
      specialtyId: 0,
      specialtyName: 'Geriatría',
      description: 'Atención integral de personas mayores.',
      active: true,
    })

    expect(created.specialtyId).toBe(7)
    expect(getSpecialties()).toContainEqual(created)
  })

  it('CP-033 · RF-11 · edita y desactiva una especialidad', () => {
    expect(editSpecialty(1, {
      specialtyName: 'Cardiología adulta',
      description: mockSpecialties[0].description,
      active: true,
    })).toMatchObject({ specialtyId: 1, specialtyName: 'Cardiología adulta' })
    expect(setSpecialtyStatus(1, false)).toBe(true)
    expect(getSpecialties().find((specialty) => specialty.specialtyId === 1)?.active).toBe(false)
  })

  it('CP-034 · RF-11 · detecta nombres de especialidad duplicados', () => {
    expect(isSpecialtyNameTaken(' cardiología ')).toBe(true)
    expect(isSpecialtyNameTaken('Cardiología', 1)).toBe(false)
  })
})
