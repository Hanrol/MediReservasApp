function AgendaMedica() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      {/* Enlace de accesibilidad */}
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
      >
        Saltar al contenido principal
      </a>

      {/* Barra superior */}
      <header className="relative z-30 border-b border-line bg-white">
        <nav
          aria-label="Barra superior de MediReservas"
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              aria-controls="shared-mobile-sidebar"
              aria-expanded={false}
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-xl text-primary-dark transition hover:bg-primary-light lg:hidden"
            >
              <span className="leading-none" aria-hidden="true">
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
            <a
              className="text-right"
              href="/perfil"
              aria-label="Ver mi perfil"
            >
              <p className="text-sm font-semibold">Usuario</p>
              <p className="text-xs text-muted">Perfil</p>
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
          className="mx-auto max-w-5xl"
          aria-labelledby="agenda-title"
        >
          {/* Título */}
          <header>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Médico
            </p>

            <h1
              id="agenda-title"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Mi agenda
            </h1>

            <p className="mt-3 text-muted">
              Revisa tus citas del día y registra la observación clínica de cada atención.
            </p>
          </header>

          {/* Filtro por fecha */}
          <form
            className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm sm:max-w-sm"
            onSubmit={(event) => event.preventDefault()}
          >
            <label
              className="mb-2 block text-sm font-semibold"
              htmlFor="agenda-date"
            >
              Ver agenda del día
            </label>

            <input
              className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
              id="agenda-date"
              name="date"
              type="date"
            />
          </form>

          {/* Contador de resultados */}
          <div className="mt-6" aria-live="polite">
            <p className="text-sm font-medium text-muted">
              {/* El total de citas se mostrará al conectar los datos */}
            </p>
          </div>

          {/* Listado de citas */}
          <ul className="mt-3 grid gap-4">
            {/* Las citas médicas se renderizarán aquí */}
          </ul>

          {/* Estado vacío */}
          <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">
            Las citas del día seleccionado aparecerán aquí.
          </p>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© 2026 MediReservas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}


export default AgendaMedica;
