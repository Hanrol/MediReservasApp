import { useEffect } from 'react'
import { getLegacyClinicalHistory } from '../../adapters/legacyClinical'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import DashboardLayout from '../../components/layout/DashboardLayout'
import EmptyState from '../../components/ui/EmptyState'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { getDoctors } from '../../lib/storage'

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(value: string) {
  if (!value) return 'Sin información'
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function HistorialClinico() {
  const { user } = useAuth()
  const isDoctor = user?.role === 'DOCTOR'
  const doctor = isDoctor ? getDoctors().find((item) => item.userId === user.userId) : undefined
  const consultations = user ? getLegacyClinicalHistory(user.userId, user.role, doctor?.doctorId) : []

  useEffect(() => {
    document.title = 'Historial clínico | MediReservas'
  }, [])

  if (!user) return null

  return (
    <DashboardLayout currentPath={ROUTES.clinicalHistory}>
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Historial clínico' }]} />

        <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg" aria-labelledby="clinical-history-title">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">{isDoctor ? 'Médico' : 'Paciente'}</p>
          <h1 className="mt-2 text-3xl font-bold" id="clinical-history-title">Historial clínico</h1>
          <p className="mt-3 text-emerald-50">Consulta diagnósticos, observaciones y tratamientos registrados en atenciones anteriores.</p>
        </section>

        {!isDoctor && (
          <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm" aria-labelledby="patient-data-title">
            <h2 className="text-2xl font-bold" id="patient-data-title">Datos del paciente</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div><dt className="font-semibold">Nombre</dt><dd className="mt-1 text-muted">{user.firstName} {user.lastName}</dd></div>
              <div><dt className="font-semibold">RUN</dt><dd className="mt-1 text-muted">{user.run}</dd></div>
            </dl>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm" aria-labelledby="consultations-title">
          <h2 className="text-2xl font-bold" id="consultations-title">Consultas médicas anteriores</h2>
          {consultations.length ? (
            <div className="mt-5 space-y-4">
              {consultations.map((consultation) => (
                <article className="rounded-xl border border-line p-5" key={consultation.id}>
                  <h3 className="text-lg font-semibold">Consulta de {consultation.specialtyName}</h3>
                  <dl className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
                    {isDoctor && <div><dt className="text-sm font-semibold text-muted">Paciente</dt><dd>{consultation.patientName} ({consultation.patientRun})</dd></div>}
                    <div><dt className="text-sm font-semibold text-muted">Fecha</dt><dd>{formatDate(consultation.date)}</dd></div>
                    <div><dt className="text-sm font-semibold text-muted">Médico</dt><dd>{consultation.doctorName}</dd></div>
                    <div><dt className="text-sm font-semibold text-muted">Motivo</dt><dd>{consultation.reason}</dd></div>
                    <div><dt className="text-sm font-semibold text-muted">Diagnóstico</dt><dd>{consultation.diagnosis}</dd></div>
                    <div><dt className="text-sm font-semibold text-muted">Observación clínica</dt><dd>{consultation.observations}</dd></div>
                    <div><dt className="text-sm font-semibold text-muted">Tratamiento</dt><dd>{consultation.treatment}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          ) : <EmptyState className="text-center">No se encontraron consultas médicas registradas.</EmptyState>}
        </section>
      </div>
    </DashboardLayout>
  )
}

export default HistorialClinico
