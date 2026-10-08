import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicFooter from '../components/layout/PublicFooter'
import PublicHeader from '../components/layout/PublicHeader'

const legacyMedicalPage = '/legacy/pages/medicos-especialidades.html'

function Home() {
  useEffect(() => {
    document.title = 'MediReservas | Reserva tu hora médica'

  }, [])

  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <a
        className="fixed left-4 top-4 z-20 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
        href="#main-content"
      >
        Saltar al contenido principal
      </a>

      <PublicHeader
        currentPage="home"
        medicalDirectoryHref={legacyMedicalPage}
        contactHref="/legacy/pages/contacto.html"
      />

      <main id="main-content" tabIndex={-1}>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-28" aria-labelledby="hero-title">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">Atención médica más cerca de ti</p>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" id="hero-title">Reserva tu hora médica de forma rápida y simple</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Encuentra especialistas, revisa sus horarios disponibles y solicita tu próxima atención desde cualquier dispositivo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-dark" href={`${legacyMedicalPage}#medicos`}>Buscar un médico</a>
              <a className="inline-flex justify-center rounded-xl border border-line bg-white px-6 py-3 font-semibold text-ink transition hover:border-primary hover:text-primary-dark" href={`${legacyMedicalPage}#especialidades`}>Ver especialidades</a>
            </div>
          </div>

          <div className="rounded-3xl bg-primary-dark p-6 text-white shadow-xl sm:p-10" aria-label="Resumen del servicio de reservas médicas">
            <p className="text-2xl font-bold">Tu salud, organizada en un solo lugar</p>
            <ul className="mt-8 space-y-5">
              <li className="flex items-center gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 font-bold">1</span>Busca por médico o especialidad.</li>
              <li className="flex items-center gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 font-bold">2</span>Elige una fecha y hora disponible.</li>
              <li className="flex items-center gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 font-bold">3</span>Consulta el estado de tus reservas.</li>
            </ul>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20" aria-labelledby="services-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Servicios</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="services-title">Gestiona tu atención médica</h2>
              <p className="mt-4 text-lg text-muted">Accede fácilmente a las principales funciones de MediReservas.</p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary-light text-xl font-bold text-primary" aria-hidden="true">01</div>
                <h3 className="text-xl font-bold">Encuentra especialistas</h3>
                <p className="mt-3 leading-7 text-muted">Consulta médicos disponibles según el área de atención que necesitas.</p>
                <a className="mt-5 inline-flex font-semibold text-primary-dark hover:text-primary" href={`${legacyMedicalPage}#medicos`}>Explorar médicos →</a>
              </article>
              <article className="rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary-light text-xl font-bold text-primary" aria-hidden="true">02</div>
                <h3 className="text-xl font-bold">Reserva una hora</h3>
                <p className="mt-3 leading-7 text-muted">Selecciona profesional, fecha y horario para solicitar tu atención.</p>
                <Link className="mt-5 inline-flex font-semibold text-primary-dark hover:text-primary" to="/login">Solicitar una cita →</Link>
              </article>
              <article className="rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary-light text-xl font-bold text-primary" aria-hidden="true">03</div>
                <h3 className="text-xl font-bold">Revisa tus citas</h3>
                <p className="mt-3 leading-7 text-muted">Consulta en un solo lugar tus próximas atenciones y su estado.</p>
                <Link className="mt-5 inline-flex font-semibold text-primary-dark hover:text-primary" to="/login">Ingresar a mis citas →</Link>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="specialties-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Especialidades</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="specialties-title">Atención para distintas necesidades</h2>
            </div>
            <a className="font-semibold text-primary-dark hover:text-primary" href={`${legacyMedicalPage}#especialidades`}>Conocer todas →</a>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-2xl border border-line bg-white p-6 font-semibold shadow-sm">Medicina general</li>
            <li className="rounded-2xl border border-line bg-white p-6 font-semibold shadow-sm">Pediatría</li>
            <li className="rounded-2xl border border-line bg-white p-6 font-semibold shadow-sm">Cardiología</li>
            <li className="rounded-2xl border border-line bg-white p-6 font-semibold shadow-sm">Dermatología</li>
          </ul>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8" aria-labelledby="cta-title">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-secondary p-8 text-white sm:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl" id="cta-title">Comienza a gestionar tus horas médicas</h2>
              <p className="mt-2 text-blue-100">Crea tu cuenta para reservar y consultar tus próximas atenciones.</p>
            </div>
            <Link className="inline-flex shrink-0 rounded-xl bg-white px-6 py-3 font-semibold text-secondary transition hover:bg-blue-50" to="/registro">Registrarme</Link>
          </div>
        </section>
      </main>

      <PublicFooter
        medicalDirectoryHref={legacyMedicalPage}
        contactHref="/legacy/pages/contacto.html"
      />
    </div>
  )
}

export default Home
