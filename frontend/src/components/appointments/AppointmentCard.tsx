import type { ReactNode } from "react";

import type { Appointment } from "../../types/appointment";
import { AppointmentStatus } from "./AppointmentStatus";

interface AppointmentCardProps {
  appointment: Appointment;
  counterpart?: "doctor" | "patient";
  actions?: ReactNode;
  footer?: ReactNode;
}

export function AppointmentCard({
  appointment,
  counterpart = "doctor",
  actions,
  footer,
}: AppointmentCardProps) {
  const headline =
    counterpart === "doctor"
      ? appointment.doctorName
      : appointment.patientName;

  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{headline}</h2>

            <AppointmentStatus status={appointment.status} />
          </div>

          <p className="mt-1 text-sm text-muted">
            {appointment.specialtyName}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Fecha
              </p>
              <p className="mt-1 font-medium">{appointment.date}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Hora
              </p>
              <p className="mt-1 font-medium">{appointment.time}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Modalidad
              </p>
              <p className="mt-1 font-medium">
                {appointment.modality === "online"
                  ? "Virtual"
                  : "Presencial"}
              </p>
            </div>
          </div>

          {appointment.reason && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Motivo de consulta
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {appointment.reason}
              </p>
            </div>
          )}

          {footer && (
            <div className="mt-5 border-t border-line pt-4">{footer}</div>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}