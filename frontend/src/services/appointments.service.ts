import { appointmentsStorage } from '../storage/appointments.storage'
import { schedulesStorage } from '../storage/schedules.storage'
import type { Appointment, AppointmentStatus } from '../types/appointment'

export type CreateAppointmentInput = Omit<Appointment, 'appointmentId' | 'appointmentStatus'>

export interface AppointmentFilters {
  patientUserId?: number
  doctorId?: number
  date?: string
  appointmentStatus?: AppointmentStatus
  searchTerm?: string
}

function getNextAppointmentId(appointments: Appointment[]) {
  return appointments.reduce((maximum, appointment) => Math.max(maximum, appointment.appointmentId), 0) + 1
}

export const appointmentsService = {
  getAll(filters: AppointmentFilters = {}): Appointment[] {
    let appointments = appointmentsStorage.getAll()

    if (filters.patientUserId) {
      appointments = appointments.filter((appointment) => appointment.patientUserId === filters.patientUserId)
    }
    if (filters.doctorId) {
      appointments = appointments.filter((appointment) => appointment.doctorId === filters.doctorId)
    }
    if (filters.date) {
      appointments = appointments.filter((appointment) => appointment.date === filters.date)
    }
    if (filters.appointmentStatus) {
      appointments = appointments.filter((appointment) => appointment.appointmentStatus === filters.appointmentStatus)
    }
    if (filters.searchTerm?.trim()) {
      const search = filters.searchTerm.trim().toLocaleLowerCase('es')
      appointments = appointments.filter((appointment) => appointment.doctorName.toLocaleLowerCase('es').includes(search))
    }

    return appointments.sort((first, second) => {
      const dateComparison = first.date.localeCompare(second.date)
      return dateComparison !== 0 ? dateComparison : first.time.localeCompare(second.time)
    })
  },

  getById(appointmentId: number): Appointment | undefined {
    return appointmentsStorage.getAll().find((appointment) => appointment.appointmentId === appointmentId)
  },

  getByPatient(patientUserId: number): Appointment[] {
    return this.getAll({ patientUserId })
  },

  getByDoctor(doctorId: number, date?: string): Appointment[] {
    return this.getAll({ doctorId, date })
  },

  create(input: CreateAppointmentInput): Appointment {
    const appointments = appointmentsStorage.getAll()
    const schedules = schedulesStorage.getAll()
    const scheduleIndex = schedules.findIndex((schedule) => schedule.id === input.scheduleSlotId)
    const schedule = schedules[scheduleIndex]

    if (!schedule || !schedule.available || schedule.doctorId !== input.doctorId || schedule.date !== input.date || schedule.time !== input.time) {
      throw new Error('El horario seleccionado ya no está disponible.')
    }

    const slotTaken = appointments.some((appointment) =>
      appointment.scheduleSlotId === input.scheduleSlotId && appointment.appointmentStatus !== 'CANCELLED')

    if (slotTaken) throw new Error('El horario seleccionado ya está ocupado.')

    const appointment: Appointment = {
      ...input,
      appointmentId: getNextAppointmentId(appointments),
      appointmentStatus: 'PENDING',
    }
    appointmentsStorage.saveAll([...appointments, appointment])
    const updatedSchedules = [...schedules]
    updatedSchedules[scheduleIndex] = { ...schedule, available: false }
    schedulesStorage.saveAll(updatedSchedules)
    return appointment
  },

  update(
    appointmentId: number,
    changes: Partial<Omit<Appointment, 'appointmentId'>>,
  ): Appointment {
    const appointments = appointmentsStorage.getAll()
    const index = appointments.findIndex((appointment) => appointment.appointmentId === appointmentId)
    if (index === -1) throw new Error('No se encontró la cita solicitada.')

    const currentAppointment = appointments[index]
    if (!currentAppointment) throw new Error('No se pudo recuperar la cita.')

    const updatedAppointment: Appointment = { ...currentAppointment, ...changes, appointmentId }
    const slotTaken = updatedAppointment.appointmentStatus !== 'CANCELLED' && appointments.some((appointment) =>
      appointment.appointmentId !== appointmentId &&
      appointment.scheduleSlotId === updatedAppointment.scheduleSlotId &&
      appointment.appointmentStatus !== 'CANCELLED')
    if (slotTaken) throw new Error('El horario seleccionado ya está ocupado.')

    const updatedAppointments = [...appointments]
    updatedAppointments[index] = updatedAppointment
    appointmentsStorage.saveAll(updatedAppointments)
    return updatedAppointment
  },

  cancel(appointmentId: number): Appointment {
    const appointment = this.getById(appointmentId)
    if (!appointment) throw new Error('No se encontró la cita solicitada.')
    if (appointment.appointmentStatus !== 'PENDING') {
      throw new Error('Solo se pueden cancelar citas pendientes.')
    }
    return this.cancelByStaff(appointmentId)
  },

  confirm(appointmentId: number): Appointment {
    const appointment = this.getById(appointmentId)
    if (!appointment) throw new Error('No se encontró la cita solicitada.')
    if (appointment.appointmentStatus !== 'PENDING') {
      throw new Error('Solo se pueden confirmar citas pendientes.')
    }
    return this.update(appointmentId, { appointmentStatus: 'CONFIRMED' })
  },

  cancelByStaff(appointmentId: number): Appointment {
    const appointments = appointmentsStorage.getAll()
    const index = appointments.findIndex((appointment) => appointment.appointmentId === appointmentId)
    const appointment = appointments[index]
    if (!appointment) throw new Error('No se encontró la cita solicitada.')
    if (appointment.appointmentStatus !== 'PENDING' && appointment.appointmentStatus !== 'CONFIRMED') {
      throw new Error('Solo se pueden cancelar citas pendientes o confirmadas.')
    }

    const updatedAppointment = { ...appointment, appointmentStatus: 'CANCELLED' as const }
    const updatedAppointments = [...appointments]
    updatedAppointments[index] = updatedAppointment

    const updatedSchedules = schedulesStorage.getAll().map((schedule) =>
      schedule.id === appointment.scheduleSlotId ? { ...schedule, available: true } : schedule)

    appointmentsStorage.saveAll(updatedAppointments)
    schedulesStorage.saveAll(updatedSchedules)
    return updatedAppointment
  },

  reschedule(appointmentId: number, scheduleSlotId: number): Appointment {
    const appointments = appointmentsStorage.getAll()
    const appointmentIndex = appointments.findIndex((appointment) => appointment.appointmentId === appointmentId)
    const appointment = appointments[appointmentIndex]
    if (!appointment) throw new Error('No se encontró la cita solicitada.')
    if (appointment.appointmentStatus !== 'PENDING') {
      throw new Error('Solo se pueden reagendar citas pendientes.')
    }

    const schedules = schedulesStorage.getAll()
    const newScheduleIndex = schedules.findIndex((schedule) => schedule.id === scheduleSlotId)
    const newSchedule = schedules[newScheduleIndex]
    if (!newSchedule || !newSchedule.available || newSchedule.doctorId !== appointment.doctorId) {
      throw new Error('El horario seleccionado ya no está disponible.')
    }

    const slotTaken = appointments.some((item) =>
      item.appointmentId !== appointmentId &&
      item.scheduleSlotId === scheduleSlotId &&
      item.appointmentStatus !== 'CANCELLED')
    if (slotTaken) throw new Error('El horario seleccionado ya está ocupado.')

    const updatedAppointment: Appointment = {
      ...appointment,
      scheduleSlotId: newSchedule.id,
      date: newSchedule.date,
      time: newSchedule.time,
      appointmentStatus: 'PENDING',
    }
    const updatedAppointments = [...appointments]
    updatedAppointments[appointmentIndex] = updatedAppointment

    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === appointment.scheduleSlotId) return { ...schedule, available: true }
      if (schedule.id === newSchedule.id) return { ...schedule, available: false }
      return schedule
    })

    appointmentsStorage.saveAll(updatedAppointments)
    schedulesStorage.saveAll(updatedSchedules)
    return updatedAppointment
  },
}
