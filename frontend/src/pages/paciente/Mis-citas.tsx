function MisCitas() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
      >
        Saltar al contenido principal
      </a>

      {/* Encabezado */}
      <header className="relative z-30 border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              aria-controls="dashboard-sidebar"
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-xl text-primary-dark transition hover:bg-primary-light lg:hidden"
            >
              ☰
            </button>

            <a
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl"
              aria-label="Ir al inicio de MediReservas"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white">
                +
              </span>

              <span className="hidden sm:inline">MediReservas</span>
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/perfil" className="text-right">
              <p className="text-sm font-semibold">Usuario</p>
              <p className="text-xs text-muted">Paciente</p>
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

      {/* Menú lateral */}
      <button
        type="button"
        aria-label="Cerrar menú de navegación"
        className="fixed inset-0 z-40 hidden bg-slate-950/45 lg:hidden"
      />

      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          id="dashboard-sidebar"
          className="hidden border-r border-line bg-white px-5 py-8 lg:block"
        >
          <header className="mb-6 border-b border-line pb-5">
            <p className="font-bold text-primary-dark">Menú principal</p>
          </header>

          <nav aria-label="Navegación del paciente">
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="/paciente/solicitar-cita"
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-primary-light hover:text-primary-dark"
                >
                  Solicitar cita
                </a>
              </li>

              <li>
                <a
                  href="/paciente/mis-citas"
                  aria-current="page"
                  className="block rounded-xl bg-primary-light px-4 py-3 text-sm font-semibold text-primary-dark"
                >
                  Mis citas
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 px-4 py-8 sm:px-6 lg:px-10"
        >
          <div className="mx-auto max-w-5xl">
            {/* Banner */}
            <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
                Paciente
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Mis citas médicas
              </h1>

              <p className="mt-3 text-emerald-50">
                Consulte el estado de sus citas médicas y cancele las que estén pendientes.
              </p>
            </section>

            {/* Búsqueda y filtros */}
            <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">
                Buscar y filtrar citas
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="buscarCita"
                    className="block text-sm font-semibold"
                  >
                    Buscar por médico
                  </label>

                  <input
                    type="text"
                    id="buscarCita"
                    placeholder="Ej: Juan Pérez"
                    className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="estadoCita"
                    className="block text-sm font-semibold"
                  >
                    Filtrar por estado
                  </label>

                  <select
                    id="estadoCita"
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary"
                  >
                    <option value="">Todas</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="CANCELLED">Cancelada</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="NO_SHOW">Inasistencia</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Listado */}
            <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">
                Listado de citas
              </h2>

              <div
                id="listaCitas"
                className="mt-5 space-y-5"
                aria-live="polite"
              >
                <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center">
                  <p className="font-semibold text-ink">
                    Tus citas aparecerán aquí
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    El listado se conectará con el servicio de citas en la siguiente etapa.
                  </p>
                </div>
              </div>

              <div
                id="mensajeSinCitas"
                className="mt-6 hidden rounded-xl border border-yellow-300 bg-yellow-50 p-4"
              >
                <p>No se encontraron citas médicas.</p>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Pie de página */}
      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© 2026 MediReservas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
export default MisCitas
