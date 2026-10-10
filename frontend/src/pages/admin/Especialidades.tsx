import {type FormEvent, useEffect, useState} from 'react'
import {Link, Navigate, useNavigate} from 'react-router-dom'
import {DASHBOARD_CONFIG} from '../../constants/roles.ts'
import {getSession, removeSession} from '../../lib/storage.ts'
import {createSpecialty, editSpecialty, getSpecialties, initializeSpecialties, isSpecialtyNameTaken, setSpecialtyStatus} from '../../services/specialties.service.ts'
import type {Specialty, SpecialtyErrors, SpecialtyValues} from '../../types/specialty.ts'
import {validateSpecialty} from '../../lib/validations.ts'

const emptyForm: SpecialtyValues = {
  specialtyId: 0,
  specialtyName: '',
  description: '',
  active: true,
}

initializeSpecialties()

function Especialidades() {
  const navigate = useNavigate()
  const session = getSession()
  const config = session ? DASHBOARD_CONFIG[session.role] : null
  const [specialties, setSpecialties] = useState<Specialty[]>(getSpecialties())
  const [menuOpen, setMenuOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [statusSpecialty, setStatusSpecialty] = useState<Specialty | null>(null)
  const [values, setValues] = useState<SpecialtyValues>(emptyForm)
  const [errors, setErrors] = useState<SpecialtyErrors>({})
  const [formMessage, setFormMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    document.title = 'Gestión de especialidades | MediReservas'
  }, [])
  useEffect(() => {
    const locked = menuOpen || formOpen || Boolean(statusSpecialty)
    document.body.classList.toggle('overflow-hidden', locked)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen, formOpen, statusSpecialty])

  if (!session || !config) return <Navigate to="/login" replace/>
  if (session.role !== 'ADMIN') return <Navigate to="/dashboard" replace/>

  const navigation = [
    {icon: '⌂', title: 'Panel principal', href: '/dashboard', reactRoute: true},
    {icon: 'MI', title: 'Mi perfil', href: '/perfil', reactRoute: true},
    ...config.actions,
  ]

  function logout() {
    removeSession()
    navigate('/login', {replace: true})
  }

  function openCreate() {
    setValues(emptyForm)
    setErrors({})
    setFormMessage('')
    setFormOpen(true)
  }

  function openEdit(specialty: Specialty) {
    setValues({...specialty, specialtyName: specialty.specialtyName ?? '', description: specialty.description ?? ''})
    setErrors({})
    setFormMessage('')
    setFormOpen(true)
  }

  function updateField(field: 'specialtyName' | 'description', value: string) {
    setValues({...values, [field]: value})
    setFormMessage('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = {...values, specialtyName: values.specialtyName.trim(), description: values.description.trim()}
    const nextErrors = validateSpecialty(normalized)
    setValues(normalized)
    setErrors(nextErrors)
    setFormMessage('')
    if (Object.keys(nextErrors).length) {
      const input = event.currentTarget.elements.namedItem(nextErrors.specialtyName ? 'specialtyName' : 'description')
      if (input instanceof HTMLElement) input.focus()
      return
    }
    if (isSpecialtyNameTaken(normalized.specialtyName, normalized.specialtyId || undefined)) {
      setFormMessage('Ya existe una especialidad con ese nombre.')
      return
    }
    if (normalized.specialtyId) {
      const {specialtyId, ...changes} = normalized
      if (!editSpecialty(specialtyId, changes)) {
        setFormMessage('No fue posible encontrar la especialidad seleccionada.')
        return
      }
    } else {
      createSpecialty(normalized)
    }
    setFormOpen(false)
    setSpecialties(getSpecialties())
  }

  function confirmStatusChange() {
    if (!statusSpecialty) return
    if (!setSpecialtyStatus(statusSpecialty.specialtyId, !statusSpecialty.active)) {
      setStatusMessage('No fue posible encontrar la especialidad seleccionada.')
      return
    }
    setStatusSpecialty(null)
    setSpecialties(getSpecialties())
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
          <nav className="lg:sticky lg:top-8">
            <p
              className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block">Navegación</p>
            <ul className="flex flex-col gap-2">
              {navigation.map((item) => <li key={item.title}>{item.reactRoute ? <Link
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-primary-light"
                to={item.href} onClick={() => setMenuOpen(false)}><span
                className="grid size-7 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark">{item.icon}</span>{item.title}
              </Link> : <a
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${item.href === '/admin/especialidades' ? 'bg-primary-light text-primary-dark' : 'text-muted hover:bg-primary-light'}`}
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
              <li className="font-semibold text-ink">Gestión de especialidades</li>
            </ol>
          </nav>
          <section className="mx-auto max-w-5xl" aria-labelledby="specialties-title">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p><h1
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="specialties-title">Gestión de
                especialidades</h1><p className="mt-3 text-muted">Administra las áreas de atención médica disponibles
                para las reservas.</p></div>
              <button
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                type="button" onClick={openCreate}>+ Crear especialidad
              </button>
            </header>
            <div className="mt-8" aria-live="polite"><p
              className="text-sm font-medium text-muted">{specialties.length} {specialties.length === 1 ? 'especialidad registrada' : 'especialidades registradas'}</p>
            </div>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <table className="w-full min-w-3xl border-collapse text-left">
                <caption className="sr-only">Especialidades médicas de MediReservas</caption>
                <thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted">
                <tr>{['Especialidad', 'Descripción', 'Estado', 'Acciones'].map((heading) => <th
                  className={`px-5 py-4 font-semibold ${heading === 'Acciones' ? 'text-right' : ''}`} scope="col"
                  key={heading}>{heading}</th>)}</tr>
                </thead>
                <tbody>
                {specialties.map((specialty) => <tr className="border-b border-line last:border-0"
                                                    key={specialty.specialtyId}>
                  <td className="px-5 py-4 font-semibold">{specialty.specialtyName}</td>
                  <td className="px-5 py-4">{specialty.description || 'Sin descripción'}</td>
                  <td className="px-5 py-4"><span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${specialty.active ? 'bg-primary-light text-primary-dark' : 'bg-red-50 text-red-600'}`}>{specialty.active ? 'Activa' : 'Inactiva'}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light"
                        type="button" onClick={() => openEdit(specialty)}>Editar
                      </button>
                      <button
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${specialty.active ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary-dark'}`}
                        type="button" onClick={() => {
                        setStatusSpecialty(specialty);
                        setStatusMessage('')
                      }}>{specialty.active ? 'Desactivar' : 'Activar'}</button>
                    </div>
                  </td>
                </tr>)}
                </tbody>
              </table>
            </div>
            {!specialties.length &&
              <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No hay
                especialidades registradas.</p>}
          </section>
        </main>
      </div>

      {formOpen &&
        <div className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-slate-950/55 p-4" role="dialog"
             aria-modal="true" aria-labelledby="specialty-dialog-title">
          <form
            className="my-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-white p-5 shadow-xl sm:p-8"
            noValidate onSubmit={handleSubmit}>
            <header className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Área de atención</p><h2
                className="mt-2 text-2xl font-bold"
                id="specialty-dialog-title">{values.specialtyId ? 'Editar especialidad' : 'Crear especialidad'}</h2>
              </div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-xl text-muted transition hover:bg-page hover:text-ink"
                type="button" aria-label="Cerrar formulario" onClick={() => setFormOpen(false)}>×
              </button>
            </header>
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="specialty-name">Nombre</label>
              <input
                className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                id="specialty-name" name="specialtyName" type="text" maxLength={60} placeholder="Ej.: Cardiología"
                value={values.specialtyName} aria-invalid={Boolean(errors.specialtyName)}
                aria-describedby="specialty-name-error"
                onChange={(event) => updateField('specialtyName', event.target.value)}/>
              <p className="mt-1.5 min-h-5 text-sm text-red-600" id="specialty-name-error"
                 role="alert">{errors.specialtyName}</p>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold" htmlFor="specialty-description">Descripción</label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                id="specialty-description" name="description" maxLength={150}
                placeholder="Breve descripción del área de atención" value={values.description}
                aria-invalid={Boolean(errors.description)} aria-describedby="specialty-description-error"
                onChange={(event) => updateField('description', event.target.value)}/>
              <p className="mt-1.5 min-h-5 text-sm text-red-600" id="specialty-description-error"
                 role="alert">{errors.description}</p>
            </div>
            <div className="mt-4"><label
              className="flex items-center gap-3 rounded-xl border border-line bg-page px-4 py-3 text-sm font-semibold"><input
              className="size-4 accent-emerald-600" name="active" type="checkbox" checked={values.active}
              onChange={(event) => setValues({...values, active: event.target.checked})}/>Especialidad activa</label>
            </div>
            <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-xl border border-line px-5 py-3 font-semibold text-muted transition hover:bg-page"
                type="button" onClick={() => setFormOpen(false)}>Cancelar
              </button>
              <button
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
                type="submit">Guardar especialidad
              </button>
            </footer>
            <p className="mt-4 text-center text-sm font-medium text-red-600" role="status">{formMessage}</p>
          </form>
        </div>}

      {statusSpecialty &&
        <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true"
             aria-labelledby="specialty-status-dialog-title" aria-describedby="specialty-status-dialog-description">
          <section className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-start gap-4"><span
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-xl text-amber-600"
              aria-hidden="true">!</span>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Estado de especialidad</p>
                <h2 className="mt-2 text-2xl font-bold"
                    id="specialty-status-dialog-title">{statusSpecialty.active ? 'Desactivar' : 'Activar'} especialidad</h2>
                <p className="mt-3 leading-7 text-muted"
                   id="specialty-status-dialog-description">{statusMessage || `¿Confirmas que deseas ${statusSpecialty.active ? 'desactivar' : 'activar'} la especialidad ${statusSpecialty.specialtyName}?`}</p>
              </div>
            </div>
            <footer className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-xl border border-line px-5 py-3 font-semibold text-muted transition hover:bg-page"
                type="button" onClick={() => setStatusSpecialty(null)}>Cancelar
              </button>
              <button
                className={`rounded-xl px-5 py-3 font-semibold text-white transition ${statusSpecialty.active ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}
                type="button"
                onClick={confirmStatusChange}>{statusSpecialty.active ? 'Desactivar' : 'Activar'} especialidad
              </button>
            </footer>
          </section>
        </div>}

      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p></footer>
    </div>
  )
}

export default Especialidades
