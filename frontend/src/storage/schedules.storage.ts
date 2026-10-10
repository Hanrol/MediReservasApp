import type { Schedule } from "../types/schedule";
import { mockSchedules } from "../data/mockSchedules";

const STORAGE_KEY = "medireservas_schedules";

export const schedulesStorage = {
  getAll(): Schedule[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (storedData !== null) {
        const parsedData: unknown = JSON.parse(storedData);

        if (Array.isArray(parsedData)) {
          return parsedData as Schedule[];
        }
      }

      this.saveAll(mockSchedules);
      return [...mockSchedules];
    } catch {
      return [...mockSchedules];
    }
  },

  saveAll(schedules: Schedule[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSchedules));
  },
};