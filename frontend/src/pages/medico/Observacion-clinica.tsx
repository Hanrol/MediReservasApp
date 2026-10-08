function ObservacionClinica() {
  return (
    <div>
      <header>
        <nav>
          <button
            type="button"
            aria-label="Abrir menú de navegación"
          >
            ☰
          </button>

          <a href="../index.html">
            <span>+</span>
            <span>MediReservas</span>
          </a>

          <div>
            <a href="perfil.html">
              <p id="header-user-name">Usuario</p>
              <p id="header-user-role">Perfil</p>
            </a>

            <button
              id="logout-button"
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section>
          <header>
            <p>Médico</p>

            <h1>Observación clínica</h1>

            <p>
              Registra el diagnóstico y la observación de la
              atención realizada.
            </p>
          </header>

          <p id="observation-not-found">
            No se encontró la cita indicada. Vuelve a tu agenda
            y selecciona una atención.
          </p>

          <div id="appointment-summary-card">
            <h2>Detalle de la atención</h2>

            <dl>
              <div>
                <dt>Paciente</dt>
                <dd id="summary-patient">
                  Sin información
                </dd>
              </div>

              <div>
                <dt>RUN</dt>
                <dd id="summary-run">
                  Sin información
                </dd>
              </div>

              <div>
                <dt>Especialidad</dt>
                <dd id="summary-specialty">
                  Sin información
                </dd>
              </div>

              <div>
                <dt>Fecha y hora</dt>
                <dd id="summary-date">
                  Sin información
                </dd>
              </div>

              <div>
                <dt>Motivo de la consulta</dt>
                <dd id="summary-reason">
                  Sin información
                </dd>
              </div>
            </dl>
          </div>

          <form id="observation-form">
            <div>
              <label htmlFor="observation-diagnosis">
                Diagnóstico
              </label>

              <input
                id="observation-diagnosis"
                name="diagnosis"
                type="text"
                maxLength={120}
                placeholder="Ej.: Hipertensión controlada"
              />

              <p id="observation-diagnosis-error"></p>
            </div>

            <div>
              <label htmlFor="observation-notes">
                Observación clínica
              </label>

              <textarea
                id="observation-notes"
                name="notes"
                maxLength={500}
                placeholder="Describe la observación de la atención"
              />

              <p id="observation-notes-error"></p>
            </div>

            <div>
              <label htmlFor="observation-treatment">
                Tratamiento
              </label>

              <textarea
                id="observation-treatment"
                name="treatment"
                maxLength={2000}
                placeholder="Indica el tratamiento o las recomendaciones médicas"
              />

              <p id="observation-treatment-error"></p>
            </div>

            <footer>
              <a href="agenda-medica.html">
                Volver a mi agenda
              </a>

              <button type="submit">
                Guardar observación
              </button>
            </footer>

            <p id="observation-form-message"></p>
          </form>
        </section>
      </main>

      <footer>
        <p>
          © 2026 MediReservas. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default ObservacionClinica;
