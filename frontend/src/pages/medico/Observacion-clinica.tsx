function ObservacionClinica() {
  return (
    
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
      >
        Saltar al contenido principal
      </a>

      {/* Barra superior */}
      <header className="relative z-30 border-b border-line bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
          aria-label="Barra superior de MediReservas"
        >
          <div className="flex items-center gap-3">
            <button
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-xl text-primary-dark transition hover:bg-primary-light lg:hidden"
              type="button"
              aria-label="Abrir menú de navegación"
            >
              <span aria-hidden="true" className="leading-none">
                ☰
              </span>
            </button>

            <a
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl"
              aria-label="Ir al inicio de MediReservas"
            >
              <span
                className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white"
                aria-hidden="true"
              >
                +
              </span>
              <span className="hidden sm:inline">MediReservas</span>
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/perfil" className="text-right" aria-label="Ver mi perfil">
              <p className="text-sm font-semibold">Usuario</p>
              <p className="text-xs text-muted">Médico</p>
            </a>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4"
            >
              <span className="sm:hidden">Salir</span>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Contenido principal */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <section
          className="mx-auto max-w-3xl"
          aria-labelledby="observation-title"
        >
          <header>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Médico
            </p>

            <h1
              id="observation-title"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Observación clínica
            </h1>

            <p className="mt-3 text-muted">
              Registra el diagnóstico y la observación de la atención realizada.
            </p>
          </header>

          {/* Mensaje cuando no se encuentra la cita */}
          <p
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700"
            hidden
          >
            No se encontró la cita indicada. Vuelve a tu agenda y selecciona
            una atención.
          </p>

          {/* Resumen de la atención */}
          <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="font-bold text-primary-dark">
              Detalle de la atención
            </h2>

            <dl className="mt-4 grid gap-4 rounded-xl bg-page p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Paciente
                </dt>
                <dd className="mt-1 font-semibold">Sin información</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  RUN
                </dt>
                <dd className="mt-1 font-semibold">Sin información</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Especialidad
                </dt>
                <dd className="mt-1 font-semibold">Sin información</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Fecha y hora
                </dt>
                <dd className="mt-1 font-semibold">Sin información</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Motivo de la consulta
                </dt>
                <dd className="mt-1 font-semibold">Sin información</dd>
              </div>
            </dl>
          </section>

          {/* Formulario clínico */}
          <form
            className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label
                htmlFor="observation-diagnosis"
                className="mb-2 block text-sm font-semibold"
              >
                Diagnóstico
              </label>

              <input
                id="observation-diagnosis"
                name="diagnosis"
                type="text"
                maxLength={120}
                placeholder="Ej.: Hipertensión controlada"
                className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
              />

              <p className="mt-1.5 min-h-5 text-sm text-red-600" role="alert" />
            </div>

            <div className="mt-4">
              <label
                htmlFor="observation-notes"
                className="mb-2 block text-sm font-semibold"
              >
                Observación clínica
              </label>

              <textarea
                id="observation-notes"
                name="notes"
                maxLength={500}
                placeholder="Describe la observación de la atención"
                className="min-h-32 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
              />

              <p className="mt-1.5 min-h-5 text-sm text-red-600" role="alert" />
            </div>

            <div className="mt-4">
              <label
                htmlFor="observation-treatment"
                className="mb-2 block text-sm font-semibold"
              >
                Tratamiento
              </label>

              <textarea
                id="observation-treatment"
                name="treatment"
                maxLength={2000}
                placeholder="Indica el tratamiento o las recomendaciones médicas"
                className="min-h-24 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
              />

              <p className="mt-1.5 min-h-5 text-sm text-red-600" role="alert" />
            </div>

            <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <a
                href="/medico/agenda"
                className="rounded-xl border border-line px-5 py-3 text-center font-semibold text-muted transition hover:bg-page"
              >
                Volver a mi agenda
              </a>

              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
              >
                Guardar observación
              </button>
            </footer>

            <p
              className="mt-4 text-center text-sm font-medium"
              role="status"
              aria-live="polite"
            />
          </form>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© 2026 MediReservas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
export default ObservacionClinica