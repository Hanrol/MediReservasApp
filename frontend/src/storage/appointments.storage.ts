import type { Appointment } from "../types/appointment";
import { APPOINTMENT_STATUSES } from "../constants/appointmentStatuses";
import { mockAppointments } from "../data/mockAppointments";
import { STORAGE_KEYS } from "./storageKeys";

function isAppointmentCollection(value: unknown): value is Appointment[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== 'object') return false
    const appointment = item as Partial<Appointment>
    return typeof appointment.appointmentId === 'number' &&
      typeof appointment.patientUserId === 'number' &&
      typeof appointment.patientName === 'string' &&
      typeof appointment.doctorId === 'number' &&
      typeof appointment.doctorName === 'string' &&
      typeof appointment.specialtyId === 'number' &&
      typeof appointment.specialtyName === 'string' &&
      typeof appointment.scheduleSlotId === 'number' &&
      typeof appointment.date === 'string' &&
      typeof appointment.time === 'string' &&
      typeof appointment.reason === 'string' &&
      (appointment.modality === 'presencial' || appointment.modality === 'online') &&
      typeof appointment.appointmentStatus === 'string' &&
      Object.hasOwn(APPOINTMENT_STATUSES, appointment.appointmentStatus)
  })
}

export const appointmentsStorage = {
  getAll(): Appointment[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.appointments);

      if (storedData !== null) {
        const parsedData: unknown = JSON.parse(storedData);

        if (isAppointmentCollection(parsedData)) {
          return parsedData;
        }
      }

      this.saveAll(mockAppointments);
      return [...mockAppointments];
    } catch {
      return [...mockAppointments];
    }
  },

  saveAll(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(mockAppointments));
  },
};
