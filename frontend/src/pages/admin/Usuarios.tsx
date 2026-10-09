import {type FormEvent, useEffect, useMemo, useState} from 'react'
import {Link, Navigate, useNavigate} from 'react-router-dom'
import {DASHBOARD_CONFIG} from '../../lib/roles.ts'
import {
  getNextUserId,
  getSession,
  getUsers,
  isUserDataTaken,
  removeSession,
  saveUser,
  updateUser,
  updateUserStatus
} from '../../lib/storage.ts'
import type {ManagedUserErrors, ManagedUserValues, User} from '../../lib/types.ts'
import {normalizeRun, validateManagedUser} from '../../lib/validations.ts'

const emptyForm: ManagedUserValues = {
  userId: 0,
  run: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  password: ''
}

function Usuarios() {
  const navigate = useNavigate()
  const session = getSession()
  const config = session ? DASHBOARD_CONFIG[session.role] : null
  const [users, setUsers] = useState<User[]>(getUsers())
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [statusUser, setStatusUser] = useState<User | null>(null)
  const [values, setValues] = useState<ManagedUserValues>(emptyForm)
  const [errors, setErrors] = useState<ManagedUserErrors>({})
  const [formMessage, setFormMessage] = useState('')

  useEffect(() => {
    document.title = 'Gestión de usuarios | MediReservas'
  }, [])
  useEffect(() => {
    const locked = menuOpen || formOpen || Boolean(statusUser)
    document.body.classList.toggle('overflow-hidden', locked)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen, formOpen, statusUser])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return users.filter((user) => {
      const text = `${user.firstName} ${user.lastName} ${user.run} ${user.email}`.toLowerCase()
      return text.includes(normalizedQuery) && (status === 'all' || (status === 'active' ? user.active : !user.active))
    })
  }, [query, status, users])

  if (!session || !config) return <Navigate to="/login" replace/>
  if (session.role !== 'ADMIN') return <Navigate to="/dashboard" replace/>

  const navigation = [
    {icon: '⌂', title: 'Panel principal', href: '/dashboard', reactRoute: true},
    {icon: 'MI', title: 'Mi perfil', href: '/perfil', reactRoute: true},
    ...config.actions,
  ]

  function refreshUsers() {
    setUsers(getUsers())
  }

  function logout() {
    removeSession();
    navigate('/login', {replace: true})
  }

  function openCreate() {
    setValues(emptyForm);
    setErrors({});
    setFormMessage('');
    setFormOpen(true)
  }

  function openEdit(user: User) {
    setValues({
      userId: user.userId,
      run: user.run,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      address: user.address ?? '',
      password: ''
    })
    setErrors({});
    setFormMessage('');
    setFormOpen(true)
  }

  function updateField(field: keyof ManagedUserValues, value: string) {
    const next = {...values, [field]: value}
    setValues(next)
    if (field !== 'userId' && errors[field]) setErrors(validateManagedUser(next, Boolean(next.userId)))
    setFormMessage('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = {
      ...values,
      run: normalizeRun(values.run.trim()),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      address: values.address.trim()
    }
    const nextErrors = validateManagedUser(normalized, Boolean(normalized.userId))
    setValues(normalized);
    setErrors(nextErrors);
    setFormMessage('')
    if (Object.keys(nextErrors).length) return
    if (isUserDataTaken(normalized.run, normalized.email, normalized.userId || undefined)) {
      setFormMessage('El RUN o correo ya está asociado a otra cuenta.');
      return
    }
    if (normalized.userId) {
      const {userId, password, ...changes} = normalized
      updateUser(userId, password ? {...changes, password} : changes)
    } else {
      const userId = getNextUserId()
      saveUser({...normalized, userId, authUserId: userId, role: 'PATIENT', active: true})
    }
    setFormOpen(false);
    refreshUsers()
  }

  function confirmStatusChange() {
    if (!statusUser) return
    if (!updateUserStatus(statusUser.userId, !statusUser.active)) return
    setStatusUser(null);
    refreshUsers()
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a
        className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
        href="#main-content">Saltar al contenido principal</a>
      <header className="relative z-30 border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
             aria-label="Barra superior de MediReservas">
          <div className="flex items-center gap-3 lg:pl-8">
            <button
              className="grid size-10 place-items-center rounded-xl border border-line text-xl text-primary-dark lg:hidden"
              type="button" aria-label="Abrir menú de navegación" aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}>☰
            </button>
            <Link className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl" to="/"><span
              className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white">+</span><span
              className="hidden sm:inline">MediReservas</span></Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link className="text-right" to="/perfil"><p
              className="text-sm font-semibold">{session.firstName} {session.lastName}</p><p
              className="text-xs text-muted">{config.label}</p></Link>
            <button
              className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark hover:bg-red-50 hover:text-red-600"
              type="button" onClick={logout}><span className="sm:hidden">Salir</span><span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </header>

      <button className={`fixed inset-0 z-40 bg-slate-950/45 lg:hidden ${menuOpen ? '' : 'hidden'}`} type="button"
              aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}/>
      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-white px-5 py-5 shadow-xl transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:px-5 lg:py-8 lg:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className="mb-6 flex items-center justify-between border-b border-line pb-5 lg:hidden"><p
            className="font-bold text-primary-dark">Menú principal</p>
            <button className="grid size-10 place-items-center rounded-xl border border-line text-xl" type="button"
                    onClick={() => setMenuOpen(false)}>×
            </button>
          </header>
          <nav className="lg:sticky lg:top-8"><p
            className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block">Navegación</p>
            <ul className="flex flex-col gap-2">
              {navigation.map((item) => <li key={item.title}>{item.reactRoute ? <Link
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${item.href === '/usuarios' ? 'bg-primary-light text-primary-dark' : 'text-muted hover:bg-primary-light'}`}
                to={item.href} onClick={() => setMenuOpen(false)}><span
                className="grid size-7 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark">{item.icon}</span>{item.title}
              </Link> : <a
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-primary-light"
                href={item.href}><span
                className="grid size-7 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark">{item.icon}</span>{item.title}
              </a>}</li>)}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8" id="main-content" tabIndex={-1}>
          <nav className="mb-6 text-sm" aria-label="Ruta de navegación">
            <ol className="flex gap-2 text-muted">
              <li><Link className="font-semibold text-primary-dark" to="/dashboard">Panel principal</Link></li>
              <li>/</li>
              <li className="font-semibold text-ink">Gestión de usuarios</li>
            </ol>
          </nav>
          <section className="mx-auto max-w-7xl" aria-labelledby="users-title">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p><h1
                className="mt-3 text-3xl font-bold sm:text-4xl" id="users-title">Gestión de usuarios</h1><p
                className="mt-3 text-muted">Consulta, crea y actualiza las cuentas registradas en MediReservas.</p>
              </div>
              <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark"
                      type="button" onClick={openCreate}>+ Crear usuario
              </button>
            </header>
            <form
              className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-[1fr_14rem]"
              role="search" onSubmit={(event) => event.preventDefault()}>
              <label className="text-sm font-semibold">Buscar usuario<input
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary"
                type="search" placeholder="Nombre, RUN o correo" value={query}
                onChange={(event) => setQuery(event.target.value)}/></label>
              <label className="text-sm font-semibold">Estado<select
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary"
                value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select></label>
            </form>
            <p className="mt-6 text-sm font-medium text-muted"
               aria-live="polite">{filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}</p>
            {filteredUsers.length ?
              <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
                <table className="w-full min-w-4xl text-left">
                  <caption className="sr-only">Usuarios registrados en MediReservas</caption>
                  <thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted">
                  <tr>{['Usuario', 'RUN', 'Correo', 'Rol', 'Estado', 'Acciones'].map((heading) => <th
                    className={`px-5 py-4 font-semibold ${heading === 'Acciones' ? 'text-right' : ''}`}
                    key={heading}>{heading}</th>)}</tr>
                  </thead>
                  <tbody>
                  {filteredUsers.map((user) => <tr className="border-b border-line last:border-0" key={user.userId}>
                    <td className="px-5 py-4 font-semibold">{user.firstName} {user.lastName}</td>
                    <td className="px-5 py-4">{user.run}</td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">{DASHBOARD_CONFIG[user.role].label}</td>
                    <td className="px-5 py-4"><span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${user.active ? 'bg-primary-light text-primary-dark' : 'bg-red-50 text-red-600'}`}>{user.active ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-primary-light"
                          type="button" onClick={() => openEdit(user)}>Editar
                        </button>
                        <button
                          className={`rounded-lg px-3 py-2 text-sm font-semibold ${user.active ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary-dark'}`}
                          type="button"
                          onClick={() => setStatusUser(user)}>{user.active ? 'Desactivar' : 'Activar'}</button>
                      </div>
                    </td>
                  </tr>)}
                  </tbody>
                </table>
              </div> :
              <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No se encontraron
                usuarios con los filtros seleccionados.</p>}
          </section>
        </main>
      </div>

      {formOpen &&
        <div className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-slate-950/55 p-4" role="dialog"
             aria-modal="true" aria-labelledby="user-dialog-title">
          <form className="my-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-xl sm:p-8"
                noValidate onSubmit={handleSubmit}>
            <header className="mb-6 flex justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Cuenta de usuario</p><h2
                className="mt-2 text-2xl font-bold"
                id="user-dialog-title">{values.userId ? 'Editar usuario' : 'Crear usuario'}</h2></div>
              <button className="grid size-10 place-items-center rounded-xl border border-line text-xl" type="button"
                      onClick={() => setFormOpen(false)}>×
              </button>
            </header>
            <div className="grid gap-x-5 sm:grid-cols-2">
              {([
                ['run', 'RUN', 'text', 12], ['firstName', 'Nombre', 'text', 80], ['lastName', 'Apellidos', 'text', 80], ['email', 'Correo electrónico', 'email', 100], ['phone', 'Teléfono', 'tel', 20], ['address', 'Dirección', 'text', 150],
              ] as const).map(([field, label, type, maxLength]) => <label className="text-sm font-semibold"
                                                                          key={field}>{label}<input
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary"
                type={type} maxLength={maxLength} value={values[field]} aria-invalid={Boolean(errors[field])}
                onChange={(event) => updateField(field, event.target.value)}
                onBlur={() => field === 'run' && updateField('run', normalizeRun(values.run))}/><span
                className="mt-1.5 block min-h-5 font-normal text-red-600">{errors[field]}</span></label>)}
              <label className="text-sm font-semibold sm:col-span-2">Contraseña temporal<input
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary"
                type="password" maxLength={100} value={values.password} aria-invalid={Boolean(errors.password)}
                onChange={(event) => updateField('password', event.target.value)}/><span
                className="mt-1.5 block text-xs font-normal text-muted">Es obligatoria al crear la cuenta. Déjala vacía al editar para conservar la actual.</span><span
                className="mt-1.5 block min-h-5 font-normal text-red-600">{errors.password}</span></label>
            </div>
            <p className="text-center text-sm font-medium text-red-600">{formMessage}</p>
            <footer className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted" type="button"
                      onClick={() => setFormOpen(false)}>Cancelar
              </button>
              <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" type="submit">Guardar
                usuario
              </button>
            </footer>
          </form>
        </div>}

      {statusUser &&
        <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true"
             aria-labelledby="status-title">
          <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <div className="flex gap-4"><span
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-xl text-pending">!</span>
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Estado de cuenta</p><h2
                className="mt-2 text-2xl font-bold"
                id="status-title">{statusUser.active ? 'Desactivar' : 'Activar'} usuario</h2><p
                className="mt-3 leading-7 text-muted">¿Confirmas que
                deseas {statusUser.active ? 'desactivar' : 'activar'} la cuenta
                de {statusUser.firstName} {statusUser.lastName}?</p></div>
            </div>
            <footer className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted" type="button"
                      onClick={() => setStatusUser(null)}>Cancelar
              </button>
              <button
                className={`rounded-xl px-5 py-3 font-semibold text-white ${statusUser.active ? 'bg-red-600' : 'bg-primary'}`}
                type="button"
                onClick={confirmStatusChange}>{statusUser.active ? 'Desactivar cuenta' : 'Activar cuenta'}</button>
            </footer>
          </section>
        </div>}

      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p></footer>
    </div>
  )
}

export default Usuarios
