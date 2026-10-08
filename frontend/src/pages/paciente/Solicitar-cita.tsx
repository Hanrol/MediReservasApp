interface Especialidad {
  nombre: string;
  medico: string;
}

function SolicitarCita() {
  const especialidades: Especialidad[] = [
    {
      nombre: "Cardiología",
      medico: "Dr. Juan Pérez",
    },
    {
      nombre: "Pediatría",
      medico: "Dra. Laura Gómez",
    },
    {
      nombre: "Dermatología",
      medico: "Dr. Carlos Rodríguez",
    },
    {
      nombre: "Neurología",
      medico: "Dra. Ana Martínez",
    },
    {
      nombre: "Traumatología",
      medico: "Dr. Andrés López",
    },
    {
      nombre: "Ginecología",
      medico: "Dra. María Torres",
    },
  ];

  return (
    <div>
      <header>
        <h1>MediReservas</h1>
        <a href="/">Inicio</a>
      </header>

      <main>
        <h2>Solicitar cita médica</h2>

        <p>
          Complete el formulario para solicitar una cita médica
          con un especialista.
        </p>

        <form>
          <section>
            <label htmlFor="especialidad">
              Especialidad
            </label>

            <select id="especialidad" name="especialidad">
              <option value="">
                Seleccione una especialidad
              </option>

              {especialidades.map((especialidad) => (
                <option
                  key={especialidad.nombre}
                  value={especialidad.nombre}
                >
                  {especialidad.nombre}
                </option>
              ))}
            </select>
          </section>

          <section>
            <label htmlFor="medico">
              Médico
            </label>

            <select id="medico" name="medico" defaultValue="">
              <option value="">
                Seleccione un médico
              </option>
            </select>
          </section>

          <section>
            <label htmlFor="fecha">
              Fecha
            </label>

            <input
              type="date"
              id="fecha"
              name="fecha"
            />
          </section>

          <section>
            <label htmlFor="hora">
              Hora
            </label>

            <select id="hora" name="hora" defaultValue="">
              <option value="">
                Seleccione una hora
              </option>

              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </select>
          </section>

          <section>
            <label htmlFor="motivo">
              Motivo de la consulta
            </label>

            <textarea
              id="motivo"
              name="motivo"
              rows={4}
              placeholder="Ingrese el motivo de la consulta"
            />
          </section>

          <section>
            <p>Modalidad de la cita</p>

            <label>
              <input
                type="radio"
                name="modalidad"
                value="Presencial"
              />
              Presencial
            </label>

            <label>
              <input
                type="radio"
                name="modalidad"
                value="Virtual"
              />
              Virtual
            </label>
          </section>

          <div>
            <button type="submit">
              Solicitar cita
            </button>

            <button type="reset">
              Limpiar formulario
            </button>
          </div>
        </form>

        <section>
          <p>
            La solicitud de cita fue registrada correctamente.
          </p>
        </section>
      </main>
    </div>
  );
}

export default SolicitarCita;
