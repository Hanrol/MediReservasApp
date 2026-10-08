function SolicitarCita() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
      >
        Saltar al contenido principal
      </a>

      {/* Encabezado */}
      <header className="relative z-30 border-b border-line bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
          aria-label="Barra superior del panel"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-xl text-primary-dark transition hover:bg-primary-light lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <span aria-hidden="true">☰</span>
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

      {/* Contenido */}
      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Barra lateral: estructura visual provisional */}
        <aside className="hidden border-r border-line bg-white px-5 py-8 lg:block">
          <p className="mb-6 font-bold text-primary-dark">Menú principal</p>

          <nav aria-label="Navegación del panel">
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="/paciente/solicitar-cita"
                  aria-current="page"
                  className="block rounded-xl bg-primary-light px-4 py-3 font-semibold text-primary-dark"
                >
                  Solicitar cita
                </a>
              </li>
              <li>
                <a
                  href="/paciente/mis-citas"
                  className="block rounded-xl px-4 py-3 text-muted transition hover:bg-page hover:text-ink"
                >
                  Mis citas
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 px-4 py-8 sm:px-6 lg:px-10"
        >
          <div className="mx-auto max-w-4xl">
            {/* Presentación */}
            <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg sm:p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
                Paciente
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Solicitar cita médica
              </h1>

              <p className="mt-3 text-emerald-50">
                Complete el formulario para solicitar una cita médica con un
                especialista.
              </p>
            </section>

            {/* Formulario */}
            <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">
                Formulario de solicitud
              </h2>

              <p className="mt-2 text-muted">
                Todos los campos son obligatorios.
              </p>

              <form
                className="mt-6 space-y-5"
                onSubmit={(event) => event.preventDefault()}
              >
                {/* Especialidad */}
                <div>
                  <label
                    htmlFor="especialidad"
                    className="block text-sm font-semibold"
                  >
                    Especialidad médica
                  </label>

                  <select
                    id="especialidad"
                    name="especialidad"
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  >
                    <option value="">Seleccione una especialidad</option>
                  </select>

                  <p className="mt-1 min-h-5 text-sm text-red-600" />
                </div>

                {/* Médico */}
                <div>
                  <label
                    htmlFor="medico"
                    className="block text-sm font-semibold"
                  >
                    Médico
                  </label>

                  <select
                    id="medico"
                    name="medico"
                    defaultValue=""
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  >
                    <option value="">Seleccione un médico</option>
                  </select>

                  <p className="mt-1 min-h-5 text-sm text-red-600" />
                </div>

                {/* Fecha y hora */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fecha"
                      className="block text-sm font-semibold"
                    >
                      Fecha de la cita
                    </label>

                    <select
                      id="fecha"
                      name="fecha"
                      defaultValue=""
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                    >
                      <option value="">Seleccione una fecha</option>
                    </select>

                    <p className="mt-1 min-h-5 text-sm text-red-600" />
                  </div>

                  <div>
                    <label
                      htmlFor="hora"
                      className="block text-sm font-semibold"
                    >
                      Hora disponible
                    </label>

                    <select
                      id="hora"
                      name="hora"
                      defaultValue=""
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                    >
                      <option value="">Seleccione una hora</option>
                    </select>

                    <p className="mt-1 min-h-5 text-sm text-red-600" />
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label
                    htmlFor="motivo"
                    className="block text-sm font-semibold"
                  >
                    Motivo de la consulta
                  </label>

                  <textarea
                    id="motivo"
                    name="motivo"
                    rows={5}
                    placeholder="Describa el motivo de la consulta."
                    className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  />

                  <p className="mt-1 min-h-5 text-sm text-red-600" />
                </div>

                {/* Modalidad */}
                <fieldset>
                  <legend className="text-sm font-semibold">
                    Modalidad de atención
                  </legend>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="modalidad"
                        value="Presencial"
                        className="accent-primary"
                      />
                      Presencial
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="modalidad"
                        value="Virtual"
                        className="accent-primary"
                      />
                      Virtual
                    </label>
                  </div>

                  <p className="mt-1 min-h-5 text-sm text-red-600" />
                </fieldset>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-offset-2"
                  >
                    Solicitar cita
                  </button>

                  <button
                    type="reset"
                    className="rounded-xl border border-line bg-white px-5 py-3 font-semibold transition hover:bg-page"
                  >
                    Limpiar formulario
                  </button>
                </div>
              </form>

              {/* Mensaje de confirmación: se conectará posteriormente */}
              <div
                hidden
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                role="status"
              >
                <p className="font-semibold text-emerald-700">
                  La cita médica fue solicitada correctamente.
                </p>
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
export default SolicitarCita