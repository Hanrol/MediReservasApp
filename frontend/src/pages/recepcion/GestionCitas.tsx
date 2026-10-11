import { useEffect, useMemo, useState } from 'react'
import { AppointmentStatus } from '../../components/appointments/AppointmentStatus'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Modal from '../../components/ui/Modal'
import { APPOINTMENT_STATUS_OPTIONS } from '../../constants/appointmentStatuses'
import { ROUTES } from '../../constants/routes'
import { useAppointments } from '../../hooks/useAppointments'
import { useSchedules } from '../../hooks/useSchedules'
import { getUsers } from '../../services/users.service'
import type { Appointment, AppointmentStatus as AppointmentStatusValue } from '../../types/appointment'

function GestionCitas() {
  const {
    appointments,
    loading,
    error,
    refresh,
    confirmAppointment: confirmAppointmentAction,
    cancelAppointmentByStaff,
    rescheduleAppointment: rescheduleAppointmentAction,
  } = useAppointments()
  const { schedules, refresh: refreshSchedules } = useSchedules()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AppointmentStatusValue | 'all'>('all')
  const [date, setDate] = useState('')
  const [feedback, setFeedback] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleError, setRescheduleError] = useState('')
  const patientRunById = useMemo(
    () => new Map(getUsers().map((user) => [user.userId, user.run])),
    [],
  )

  useEffect(() => {
    document.title = 'Gestión de citas | MediReservas'
  }, [])

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')

    return appointments.filter((appointment) => {
      const searchableText = `${appointment.patientName} ${patientRunById.get(appointment.patientUserId) ?? ''} ${appointment.doctorName} ${appointment.specialtyName}`
        .toLocaleLowerCase('es')
      return searchableText.includes(normalizedQuery)
        && (status === 'all' || appointment.appointmentStatus === status)
        && (!date || appointment.date === date)
    })
  }, [appointments, date, patientRunById, query, status])

  const availableDates = useMemo(() => {
    if (!selectedAppointment) return []
    return [...new Set(schedules
      .filter((schedule) => schedule.doctorId === selectedAppointment.doctorId && schedule.available)
      .map((schedule) => schedule.date))].sort()
  }, [schedules, selectedAppointment])

  const availableTimes = useMemo(() => {
    if (!selectedAppointment || !rescheduleDate) return []
    return schedules
      .filter((schedule) => schedule.doctorId === selectedAppointment.doctorId
        && schedule.date === rescheduleDate
        && schedule.available)
      .map((schedule) => schedule.time)
      .sort()
  }, [rescheduleDate, schedules, selectedAppointment])

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setDate('')
  }

  function confirmAppointment(appointment: Appointment) {
    if (!window.confirm(`¿Confirmas la cita de ${appointment.patientName}?`)) return
    const updated = confirmAppointmentAction(appointment.appointmentId)
    if (updated) setFeedback(`La cita de ${appointment.patientName} fue confirmada.`)
  }

  function cancelAppointment(appointment: Appointment) {
    if (!window.confirm(`¿Confirmas la cancelación de la cita de ${appointment.patientName}?`)) return
    const updated = cancelAppointmentByStaff(appointment.appointmentId)
    if (!updated) return

    refreshSchedules()
    setFeedback(`La cita de ${appointment.patientName} fue cancelada.`)
  }

  function openReschedule(appointment: Appointment) {
    setSelectedAppointment(appointment)
    setRescheduleDate('')
    setRescheduleTime('')
    setRescheduleError('')
  }

  function closeReschedule() {
    setSelectedAppointment(null)
    setRescheduleError('')
  }

  function rescheduleAppointment() {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      setRescheduleError('Selecciona la nueva fecha y hora.')
      return
    }

    const newSchedule = schedules.find((schedule) => schedule.doctorId === selectedAppointment.doctorId
      && schedule.date === rescheduleDate
      && schedule.time === rescheduleTime
      && schedule.available)

    if (!newSchedule) {
      setRescheduleError('El horario seleccionado ya no está disponible.')
      return
    }

    const updated = rescheduleAppointmentAction(selectedAppointment.appointmentId, newSchedule.id)
    if (!updated) return

    refreshSchedules()
    setFeedback(`La cita de ${selectedAppointment.patientName} fue reagendada para el ${newSchedule.date} a las ${newSchedule.time}.`)
    closeReschedule()
  }

  return (
    <DashboardLayout currentPath={ROUTES.appointmentManagement}>
      <section className="mx-auto max-w-7xl" aria-labelledby="appointments-title">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Recepción</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="appointments-title">Gestión de citas</h1>
          <p className="mt-3 text-muted">Consulta las solicitudes, confirma, reagenda o cancela las citas de los pacientes.</p>
        </header>

        {feedback && (
          <div className="mt-6 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-primary-light p-4 text-sm font-medium text-primary-dark" role="status">
            <p>{feedback}</p>
            <button className="shrink-0 rounded px-2 font-bold hover:bg-white/60" type="button" aria-label="Cerrar mensaje" onClick={() => setFeedback('')}>×</button>
          </div>
        )}

        {error && <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">{error}</p>}

        <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-[1fr_14rem_14rem_auto] xl:items-end" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="text-sm font-semibold">Buscar cita
            <input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="search" placeholder="Paciente, médico o especialidad" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="text-sm font-semibold">Estado
            <select className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary" value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatusValue | 'all')}>
              {APPOINTMENT_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Fecha
            <input className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <button className="rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:bg-page" type="button" onClick={clearFilters}>Limpiar filtros</button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted" aria-live="polite">
            {loading ? 'Cargando citas...' : `${filteredAppointments.length} ${filteredAppointments.length === 1 ? 'cita encontrada' : 'citas encontradas'}`}
          </p>
          <button className="text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50" type="button" disabled={loading} onClick={refresh}>Actualizar</button>
        </div>

        {!loading && filteredAppointments.length > 0 ? (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-4xl border-collapse text-left">
              <caption className="sr-only">Solicitudes de citas médicas</caption>
              <thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted">
                <tr>{['Paciente', 'RUN', 'Especialidad', 'Médico', 'Fecha', 'Hora', 'Motivo', 'Estado', 'Acciones'].map((heading) => <th className={`px-5 py-4 font-semibold ${heading === 'Acciones' ? 'text-right' : ''}`} scope="col" key={heading}>{heading}</th>)}</tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr className="border-b border-line last:border-0" key={appointment.appointmentId}>
                    <td className="px-5 py-4 font-semibold">{appointment.patientName}</td>
                    <td className="px-5 py-4">{patientRunById.get(appointment.patientUserId) ?? 'Sin información'}</td>
                    <td className="px-5 py-4">{appointment.specialtyName}</td>
                    <td className="px-5 py-4">{appointment.doctorName}</td>
                    <td className="px-5 py-4">{appointment.date}</td>
                    <td className="px-5 py-4">{appointment.time}</td>
                    <td className="px-5 py-4">{appointment.reason}</td>
                    <td className="px-5 py-4"><AppointmentStatus status={appointment.appointmentStatus} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {appointment.appointmentStatus === 'PENDING' && <button className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-primary-light" type="button" onClick={() => confirmAppointment(appointment)}>Confirmar</button>}
                        {appointment.appointmentStatus === 'PENDING' && <button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-primary-light" type="button" onClick={() => openReschedule(appointment)}>Reagendar</button>}
                        {(appointment.appointmentStatus === 'PENDING' || appointment.appointmentStatus === 'CONFIRMED') && <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" type="button" onClick={() => cancelAppointment(appointment)}>Cancelar</button>}
                        {!['PENDING', 'CONFIRMED'].includes(appointment.appointmentStatus) && <span className="text-sm text-muted">Sin acciones</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No se encontraron citas con los filtros seleccionados.</p>}
      </section>

      {selectedAppointment && (
        <Modal
          title="Nueva fecha y hora"
          eyebrow="Reagendar cita"
          onClose={closeReschedule}
          footer={(
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted hover:bg-page" type="button" onClick={closeReschedule}>Cancelar</button>
              <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark" type="button" onClick={rescheduleAppointment}>Guardar nueva fecha</button>
            </div>
          )}
        >
          <p className="text-sm text-muted">Cita de {selectedAppointment.patientName} — {selectedAppointment.specialtyName} con {selectedAppointment.doctorName}.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">Nueva fecha
              <select className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary" value={rescheduleDate} onChange={(event) => { setRescheduleDate(event.target.value); setRescheduleTime(''); setRescheduleError('') }}>
                <option value="">Selecciona una fecha</option>
                {availableDates.map((availableDate) => <option value={availableDate} key={availableDate}>{availableDate}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Nueva hora
              <select className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary disabled:bg-page" value={rescheduleTime} disabled={!rescheduleDate} onChange={(event) => { setRescheduleTime(event.target.value); setRescheduleError('') }}>
                <option value="">Selecciona una hora</option>
                {availableTimes.map((availableTime) => <option value={availableTime} key={availableTime}>{availableTime}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-2 min-h-5 text-sm text-red-600" role="alert">{rescheduleError}</p>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default GestionCitas
