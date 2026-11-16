import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { getPublicDoctorDirectory, getPublicDoctorSchedules } from '../../services/public-doctor-directory.service'
import type { Doctor } from '../../types/doctor'
import type { Specialty } from '../../types/specialty'
import type { Schedule } from '../../types/schedule'
import { getLocalDateString } from '../../utils/validations'

function formatScheduleDate(date: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function MedicosEspecialidades() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [specialtyId, setSpecialtyId] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedDoctorSchedules, setSelectedDoctorSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [error, setError] = useState('')
  const [scheduleError, setScheduleError] = useState('')

  useEffect(() => {
    document.title = 'Médicos y especialidades | MediReservas'
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      void getPublicDoctorDirectory()
        .then((directory) => {
          if (!active) return
          setDoctors(directory.doctors)
          setSpecialties(directory.specialties)
        })
        .catch((cause: unknown) => {
          if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el directorio médico.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!location.hash) return
    window.requestAnimationFrame(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location.hash])

  const activeSpecialties = useMemo(() => specialties.filter((specialty) => specialty.active), [specialties])
  const activeDoctors = useMemo(() => doctors.filter((doctor) => doctor.active), [doctors])
  const specialtyById = new Map(activeSpecialties.map((specialty) => [specialty.specialtyId, specialty]))
  const specialtySearchTerm = specialtySearch.trim().toLowerCase()
  const doctorSearchTerm = doctorSearch.trim().toLowerCase()
  const selectedSpecialtyId = Number(specialtyId)
  const visibleSpecialties = activeSpecialties.filter((specialty) => specialty.specialtyName.toLowerCase().includes(specialtySearchTerm))
  const visibleDoctors = activeDoctors
    .filter((doctor) => `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(doctorSearchTerm))
    .filter((doctor) => !selectedSpecialtyId || doctor.specialtyIds.includes(selectedSpecialtyId))
  useEffect(() => {
    if (!selectedDoctor) return
    let active = true
    const timer = window.setTimeout(() => {
      setLoadingSchedules(true)
      setScheduleError('')
      void getPublicDoctorSchedules(selectedDoctor.doctorId)
        .then((schedules) => {
          if (active) setSelectedDoctorSchedules(schedules.filter((schedule) => schedule.date >= getLocalDateString()))
        })
        .catch((cause: unknown) => {
          if (active) {
            setSelectedDoctorSchedules([])
            setScheduleError(cause instanceof Error ? cause.message : 'No se pudieron cargar los horarios disponibles.')
          }
        })
        .finally(() => {
          if (active) setLoadingSchedules(false)
        })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [selectedDoctor])

  function filterDoctors(selectedSpecialtyId: number) {
    setSpecialtyId(String(selectedSpecialtyId))
    document.querySelector('#medicos')?.scrollIntoView({ behavior: 'smooth' })
  }

  function doctorSpecialties(doctor: Doctor) {
    return doctor.specialtyIds.map((id) => specialtyById.get(id)).filter(Boolean)
  }

  return (
    <Fragment>
      <PublicLayout currentPage="directory" compactFooter>
        <section className="bg-primary-dark py-14 text-white sm:py-20" aria-labelledby="directory-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">Directorio médico</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl" id="directory-title">Encuentra la atención que necesitas</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50">Consulta las especialidades disponibles y conoce a nuestros profesionales de salud.</p>
          </div>
        </section>

        <section className="scroll-mt-24 py-14 sm:py-20" id="especialidades" aria-labelledby="specialties-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Especialidades</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight" id="specialties-title">Áreas de atención médica</h2>
                <p className="mt-3 text-muted">Selecciona una especialidad para consultar sus médicos disponibles.</p>
              </div>
              <label className="w-full text-sm font-semibold md:max-w-sm">Buscar especialidad
                <input className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100" type="search" value={specialtySearch} onChange={(event) => setSpecialtySearch(event.target.value)} placeholder="Ej.: Cardiología" />
              </label>
            </div>
            {loading ? <p role="status" className="mt-6 text-muted">Cargando directorio médico...</p> : error ? (
              <p role="alert" className="mt-6 text-red-700">{error}</p>
            ) : visibleSpecialties.length ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSpecialties.map((specialty) => (
                  <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg" key={specialty.specialtyId}>
                    <h3 className="text-xl font-bold">{specialty.specialtyName}</h3>
                    <p className="mt-3 flex-1 leading-7 text-muted">{specialty.description}</p>
                    <button className="mt-5 self-start font-semibold text-primary-dark hover:text-primary" type="button" onClick={() => filterDoctors(specialty.specialtyId)}>Ver médicos</button>
                  </article>
                ))}
              </div>
            ) : <EmptyState>No se encontraron especialidades.</EmptyState>}
          </div>
        </section>

        <section className="scroll-mt-24 border-t border-line bg-white py-14 sm:py-20" id="medicos" aria-labelledby="doctors-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Profesionales</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight" id="doctors-title">Médicos disponibles</h2>
            <p className="mt-3 text-muted">Busca por nombre o filtra el listado según especialidad.</p>
            <div className="mt-7 grid gap-5 rounded-2xl border border-line bg-page p-5 md:grid-cols-2">
              <label className="text-sm font-semibold">Buscar médico
                <input className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100" type="search" value={doctorSearch} onChange={(event) => setDoctorSearch(event.target.value)} placeholder="Ej.: Daniela Rojas" />
              </label>
              <label className="text-sm font-semibold">Filtrar por especialidad
                <select className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100" value={specialtyId} onChange={(event) => setSpecialtyId(event.target.value)}>
                  <option value="">Todas las especialidades</option>
                   {activeSpecialties.map((specialty) => <option value={specialty.specialtyId} key={specialty.specialtyId}>{specialty.specialtyName}</option>)}
                </select>
              </label>
            </div>
            {!loading && !error && visibleDoctors.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleDoctors.map((doctor) => (
                  <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm" key={doctor.doctorId}>
                    <h3 className="text-xl font-bold">{doctor.firstName} {doctor.lastName}</h3>
                    <p className="mt-3 text-primary-dark">Especialidad: {doctorSpecialties(doctor).map((item) => item?.specialtyName).join(', ')}</p>
                    <p className="mt-1 text-sm text-muted">Registro médico: {doctor.medicalLicenseNumber}</p>
                    <button className="mt-5 self-start rounded-xl border border-primary px-4 py-2 font-semibold text-primary-dark transition hover:bg-primary-light" type="button" onClick={() => {
                      setSelectedDoctorSchedules([])
                      setSelectedDoctor(doctor)
                    }}>Ver detalle</button>
                  </article>
                ))}
              </div>
            ) : !loading && !error ? <EmptyState>No se encontraron médicos.</EmptyState> : null}
          </div>
        </section>
      </PublicLayout>

      {selectedDoctor && (
        <Modal
          eyebrow="Profesional"
          title={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
          onClose={() => {
            setSelectedDoctor(null)
            setSelectedDoctorSchedules([])
          }}
          footer={<Link className="inline-flex w-full justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark" to={isAuthenticated ? `${ROUTES.requestAppointment}?medico=${selectedDoctor.doctorId}` : ROUTES.login}>{isAuthenticated ? 'Solicitar cita' : 'Iniciar sesión para reservar'}</Link>}
        >
            <dl className="space-y-4">
              <div><dt className="text-sm font-semibold text-muted">Especialidades</dt><dd className="mt-1">{doctorSpecialties(selectedDoctor).map((item) => item?.specialtyName).join(', ')}</dd></div>
              <div><dt className="text-sm font-semibold text-muted">Registro médico</dt><dd className="mt-1">{selectedDoctor.medicalLicenseNumber}</dd></div>
              <div>
                <dt className="text-sm font-semibold text-muted">Próximos horarios disponibles</dt>
                <dd className="mt-2">
                  {loadingSchedules ? 'Cargando horarios disponibles...' : scheduleError ? scheduleError : selectedDoctorSchedules.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {selectedDoctorSchedules.map((schedule) => (
                        <li className="rounded-lg bg-primary-light px-3 py-2 text-sm font-semibold text-primary-dark" key={schedule.id}>
                          {formatScheduleDate(schedule.date)} · {schedule.time} hrs
                        </li>
                      ))}
                    </ul>
                  ) : 'No hay horarios disponibles por el momento.'}
                </dd>
              </div>
              <div><dt className="text-sm font-semibold text-muted">Descripción</dt><dd className="mt-1 leading-7">{doctorSpecialties(selectedDoctor).map((item) => item?.description).join(' ')}</dd></div>
            </dl>
        </Modal>
      )}
    </Fragment>
  )
}

export default MedicosEspecialidades
