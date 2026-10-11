import { type FormEvent, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.tsx'
import { ROUTES } from '../../constants/routes.ts'
import {createDoctor, editDoctor, getDoctors, initializeDoctors, isDoctorDataTaken, setDoctorStatus} from '../../services/doctors.service.ts'
import {getSpecialties, initializeSpecialties} from '../../services/specialties.service.ts'
import {getUsers, initializeUsers} from '../../services/users.service.ts'
import type {Doctor, DoctorErrors, DoctorValues} from '../../types/doctor.ts'
import type {Specialty} from '../../types/specialty.ts'
import type {User} from '../../types/user.ts'
import {getLocalDateString, normalizeRun, validateDoctor} from '../../utils/validations.ts'

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

initializeUsers()
initializeSpecialties()
initializeDoctors()

function Medicos() {
  const [doctors, setDoctors] = useState<Doctor[]>(getDoctors())
  const [users, setUsers] = useState<User[]>(getUsers())
  const [specialties, setSpecialties] = useState<Specialty[]>(getSpecialties())
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

  const doctorUsers = users.filter((user) => user.role === 'DOCTOR' && user.active)
  const activeSpecialties = specialties.filter((specialty) => specialty.active)

  function refreshSelects() {
    setUsers(getUsers())
    setSpecialties(getSpecialties())
  }

  function openCreate() {
    refreshSelects()
    setValues(emptyForm)
    setErrors({})
    setFormMessage('')
    setFormOpen(true)
  }

  function openEdit(doctor: Doctor) {
    refreshSelects()
    const availableUsers = getUsers().filter((user) => user.role === 'DOCTOR' && user.active)
    const availableSpecialties = getSpecialties().filter((specialty) => specialty.active)
    setValues({
      doctorId: doctor.doctorId,
      userId: availableUsers.some((user) => user.userId === doctor.userId) ? doctor.userId ?? 0 : 0,
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
      const nextErrors = validateDoctor(getDoctorData(next))
      setErrors({...errors, [field]: nextErrors[field as keyof DoctorErrors]})
    }
    setFormMessage('')
  }

  function validateField(field: keyof DoctorErrors) {
    const next = field === 'run' ? {...values, run: normalizeRun(values.run)} : values
    if (field === 'run') setValues(next)
    const nextErrors = validateDoctor(getDoctorData(next))
    setErrors({...errors, [field]: nextErrors[field]})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = getDoctorData(values)
    const nextErrors = validateDoctor(normalized)
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
    if (isDoctorDataTaken(normalized.run, normalized.medicalLicenseNumber, normalized.doctorId || undefined)) {
      setFormMessage('El RUN o N° de registro ya está asociado a otro médico.')
      return
    }
    if (normalized.doctorId) {
      const {doctorId, ...changes} = normalized
      if (!editDoctor(doctorId, changes)) {
        setFormMessage('No fue posible encontrar al médico seleccionado.')
        return
      }
    } else {
      createDoctor(normalized)
    }
    setFormOpen(false)
    setDoctors(getDoctors())
  }

  function confirmStatusChange() {
    if (!statusDoctor) return
    if (!setDoctorStatus(statusDoctor.doctorId, !statusDoctor.active)) {
      setStatusMessage('No fue posible encontrar al médico seleccionado.')
      return
    }
    setStatusDoctor(null)
    setDoctors(getDoctors())
  }

  function getSpecialtyNames(doctor: Doctor) {
    return doctor.specialtyIds
      .map((id) => specialties.find((specialty) => specialty.specialtyId === id)?.specialtyName)
      .filter(Boolean).join(', ') || 'Sin información'
  }

  return (
    <DashboardLayout currentPath={ROUTES.adminDoctors}>
      <section className="mx-auto max-w-7xl" aria-labelledby="doctors-title">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p><h1
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="doctors-title">Gestión de
                médicos</h1><p className="mt-3 text-muted">Crea, edita y actualiza los profesionales asociados a
                MediReservas.</p></div>
              <button
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                type="button" onClick={openCreate}>+ Crear médico
              </button>
            </header>
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
                <tr>{['Médico', 'RUN', 'Correo', 'N° registro', 'Especialidad', 'Fecha ingreso', 'Estado', 'Acciones'].map((heading) =>
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
                  <td className="px-5 py-4">{doctor.admissionDate || 'Sin información'}</td>
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
            {!filteredDoctors.length &&
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
                  onChange={(event) => updateField('userId', Number(event.target.value))}
                  onBlur={() => validateField('userId')}>
                  <option value="">Selecciona un usuario con rol médico</option>
                  {doctorUsers.map((user) => <option value={user.userId}
                                                     key={user.userId}>{user.firstName} {user.lastName} — {user.email}</option>)}
                </select>
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="doctor-user-error"
                   role="alert">{errors.userId}</p>
              </div>
              {([
                ['firstName', 'Nombre', 'text', 50, 'given-name', '', 'doctor-first-name'],
                ['lastName', 'Apellido', 'text', 50, 'family-name', '', 'doctor-last-name'],
                ['run', 'RUN', 'text', 12, 'off', '12345678-5', 'doctor-run'],
                ['email', 'Correo electrónico', 'email', 100, 'email', '', 'doctor-email'],
                ['phone', 'Teléfono', 'tel', 20, 'tel', '+56 9 1234 5678', 'doctor-phone'],
                ['medicalLicenseNumber', 'N° registro médico', 'text', 20, 'off', 'RUM-12345', 'doctor-license'],
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
                  onChange={(event) => updateField('specialtyId', Number(event.target.value))}
                  onBlur={() => validateField('specialtyId')}>
                  <option value="">Selecciona una especialidad</option>
                  {activeSpecialties.map((specialty) => <option value={specialty.specialtyId}
                                                                key={specialty.specialtyId}>{specialty.specialtyName}</option>)}
                </select>
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="doctor-specialty-error"
                   role="alert">{errors.specialtyId}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="doctor-admission-date">Fecha de
                  ingreso</label>
                <input
                  className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id="doctor-admission-date" name="admissionDate" type="date" max={getLocalDateString()}
                  value={values.admissionDate} aria-invalid={Boolean(errors.admissionDate)}
                  aria-describedby="doctor-admission-error"
                  onChange={(event) => updateField('admissionDate', event.target.value)}
                  onBlur={() => validateField('admissionDate')}/>
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="doctor-admission-error"
                   role="alert">{errors.admissionDate}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold" htmlFor="doctor-extra-specialties">Especialidades
                  adicionales</label>
                <select
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id="doctor-extra-specialties" name="extraSpecialtyIds" multiple size={4}
                  aria-describedby="doctor-extra-specialties-help" value={values.extraSpecialtyIds.map(String)}
                  onChange={(event) => updateField('extraSpecialtyIds', Array.from(event.target.selectedOptions, (option) => Number(option.value)))}>
                  {activeSpecialties.map((specialty) => <option value={specialty.specialtyId}
                                                                key={specialty.specialtyId}>{specialty.specialtyName}</option>)}
                </select>
                <p className="mt-1.5 text-xs text-muted" id="doctor-extra-specialties-help">Opcional. Usa Ctrl para
                  seleccionar varias.</p>
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
                type="submit">Guardar médico
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

export default Medicos
