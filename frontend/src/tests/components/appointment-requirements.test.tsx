import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import Agenda from '../../pages/medico/Agenda'
import GestionCitas from '../../pages/recepcion/GestionCitas'
import MedicosEspecialidades from '../../pages/public/MedicosEspecialidades'
import MisCitas from '../../pages/paciente/MisCitas'
import ObservacionClinica from '../../pages/medico/ObservacionClinica'
import SolicitarCita from '../../pages/paciente/SolicitarCita'
import { appointmentsStorage } from '../../storage/appointments.storage'
import { clinicalStorage } from '../../storage/clinical.storage'
import { schedulesStorage } from '../../storage/schedules.storage'
import { saveDoctors } from '../../storage/doctors.storage'
import { saveSpecialties } from '../../storage/specialties.storage'
import { saveUsers } from '../../storage/users.storage'
import type { User } from '../../types/user'

function renderAs(user: User, page: React.ReactNode, initialPath = '/') {
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
    logout: vi.fn(),
    refreshSession: vi.fn(),
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={authValue}>{page}</AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Requisitos de citas en las pantallas por rol', () => {
  beforeEach(() => {
    localStorage.clear()
    appointmentsStorage.reset()
    clinicalStorage.reset()
    schedulesStorage.reset()
    saveUsers(mockUsers)
    saveDoctors(mockDoctors)
    saveSpecialties(mockSpecialties)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('CP-071 · RF-18 · permite al paciente cancelar una cita confirmada', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!

    renderAs(patient, <MisCitas />)

    const appointmentCard = screen.getByText('Control general').closest('article')!
    await user.click(within(appointmentCard).getByRole('button', { name: 'Cancelar cita' }))

    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 1)?.appointmentStatus).toBe('CANCELLED')
    expect(schedulesStorage.getAll().find((item) => item.id === 1)?.available).toBe(true)
  })

  it('CP-072 · RF-19 · recepción ve el motivo de cada solicitud', () => {
    const receptionist = mockUsers.find((item) => item.role === 'RECEPTIONIST')!

    renderAs(receptionist, <GestionCitas />)

    expect(screen.getByRole('columnheader', { name: 'Motivo' })).toBeInTheDocument()
    expect(screen.getByText('Control general')).toBeInTheDocument()
  })

  it('CP-073 · RF-19 · recepción filtra las solicitudes por estado y fecha', async () => {
    const receptionist = mockUsers.find((item) => item.role === 'RECEPTIONIST')!
    const user = userEvent.setup()

    renderAs(receptionist, <GestionCitas />)

    await user.selectOptions(screen.getByLabelText('Estado'), 'PENDING')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-10' } })

    expect(screen.getByText('Control preventivo')).toBeInTheDocument()
    expect(screen.queryByText('Control general')).not.toBeInTheDocument()
  })

  it('CP-074 · RF-24 · guardar una observación completa la cita atendida', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!

    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=1')

    await user.type(screen.getByLabelText(/Diagnóstico/), 'Migraña')
    await user.type(screen.getByLabelText(/Observaciones clínicas/), 'Paciente refiere cefalea recurrente.')
    await user.type(screen.getByLabelText(/Tratamiento e indicaciones/), 'Control en cuatro semanas.')
    await user.click(screen.getByRole('button', { name: 'Guardar observación' }))

    expect(clinicalStorage.getAll()).toHaveLength(1)
    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 1)?.appointmentStatus).toBe('COMPLETED')
    expect(screen.getByText('La observación clínica se guardó correctamente.')).toBeInTheDocument()
  })

  it('CP-075 · RF-23/RF-24 · agenda limita la acción médica al registro de observaciones', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T12:00:00'))
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!

    renderAs(doctor, <Agenda />)

    expect(screen.getAllByRole('link', { name: 'Registrar observación' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Confirmar cita' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar cita' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar completada' })).not.toBeInTheDocument()
  })

  it('CP-076 · RF-13 · detalle del médico presenta horarios referenciales y acceso a reserva', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T12:00:00'))
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!

    renderAs(patient, <MedicosEspecialidades />)

    const doctorCard = screen.getByRole('heading', { name: 'Daniela Rojas' }).closest('article')!
    fireEvent.click(within(doctorCard).getByRole('button', { name: 'Ver detalle' }))

    expect(screen.getByText('Próximos horarios disponibles')).toBeInTheDocument()
    expect(screen.getByText(/11:30 hrs/)).toBeInTheDocument()
    expect(screen.getByText(/14:00 hrs/)).toBeInTheDocument()
    expect(screen.getByText(/15:00 hrs/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitar cita' })).toHaveAttribute(
      'href',
      '/solicitar-cita?medico=1',
    )
  })

  it('CP-077 · RF-13/RF-15 · reserva preselecciona médico y especialidad del detalle', async () => {
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!

    renderAs(patient, <SolicitarCita />, '/solicitar-cita?medico=1')

    expect(await screen.findByLabelText(/Médico/)).toHaveValue('1')
    expect(screen.getByLabelText(/Especialidad/)).toHaveValue('1')
  })

  it('CP-094 · RF-20 · recepción confirma una solicitud pendiente', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const receptionist = mockUsers.find((item) => item.role === 'RECEPTIONIST')!
    renderAs(receptionist, <GestionCitas />)

    const appointmentRow = screen.getByText('Control preventivo').closest('tr')!
    fireEvent.click(within(appointmentRow).getByRole('button', { name: 'Confirmar' }))

    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 2)?.appointmentStatus).toBe('CONFIRMED')
    expect(screen.getByRole('status')).toHaveTextContent('fue confirmada')
  })

  it('CP-095 · RF-21 · recepción reagenda y reserva el nuevo horario', async () => {
    const user = userEvent.setup()
    const receptionist = mockUsers.find((item) => item.role === 'RECEPTIONIST')!
    renderAs(receptionist, <GestionCitas />)

    const appointmentRow = screen.getByText('Control preventivo').closest('tr')!
    await user.click(within(appointmentRow).getByRole('button', { name: 'Reagendar' }))
    await user.selectOptions(screen.getByLabelText('Nueva fecha'), '2026-10-12')
    await user.selectOptions(screen.getByLabelText('Nueva hora'), '11:30')
    await user.click(screen.getByRole('button', { name: 'Guardar nueva fecha' }))

    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 2)).toMatchObject({
      date: '2026-10-12',
      time: '11:30',
      scheduleSlotId: 7,
      appointmentStatus: 'PENDING',
    })
    expect(schedulesStorage.getAll().find((item) => item.id === 6)?.available).toBe(true)
    expect(schedulesStorage.getAll().find((item) => item.id === 7)?.available).toBe(false)
  })

  it('CP-096 · RF-22 · recepción confirma la cancelación de una cita y libera el horario', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const receptionist = mockUsers.find((item) => item.role === 'RECEPTIONIST')!
    renderAs(receptionist, <GestionCitas />)

    const appointmentRow = screen.getByText('Control general').closest('tr')!
    fireEvent.click(within(appointmentRow).getByRole('button', { name: 'Cancelar' }))

    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 1)?.appointmentStatus).toBe('CANCELLED')
    expect(schedulesStorage.getAll().find((item) => item.id === 1)?.available).toBe(true)
    expect(screen.getByRole('status')).toHaveTextContent('fue cancelada')
  })

  it('CP-097 · RF-15/RF-16 · paciente valida el formulario y registra una cita', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T12:00:00'))
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    renderAs(patient, <SolicitarCita />)

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar cita' }))
    expect(screen.getByText('Revisa los campos indicados antes de continuar.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Especialidad/), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Médico/), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Fecha de atención/), { target: { value: '2026-10-12' } })
    fireEvent.change(screen.getByLabelText(/Hora de atención/), { target: { value: '11:30' } })
    fireEvent.change(screen.getByLabelText(/Motivo de la consulta/), { target: { value: 'Control cardiológico' } })
    fireEvent.click(screen.getByLabelText(/Presencial/))
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar cita' }))

    expect(screen.getByRole('status')).toHaveTextContent('Tu solicitud de cita se registró correctamente')
    expect(appointmentsStorage.getAll()).toHaveLength(6)
    expect(appointmentsStorage.getAll().at(-1)).toMatchObject({
      doctorId: 1,
      date: '2026-10-12',
      time: '11:30',
      reason: 'Control cardiológico',
      appointmentStatus: 'PENDING',
    })
    expect(schedulesStorage.getAll().find((item) => item.id === 3)?.available).toBe(false)
  })
})
