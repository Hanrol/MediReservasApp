import { describe, expect, it } from 'vitest'

import type { Doctor } from '../../types/doctor'
import { validateAppointmentForm } from '../../utils/appointmentForm'
import {
  validateContact,
  validateLogin,
  validateRegistration,
} from '../../utils/validations'

const validRegistration = {
  run: '18265432-9',
  firstName: 'María',
  lastName: 'Soto',
  birthDate: '1990-05-10',
  phone: '912345678',
  address: 'Avenida Vicuña Mackenna 4917',
  email: 'maria@example.cl',
  password: 'Paciente123',
  passwordConfirmation: 'Paciente123',
  terms: true,
}

const doctor: Doctor = {
  doctorId: 1,
  userId: 3,
  run: '33333333-3',
  firstName: 'Daniela',
  lastName: 'Rojas',
  email: 'medico@medireservas.cl',
  phone: '912345678',
  medicalLicenseNumber: 'RUM-12345',
  specialtyIds: [1],
  admissionDate: '2024-01-01',
  active: true,
}

describe('Validaciones de formularios', () => {
  it('CP-001 · RF-02 · acepta un registro de paciente válido', () => {
    expect(validateRegistration(validRegistration)).toEqual({})
  })

  it('CP-002 · RF-02/RNF-02/RNF-07 · informa los datos inválidos del registro', () => {
    const errors = validateRegistration({
      ...validRegistration,
      run: '12345678-9',
      firstName: 'María123',
      email: 'correo-invalido',
      password: '123',
      passwordConfirmation: '456',
      terms: false,
    })

    expect(errors).toMatchObject({
      run: 'Ingresa un RUN chileno válido.',
      firstName: 'El nombre contiene caracteres no permitidos.',
      email: 'Ingresa un correo electrónico válido.',
      password: 'La contraseña debe tener entre 6 y 100 caracteres.',
      passwordConfirmation: 'Las contraseñas no coinciden.',
      terms: 'Debes aceptar los términos para continuar.',
    })
  })

  it('CP-003 · RF-03 · exige credenciales para iniciar sesión', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'El correo electrónico es obligatorio.',
      password: 'La contraseña es obligatoria.',
    })
  })

  it('CP-004 · RF-03 · acepta credenciales con formato válido', () => {
    expect(validateLogin({ email: 'paciente@medireservas.cl', password: 'Paciente123' })).toEqual({})
  })

  it('CP-005 · RF-27 · valida campos y correo del formulario de contacto', () => {
    expect(validateContact({ nombre: '', correo: 'correo-invalido', asunto: '', mensaje: '' })).toEqual({
      nombre: 'El nombre es obligatorio.',
      correo: 'Ingresa un correo electrónico válido.',
      asunto: 'El asunto es obligatorio.',
      mensaje: 'El mensaje es obligatorio.',
    })
  })

  it('CP-006 · RF-15/RF-16 · rechaza una solicitud de cita incompleta', () => {
    const errors = validateAppointmentForm(
      { specialtyId: '', doctorId: '', date: '', time: '', reason: '', modality: '' },
      undefined,
      [],
      '2026-10-11',
    )

    expect(errors).toEqual({
      specialtyId: 'Seleccione una especialidad.',
      doctorId: 'Seleccione un médico.',
      date: 'Seleccione una fecha.',
      time: 'Seleccione una hora disponible.',
      reason: 'Ingrese el motivo de la consulta.',
      modality: 'Seleccione una modalidad.',
    })
  })

  it('CP-007 · RF-15/RF-16 · acepta una solicitud de cita coherente', () => {
    const errors = validateAppointmentForm(
      {
        specialtyId: '1',
        doctorId: '1',
        date: '2026-10-12',
        time: '09:30',
        reason: 'Control cardiológico',
        modality: 'presencial',
      },
      doctor,
      ['09:30'],
      '2026-10-11',
    )

    expect(errors).toEqual({})
  })
})
