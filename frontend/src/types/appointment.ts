export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentModality = "presencial" | "online";

export interface Appointment {
  appointmentId: number;
  patientUserId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialtyId: number;
  specialtyName: string;
  scheduleSlotId: number;
  date: string;
  time: string;
  reason: string;
  modality: AppointmentModality;
  appointmentStatus: AppointmentStatus;
}
