import type { Schedule } from "../types/schedule";
import { schedulesStorage } from "../storage/schedules.storage";

export interface ScheduleFilters {
  doctorId?: string;
  date?: string;
  available?: boolean;
}

export const schedulesService = {
  getAll(filters: ScheduleFilters = {}): Schedule[] {
    let schedules = schedulesStorage.getAll();

    if (filters.doctorId) {
      schedules = schedules.filter(
        (schedule) => schedule.doctorId === filters.doctorId,
      );
    }

    if (filters.date) {
      schedules = schedules.filter(
        (schedule) => schedule.date === filters.date,
      );
    }

    if (filters.available !== undefined) {
      schedules = schedules.filter(
        (schedule) => schedule.available === filters.available,
      );
    }

    return schedules.sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);

      return dateComparison !== 0
        ? dateComparison
        : a.time.localeCompare(b.time);
    });
  },

  getById(id: string): Schedule | undefined {
    return schedulesStorage
      .getAll()
      .find((schedule) => schedule.id === id);
  },

  getByDoctor(doctorId: string, date?: string): Schedule[] {
    return this.getAll({ doctorId, date, available: true });
  },

  getAvailableTimes(doctorId: string, date: string): string[] {
    return this.getByDoctor(doctorId, date).map(
      (schedule) => schedule.time,
    );
  },

  markUnavailable(doctorId: string, date: string, time: string): void {
    const schedules = schedulesStorage.getAll();
    const index = schedules.findIndex(
      (schedule) =>
        schedule.doctorId === doctorId &&
        schedule.date === date &&
        schedule.time === time,
    );

    if (index === -1) {
      throw new Error("No se encontró el horario solicitado.");
    }

    const currentSchedule = schedules[index];

    if (!currentSchedule) {
      throw new Error("No se pudo recuperar el horario.");
    }

    const updatedSchedule: Schedule = {
      ...currentSchedule,
      available: false,
    };

    const updatedSchedules = [...schedules];
    updatedSchedules[index] = updatedSchedule;

    schedulesStorage.saveAll(updatedSchedules);
  },

  markAvailable(doctorId: string, date: string, time: string): void {
    const schedules = schedulesStorage.getAll();
    const index = schedules.findIndex(
      (schedule) =>
        schedule.doctorId === doctorId &&
        schedule.date === date &&
        schedule.time === time,
    );

    if (index === -1) {
      throw new Error("No se encontró el horario solicitado.");
    }

    const currentSchedule = schedules[index];

    if (!currentSchedule) {
      throw new Error("No se pudo recuperar el horario.");
    }

    const updatedSchedule: Schedule = {
      ...currentSchedule,
      available: true,
    };

    const updatedSchedules = [...schedules];
    updatedSchedules[index] = updatedSchedule;

    schedulesStorage.saveAll(updatedSchedules);
  },
};