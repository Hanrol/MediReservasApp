function AgendaMedica() {
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

            <h1>Mi agenda</h1>

            <p>
              Revisa tus citas del día y registra la observación
              clínica de cada atención.
            </p>
          </header>

          <form id="agenda-filter-form">
            <label htmlFor="agenda-date">
              Ver agenda del día
            </label>

            <input
              id="agenda-date"
              name="date"
              type="date"
            />
          </form>

          <div>
            <p id="agenda-result-count"></p>
          </div>

          <ul id="agenda-list">
          </ul>

          <p id="agenda-empty-message">
            No tienes citas registradas para la fecha seleccionada.
          </p>
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

export default AgendaMedica;
