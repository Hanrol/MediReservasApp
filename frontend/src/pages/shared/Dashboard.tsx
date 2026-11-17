import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardActionLink from '../../components/dashboard/DashboardActionLink'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SummaryCard from '../../components/ui/SummaryCard'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { DASHBOARD_CONFIG } from '../../constants/roles'
import { getDashboardSummary, type DashboardSummaryItem } from '../../services/dashboard.service'
import { getProfileCompletion, type ProfileCompletion } from '../../services/profile-onboarding.service'
import { getAdminDashboardSummary } from '../../services/admin-api.service'

function Dashboard() {
  const { user, session } = useAuth()
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [summary, setSummary] = useState<DashboardSummaryItem[]>([])
  const [summaryError, setSummaryError] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const config = user ? DASHBOARD_CONFIG[user.role] : null

  useEffect(() => {
    if (config) document.title = `Panel de ${config.label} | MediReservas`
  }, [config])

  useEffect(() => {
    if (!session || !user || user.role === 'ADMIN') {
      return
    }
    let active = true
    void getProfileCompletion(session.token)
      .then((status) => { if (active) setCompletion(status) })
      .catch(() => { if (active) setCompletion(null) })
    return () => { active = false }
  }, [session, user])

  useEffect(() => {
    if (!session?.token || !user) return
    let active = true
    const summaryRequest = user.role === 'ADMIN'
      ? getAdminDashboardSummary(session.token)
      : getDashboardSummary(session.token, user)
    void summaryRequest
      .then((items) => { if (active) { setSummary(items); setSummaryError('') } })
      .catch(() => { if (active) setSummaryError('No se pudo cargar el resumen desde el servidor.') })
      .finally(() => { if (active) setSummaryLoading(false) })
    return () => { active = false }
  }, [session?.token, user])


  if (!user || !config) return <Navigate to={ROUTES.login} replace />

  return (
    <DashboardLayout currentPath={ROUTES.dashboard} mainClassName="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">

      <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg sm:p-8" aria-labelledby="welcome-title">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">Panel de {config.label.toLowerCase()}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="welcome-title">Hola, {user.firstName}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-emerald-50">{config.description}</p>
      </section>

      {completion && !completion.complete && (
        <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center sm:justify-between" aria-label="Completa tu perfil">
          <div>
            <h2 className="font-bold">Completa tu perfil</h2>
            <p className="mt-1 text-sm">Agrega los datos que faltan para tener tu cuenta al día. Puedes hacerlo ahora o más tarde.</p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-dark px-5 py-2 font-semibold text-white hover:bg-primary" to={ROUTES.profile}>
            Completar perfil
          </Link>
        </aside>
      )}

      <section className="mt-10" aria-labelledby="quick-access-title">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Funciones</p>
        <h2 className="mt-2 text-2xl font-bold" id="quick-access-title">Accesos principales</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {config.actions.map((action) => <DashboardActionLink action={action} key={action.title} />)}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="summary-title">
        <h2 className="text-2xl font-bold" id="summary-title">Resumen</h2>
        {summaryError && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{summaryError}</p>}
        {summaryLoading && <p className="mt-4 text-sm text-muted" role="status">Cargando resumen...</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {summary.map((item) => (
            <SummaryCard key={item.label} value={item.value} label={item.label} />
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}

export default Dashboard
