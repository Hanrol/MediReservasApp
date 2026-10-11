import { APPOINTMENT_STATUSES } from "../../constants/appointmentStatuses";
import type { AppointmentStatus as AppointmentStatusType } from "../../types/appointment";

interface AppointmentStatusProps {
  status: AppointmentStatusType;
  className?: string;
}

const STATUS_STYLES: Record<AppointmentStatusType, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-800 ring-blue-200",
  COMPLETED: "bg-primary-light text-primary-dark ring-primary/20",
  CANCELLED: "bg-gray-100 text-gray-600 ring-gray-200",
  NO_SHOW: "bg-red-50 text-red-800 ring-red-200",
};

export function AppointmentStatus({ status, className = "" }: AppointmentStatusProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]} ${className}`}
    >
      {APPOINTMENT_STATUSES[status]}
    </span>
  );
}
