import { beforeEach, describe, expect, it } from 'vitest'

import { mockUsers } from '../../data/mockUsers'
import {
  changeUserRole,
  createUser,
  editUser,
  getUserById,
  isUserDataTaken,
  setUserStatus,
  userExists,
} from '../../services/users.service'
import { saveUsers } from '../../storage/users.storage'
import { validateRoleChange } from '../../constants/roles'

const newUser = {
  run: '12345678-5',
  firstName: 'Camila',
  lastName: 'Torres',
  email: 'camila.torres@example.cl',
  phone: '912345678',
  address: 'Santiago',
  password: 'Paciente123',
}

describe('Gestión de usuarios y roles', () => {
  beforeEach(() => {
    localStorage.clear()
    saveUsers(mockUsers)
  })

  it('CP-012 · RF-07 · crea una cuenta activa con rol paciente', () => {
    const created = createUser(newUser)

    expect(created).toMatchObject({
      userId: 7,
      authUserId: 7,
      role: 'PATIENT',
      active: true,
      email: newUser.email,
    })
    expect(getUserById(created.userId)).toEqual(created)
  })

  it('CP-013 · RF-07 · edita los datos de una cuenta existente', () => {
    const updated = editUser(4, { phone: '987654321', address: 'Puente Alto' })

    expect(updated).toMatchObject({ userId: 4, phone: '987654321', address: 'Puente Alto' })
  })

  it('CP-014 · RF-09 · desactiva una cuenta sin eliminarla', () => {
    expect(setUserStatus(4, false)).toBe(true)
    expect(getUserById(4)).toMatchObject({ userId: 4, active: false })
  })

  it('CP-015 · RF-08 · asigna un rol permitido al usuario', () => {
    expect(changeUserRole(4, 'RECEPTIONIST')).toMatchObject({
      userId: 4,
      role: 'RECEPTIONIST',
    })
  })

  it('CP-016 · RF-08 · rechaza un rol inválido o sin cambios', () => {
    expect(validateRoleChange('PATIENT', 'SUPERVISOR')).toBe('Selecciona un rol válido.')
    expect(validateRoleChange('PATIENT', 'PATIENT')).toBe('Selecciona un rol diferente al actual.')
    expect(validateRoleChange('PATIENT', 'DOCTOR')).toBe('')
  })

  it('CP-017 · RF-07 · detecta RUN y correo ya registrados', () => {
    expect(userExists('44444444-4', 'otro@example.cl')).toBe(true)
    expect(userExists('99999999-9', ' PACIENTE@MEDIRESERVAS.CL ')).toBe(true)
    expect(isUserDataTaken('44444444-4', 'nuevo@example.cl', 4)).toBe(false)
  })
})
