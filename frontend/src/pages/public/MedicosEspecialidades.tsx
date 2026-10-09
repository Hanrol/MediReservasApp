import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PublicFooter from '../../components/layout/PublicFooter'
import PublicHeader from '../../components/layout/PublicHeader'
import { useAuth } from '../../hooks/useAuth'
import { getDoctors, getSpecialties, initializeBaseDoctors, initializeBaseSpecialties } from '../../lib/storage'
import type { Doctor } from '../../lib/types'

function MedicosEspecialidades() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [specialtyId, setSpecialtyId] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    document.title = 'Médicos y especialidades | MediReservas'
    initializeBaseSpecialties()
    initializeBaseDoctors()
  }, [])

  useEffect(() => {
    if (!location.hash) return
    window.requestAnimationFrame(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location.hash])

  const specialties = getSpecialties().filter((specialty) => specialty.active)
  const doctors = getDoctors().filter((doctor) => doctor.active)
  const specialtyById = new Map(specialties.map((specialty) => [specialty.specialtyId, specialty]))
  const specialtySearchTerm = specialtySearch.trim().toLowerCase()
  const doctorSearchTerm = doctorSearch.trim().toLowerCase()
  const selectedSpecialtyId = Number(specialtyId)
  const visibleSpecialties = specialties.filter((specialty) => specialty.specialtyName.toLowerCase().includes(specialtySearchTerm))
  const visibleDoctors = doctors
    .filter((doctor) => `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(doctorSearchTerm))
    .filter((doctor) => !selectedSpecialtyId || doctor.specialtyIds.includes(selectedSpecialtyId))

  function filterDoctors(selectedSpecialtyId: number) {
    setSpecialtyId(String(selectedSpecialtyId))
    document.querySelector('#medicos')?.scrollIntoView({ behavior: 'smooth' })
  }

  function doctorSpecialties(doctor: Doctor) {
    return doctor.specialtyIds.map((id) => specialtyById.get(id)).filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">Saltar al contenido principal</a>
      <PublicHeader currentPage="directory" />

      <main id="main-content" tabIndex={-1}>
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
            {visibleSpecialties.length ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSpecialties.map((specialty) => (
                  <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg" key={specialty.specialtyId}>
                    <h3 className="text-xl font-bold">{specialty.specialtyName}</h3>
                    <p className="mt-3 flex-1 leading-7 text-muted">{specialty.description}</p>
                    <button className="mt-5 self-start font-semibold text-primary-dark hover:text-primary" type="button" onClick={() => filterDoctors(specialty.specialtyId)}>Ver médicos</button>
                  </article>
                ))}
              </div>
            ) : <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800" role="status">No se encontraron especialidades.</p>}
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
                  {specialties.map((specialty) => <option value={specialty.specialtyId} key={specialty.specialtyId}>{specialty.specialtyName}</option>)}
                </select>
              </label>
            </div>
            {visibleDoctors.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleDoctors.map((doctor) => (
                  <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm" key={doctor.doctorId}>
                    <h3 className="text-xl font-bold">{doctor.firstName} {doctor.lastName}</h3>
                    <p className="mt-3 text-primary-dark">Especialidad: {doctorSpecialties(doctor).map((item) => item?.specialtyName).join(', ')}</p>
                    <p className="mt-1 text-sm text-muted">Registro médico: {doctor.medicalLicenseNumber}</p>
                    <button className="mt-5 self-start rounded-xl border border-primary px-4 py-2 font-semibold text-primary-dark transition hover:bg-primary-light" type="button" onClick={() => setSelectedDoctor(doctor)}>Ver detalle</button>
                  </article>
                ))}
              </div>
            ) : <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800" role="status">No se encontraron médicos.</p>}
          </div>
        </section>
      </main>

      <PublicFooter compact />

      {selectedDoctor && (
        <div className="fixed inset-0 z-70 grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDoctor(null) }}>
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="doctor-detail-title">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Profesional</p><h2 className="mt-2 text-2xl font-bold" id="doctor-detail-title">{selectedDoctor.firstName} {selectedDoctor.lastName}</h2></div>
              <button className="grid size-10 place-items-center rounded-xl border border-line text-xl text-muted hover:bg-page" type="button" aria-label="Cerrar detalle" onClick={() => setSelectedDoctor(null)}>×</button>
            </div>
            <dl className="mt-6 space-y-4">
              <div><dt className="text-sm font-semibold text-muted">Especialidades</dt><dd className="mt-1">{doctorSpecialties(selectedDoctor).map((item) => item?.specialtyName).join(', ')}</dd></div>
              <div><dt className="text-sm font-semibold text-muted">Registro médico</dt><dd className="mt-1">{selectedDoctor.medicalLicenseNumber}</dd></div>
              <div><dt className="text-sm font-semibold text-muted">Descripción</dt><dd className="mt-1 leading-7">{doctorSpecialties(selectedDoctor).map((item) => item?.description).join(' ')}</dd></div>
            </dl>
            <Link className="mt-7 inline-flex w-full justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark" to={isAuthenticated ? `/solicitar-cita?medico=${selectedDoctor.doctorId}` : '/login'}>{isAuthenticated ? 'Solicitar cita' : 'Iniciar sesión para reservar'}</Link>
          </section>
        </div>
      )}
    </div>
  )
}

export default MedicosEspecialidades
