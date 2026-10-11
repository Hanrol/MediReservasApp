import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import AccesoDenegado from '../../pages/shared/AccesoDenegado'
import Dashboard from '../../pages/shared/Dashboard'
import HistorialClinico from '../../pages/shared/HistorialClinico'
import Perfil from '../../pages/shared/Perfil'
import { clinicalService } from '../../services/clinical.service'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { clinicalStorage } from '../../storage/clinical.storage'
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
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

function seedClinicalObservation() {
  clinicalService.create({
    appointmentId: 1,
    patientId: 4,
    doctorId: 1,
    diagnosis: 'Migraña',
    notes: 'Cefalea recurrente informada por la paciente.',
    treatment: 'Control en cuatro semanas.',
  })
}

describe('Requisitos de páginas compartidas', () => {
  beforeEach(() => {
    localStorage.clear()
    appointmentsStorage.reset()
    schedulesStorage.reset()
    clinicalStorage.reset()
    saveUsers(mockUsers)
    saveDoctors(mockDoctors)
    saveSpecialties(mockSpecialties)
  })

  it('CP-089 · RF-05 · dashboard muestra accesos según el rol administrador', () => {
    const admin = mockUsers.find((user) => user.role === 'ADMIN')!
    renderAs(admin, <Dashboard />)

    expect(screen.getByRole('heading', { name: `Hola, ${admin.firstName}` })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Gestionar usuarios/ }).some((link) => link.getAttribute('href') === '/usuarios')).toBe(true)
    expect(screen.getAllByRole('link', { name: /Roles y permisos/ }).some((link) => link.getAttribute('href') === '/roles')).toBe(true)
    expect(screen.getByText('Usuarios activos')).toBeInTheDocument()
  })

  it('CP-090 · RF-06 · perfil presenta los datos principales de la sesión actual', () => {
    const patient = mockUsers.find((user) => user.role === 'PATIENT')!
    renderAs(patient, <Perfil />)

    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByText(patient.email)).toBeInTheDocument()
    expect(screen.getByText(patient.run)).toBeInTheDocument()
    expect(screen.getByText('Estado de la cuenta')).toBeInTheDocument()
  })

  it('CP-091 · RF-25 · paciente consulta sus datos y observaciones clínicas', () => {
    seedClinicalObservation()
    const patient = mockUsers.find((user) => user.role === 'PATIENT')!
    renderAs(patient, <HistorialClinico />)

    expect(screen.getByText('Datos del paciente')).toBeInTheDocument()
    expect(screen.getAllByText('Paula Contreras')).toHaveLength(2)
    expect(screen.getByText('Migraña')).toBeInTheDocument()
    expect(screen.getByText('Cefalea recurrente informada por la paciente.')).toBeInTheDocument()
  })

  it('CP-092 · RF-25 · médico consulta las atenciones relacionadas con su agenda', () => {
    seedClinicalObservation()
    const doctor = mockUsers.find((user) => user.role === 'DOCTOR')!
    renderAs(doctor, <HistorialClinico />)

    expect(screen.getByRole('heading', { name: 'Historial clínico' })).toBeInTheDocument()
    expect(screen.getByText('Paula Contreras (44444444-4)')).toBeInTheDocument()
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
