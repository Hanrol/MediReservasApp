interface Cita {
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  estado: "Pendiente" | "Confirmada" | "Cancelada";
}

function MisCitas() {
  const citas: Cita[] = [
    {
      especialidad: "Cardiología",
      medico: "Dr. Juan Pérez",
      fecha: "12/09/2026",
      hora: "10:00",
      estado: "Confirmada",
    },
    {
      especialidad: "Pediatría",
      medico: "Dra. Laura Gómez",
      fecha: "15/09/2026",
      hora: "09:30",
      estado: "Pendiente",
    },
    {
      especialidad: "Dermatología",
      medico: "Dr. Carlos Rodríguez",
      fecha: "20/09/2026",
      hora: "15:00",
      estado: "Cancelada",
    },
  ];

  return (
    <div>
      <header>
        <h1>MediReservas</h1>
        <a href="/">Inicio</a>
      </header>

      <main>
        <h2>Mis citas médicas</h2>

        <p>
          Consulte el estado de sus citas médicas y cancele
          las que estén pendientes.
        </p>

        <section>
          <h3>Buscar y filtrar citas</h3>

          <input
            type="text"
            id="buscarCita"
            placeholder="Ej: Juan Pérez"
          />

          <select id="estadoCita" defaultValue="Todas">
            <option value="Todas">Todas</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </section>

        <section>
          <h3>Citas registradas</h3>

          <div>
            {citas.map((cita, index) => (
              <article key={index}>
                <h4>{cita.especialidad}</h4>

                <p>
                  Médico: {cita.medico}
                </p>

                <p>
                  Fecha: {cita.fecha}
                </p>

                <p>
                  Hora: {cita.hora}
                </p>

                <p>
                  Estado: {cita.estado}
                </p>

                <button
                  type="button"
                  disabled={cita.estado === "Cancelada"}
                >
                  {cita.estado === "Cancelada"
                    ? "Cita cancelada"
                    : "Cancelar cita"}
                </button>
              </article>
            ))}
          </div>

          <p id="mensajeSinCitas">
            No se encontraron citas médicas.
          </p>
        </section>
      </main>
    </div>
  );
}

export default MisCitas;