import type { ClinicalObservation } from "../types/clinical";

const STORAGE_KEY = "medireservas_clinical_observations";

export const clinicalStorage = {
  getAll(): ClinicalObservation[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (storedData !== null) {
        const parsedData: unknown = JSON.parse(storedData);

        if (Array.isArray(parsedData)) {
          return parsedData as ClinicalObservation[];
        }
      }

      return [];
    } catch {
      return [];
    }
  },

  saveAll(observations: ClinicalObservation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(observations));
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  },
};