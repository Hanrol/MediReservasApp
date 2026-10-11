import { useEffect } from 'react'
import DashboardActionLink from '../../components/dashboard/DashboardActionLink'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SummaryCard from '../../components/ui/SummaryCard'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { DASHBOARD_CONFIG } from '../../constants/roles'
import { getDashboardSummary } from '../../services/dashboard.service'

function Dashboard() {
  const { user } = useAuth()
  const config = user ? DASHBOARD_CONFIG[user.role] : null

  useEffect(() => {
    if (config) document.title = `Panel de ${config.label} | MediReservas`
  }, [config])


  if (!user || !config) return <Navigate to={ROUTES.login} replace />

  const summary = getDashboardSummary(user)


  return (
    <DashboardLayout currentPath={ROUTES.dashboard} mainClassName="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">

      <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg sm:p-8" aria-labelledby="welcome-title">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">Panel de {config.label.toLowerCase()}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="welcome-title">Hola, {user.firstName}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-emerald-50">{config.description}</p>
      </section>

      <section className="mt-10" aria-labelledby="quick-access-title">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Funciones</p>
        <h2 className="mt-2 text-2xl font-bold" id="quick-access-title">Accesos principales</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {config.actions.map((action) => <DashboardActionLink action={action} key={action.title} />)}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="summary-title">
        <h2 className="text-2xl font-bold" id="summary-title">Resumen</h2>
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
