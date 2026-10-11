import type { ClinicalObservation } from "../types/clinical";
import { STORAGE_KEYS } from "./storageKeys";

function isClinicalCollection(value: unknown): value is ClinicalObservation[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== 'object') return false
    const observation = item as Partial<ClinicalObservation>
    return typeof observation.id === 'string' &&
      typeof observation.appointmentId === 'number' &&
      typeof observation.patientId === 'number' &&
      typeof observation.doctorId === 'number' &&
      typeof observation.diagnosis === 'string' &&
      typeof observation.notes === 'string' &&
      typeof observation.treatment === 'string' &&
      typeof observation.createdAt === 'string'
  })
}

export const clinicalStorage = {
  getAll(): ClinicalObservation[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.clinicalObservations);

      if (storedData !== null) {
        const parsedData: unknown = JSON.parse(storedData);

        if (isClinicalCollection(parsedData)) {
          return parsedData;
        }
      }

      return [];
    } catch {
      return [];
    }
  },

  saveAll(observations: ClinicalObservation[]): void {
    localStorage.setItem(STORAGE_KEYS.clinicalObservations, JSON.stringify(observations));
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEYS.clinicalObservations, JSON.stringify([]));
  },
};
