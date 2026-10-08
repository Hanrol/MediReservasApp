export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type AppointmentModality = "presencial" | "online";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialtyId: string;
  specialtyName: string;
  date: string;
  time: string;
  reason: string;
  modality: AppointmentModality;
  status: AppointmentStatus;
}