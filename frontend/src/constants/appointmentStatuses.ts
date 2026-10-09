import type { AppointmentStatus } from "../types/appointment";

export const APPOINTMENT_STATUSES: Record<
  AppointmentStatus,
  string
> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export const APPOINTMENT_STATUS_OPTIONS: {
  value: AppointmentStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "completed", label: "Completadas" },
  { value: "cancelled", label: "Canceladas" },
];