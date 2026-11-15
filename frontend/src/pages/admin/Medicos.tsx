import { type FormEvent, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.tsx'
import Breadcrumbs from '../../components/layout/Breadcrumbs.tsx'
import { ROUTES } from '../../constants/routes.ts'
import { getAdminDoctors, getAdminSpecialties, getAdminUsers, saveAdminDoctor } from '../../services/admin-api.service.ts'
import { ApiError } from '../../services/api-client.ts'
import { useAuth } from '../../hooks/useAuth.ts'
import type {Doctor, DoctorErrors, DoctorValues} from '../../types/doctor.ts'
import type {Specialty} from '../../types/specialty.ts'
import type {User} from '../../types/user.ts'
import { normalizeRun } from '../../utils/validations.ts'

const emptyForm: DoctorValues = {
  doctorId: 0,
  userId: 0,
  firstName: '',
  lastName: '',
  run: '',
  email: '',
  phone: '',
  medicalLicenseNumber: '',
  specialtyId: 0,
  extraSpecialtyIds: [],
  admissionDate: '',
  active: true,
}

function Medicos() {
  const { session } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [statusDoctor, setStatusDoctor] = useState<Doctor | null>(null)
  const [values, setValues] = useState<DoctorValues>(emptyForm)
  const [errors, setErrors] = useState<DoctorErrors>({})
  const [formMessage, setFormMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    document.title = 'Gestión de médicos | MediReservas'
  }, [])
  useEffect(() => {
    if (!session?.token) return
    let active = true
    void Promise.all([getAdminDoctors(session.token), getAdminUsers(session.token), getAdminSpecialties(session.token)])
      .then(([loadedDoctors, loadedUsers, loadedSpecialties]) => {
        if (!active) return
        setDoctors(loadedDoctors)
        setUsers(loadedUsers)
        setSpecialties(loadedSpecialties)
        setLoadError('')
      })
      .catch(() => { if (active) setLoadError('No se pudieron cargar los médicos desde el servidor. Intenta actualizar la página.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session?.token])
  useEffect(() => {
    const locked = formOpen || Boolean(statusDoctor)
    document.body.classList.toggle('overflow-hidden', locked)
    return () => document.body.classList.remove('overflow-hidden')
  }, [formOpen, statusDoctor])

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return doctors.filter((doctor) => {
      const text = `${doctor.firstName ?? ''} ${doctor.lastName ?? ''} ${doctor.run ?? ''} ${doctor.email ?? ''}`.toLowerCase()
      return text.includes(normalizedQuery) && (status === 'all' || (status === 'active' ? doctor.active : !doctor.active))
    })
  }, [query, status, doctors])

  const doctorUsers = users.filter((user) =>
    (user.roles?.includes('DOCTOR') || user.role === 'DOCTOR')
      && user.active
      && !doctors.some((doctor) => doctor.userId === user.userId),
  )
  async function refreshData() {
    if (!session?.token) return false
    setLoading(true)
    try {
      const [loadedDoctors, loadedUsers, loadedSpecialties] = await Promise.all([
        getAdminDoctors(session.token), getAdminUsers(session.token), getAdminSpecialties(session.token),
      ])
      setDoctors(loadedDoctors)
      setUsers(loadedUsers)
      setSpecialties(loadedSpecialties)
      setLoadError('')
      return true
    } catch {
      setLoadError('No se pudieron actualizar los datos desde el servidor.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function openCreate() {
    await refreshData()
    setValues(emptyForm)
    setErrors({})
    setFormMessage('')
    setFormOpen(true)
  }

  function openEdit(doctor: Doctor) {
    const availableSpecialties = specialties.filter((specialty) => specialty.active)
    setValues({
      doctorId: doctor.doctorId,
      userId: doctor.userId ?? 0,
      firstName: doctor.firstName ?? '',
      lastName: doctor.lastName ?? '',
      run: doctor.run ?? '',
      email: doctor.email ?? '',
      phone: doctor.phone ?? '',
      medicalLicenseNumber: doctor.medicalLicenseNumber ?? '',
      specialtyId: availableSpecialties.some((specialty) => specialty.specialtyId === doctor.specialtyIds[0]) ? doctor.specialtyIds[0] : 0,
      extraSpecialtyIds: doctor.specialtyIds.slice(1).filter((id) => availableSpecialties.some((specialty) => specialty.specialtyId === id)),
      admissionDate: doctor.admissionDate ?? '',
      active: Boolean(doctor.active),
    })
    setErrors({})
    setFormMessage('')
    setFormOpen(true)
  }

  function getDoctorData(formValues: DoctorValues): Doctor {
    const {specialtyId, extraSpecialtyIds, ...doctor} = formValues
    return {
      ...doctor,
      firstName: doctor.firstName.trim(),
      lastName: doctor.lastName.trim(),
      run: normalizeRun(doctor.run.trim()),
      email: doctor.email.trim().toLowerCase(),
      phone: doctor.phone.trim(),
      medicalLicenseNumber: doctor.medicalLicenseNumber.trim().toUpperCase(),
      specialtyIds: [specialtyId, ...extraSpecialtyIds].filter((id, index, ids) => id && ids.indexOf(id) === index),
    }
  }

  function updateField<K extends keyof DoctorValues>(field: K, value: DoctorValues[K]) {
    const next = {...values, [field]: value}
    setValues(next)
    if (field in errors) {
      const nextErrors = validateAdminDoctor(next)
      setErrors({...errors, [field]: nextErrors[field as keyof DoctorErrors]})
    }
    setFormMessage('')
  }

  function selectPrimarySpecialty(specialtyId: number) {
    setValues((current) => ({
      ...current,
      specialtyId,
      extraSpecialtyIds: current.extraSpecialtyIds.filter((id) => id !== specialtyId),
    }))
    setErrors((current) => ({ ...current, specialtyId: undefined }))
    setFormMessage('')
  }

  function toggleExtraSpecialty(specialtyId: number, checked: boolean) {
    const nextIds = checked
      ? [...new Set([...values.extraSpecialtyIds, specialtyId])]
      : values.extraSpecialtyIds.filter((id) => id !== specialtyId)
    updateField('extraSpecialtyIds', nextIds)
  }

  function validateField(field: keyof DoctorErrors) {
    const next = field === 'run' ? {...values, run: normalizeRun(values.run)} : values
    if (field === 'run') setValues(next)
    const nextErrors = validateAdminDoctor(next)
    setErrors({...errors, [field]: nextErrors[field]})
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = getDoctorData(values)
    const nextErrors = validateAdminDoctor(values)
    setValues({
      ...values,
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      run: normalized.run,
      email: normalized.email,
      phone: normalized.phone,
      medicalLicenseNumber: normalized.medicalLicenseNumber,
    })
    setErrors(nextErrors)
    setFormMessage('')
    if (Object.keys(nextErrors).length) {
      const input = event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])
      if (input instanceof HTMLElement) input.focus()
      return
    }
    if (doctors.some((doctor) => doctor.doctorId !== normalized.doctorId
      && doctor.medicalLicenseNumber.trim().toLowerCase() === normalized.medicalLicenseNumber.toLowerCase())) {
      setFormMessage('El N° de registro ya está asociado a otro médico.')
      return
    }
    if (!session?.token) {
      setFormMessage('Tu sesión expiró. Inicia sesión nuevamente.')
      return
    }
    setSaving(true)
    try {
      await saveAdminDoctor(session.token, normalized, !normalized.doctorId)
      if (!await refreshData()) throw new Error('No se pudieron actualizar los datos.')
      setFormOpen(false)
    } catch (requestError) {
      setFormMessage(requestError instanceof ApiError ? requestError.message : 'No se pudo guardar el médico. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmStatusChange() {
    if (!statusDoctor) return
    if (!session?.token) {
      setStatusMessage('Tu sesión expiró. Inicia sesión nuevamente.')
      return
    }
    setSaving(true)
    try {
      await saveAdminDoctor(session.token, { ...statusDoctor, active: !statusDoctor.active }, false)
      if (!await refreshData()) throw new Error('No se pudieron actualizar los datos.')
      setStatusDoctor(null)
    } catch (requestError) {
      setStatusMessage(requestError instanceof ApiError ? requestError.message : 'No se pudo cambiar el estado del médico.')
    } finally {
      setSaving(false)
    }
  }

  function getSpecialtyNames(doctor: Doctor) {
    return doctor.specialtyIds
      .map((id) => specialties.find((specialty) => specialty.specialtyId === id)?.specialtyName)
      .filter(Boolean).join(', ') || 'Sin información'
  }

  return (
    <DashboardLayout currentPath={ROUTES.adminDoctors}>
      <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Gestión de médicos' }]} />
      <section className="mx-auto max-w-7xl" aria-labelledby="doctors-title">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p><h1
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="doctors-title">Gestión de
                médicos</h1><p className="mt-3 text-muted">Crea, edita y actualiza los profesionales asociados a
                MediReservas.</p></div>
              <button
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                type="button" onClick={() => void openCreate()}>+ Crear médico
              </button>
            </header>
            {loadError && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{loadError}</p>}
            {loading && <p className="mt-5 text-sm text-muted" role="status">Cargando médicos…</p>}
            <form
              className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-[1fr_14rem]"
              role="search" onSubmit={(event) => event.preventDefault()}>
              <div><label className="mb-2 block text-sm font-semibold" htmlFor="doctor-search">Buscar
                médico</label><input
                className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                id="doctor-search" name="search" type="search" placeholder="Nombre, RUN o correo" value={query}
                onChange={(event) => setQuery(event.target.value)}/></div>
              <div><label className="mb-2 block text-sm font-semibold"
                          htmlFor="doctor-status-filter">Estado</label><select
                className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                id="doctor-status-filter" name="status" value={status}
                onChange={(event) => setStatus(event.target.value)}>
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select></div>
            </form>
            <div className="mt-6" aria-live="polite"><p
              className="text-sm font-medium text-muted">{filteredDoctors.length} {filteredDoctors.length === 1 ? 'médico encontrado' : 'médicos encontrados'}</p>
            </div>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <table className="w-full min-w-4xl border-collapse text-left">
                <caption className="sr-only">Médicos registrados en MediReservas</caption>
                <thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted">
                <tr>{['Médico', 'RUN', 'Correo', 'N° registro', 'Especialidad', 'Estado', 'Acciones'].map((heading) =>
                  <th className={`px-5 py-4 font-semibold ${heading === 'Acciones' ? 'text-right' : ''}`} scope="col"
                      key={heading}>{heading}</th>)}</tr>
                </thead>
                <tbody>
                {filteredDoctors.map((doctor) => <tr className="border-b border-line last:border-0"
                                                     key={doctor.doctorId}>
                  <td
                    className="px-5 py-4 font-semibold">{`${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`.trim() || 'Sin nombre'}</td>
                  <td className="px-5 py-4">{doctor.run ?? 'Sin información'}</td>
                  <td className="px-5 py-4">{doctor.email}</td>
                  <td className="px-5 py-4">{doctor.medicalLicenseNumber}</td>
                  <td className="px-5 py-4">{getSpecialtyNames(doctor)}</td>
                   <td className="px-5 py-4"><span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${doctor.active ? 'bg-primary-light text-primary-dark' : 'bg-red-50 text-red-600'}`}>{doctor.active ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light"
                        type="button" onClick={() => openEdit(doctor)}>Editar
                      </button>
                      <button
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${doctor.active ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary-dark'}`}
                        type="button" onClick={() => {
                        setStatusDoctor(doctor);
                        setStatusMessage('')
                      }}>{doctor.active ? 'Desactivar' : 'Activar'}</button>
                    </div>
                  </td>
                </tr>)}
                </tbody>
              </table>
            </div>
            {!loading && !loadError && !filteredDoctors.length &&
              <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No se encontraron
                médicos con los filtros seleccionados.</p>}
      </section>

      {formOpen &&
        <div className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-slate-950/55 p-4" role="dialog"
             aria-modal="true" aria-labelledby="doctor-dialog-title">
          <form
            className="my-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-white p-5 shadow-xl sm:p-8"
            noValidate onSubmit={handleSubmit}>
            <header className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Ficha del médico</p><h2
                className="mt-2 text-2xl font-bold"
                id="doctor-dialog-title">{values.doctorId ? 'Editar médico' : 'Crear médico'}</h2></div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-xl text-muted transition hover:bg-page hover:text-ink"
                type="button" aria-label="Cerrar formulario" onClick={() => setFormOpen(false)}>×
              </button>
            </header>
            <div className="grid gap-x-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold" htmlFor="doctor-user-id">Usuario asociado</label>
                <select
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id="doctor-user-id" name="userId" value={values.userId || ''} aria-invalid={Boolean(errors.userId)}
                  aria-describedby="doctor-user-error"
                  disabled={Boolean(values.doctorId)}
                  onChange={(event) => updateField('userId', Number(event.target.value))}
                  onBlur={() => validateField('userId')}>
                  {values.doctorId ? (() => {
                    const associatedUser = users.find((user) => user.userId === values.userId)
                    const name = `${associatedUser?.firstName ?? values.firstName} ${associatedUser?.lastName ?? values.lastName}`.trim()
                    return <option value={values.userId}>{name || 'Médico'} — {associatedUser?.email ?? values.email}</option>
                  })() : <>
                    <option value="">Selecciona un usuario con rol médico</option>
                    {doctorUsers.map((user) => <option value={user.userId}
                                                       key={user.userId}>{user.firstName} {user.lastName} — {user.email}</option>)}
                  </>}
                </select>
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="doctor-user-error"
                   role="alert">{errors.userId}</p>
              </div>
              {([
                ['medicalLicenseNumber', 'N° registro médico', 'text', 50, 'off', 'RUM-12345', 'doctor-license'],
              ] as const).map(([field, label, type, maxLength, autoComplete, placeholder, id]) => <div key={field}>
                <label className="mb-2 block text-sm font-semibold" htmlFor={id}>{label}</label>
                <input
                  className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id={id} name={field} type={type} maxLength={maxLength} autoComplete={autoComplete}
                  placeholder={placeholder} value={values[field]} aria-invalid={Boolean(errors[field])}
                  aria-describedby={`${id}-error`} onChange={(event) => updateField(field, event.target.value)}
                  onBlur={() => validateField(field)}/>
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id={`${id}-error`} role="alert">{errors[field]}</p>
              </div>)}
              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="doctor-specialty-id">Especialidad
                  principal</label>
                <select
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id="doctor-specialty-id" name="specialtyId" value={values.specialtyId || ''}
                  aria-invalid={Boolean(errors.specialtyId)} aria-describedby="doctor-specialty-error"
                  onChange={(event) => selectPrimarySpecialty(Number(event.target.value))}
                  onBlur={() => validateField('specialtyId')}>
                  <option value="">Selecciona una especialidad</option>
                  {specialties.filter((specialty) => specialty.active || specialty.specialtyId === values.specialtyId)
                    .map((specialty) => <option value={specialty.specialtyId}
                                                key={specialty.specialtyId}>{specialty.specialtyName}{specialty.active ? '' : ' (inactiva)'}</option>)}
                </select>
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="doctor-specialty-error"
                   role="alert">{errors.specialtyId}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold" htmlFor="doctor-extra-specialties">Especialidades
                  adicionales</label>
                <fieldset className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-line bg-white p-2"
                          aria-describedby="doctor-extra-specialties-help">
                  <legend className="sr-only">Especialidades adicionales</legend>
                  {specialties.filter((specialty) => specialty.specialtyId !== values.specialtyId
                    && (specialty.active || values.extraSpecialtyIds.includes(specialty.specialtyId)))
                    .map((specialty) => <label key={specialty.specialtyId}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-primary-light">
                      <input className="size-4 accent-emerald-600" type="checkbox"
                        checked={values.extraSpecialtyIds.includes(specialty.specialtyId)}
                        onChange={(event) => toggleExtraSpecialty(specialty.specialtyId, event.target.checked)} />
                      <span>{specialty.specialtyName}{specialty.active ? '' : ' (inactiva)'}</span>
                    </label>)}
                </fieldset>
                <p className="mt-1.5 text-xs text-muted" id="doctor-extra-specialties-help">Opcional. Marca todas las especialidades que correspondan; la principal no se repite aquí.</p>
              </div>
              <div className="sm:col-span-2"><label
                className="flex items-center gap-3 rounded-xl border border-line bg-page px-4 py-3 text-sm font-semibold"><input
                className="size-4 accent-emerald-600" name="active" type="checkbox" checked={values.active}
                onChange={(event) => updateField('active', event.target.checked)}/>Médico activo</label></div>
            </div>
            <footer className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-xl border border-line px-5 py-3 font-semibold text-muted transition hover:bg-page"
                type="button" onClick={() => setFormOpen(false)}>Cancelar
              </button>
              <button
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
                type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar médico'}
              </button>
            </footer>
            <p className="mt-4 text-center text-sm font-medium text-red-600" role="status">{formMessage}</p>
          </form>
        </div>}

      {statusDoctor &&
        <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true"
             aria-labelledby="doctor-status-dialog-title" aria-describedby="doctor-status-dialog-description">
          <section className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-start gap-4"><span
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-xl text-amber-600"
              aria-hidden="true">!</span>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Estado del médico</p>
                <h2 className="mt-2 text-2xl font-bold"
                    id="doctor-status-dialog-title">{statusDoctor.active ? 'Desactivar' : 'Activar'} médico</h2>
                <p className="mt-3 leading-7 text-muted"
                   id="doctor-status-dialog-description">{statusMessage || `¿Confirmas que deseas ${statusDoctor.active ? 'desactivar' : 'activar'} al médico ${`${statusDoctor.firstName ?? ''} ${statusDoctor.lastName ?? ''}`.trim() || 'este médico'}?`}</p>
              </div>
            </div>
            <footer className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-xl border border-line px-5 py-3 font-semibold text-muted transition hover:bg-page"
                type="button" onClick={() => setStatusDoctor(null)}>Cancelar
              </button>
              <button
                className={`rounded-xl px-5 py-3 font-semibold text-white transition ${statusDoctor.active ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}
                type="button" onClick={confirmStatusChange}>{statusDoctor.active ? 'Desactivar' : 'Activar'} médico
              </button>
            </footer>
          </section>
        </div>}

    </DashboardLayout>
  )
}

function validateAdminDoctor(values: DoctorValues): DoctorErrors {
  const errors: DoctorErrors = {}
  if (!values.userId) errors.userId = 'Selecciona un usuario médico.'
  if (!values.medicalLicenseNumber.trim()) errors.medicalLicenseNumber = 'El registro médico es obligatorio.'
  else if (values.medicalLicenseNumber.trim().length > 50) errors.medicalLicenseNumber = 'El registro médico no puede superar 50 caracteres.'
  if (!values.specialtyId && values.extraSpecialtyIds.length === 0) errors.specialtyId = 'Selecciona al menos una especialidad.'
  return errors
}

export default Medicos
