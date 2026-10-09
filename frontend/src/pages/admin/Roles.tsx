import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DASHBOARD_CONFIG, isValidRole, validateRoleChange } from '../../lib/roles.ts'
import { getSession, getUsers, removeSession, updateUser } from '../../lib/storage.ts'
import type { User } from '../../lib/types.ts'

function Roles() {
  const navigate = useNavigate()
  const session = getSession()
  const config = session ? DASHBOARD_CONFIG[session.role] : null
  const [users, setUsers] = useState<User[]>(getUsers())
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [roleError, setRoleError] = useState('')
  const [confirmationOpen, setConfirmationOpen] = useState(false)

  useEffect(() => { document.title = 'Roles y permisos | MediReservas' }, [])
  useEffect(() => {
    const locked = menuOpen || Boolean(selectedUser)
    document.body.classList.toggle('overflow-hidden', locked)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen, selectedUser])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return users.filter((user) => `${user.firstName} ${user.lastName} ${user.run} ${user.email}`.toLowerCase().includes(normalizedQuery))
  }, [query, users])

  if (!session || !config) return <Navigate to="/login" replace />
  if (session.role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  const navigation = [
    { icon: '⌂', title: 'Panel principal', href: '/dashboard', reactRoute: true },
    { icon: 'MI', title: 'Mi perfil', href: '/perfil', reactRoute: true },
    ...config.actions,
  ]

  function logout() { removeSession(); navigate('/login', { replace: true }) }
  function openRoleDialog(user: User) {
    setSelectedUser(user); setSelectedRole(user.role); setRoleError(''); setConfirmationOpen(false)
  }
  function closeDialog() { setSelectedUser(null); setConfirmationOpen(false); setRoleError('') }
  function requestRoleChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser) return
    const error = validateRoleChange(selectedUser.role, selectedRole)
    setRoleError(error)
    if (!error) setConfirmationOpen(true)
  }
  function confirmRoleChange() {
    if (!selectedUser || !isValidRole(selectedRole)) return
    updateUser(selectedUser.userId, { role: selectedRole })
    setUsers(getUsers()); closeDialog()
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">Saltar al contenido principal</a>
      <header className="relative z-30 border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Barra superior de MediReservas">
          <div className="flex items-center gap-3 lg:pl-8">
            <button className="grid size-10 place-items-center rounded-xl border border-line text-xl text-primary-dark lg:hidden" type="button" aria-label="Abrir menú de navegación" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>☰</button>
            <Link className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl" to="/"><span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white">+</span><span className="hidden sm:inline">MediReservas</span></Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link className="text-right" to="/perfil"><p className="text-sm font-semibold">{session.firstName} {session.lastName}</p><p className="text-xs text-muted">{config.label}</p></Link>
            <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark hover:bg-red-50 hover:text-red-600" type="button" onClick={logout}><span className="sm:hidden">Salir</span><span className="hidden sm:inline">Cerrar sesión</span></button>
          </div>
        </nav>
      </header>

      <button className={`fixed inset-0 z-40 bg-slate-950/45 lg:hidden ${menuOpen ? '' : 'hidden'}`} type="button" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-white px-5 py-5 shadow-xl transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:px-5 lg:py-8 lg:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className="mb-6 flex items-center justify-between border-b border-line pb-5 lg:hidden"><p className="font-bold text-primary-dark">Menú principal</p><button className="grid size-10 place-items-center rounded-xl border border-line text-xl" type="button" onClick={() => setMenuOpen(false)}>×</button></header>
          <nav className="lg:sticky lg:top-8"><p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block">Navegación</p><ul className="flex flex-col gap-2">
            {navigation.map((item) => <li key={item.title}>{item.reactRoute ? <Link className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${item.href === '/roles' ? 'bg-primary-light text-primary-dark' : 'text-muted hover:bg-primary-light'}`} to={item.href} onClick={() => setMenuOpen(false)}><span className="grid size-7 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark">{item.icon}</span>{item.title}</Link> : <a className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-primary-light" href={item.href}><span className="grid size-7 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark">{item.icon}</span>{item.title}</a>}</li>)}
          </ul></nav>
        </aside>

        <main className="min-w-0 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8" id="main-content" tabIndex={-1}>
          <nav className="mb-6 text-sm" aria-label="Ruta de navegación"><ol className="flex gap-2 text-muted"><li><Link className="font-semibold text-primary-dark" to="/dashboard">Panel principal</Link></li><li>/</li><li className="font-semibold text-ink">Roles y permisos</li></ol></nav>
          <section className="mx-auto max-w-7xl" aria-labelledby="roles-title">
            <header><p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl" id="roles-title">Roles y permisos</h1><p className="mt-3 text-muted">Asigna a cada usuario el perfil que corresponda a sus funciones.</p></header>
            <aside className="mt-8 rounded-2xl border border-emerald-200 bg-primary-light p-5 sm:p-6" aria-labelledby="roles-information-title"><h2 className="font-bold text-primary-dark" id="roles-information-title">Perfiles disponibles</h2><ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2"><li><strong className="text-ink">Administrador:</strong> acceso a la configuración y gestión completa.</li><li><strong className="text-ink">Recepcionista:</strong> gestión de solicitudes y estados de citas.</li><li><strong className="text-ink">Médico:</strong> acceso a agenda, pacientes y observaciones clínicas.</li><li><strong className="text-ink">Paciente:</strong> reserva y consulta de sus propias atenciones.</li></ul></aside>
            <form className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm" role="search" onSubmit={(event) => event.preventDefault()}><label className="block text-sm font-semibold">Buscar usuario<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="search" placeholder="Nombre, RUN o correo" value={query} onChange={(event) => setQuery(event.target.value)} /></label></form>
            <p className="mt-6 text-sm font-medium text-muted" aria-live="polite">{filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}</p>
            {filteredUsers.length ? <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm"><table className="w-full min-w-3xl text-left"><thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted"><tr>{['Usuario', 'RUN', 'Correo', 'Rol actual', 'Acción'].map((heading) => <th className={`px-5 py-4 font-semibold ${heading === 'Acción' ? 'text-right' : ''}`} key={heading}>{heading}</th>)}</tr></thead><tbody>
              {filteredUsers.map((user) => <tr className="border-b border-line last:border-0" key={user.userId}><td className="px-5 py-4 font-semibold">{user.firstName} {user.lastName}</td><td className="px-5 py-4">{user.run}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{DASHBOARD_CONFIG[user.role].label}</td><td className="px-5 py-4 text-right"><button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-primary-light" type="button" onClick={() => openRoleDialog(user)}>Cambiar rol</button></td></tr>)}
            </tbody></table></div> : <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No se encontraron usuarios con ese criterio.</p>}
          </section>
        </main>
      </div>

      {selectedUser && !confirmationOpen && <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-labelledby="role-dialog-title"><form className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl sm:p-8" noValidate onSubmit={requestRoleChange}>
        <header className="flex justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Permisos del usuario</p><h2 className="mt-2 text-2xl font-bold" id="role-dialog-title">Asignar rol</h2></div><button className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-xl" type="button" onClick={closeDialog}>×</button></header>
        <dl className="mt-6 grid gap-4 rounded-xl bg-page p-4 sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase text-muted">Usuario</dt><dd className="mt-1 font-semibold">{selectedUser.firstName} {selectedUser.lastName}</dd></div><div><dt className="text-xs font-medium uppercase text-muted">Correo</dt><dd className="mt-1 break-words text-sm font-semibold">{selectedUser.email}</dd></div></dl>
        <label className="mt-6 block text-sm font-semibold">Nuevo rol<select className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary" value={selectedRole} aria-invalid={Boolean(roleError)} onChange={(event) => { setSelectedRole(event.target.value); setRoleError('') }}><option value="">Selecciona un rol</option><option value="ADMIN">Administrador</option><option value="RECEPTIONIST">Recepcionista</option><option value="DOCTOR">Médico</option><option value="PATIENT">Paciente</option></select><span className="mt-1.5 block min-h-5 font-normal text-red-600">{roleError}</span></label>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">El cambio modificará las funciones disponibles para este usuario.</p><footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted" type="button" onClick={closeDialog}>Cancelar</button><button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" type="submit">Guardar rol</button></footer>
      </form></div>}

      {selectedUser && confirmationOpen && isValidRole(selectedRole) && <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"><p className="text-sm font-bold uppercase tracking-widest text-primary">Confirmar cambio</p><h2 className="mt-2 text-2xl font-bold" id="confirmation-title">Asignar nuevo rol</h2><p className="mt-4 leading-7 text-muted">¿Confirmas la asignación del rol <strong className="text-ink">{DASHBOARD_CONFIG[selectedRole].label}</strong> a {selectedUser.firstName} {selectedUser.lastName}?</p><footer className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted" type="button" onClick={() => setConfirmationOpen(false)}>Volver</button><button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" type="button" onClick={confirmRoleChange}>Confirmar cambio</button></footer></section></div>}

      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted"><p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p></footer>
    </div>
  )
}

export default Roles
