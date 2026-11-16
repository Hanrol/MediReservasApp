import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import {
  clearLegacyWeeklySchedules,
  createConcreteSlot,
  deleteConcreteSlot,
  getDoctorScheduleContext,
  type ConcreteSlot,
  type WeeklySchedule,
} from '../../services/doctor-schedules.service'
import { getLocalDateString } from '../../utils/validations'

const timeOptions = Array.from({ length: 33 }, (_, index) => {
  const minutes = 7 * 60 + index * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function overlapsExistingSlot(slots: ConcreteSlot[], date: string, time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const start = hour * 60 + minute
  const end = start + 30
  return slots.some((slot) => {
    if (slot.slotDate !== date) return false
    const [slotHour, slotMinute] = slot.startTime.split(':').map(Number)
    const [slotEndHour, slotEndMinute] = slot.endTime.split(':').map(Number)
    const slotStart = slotHour * 60 + slotMinute
    const slotEnd = slotEndHour * 60 + slotEndMinute
    return start < slotEnd && end > slotStart
  })
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function Disponibilidad() {
  const { session } = useAuth()
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [legacySchedules, setLegacySchedules] = useState<WeeklySchedule[]>([])
  const [slots, setSlots] = useState<ConcreteSlot[]>([])
  const [selectedDate, setSelectedDate] = useState(getLocalDateString())
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const token = session?.token
  const today = getLocalDateString()
  const lastDate = getLocalDateString(addDays(new Date(), 29))

  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const context = await getDoctorScheduleContext(token)
      setDoctorId(context.doctorId)
      setLegacySchedules(context.schedules)
      setSlots(context.slots)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar tu disponibilidad.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh() }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  const upcomingSlots = useMemo(() => slots
    .filter((slot) => slot.slotDate >= today && slot.slotDate <= lastDate)
    .sort((a, b) => a.slotDate.localeCompare(b.slotDate) || a.startTime.localeCompare(b.startTime)),
  [lastDate, slots, today])

  const availableTimes = timeOptions.filter((time) =>
    !overlapsExistingSlot(slots, selectedDate, time)
    && (selectedDate !== today || time > new Date().toTimeString().slice(0, 5)))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setError('')
    if (!token || !doctorId || !selectedTime) return
    if (overlapsExistingSlot(slots, selectedDate, selectedTime)) {
      setError('Ese horario ya está ocupado. Elige otra hora o fecha.')
      return
    }

    setSaving(true)
    try {
      if (legacySchedules.length) {
        const confirmed = window.confirm(
          'Aún tienes horarios semanales recurrentes. Al continuar, dejarán de repetirse y mantendrás tus citas ya reservadas. ¿Deseas continuar?',
        )
        if (!confirmed) return
        await clearLegacyWeeklySchedules(token)
      }
      await createConcreteSlot(token, {
        doctorId,
        slotDate: selectedDate,
        startTime: selectedTime,
      })
      await refresh()
      setSelectedTime('')
      setNotice('Horario agregado al calendario. Los pacientes ya pueden reservarlo.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el horario.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slotId: number) => {
    if (!token) return
    setError('')
    setNotice('')
    try {
      await deleteConcreteSlot(token, slotId)
      await refresh()
      setNotice('Horario eliminado del calendario.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el horario.')
    }
  }

  return (
    <DashboardLayout currentPath={ROUTES.doctorAvailability}>
      <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Mi disponibilidad' }]} />
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Mi disponibilidad</h1>
        <p className="mt-3 text-muted">
          Selecciona una fecha y una hora concreta. Cada horario dura 30 minutos y se publica para reserva.
        </p>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl bg-primary-light p-4 text-primary-dark">{notice}</p>}
        {legacySchedules.length > 0 && (
          <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            Tienes {legacySchedules.length} horario(s) semanal(es) antiguo(s). Al guardar una fecha concreta, dejarán de repetirse; las citas existentes se conservan.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm font-medium" htmlFor="availability-date">
            Día
            <input
              id="availability-date"
              className="mt-2 w-full rounded-xl border border-line p-3"
              type="date"
              min={today}
              max={lastDate}
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value)
                setSelectedTime('')
              }}
              required
            />
          </label>
          <label className="text-sm font-medium" htmlFor="availability-time">
            Hora de inicio
            <select
              id="availability-time"
              className="mt-2 w-full rounded-xl border border-line p-3"
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              required
            >
              <option value="">Elige una hora</option>
              {availableTimes.map((time) => <option key={time} value={time}>{time}–{timeOptions[timeOptions.indexOf(time) + 1] ?? '23:30'}</option>)}
            </select>
          </label>
          <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={saving || loading || !selectedTime}>
            {saving ? 'Guardando…' : 'Agregar al calendario'}
          </button>
        </form>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5">
          <h2 className="text-xl font-semibold">Próximos horarios</h2>
          {loading ? <p className="mt-4 text-muted">Cargando calendario…</p> : upcomingSlots.length ? (
            <ul className="mt-4 divide-y divide-line">
              {upcomingSlots.map((slot) => {
                const isAvailable = slot.slotStatus === 'DISPONIBLE' && slot.appointmentId === null
                return (
                  <li key={slot.scheduleSlotId} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium capitalize">{formatDay(slot.slotDate)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)} · {isAvailable ? 'Disponible' : 'Reservado'}
                      </p>
                    </div>
                    {isAvailable && (
                      <button type="button" onClick={() => void handleDelete(slot.scheduleSlotId)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                        Eliminar
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : <p className="mt-4 text-muted">Aún no has agregado horarios concretos para los próximos 30 días.</p>}
        </section>
      </div>
    </DashboardLayout>
  )
}

export default Disponibilidad
