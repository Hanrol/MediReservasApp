import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockAppointments } from '../../data/mockAppointments'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import Agenda from '../../pages/medico/Agenda'
import GestionCitas from '../../pages/recepcion/GestionCitas'
import MedicosEspecialidades from '../../pages/public/MedicosEspecialidades'
import MisCitas from '../../pages/paciente/MisCitas'
import ObservacionClinica from '../../pages/medico/ObservacionClinica'
import Registro from '../../pages/public/Registro'
import SolicitarCita from '../../pages/paciente/SolicitarCita'
import { clinicalService } from '../../services/clinical.service'
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
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
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
    await user.click(screen.getByRole('button', { name: 'Cerrar mensaje' }))
    expect(screen.queryByText('La cita se canceló correctamente.')).not.toBeInTheDocument()
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

    await user.type(screen.getByLabelText('Buscar cita'), 'Paula')
    await user.selectOptions(screen.getByLabelText('Estado'), 'PENDING')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-10' } })

    expect(screen.getByText('Control preventivo')).toBeInTheDocument()
    expect(screen.queryByText('Control general')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByText('5 citas encontradas')).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar ventana' }))
    expect(screen.queryByRole('dialog', { name: 'Daniela Rojas' })).not.toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mensaje' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
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

  it('CP-103 · RF-24/RNF-07 · observación clínica señala los campos obligatorios', () => {
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=1')

    fireEvent.click(screen.getByRole('button', { name: 'Guardar observación' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos indicados antes de guardar la observación.')
    expect(screen.getByText('Ingrese el diagnóstico clínico.')).toBeInTheDocument()
    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 1)?.appointmentStatus).toBe('CONFIRMED')
  })

  it('CP-104 · RF-24 · observación sin cita ofrece volver a la agenda', () => {
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica')

    expect(screen.getByRole('heading', { name: 'No se seleccionó ninguna cita' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mi agenda' })).toHaveAttribute('href', '/agenda-medica')
  })

  it('CP-105 · RF-17 · el paciente puede limpiar los filtros de sus citas', async () => {
    const user = userEvent.setup()
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    renderAs(patient, <MisCitas />)

    await user.type(screen.getByLabelText('Nombre del médico'), 'Médico inexistente')
    await user.selectOptions(screen.getByLabelText('Estado de la cita'), 'PENDING')
    expect(screen.getByText('No se encontraron citas')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver todas las citas' }))

    expect(screen.getByText('Control general')).toBeInTheDocument()
  })

  it('CP-106 · RF-18 · conserva la cita si el paciente rechaza la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    renderAs(patient, <MisCitas />)

    const appointmentCard = screen.getByText('Control preventivo').closest('article')!
    await user.click(within(appointmentCard).getByRole('button', { name: 'Cancelar cita' }))

    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 2)?.appointmentStatus).toBe('PENDING')
    expect(window.confirm).toHaveBeenCalledOnce()
  })

  it('CP-107 · RF-10/RF-12 · directorio busca y filtra especialidades y médicos', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    renderAs(patient, <MedicosEspecialidades />)

    const specialtySearch = screen.getByRole('searchbox', { name: 'Buscar especialidad' })
    await user.type(specialtySearch, 'especialidad inexistente')
    expect(screen.getByText('No se encontraron especialidades.')).toBeInTheDocument()
    await user.clear(specialtySearch)

    const doctorSearch = screen.getByRole('searchbox', { name: 'Buscar médico' })
    await user.type(doctorSearch, 'Daniela')
    expect(screen.getByRole('heading', { name: 'Daniela Rojas' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Luis Pérez' })).not.toBeInTheDocument()
    await user.clear(doctorSearch)
    await user.selectOptions(screen.getByLabelText('Filtrar por especialidad'), '2')
    expect(screen.getByRole('heading', { name: 'Luis Pérez' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Daniela Rojas' })).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Filtrar por especialidad'), '')

    const specialtyCard = screen.getByRole('heading', { name: 'Cardiología' }).closest('article')!
    await user.click(within(specialtyCard).getByRole('button', { name: 'Ver médicos' }))
    expect(screen.getByLabelText('Filtrar por especialidad')).toHaveValue('1')
    expect(scrollIntoView).toHaveBeenCalledOnce()
  })

  it('CP-108 · RF-10/RF-12/RNF-07 · directorio informa cuando no hay datos disponibles', () => {
    saveDoctors([])
    saveSpecialties([])
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!

    renderAs(patient, <MedicosEspecialidades />)

    expect(screen.getByText('No se encontraron especialidades.')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron médicos.')).toBeInTheDocument()
  })

  it('CP-109 · RF-24 · observación existente queda visible y bloqueada para edición', () => {
    clinicalService.create({
      appointmentId: 1,
      patientId: 4,
      doctorId: 1,
      diagnosis: 'Migraña',
      notes: 'Cefalea recurrente informada por la paciente.',
      treatment: 'Control en cuatro semanas.',
    })
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!

    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=1')

    expect(screen.getByText(/Esta cita ya tiene una observación registrada/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Diagnóstico/)).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Observación ya registrada' })).toBeDisabled()
  })

  it('CP-111 · RF-23 · el médico filtra la agenda por paciente, fecha y estado', async () => {
    const user = userEvent.setup()
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <Agenda />)

    await user.type(screen.getByLabelText('Nombre del paciente'), 'Paula')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-09' } })
    await user.selectOptions(screen.getByLabelText('Estado'), 'CONFIRMED')
    expect(screen.getByText('2 citas encontradas')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByText('Mi agenda médica')).toBeInTheDocument()
  })

  it('CP-112 · RF-24 · bloquea el registro de observaciones para citas no confirmadas', () => {
    const doctor = mockUsers.find((item) => item.userId === 5)!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=2')

    fireEvent.click(screen.getByRole('button', { name: 'Guardar observación' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Solo se pueden registrar observaciones de citas confirmadas.')
    expect(clinicalStorage.getAll()).toHaveLength(0)
  })

  it('CP-113 · RF-24/RNF-02 · formulario clínico muestra y permite limpiar errores', () => {
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=1')

    fireEvent.click(screen.getByRole('button', { name: 'Guardar observación' }))
    expect(screen.getByText('Ingrese el diagnóstico clínico.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar formulario' }))
    expect(screen.queryByText('Ingrese el diagnóstico clínico.')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('CP-114 · RF-24 · informa cuando la cita de la observación no existe', () => {
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=999')

    expect(screen.getByRole('alert')).toHaveTextContent('No se encontró la cita seleccionada.')
  })

  it('CP-115 · RF-21/RNF-07 · recepción exige fecha y hora para reagendar', async () => {
    const user = userEvent.setup()
    const receptionist = mockUsers.find((item) => item.role === 'RECEPTIONIST')!
    renderAs(receptionist, <GestionCitas />)

    const appointmentRow = screen.getByText('Control preventivo').closest('tr')!
    await user.click(within(appointmentRow).getByRole('button', { name: 'Reagendar' }))
    await user.click(screen.getByRole('button', { name: 'Guardar nueva fecha' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona la nueva fecha y hora.')
  })

  it('CP-116 · RF-24/RNF-07 · revierte el estado si no se guarda la observación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=1')

    await user.type(screen.getByLabelText(/Diagnóstico/), 'Migraña')
    await user.type(screen.getByLabelText(/Observaciones clínicas/), 'Paciente refiere cefalea recurrente.')
    await user.type(screen.getByLabelText(/Tratamiento e indicaciones/), 'Control en cuatro semanas.')
    clinicalService.create({
      appointmentId: 1,
      patientId: 4,
      doctorId: 1,
      diagnosis: 'Registro concurrente',
      notes: 'Ya se creó una observación para esta cita.',
      treatment: 'Control posterior.',
    })

    await user.click(screen.getByRole('button', { name: 'Guardar observación' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No fue posible guardar la observación.')
    expect(appointmentsStorage.getAll().find((item) => item.appointmentId === 1)?.appointmentStatus).toBe('CONFIRMED')
    expect(clinicalStorage.getAll()).toHaveLength(1)
  })

  it('CP-120 · RF-02/RNF-07 · registro detecta correo ya asociado a otra cuenta', () => {
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    renderAs(patient, <Registro />, '/registro')

    fireEvent.change(screen.getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Camila' } })
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Duplicada' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-05-10' } })
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '912345678' } })
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Santiago' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'paciente@medireservas.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Ya existe una cuenta asociada a este RUN o correo.')).toBeInTheDocument()
  })

  it('CP-121 · RF-15/RF-16 · informa si el horario se ocupa durante el envío', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T12:00:00'))
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    const conflictingAppointment = {
      ...mockAppointments[0]!,
      appointmentId: 6,
      scheduleSlotId: 3,
      date: '2026-10-12',
      time: '11:30',
      appointmentStatus: 'PENDING' as const,
    }
    appointmentsStorage.saveAll([...mockAppointments, conflictingAppointment])
    renderAs(patient, <SolicitarCita />)

    fireEvent.change(screen.getByLabelText(/Especialidad/), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Médico/), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Fecha de atención/), { target: { value: '2026-10-12' } })
    fireEvent.change(screen.getByLabelText(/Hora de atención/), { target: { value: '11:30' } })
    fireEvent.change(screen.getByLabelText(/Motivo de la consulta/), { target: { value: 'Control cardiológico' } })
    fireEvent.click(screen.getByLabelText(/Presencial/))
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar cita' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No fue posible registrar la cita. Inténtalo nuevamente.')
  })

  it('CP-122 · RF-24 · avisa si la cita desaparece antes de completar la atención', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    const doctor = mockUsers.find((item) => item.role === 'DOCTOR')!
    renderAs(doctor, <ObservacionClinica />, '/observacion-clinica?cita=1')

    await user.type(screen.getByLabelText(/Diagnóstico/), 'Migraña')
    await user.type(screen.getByLabelText(/Observaciones clínicas/), 'Paciente refiere cefalea recurrente.')
    await user.type(screen.getByLabelText(/Tratamiento e indicaciones/), 'Control en cuatro semanas.')
    appointmentsStorage.saveAll([])
    await user.click(screen.getByRole('button', { name: 'Guardar observación' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No fue posible completar la cita.')
    expect(clinicalStorage.getAll()).toHaveLength(0)
  })
})
