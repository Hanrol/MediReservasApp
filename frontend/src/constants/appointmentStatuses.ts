import type { AppointmentStatus } from "../types/appointment";

export const APPOINTMENT_STATUSES: Record<
  AppointmentStatus,
  string
> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
};

export const APPOINTMENT_STATUS_OPTIONS: {
  value: AppointmentStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "NO_SHOW", label: "No asistió" },
];
