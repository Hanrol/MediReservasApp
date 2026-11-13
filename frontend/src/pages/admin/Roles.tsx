import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.tsx'
import Breadcrumbs from '../../components/layout/Breadcrumbs.tsx'
import { DASHBOARD_CONFIG } from '../../constants/roles.ts'
import { ROUTES } from '../../constants/routes.ts'
import { useAuth } from '../../hooks/useAuth.ts'
import { getAdminUsers } from '../../services/admin-api.service.ts'
import type { User } from '../../types/user.ts'

function Roles() {
  const { session } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => { document.title = 'Roles y permisos | MediReservas' }, [])
  useEffect(() => {
    if (!session?.token) return
    let active = true
    void getAdminUsers(session.token)
      .then((loaded) => { if (active) { setUsers(loaded); setError('') } })
      .catch(() => { if (active) setError('No se pudieron cargar los roles desde el servidor.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session?.token])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return users.filter((user) => `${user.firstName} ${user.lastName} ${user.run} ${user.email}`.toLowerCase().includes(normalizedQuery))
  }, [query, users])

  return (
    <DashboardLayout currentPath={ROUTES.roles}>
      <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Roles y permisos' }]} />
      <section className="mx-auto max-w-7xl" aria-labelledby="roles-title">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl" id="roles-title">Roles y permisos</h1>
          <p className="mt-3 text-muted">Consulta los perfiles de acceso de las cuentas existentes.</p>
        </header>
        <aside className="mt-8 rounded-2xl border border-emerald-200 bg-primary-light p-5 sm:p-6" aria-labelledby="roles-information-title">
          <h2 className="font-bold text-primary-dark" id="roles-information-title">Perfiles disponibles</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
            <li><strong className="text-ink">Administrador:</strong> acceso a la configuración y gestión completa.</li>
            <li><strong className="text-ink">Recepcionista:</strong> gestión de solicitudes y estados de citas.</li>
            <li><strong className="text-ink">Médico:</strong> acceso a agenda, pacientes y observaciones clínicas.</li>
            <li><strong className="text-ink">Paciente:</strong> reserva y consulta de sus propias atenciones.</li>
          </ul>
        </aside>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          El perfil se define al crear la cuenta: los pacientes pueden registrarse y las demás cuentas se crean mediante invitación de administración. Las cuentas existentes no permiten cambiar de rol desde esta pantalla.
        </p>
        <form className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-sm font-semibold">Buscar usuario
            <input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="search" placeholder="Nombre, RUN o correo" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </form>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        {loading && <p className="mt-5 text-sm text-muted" role="status">Cargando usuarios…</p>}
        <p className="mt-6 text-sm font-medium text-muted" aria-live="polite">{filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}</p>
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-3xl text-left">
              <caption className="sr-only">Roles asignados a usuarios registrados</caption>
              <thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted">
                <tr>{['Usuario', 'RUN', 'Correo', 'Roles asignados'].map((heading) => <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>)}</tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr className="border-b border-line last:border-0" key={user.userId}>
                    <td className="px-5 py-4 font-semibold">{user.firstName} {user.lastName}</td>
                    <td className="px-5 py-4">{user.run}</td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">{(user.roles ?? [user.role]).map((role) => DASHBOARD_CONFIG[role].label).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filteredUsers.length === 0 && <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No se encontraron usuarios con ese criterio.</p>}
      </section>
    </DashboardLayout>
  )
}

export default Roles
