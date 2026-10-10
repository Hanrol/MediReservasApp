import type { Appointment } from "../../types/appointment";
import { AppointmentStatus } from "./AppointmentStatus";

interface AppointmentTableProps {
  appointments: Appointment[];
  counterpart?: "doctor" | "patient";
  onRowClick?: (appointment: Appointment) => void;
}

export function AppointmentTable({
  appointments,
  counterpart = "doctor",
  onRowClick,
}: AppointmentTableProps) {
  const counterpartLabel =
    counterpart === "doctor" ? "Paciente" : "Médico";

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-muted"
            >
              {counterpartLabel}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-muted"
            >
              Especialidad
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-muted"
            >
              Fecha
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-muted"
            >
              Hora
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-muted"
            >
              Modalidad
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-semibold text-muted"
            >
              Estado
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-line">
          {appointments.map((appointment) => {
            const counterpartName =
              counterpart === "doctor"
                ? appointment.patientName
                : appointment.doctorName;

            return (
              <tr
                key={appointment.id}
                onClick={
                  onRowClick
                    ? () => onRowClick(appointment)
                    : undefined
                }
                className={
                  onRowClick
                    ? "cursor-pointer transition hover:bg-gray-50"
                    : undefined
                }
              >
                <td className="px-4 py-3 font-medium">
                  {counterpartName}
                </td>
                <td className="px-4 py-3 text-muted">
                  {appointment.specialtyName}
                </td>
                <td className="px-4 py-3">{appointment.date}</td>
                <td className="px-4 py-3">{appointment.time}</td>
                <td className="px-4 py-3">
                  {appointment.modality === "online"
                    ? "Virtual"
                    : "Presencial"}
                </td>
                <td className="px-4 py-3">
                  <AppointmentStatus status={appointment.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}