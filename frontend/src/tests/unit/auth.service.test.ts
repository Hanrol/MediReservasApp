import { beforeEach, describe, expect, it } from 'vitest'

import { mockUsers } from '../../data/mockUsers'
import { authenticate, createSession } from '../../services/auth.service'
import { saveUsers } from '../../storage/users.storage'
import { getSession } from '../../storage/session.storage'

describe('Autenticación y sesión', () => {
  beforeEach(() => {
    localStorage.clear()
    saveUsers(mockUsers)
  })

  it('CP-008 · RF-03 · autentica un usuario activo sin distinguir mayúsculas del correo', () => {
    const user = authenticate(' PACIENTE@MEDIRESERVAS.CL ', 'Paciente123')

    expect(user?.role).toBe('PATIENT')
    expect(user?.active).toBe(true)
  })

  it('CP-009 · RF-03 · rechaza una contraseña incorrecta', () => {
    expect(authenticate('paciente@medireservas.cl', 'Incorrecta')).toBeUndefined()
  })

  it('CP-010 · RF-03/RF-29 · impide autenticar una cuenta inactiva', () => {
    expect(authenticate('maria.soto@medireservas.cl', 'Medico123')).toBeUndefined()
  })

  it('CP-011 · RF-03 · crea y persiste la sesión del usuario autenticado', () => {
    const user = mockUsers[3]
    const session = createSession(user)

    expect(session.token).not.toBe('')
    expect(getSession()).toEqual(session)
  })
})
