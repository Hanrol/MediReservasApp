import type { Schedule } from "../types/schedule";
import { mockSchedules } from "../data/mockSchedules";
import { STORAGE_KEYS } from "./storageKeys";

function isScheduleCollection(value: unknown): value is Schedule[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== 'object') return false
    const schedule = item as Partial<Schedule>
    return typeof schedule.id === 'number' &&
      typeof schedule.doctorId === 'number' &&
      typeof schedule.date === 'string' &&
      typeof schedule.time === 'string' &&
      typeof schedule.available === 'boolean'
  })
}

export const schedulesStorage = {
  getAll(): Schedule[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.schedules);

      if (storedData !== null) {
        const parsedData: unknown = JSON.parse(storedData);

        if (isScheduleCollection(parsedData)) {
          return parsedData;
        }
      }

      this.saveAll(mockSchedules);
      return [...mockSchedules];
    } catch {
      return [...mockSchedules];
    }
  },

  saveAll(schedules: Schedule[]): void {
    localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(mockSchedules));
  },
};
