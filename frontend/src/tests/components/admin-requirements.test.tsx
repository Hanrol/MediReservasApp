import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import Especialidades from '../../pages/admin/Especialidades'
import Medicos from '../../pages/admin/Medicos'
import Roles from '../../pages/admin/Roles'
import Usuarios from '../../pages/admin/Usuarios'
import { getDoctors } from '../../services/doctors.service'
import { saveDoctors } from '../../storage/doctors.storage'
import { saveSpecialties } from '../../storage/specialties.storage'
import { saveUsers } from '../../storage/users.storage'
import type { User } from '../../types/user'

function renderAsAdmin(page: React.ReactNode) {
  const admin = mockUsers.find((user) => user.role === 'ADMIN') as User
  const authValue = {
    session: {
      token: 'test-token',
      userId: admin.userId,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    },
    user: admin,
    isAuthenticated: true,
    startSession: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
  }

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>{page}</AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Requisitos de administración', () => {
  beforeEach(() => {
    localStorage.clear()
    saveUsers(mockUsers)
    saveDoctors(mockDoctors)
    saveSpecialties(mockSpecialties)
  })

  it('CP-085 · RF-07/RF-09 · crea y luego desactiva una cuenta solicitando confirmación', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Usuarios />)

    await user.click(screen.getByRole('button', { name: '+ Crear usuario' }))
    const createDialog = screen.getByRole('dialog', { name: 'Crear usuario' })
    fireEvent.change(within(createDialog).getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.change(within(createDialog).getByLabelText('Nombre'), { target: { value: 'Camila' } })
    fireEvent.change(within(createDialog).getByLabelText('Apellidos'), { target: { value: 'Torres' } })
    fireEvent.change(within(createDialog).getByLabelText('Correo electrónico'), { target: { value: 'camila.admin-test@example.cl' } })
    fireEvent.change(within(createDialog).getByLabelText('Teléfono'), { target: { value: '912345678' } })
    fireEvent.change(within(createDialog).getByLabelText('Dirección'), { target: { value: 'Santiago Centro' } })
    fireEvent.change(within(createDialog).getByLabelText(/Contraseña temporal/), { target: { value: 'Paciente123' } })
    await user.click(within(createDialog).getByRole('button', { name: 'Guardar usuario' }))

    const createdUserRow = screen.getByRole('row', { name: /Camila Torres/ })
    await user.click(within(createdUserRow).getByRole('button', { name: 'Desactivar' }))
    const statusDialog = screen.getByRole('dialog', { name: 'Desactivar usuario' })
    expect(statusDialog).toHaveTextContent('¿Confirmas que deseas desactivar la cuenta de Camila Torres?')
    await user.click(within(statusDialog).getByRole('button', { name: 'Desactivar cuenta' }))

    expect(screen.getByRole('row', { name: /Camila Torres.*Inactivo/ })).toBeInTheDocument()
  })

  it('CP-086 · RF-08 · asigna un rol disponible y refleja el cambio en la tabla', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Roles />)

    const patientRow = screen.getByRole('row', { name: /Paula Contreras/ })
    await user.click(within(patientRow).getByRole('button', { name: 'Cambiar rol' }))
    const roleDialog = screen.getByRole('dialog', { name: 'Asignar rol' })
    await user.selectOptions(within(roleDialog).getByLabelText('Nuevo rol'), 'RECEPTIONIST')
    await user.click(within(roleDialog).getByRole('button', { name: 'Guardar rol' }))

    const confirmation = screen.getByRole('alertdialog', { name: 'Asignar nuevo rol' })
    await user.click(within(confirmation).getByRole('button', { name: 'Confirmar cambio' }))

    expect(screen.getByRole('row', { name: /Paula Contreras.*Recepcionista/ })).toBeInTheDocument()
  })

  it('CP-087 · RF-11 · valida y crea una especialidad desde el mantenedor', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Especialidades />)

    await user.click(screen.getByRole('button', { name: '+ Crear especialidad' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear especialidad' })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar especialidad' }))
    expect(within(dialog).getByText('El nombre de la especialidad es obligatorio.')).toBeInTheDocument()

    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Geriatría' } })
    fireEvent.change(within(dialog).getByLabelText('Descripción'), { target: { value: 'Atención integral de personas mayores.' } })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar especialidad' }))

    expect(screen.getByRole('row', { name: /Geriatría.*Atención integral/ })).toBeInTheDocument()
  })

  it('CP-088 · RF-14 · permite actualizar los datos de una ficha médica', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Medicos />)

    const doctorRow = screen.getByRole('row', { name: /Daniela Rojas/ })
    await user.click(within(doctorRow).getByRole('button', { name: 'Editar' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar médico' })
    fireEvent.change(within(dialog).getByLabelText('Teléfono'), { target: { value: '987654321' } })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar médico' }))

    expect(getDoctors().find((doctor) => doctor.doctorId === 1)?.phone).toBe('987654321')
  })
})
