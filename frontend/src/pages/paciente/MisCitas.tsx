import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../hooks/useAuth";
import { APPOINTMENT_STATUS_OPTIONS } from "../../constants/appointmentStatuses";
import { AppointmentCard } from "../../components/appointments/AppointmentCard";
import type { AppointmentStatus } from "../../types/appointment";
import { ROUTES } from "../../constants/routes";

function MisCitas() {
  const { user } = useAuth();
  const {
    appointments,
    loading,
    error,
    refresh,
    cancelAppointment,
  } = useAppointments({
    filters: { patientUserId: user?.userId },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<AppointmentStatus | "all">("all");
  const [actionMessage, setActionMessage] = useState<string | null>(
    null,
  );

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDoctor = appointment.doctorName
        .toLocaleLowerCase("es")
        .includes(normalizedSearch);

      const matchesStatus =
        selectedStatus === "all" ||
        appointment.appointmentStatus === selectedStatus;

      return matchesDoctor && matchesStatus;
    });
  }, [appointments, normalizedSearch, selectedStatus]);

  const handleCancel = (appointmentId: number) => {
    setActionMessage(null);

    const appointment = appointments.find(
      (item) => item.appointmentId === appointmentId,
    );

    if (!appointment) {
      setActionMessage("No se encontró la cita seleccionada.");
      return;
    }

    if (
      appointment.appointmentStatus !== "PENDING" &&
      appointment.appointmentStatus !== "CONFIRMED"
    ) {
      setActionMessage(
        "Solo puedes cancelar citas pendientes o confirmadas.",
      );
      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cancelar esta cita?",
    );

    if (!confirmed) return;

    const cancelled = cancelAppointment(appointmentId);

    if (cancelled) {
      setActionMessage("La cita se canceló correctamente.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setActionMessage(null);
  };

  return (
    <DashboardLayout currentPath={ROUTES.myAppointments}>
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Área del paciente
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mis citas médicas
          </h1>

          <p className="mt-3 max-w-2xl text-muted">
            Consulta tus próximas citas, revisa sus estados y cancela
            las citas pendientes o confirmadas.
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
          aria-label="Filtros de citas"
          className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Buscar citas</h2>
            <p className="mt-1 text-sm text-muted">
              Filtra tus citas por médico o estado.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_260px_auto] md:items-end">
            <div>
              <label
                htmlFor="searchDoctor"
                className="mb-2 block text-sm font-medium"
              >
                Nombre del médico
              </label>

              <input
                id="searchDoctor"
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Ej.: María González"
                maxLength={100}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary"
              />
            </div>

            <div>
              <label
                htmlFor="statusFilter"
                className="mb-2 block text-sm font-medium"
              >
                Estado de la cita
              </label>

              <select
                id="statusFilter"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value as AppointmentStatus | "all",
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
                ? "Cargando citas..."
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
              Actualizar lista
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-semibold text-red-800">
              No se pudieron procesar las citas.
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
            <p className="font-medium">Cargando tus citas médicas...</p>
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
                  —
                </div>

                <h2 className="text-lg font-semibold">
                  No se encontraron citas
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  {appointments.length === 0
                    ? "Todavía no hay citas registradas para mostrar."
                    : "Prueba con otro nombre de médico o cambia el filtro de estado."}
                </p>

                {(searchTerm || selectedStatus !== "all") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    Ver todas las citas
                  </button>
                )}

                <Link
                  to={ROUTES.requestAppointment}
                  className="mt-5 inline-block rounded-xl border border-line px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
                >
                  Solicitar una cita
                </Link>
              </section>
            ) : (
              <section
                aria-label="Listado de citas médicas"
                className="space-y-4"
              >
                {filteredAppointments.map((appointment) => {
                  const canCancel =
                    appointment.appointmentStatus === "PENDING" ||
                    appointment.appointmentStatus === "CONFIRMED";

                  return (
                    <AppointmentCard
                      key={appointment.appointmentId}
                      appointment={appointment}
                      counterpart="doctor"
                      actions={
                        canCancel ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(appointment.appointmentId)
                            }
                            className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:w-auto"
                          >
                            Cancelar cita
                          </button>
                        ) : (
                          <p className="text-sm text-muted">
                            {appointment.appointmentStatus === "CONFIRMED" &&
                              "Cita confirmada"}
                            {appointment.appointmentStatus === "COMPLETED" &&
                              "Cita completada"}
                            {appointment.appointmentStatus === "CANCELLED" &&
                              "Cita cancelada"}
                          </p>
                        )
                      }
                    />
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MisCitas;
