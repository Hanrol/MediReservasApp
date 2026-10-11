import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../hooks/useAuth";
import { getDoctorForUser } from "../../services/doctors.service";
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_OPTIONS } from "../../constants/appointmentStatuses";
import { AppointmentCard } from "../../components/appointments/AppointmentCard";
import type { AppointmentStatus } from "../../types/appointment";
import { ROUTES } from "../../constants/routes";

function Agenda() {
  const { user } = useAuth();
  const doctor = getDoctorForUser(user);
  const {
    appointments,
    loading,
    error,
    refresh,
    updateAppointment,
  } = useAppointments({
    filters: { doctorId: doctor?.doctorId },
  });

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<AppointmentStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(
    null,
  );

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate =
        !selectedDate || appointment.date === selectedDate;

      const matchesStatus =
        selectedStatus === "all" ||
        appointment.appointmentStatus === selectedStatus;

      const matchesPatient = appointment.patientName
        .toLocaleLowerCase("es")
        .includes(normalizedSearch);

      return matchesDate && matchesStatus && matchesPatient;
    });
  }, [appointments, selectedDate, selectedStatus, normalizedSearch]);

  const statusCounts = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(
        (appointment) => appointment.appointmentStatus === "PENDING",
      ).length,
      confirmed: appointments.filter(
        (appointment) => appointment.appointmentStatus === "CONFIRMED",
      ).length,
      completed: appointments.filter(
        (appointment) => appointment.appointmentStatus === "COMPLETED",
      ).length,
    };
  }, [appointments]);

  const handleStatusChange = (
    appointmentId: number,
    newStatus: AppointmentStatus,
  ) => {
    setActionMessage(null);

    const appointment = appointments.find(
      (item) => item.appointmentId === appointmentId,
    );

    if (!appointment) {
      setActionMessage("No se encontró la cita seleccionada.");
      return;
    }

    if (
      appointment.appointmentStatus === "CANCELLED" ||
      appointment.appointmentStatus === "COMPLETED"
    ) {
      setActionMessage(
        "No puedes modificar el estado de una cita cancelada o completada.",
      );
      return;
    }

    if (
      newStatus !== "CONFIRMED" &&
      newStatus !== "CANCELLED" &&
      newStatus !== "COMPLETED"
    ) {
      setActionMessage("El estado seleccionado no es válido.");
      return;
    }

    if (
      newStatus === "COMPLETED" &&
      appointment.appointmentStatus !== "CONFIRMED"
    ) {
      setActionMessage(
        "Solo puedes marcar como completada una cita confirmada.",
      );
      return;
    }

    const confirmationText: Record<
      "CONFIRMED" | "CANCELLED" | "COMPLETED",
      string
    > = {
      CONFIRMED: "¿Deseas confirmar esta cita?",
      CANCELLED: "¿Deseas cancelar esta cita?",
      COMPLETED: "¿Deseas marcar esta cita como completada?",
    };

    if (!window.confirm(confirmationText[newStatus])) {
      return;
    }

    const updated = updateAppointment(appointmentId, {
      appointmentStatus: newStatus,
    });

    if (updated) {
      setActionMessage(
        `La cita de ${appointment.patientName} se actualizó a "${APPOINTMENT_STATUSES[newStatus]}".`,
      );
    }
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedStatus("all");
    setSearchTerm("");
    setActionMessage(null);
  };

  return (
    <DashboardLayout currentPath={ROUTES.medicalSchedule}>
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Área médica
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mi agenda médica
          </h1>

          <p className="mt-3 text-muted">
            Consulta las citas de tus pacientes y gestiona su estado.
          </p>
        </section>

        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary-light p-4 text-sm text-primary-dark"
          >
            <p>{actionMessage}</p>

            <button
              type="button"
              onClick={() => setActionMessage(null)}
              aria-label="Cerrar mensaje"
              className="shrink-0 rounded px-2 font-bold hover:bg-white/60"
            >
              ×
            </button>
          </div>
        )}

        <section
          aria-label="Resumen de citas"
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">
              Total de citas
            </p>
            <p className="mt-3 text-3xl font-bold">
              {loading ? "—" : statusCounts.total}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">
              Pendientes
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-700">
              {loading ? "—" : statusCounts.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">
              Confirmadas
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-700">
              {loading ? "—" : statusCounts.confirmed}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">
              Completadas
            </p>
            <p className="mt-3 text-3xl font-bold text-primary">
              {loading ? "—" : statusCounts.completed}
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Filtrar agenda</h2>
            <p className="mt-1 text-sm text-muted">
              Busca por paciente, fecha o estado de la cita.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_220px_auto] xl:items-end">
            <div>
              <label
                htmlFor="searchPatient"
                className="mb-2 block text-sm font-medium"
              >
                Nombre del paciente
              </label>

              <input
                id="searchPatient"
                type="search"
                value={searchTerm}
                maxLength={100}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Buscar paciente..."
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </div>

            <div>
              <label
                htmlFor="appointmentDate"
                className="mb-2 block text-sm font-medium"
              >
                Fecha
              </label>

              <input
                id="appointmentDate"
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </div>

            <div>
              <label
                htmlFor="appointmentStatus"
                className="mb-2 block text-sm font-medium"
              >
                Estado
              </label>

              <select
                id="appointmentStatus"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value as
                      | AppointmentStatus
                      | "all",
                  )
                }
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
              >
                {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-line px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-sm text-muted" aria-live="polite">
              {loading
                ? "Cargando agenda..."
                : `${filteredAppointments.length} ${
                    filteredAppointments.length === 1
                      ? "cita encontrada"
                      : "citas encontradas"
                  }`}
            </p>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="text-sm font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Actualizar agenda
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-semibold text-red-800">
              No se pudo cargar la agenda.
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {loading && (
          <div
            role="status"
            className="rounded-2xl border border-line bg-white px-6 py-12 text-center"
          >
            <div
              className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"
              aria-hidden="true"
            />

            <p className="font-medium">Cargando agenda médica...</p>
            <p className="mt-1 text-sm text-muted">
              Espera un momento, por favor.
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredAppointments.length === 0 ? (
              <section className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl"
                  aria-hidden="true"
                >
                </div>

                <h2 className="text-lg font-semibold">
                  No se encontraron citas
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  {appointments.length === 0
                    ? "No hay citas registradas para este médico."
                    : "Prueba con otro paciente, fecha o estado."}
                </p>

                {(searchTerm ||
                  selectedDate ||
                  selectedStatus !== "all") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    Ver todas las citas
                  </button>
                )}
              </section>
            ) : (
              <section
                aria-label="Listado de citas médicas"
                className="space-y-4"
              >
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointmentId}
                    appointment={appointment}
                    counterpart="patient"
                    actions={
                      <>
                        {appointment.appointmentStatus === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  appointment.appointmentId,
                                  "CONFIRMED",
                                )
                              }
                              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                            >
                              Confirmar cita
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  appointment.appointmentId,
                                  "CANCELLED",
                                )
                              }
                              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Cancelar cita
                            </button>
                          </>
                        )}

                        {appointment.appointmentStatus === "CONFIRMED" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  appointment.appointmentId,
                                  "COMPLETED",
                                )
                              }
                              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                            >
                              Marcar completada
                            </button>

                            <Link
                              to={`${ROUTES.clinicalObservation}?cita=${encodeURIComponent(
                                appointment.appointmentId,
                              )}`}
                              className="rounded-xl border border-line px-4 py-3 text-center text-sm font-semibold transition hover:bg-gray-50"
                            >
                              Registrar observación
                            </Link>
                          </>
                        )}

                        {appointment.appointmentStatus === "COMPLETED" && (
                          <p className="text-sm text-muted">
                            Atención completada
                          </p>
                        )}

                        {appointment.appointmentStatus === "CANCELLED" && (
                          <p className="text-sm text-muted">
                            Cita cancelada
                          </p>
                        )}
                      </>
                    }
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Agenda;
