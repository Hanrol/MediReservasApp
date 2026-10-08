import { useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Link, Navigate } from 'react-router-dom'
import { DASHBOARD_CONFIG, type DashboardAction } from '../lib/roles'
import { getSession, getStoredItems, getUsers } from '../lib/storage'

interface Appointment {
  appointmentStatus?: string
  doctorId?: number
  patientUserId?: number
  date?: string
}

interface Doctor {
  doctorId?: number
  userId?: number
}

interface Specialty {
  active?: boolean
}

function ActionLink({ action, compact = false, onClick }: { action: DashboardAction; compact?: boolean; onClick?: () => void }) {
  const className = compact
    ? 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-primary-light hover:text-primary-dark'
    : 'group rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg'
  const content = (
    <>
      <span className={compact ? 'grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark' : 'grid size-11 place-items-center rounded-xl bg-primary-light text-sm font-bold text-primary-dark'} aria-hidden="true">{action.icon}</span>
      {compact ? <span>{action.title}</span> : (
        <div>
          <h3 className="mt-5 text-lg font-bold group-hover:text-primary-dark">{action.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{action.description}</p>
        </div>
      )}
    </>
  )
  return action.reactRoute
    ? <Link className={className} to={action.href} onClick={onClick}>{content}</Link>
    : <a className={className} href={action.href} onClick={onClick}>{content}</a>
}

function getSummary(role: string, userId: number) {
  const users = getUsers()
  const appointments = getStoredItems<Appointment>('medireservas_appointments')
  const doctors = getStoredItems<Doctor>('medireservas_doctors')
  const specialties = getStoredItems<Specialty>('medireservas_specialties')
  const today = new Date().toISOString().slice(0, 10)

  if (role === 'ADMIN') return [
    { value: new Set(users.map((user) => user.role)).size, label: 'Perfiles del sistema' },
    { value: users.filter((user) => user.active).length, label: 'Usuarios activos' },
    { value: specialties.filter((specialty) => specialty.active).length, label: 'Especialidades activas' },
  ]
  if (role === 'RECEPTIONIST') return [
    { value: appointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Citas pendientes' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CONFIRMED').length, label: 'Citas confirmadas' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CANCELLED').length, label: 'Citas canceladas' },
  ]
  if (role === 'DOCTOR') {
    const doctorId = doctors.find((doctor) => doctor.userId === userId)?.doctorId
    const ownAppointments = appointments.filter((item) => item.doctorId === doctorId)
    return [
      { value: ownAppointments.filter((item) => item.date === today && item.appointmentStatus !== 'CANCELLED').length, label: 'Atenciones de hoy' },
      { value: ownAppointments.filter((item) => item.appointmentStatus === 'CONFIRMED' && (item.date ?? '') <= today).length, label: 'Observaciones pendientes' },
      { value: ownAppointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones completadas' },
    ]
  }
  const ownAppointments = appointments.filter((item) => item.patientUserId === userId)
  return [
    { value: ownAppointments.filter((item) => (item.date ?? '') >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(item.appointmentStatus ?? '')).length, label: 'Próximas citas' },
    { value: ownAppointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Solicitudes pendientes' },
    { value: ownAppointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones realizadas' },
  ]
}

function Dashboard() {
  const session = getSession()
  const config = session ? DASHBOARD_CONFIG[session.role] : null

  useEffect(() => {
    if (config) document.title = `Panel de ${config.label} | MediReservas`
  }, [config])


  if (!session || !config) return <Navigate to="/login" replace />

  const summary = getSummary(session.role, session.userId)


  return (
    <DashboardLayout currentPath="/dashboard" mainClassName="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">

      <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg sm:p-8" aria-labelledby="welcome-title">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">Panel de {config.label.toLowerCase()}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="welcome-title">Hola, {session.firstName}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-emerald-50">{config.description}</p>
      </section>

      <section className="mt-10" aria-labelledby="quick-access-title">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Funciones</p>
        <h2 className="mt-2 text-2xl font-bold" id="quick-access-title">Accesos principales</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {config.actions.map((action) => <ActionLink action={action} key={action.title} />)}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="summary-title">
        <h2 className="text-2xl font-bold" id="summary-title">Resumen</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {summary.map((item) => (
            <article className="rounded-2xl border border-line bg-white p-5 shadow-sm" key={item.label}>
              <p className="text-3xl font-bold text-primary-dark">{item.value}</p>
              <p className="mt-1 text-sm text-muted">{item.label}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}

export default Dashboard
