import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import AccesoDenegado from '../../pages/shared/AccesoDenegado'
import Dashboard from '../../pages/shared/Dashboard'
import HistorialClinico from '../../pages/shared/HistorialClinico'
import Perfil from '../../pages/shared/Perfil'
import * as doctorWorkflow from '../../services/doctor-workflow.service'
import * as patientClinicalHistory from '../../services/patient-clinical-history.service'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { schedulesStorage } from '../../storage/schedules.storage'
import { saveDoctors } from '../../storage/doctors.storage'
import { saveSpecialties } from '../../storage/specialties.storage'
import { saveUsers } from '../../storage/users.storage'
import type { User } from '../../types/user'

function renderAs(user: User, page: React.ReactNode, logout = vi.fn()) {
  const authValue = {
    session: {
      token: 'test-token',
      userId: user.userId,
      authUserId: user.authUserId,
      run: user.run,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      active: user.active,
    },
    user,
    isAuthenticated: true,
    startSession: vi.fn(),
    logout,
    refreshSession: vi.fn(),
  }

  return {
    logout,
    ...render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>{page}</AuthContext.Provider>
      </MemoryRouter>,
    ),
  }
}

describe('Requisitos de páginas compartidas', () => {
  afterEach(() => vi.unstubAllGlobals())
  beforeEach(() => {
    localStorage.clear()
    appointmentsStorage.reset()
    schedulesStorage.reset()
    saveUsers(mockUsers)
    saveDoctors(mockDoctors)
    saveSpecialties(mockSpecialties)
  })

  it('CP-089 · RF-05 · dashboard muestra accesos según el rol administrador', async () => {
    const admin = mockUsers.find((user) => user.role === 'ADMIN')!
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const path = String(input)
      const data = path.endsWith('/auth/users')
          ? { code: 200, message: 'ok', data: mockUsers.map(({ authUserId, email, active, role }) => ({ authUserId, email, enabled: active, roles: [role] })) }
          : path.endsWith('/users')
            ? { code: 200, message: 'ok', data: mockUsers.map(({ userId, authUserId, run, email, active }) => ({ userId, authUserId, run, email, active })) }
          : path.endsWith('/user-profiles')
            ? { code: 200, message: 'ok', data: mockUsers.map(({ userId, firstName, lastName }) => ({ userProfileId: userId, userId, firstName, lastName })) }
            : { code: 200, message: 'ok', data: mockSpecialties }
      return Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    }))
    renderAs(admin, <Dashboard />)

    expect(screen.getByRole('heading', { name: `Hola, ${admin.firstName}` })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Gestionar usuarios/ }).some((link) => link.getAttribute('href') === '/usuarios')).toBe(true)
    expect(screen.getAllByRole('link', { name: /Roles y permisos/ }).some((link) => link.getAttribute('href') === '/roles')).toBe(true)
    expect(await screen.findByText('Usuarios activos')).toBeInTheDocument()
  })

  it('CP-090 · RF-06 · perfil presenta los datos principales de la sesión actual', () => {
    const patient = mockUsers.find((user) => user.role === 'PATIENT')!
    renderAs(patient, <Perfil />)

    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByText(patient.email)).toBeInTheDocument()
    expect(screen.getByText(patient.run)).toBeInTheDocument()
    expect(screen.getByText('Estado de la cuenta')).toBeInTheDocument()
  })

  it('CP-091 · RF-25 · paciente consulta sus datos y observaciones clínicas desde la API', async () => {
    const patient = mockUsers.find((user) => user.role === 'PATIENT')!
    vi.spyOn(patientClinicalHistory, 'getPatientClinicalHistory').mockResolvedValue([{
      id: '15',
      patientName: 'Paula Contreras',
      patientRun: patient.run,
      doctorName: 'Daniela Rojas',
      specialtyName: 'Cardiología',
      date: '2026-10-11',
      reason: 'Control preventivo',
      diagnosis: 'Migraña',
      observations: 'Cefalea recurrente informada por la paciente.',
      treatment: 'Control en cuatro semanas.',
    }])
    renderAs(patient, <HistorialClinico />)

    expect(screen.getByText('Datos del paciente')).toBeInTheDocument()
    expect(screen.getAllByText('Paula Contreras')).toHaveLength(2)
    expect(await screen.findByText('Migraña')).toBeInTheDocument()
    expect(screen.getByText('Cefalea recurrente informada por la paciente.')).toBeInTheDocument()
    expect(patientClinicalHistory.getPatientClinicalHistory).toHaveBeenCalledWith(
      'test-token', patient.userId, 'Paula Contreras', patient.run,
    )
  })

  it('CP-092 · RF-25 · médico consulta las atenciones relacionadas con su agenda', async () => {
    vi.spyOn(doctorWorkflow, 'getDoctorClinicalHistory').mockResolvedValue([{
      id: '10',
      patientName: 'Paula Contreras',
      patientRun: '12345678-5',
      doctorName: 'Daniela Rojas',
      specialtyName: 'Cardiología',
      date: '2026-10-11',
      reason: 'Control preventivo',
      diagnosis: 'Migraña',
      observations: 'Cefalea recurrente informada por la paciente.',
      treatment: 'Control en cuatro semanas.',
    }])
    const doctor = mockUsers.find((user) => user.role === 'DOCTOR')!
    renderAs(doctor, <HistorialClinico />)

    expect(screen.getByRole('heading', { name: 'Historial clínico' })).toBeInTheDocument()
    expect(await screen.findByText('Paula Contreras')).toBeInTheDocument()
    expect(screen.getByText('12345678-5')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Consulta de Cardiología' })).toBeInTheDocument()
    expect(screen.getByText('Migraña')).toBeInTheDocument()
    expect(screen.queryByText('Datos del paciente')).not.toBeInTheDocument()
  })

  it('CP-093 · RF-29 · acceso denegado ofrece volver al panel o cerrar sesión', async () => {
    const user = userEvent.setup()
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    const { logout } = renderAs(patient, <AccesoDenegado />)

    expect(screen.getByRole('heading', { name: 'No tienes permiso para ingresar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al panel' })).toHaveAttribute('href', '/dashboard')
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(logout).toHaveBeenCalledOnce()
  })
})
