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
import { getUsers } from '../../services/users.service'
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

    const inactiveUserRow = screen.getByRole('row', { name: /Camila Torres.*Inactivo/ })
    expect(inactiveUserRow).toBeInTheDocument()
    await user.click(within(inactiveUserRow).getByRole('button', { name: 'Editar' }))
    const editDialog = screen.getByRole('dialog', { name: 'Editar usuario' })
    fireEvent.change(within(editDialog).getByLabelText('Teléfono'), { target: { value: '998765432' } })
    expect(within(editDialog).getByLabelText(/Contraseña temporal/)).toHaveValue('')
    await user.click(within(editDialog).getByRole('button', { name: 'Guardar usuario' }))

    expect(getUsers().find((item) => item.email === 'camila.admin-test@example.cl')).toMatchObject({
      phone: '998765432',
      active: false,
    })
    const editedUserRow = screen.getByRole('row', { name: /Camila Torres.*Inactivo/ })
    await user.click(within(editedUserRow).getByRole('button', { name: 'Activar' }))
    const activateDialog = screen.getByRole('dialog', { name: 'Activar usuario' })
    await user.click(within(activateDialog).getByRole('button', { name: 'Cancelar' }))
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
    fireEvent.click(within(dialog).getByRole('checkbox'))
    fireEvent.click(within(dialog).getByRole('checkbox'))

    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Geriatría' } })
    fireEvent.change(within(dialog).getByLabelText('Descripción'), { target: { value: 'Atención integral de personas mayores.' } })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar especialidad' }))

    expect(screen.getByRole('row', { name: /Geriatría.*Atención integral/ })).toBeInTheDocument()

    const createdRow = screen.getByRole('row', { name: /Geriatría.*Atención integral/ })
    await user.click(within(createdRow).getByRole('button', { name: 'Editar' }))
    const editDialog = screen.getByRole('dialog', { name: 'Editar especialidad' })
    fireEvent.change(within(editDialog).getByLabelText('Descripción'), { target: { value: 'Atención geriátrica integral.' } })
    await user.click(within(editDialog).getByRole('button', { name: 'Guardar especialidad' }))
    expect(screen.getByRole('row', { name: /Geriatría.*Atención geriátrica integral/ })).toBeInTheDocument()

    const updatedRow = screen.getByRole('row', { name: /Geriatría.*Atención geriátrica integral/ })
    await user.click(within(updatedRow).getByRole('button', { name: 'Desactivar' }))
    const statusDialog = screen.getByRole('dialog', { name: 'Desactivar especialidad' })
    await user.click(within(statusDialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('row', { name: /Geriatría.*Atención geriátrica integral.*Activa/ })).toBeInTheDocument()
    const activeRow = screen.getByRole('row', { name: /Geriatría.*Atención geriátrica integral.*Activa/ })
    await user.click(within(activeRow).getByRole('button', { name: 'Desactivar' }))
    const confirmStatusDialog = screen.getByRole('dialog', { name: 'Desactivar especialidad' })
    await user.click(within(confirmStatusDialog).getByRole('button', { name: 'Desactivar especialidad' }))
    expect(screen.getByRole('row', { name: /Geriatría.*Inactiva/ })).toBeInTheDocument()
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

  it('CP-102 · RF-14 · crea un médico asociado a una cuenta médica activa', async () => {
    const user = userEvent.setup()
    const additionalDoctor: User = {
      userId: 7,
      authUserId: 7,
      run: '12345678-5',
      firstName: 'Felipe',
      lastName: 'Navarro',
      email: 'felipe.navarro@medireservas.cl',
      password: 'Doctor123',
      role: 'DOCTOR',
      active: true,
      phone: '912345678',
      address: 'Santiago',
    }
    saveUsers([...mockUsers, additionalDoctor])
    renderAsAdmin(<Medicos />)

    const search = screen.getByLabelText('Buscar médico')
    await user.type(search, 'María')
    expect(screen.getByRole('row', { name: /María Soto/ })).toBeInTheDocument()
    await user.clear(search)
    await user.selectOptions(screen.getByLabelText('Estado'), 'inactive')
    expect(screen.getByRole('row', { name: /María Soto/ })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Estado'), 'all')

    await user.click(screen.getByRole('button', { name: '+ Crear médico' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear médico' })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar médico' }))
    expect(within(dialog).getByText('Selecciona un usuario médico.')).toBeInTheDocument()
    await user.selectOptions(within(dialog).getByLabelText('Usuario asociado'), '7')
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Felipe' } })
    fireEvent.change(within(dialog).getByLabelText('Apellido'), { target: { value: 'Navarro' } })
    fireEvent.change(within(dialog).getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.blur(within(dialog).getByLabelText('RUN'))
    fireEvent.change(within(dialog).getByLabelText('Correo electrónico'), { target: { value: 'felipe.navarro@medireservas.cl' } })
    fireEvent.change(within(dialog).getByLabelText('Teléfono'), { target: { value: '912345678' } })
    fireEvent.change(within(dialog).getByLabelText('N° registro médico'), { target: { value: 'RUM-99999' } })
    await user.selectOptions(within(dialog).getByLabelText(/Especialidad principal/), '1')
    fireEvent.change(within(dialog).getByLabelText(/Fecha de ingreso/), { target: { value: '2024-01-15' } })
    fireEvent.blur(within(dialog).getByLabelText(/Fecha de ingreso/))
    await user.selectOptions(within(dialog).getByLabelText('Especialidades adicionales'), ['5'])
    await user.click(within(dialog).getByLabelText('Médico activo'))
    await user.click(within(dialog).getByLabelText('Médico activo'))
    await user.click(within(dialog).getByRole('button', { name: 'Guardar médico' }))

    expect(getDoctors()).toHaveLength(4)
    const createdDoctorRow = screen.getByRole('row', { name: /Felipe Navarro/ })
    expect(createdDoctorRow).toBeInTheDocument()
    await user.click(within(createdDoctorRow).getByRole('button', { name: 'Desactivar' }))
    const statusDialog = screen.getByRole('dialog', { name: 'Desactivar médico' })
    await user.click(within(statusDialog).getByRole('button', { name: 'Desactivar médico' }))
    expect(getDoctors().find((doctor) => doctor.email === 'felipe.navarro@medireservas.cl')?.active).toBe(false)
  })

  it('CP-110 · RF-11 · no crea una especialidad con un nombre ya registrado', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Especialidades />)

    await user.click(screen.getByRole('button', { name: '+ Crear especialidad' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear especialidad' })
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Cardiología' } })
    fireEvent.change(within(dialog).getByLabelText('Descripción'), { target: { value: 'Especialidad duplicada.' } })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar especialidad' }))

    expect(within(dialog).getByText('Ya existe una especialidad con ese nombre.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar formulario' }))
    await user.click(screen.getByRole('button', { name: '+ Crear especialidad' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Crear especialidad' })).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog', { name: 'Crear especialidad' })).not.toBeInTheDocument()
  })

  it('CP-117 · RF-07/RF-09 · usuarios filtra por texto y estado', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Usuarios />)

    const search = screen.getByLabelText('Buscar usuario')
    await user.type(search, 'Paula')
    expect(screen.getByRole('row', { name: /Paula Contreras/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Andrea Muñoz/ })).not.toBeInTheDocument()
    fireEvent.submit(screen.getByRole('search'))
    await user.clear(search)
    await user.selectOptions(screen.getByLabelText('Estado'), 'inactive')
    expect(screen.getByRole('row', { name: /María Soto.*Inactivo/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Paula Contreras/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Crear usuario' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear usuario' })
    fireEvent.click(within(dialog).getByRole('button', { name: '×' }))
    expect(screen.queryByRole('dialog', { name: 'Crear usuario' })).not.toBeInTheDocument()
  })

  it('CP-118 · RF-07/RNF-07 · usuarios rechaza un RUN o correo duplicado', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Usuarios />)

    await user.click(screen.getByRole('button', { name: '+ Crear usuario' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear usuario' })
    fireEvent.change(within(dialog).getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Camila' } })
    fireEvent.change(within(dialog).getByLabelText('Apellidos'), { target: { value: 'Duplicada' } })
    fireEvent.change(within(dialog).getByLabelText('Correo electrónico'), { target: { value: 'paciente@medireservas.cl' } })
    fireEvent.change(within(dialog).getByLabelText(/Contraseña temporal/), { target: { value: 'Paciente123' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar usuario' }))

    expect(within(dialog).getByText('El RUN o correo ya está asociado a otra cuenta.')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog', { name: 'Crear usuario' })).not.toBeInTheDocument()
  })

  it('CP-119 · RF-14/RNF-07 · médicos rechaza un RUN o registro duplicado', async () => {
    const user = userEvent.setup()
    renderAsAdmin(<Medicos />)

    await user.click(screen.getByRole('button', { name: '+ Crear médico' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear médico' })
    await user.selectOptions(within(dialog).getByLabelText('Usuario asociado'), '3')
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Daniela' } })
    fireEvent.change(within(dialog).getByLabelText('Apellido'), { target: { value: 'Rojas' } })
    fireEvent.change(within(dialog).getByLabelText('RUN'), { target: { value: '33333333-3' } })
    fireEvent.change(within(dialog).getByLabelText('Correo electrónico'), { target: { value: 'daniela.duplicada@example.cl' } })
    fireEvent.change(within(dialog).getByLabelText('Teléfono'), { target: { value: '912345678' } })
    fireEvent.change(within(dialog).getByLabelText('N° registro médico'), { target: { value: 'RUM-12345' } })
    await user.selectOptions(within(dialog).getByLabelText(/Especialidad principal/), '1')
    fireEvent.change(within(dialog).getByLabelText(/Fecha de ingreso/), { target: { value: '2024-01-15' } })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar médico' }))

    expect(within(dialog).getByText('El RUN o N° de registro ya está asociado a otro médico.')).toBeInTheDocument()
  })
})
