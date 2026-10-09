import type { Appointment } from "../types/appointment";
import { mockAppointments } from "../data/mockAppointments";

const STORAGE_KEY = "medireservas_appointments";

export const appointmentsStorage = {
  getAll(): Appointment[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (storedData !== null) {
        const parsedData: unknown = JSON.parse(storedData);

        if (Array.isArray(parsedData)) {
          return parsedData as Appointment[];
        }
      }

      this.saveAll(mockAppointments);
      return [...mockAppointments];
    } catch {
      return [...mockAppointments];
    }
  },

  saveAll(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAppointments));
  },
};
