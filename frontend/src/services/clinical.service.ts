import type {
  ClinicalObservation,
  ClinicalHistory,
} from "../types/clinical";
import { clinicalStorage } from "../storage/clinical.storage";

export interface CreateObservationInput {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  notes: string;
  treatment: string;
}

export interface ClinicalFilters {
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
}

function generateObservationId(): string {
  return `observation-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const clinicalService = {
  getAll(filters: ClinicalFilters = {}): ClinicalObservation[] {
    let observations = clinicalStorage.getAll();

    if (filters.patientId) {
      observations = observations.filter(
        (observation) => observation.patientId === filters.patientId,
      );
    }

    if (filters.doctorId) {
      observations = observations.filter(
        (observation) => observation.doctorId === filters.doctorId,
      );
    }

    if (filters.appointmentId) {
      observations = observations.filter(
        (observation) =>
          observation.appointmentId === filters.appointmentId,
      );
    }

    return observations.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  getById(id: string): ClinicalObservation | undefined {
    return clinicalStorage
      .getAll()
      .find((observation) => observation.id === id);
  },

  getByAppointment(appointmentId: string): ClinicalObservation[] {
    return this.getAll({ appointmentId });
  },

  getByPatient(patientId: string): ClinicalObservation[] {
    return this.getAll({ patientId });
  },

  getByDoctor(doctorId: string): ClinicalObservation[] {
    return this.getAll({ doctorId });
  },

  getHistory(patientId: string): ClinicalHistory {
    return {
      patientId,
      observations: this.getByPatient(patientId),
    };
  },

  create(input: CreateObservationInput): ClinicalObservation {
    const observations = clinicalStorage.getAll();

    const existing = observations.find(
      (observation) =>
        observation.appointmentId === input.appointmentId,
    );

    if (existing) {
      throw new Error(
        "Ya existe una observación registrada para esta cita.",
      );
    }

    const observation: ClinicalObservation = {
      ...input,
      id: generateObservationId(),
      createdAt: new Date().toISOString(),
    };

    clinicalStorage.saveAll([...observations, observation]);

    return observation;
  },

  update(
    id: string,
    changes: Partial<Omit<ClinicalObservation, "id" | "createdAt">>,
  ): ClinicalObservation {
    const observations = clinicalStorage.getAll();
    const index = observations.findIndex(
      (observation) => observation.id === id,
    );

    if (index === -1) {
      throw new Error("No se encontró la observación solicitada.");
    }

    const currentObservation = observations[index];

    if (!currentObservation) {
      throw new Error("No se pudo recuperar la observación.");
    }

    const updatedObservation: ClinicalObservation = {
      ...currentObservation,
      ...changes,
      id: currentObservation.id,
      createdAt: currentObservation.createdAt,
    };

    const updatedObservations = [...observations];
    updatedObservations[index] = updatedObservation;

    clinicalStorage.saveAll(updatedObservations);

    return updatedObservation;
  },

  remove(id: string): void {
    const observations = clinicalStorage.getAll();
    const filtered = observations.filter(
      (observation) => observation.id !== id,
    );

    if (filtered.length === observations.length) {
      throw new Error("No se encontró la observación solicitada.");
    }

    clinicalStorage.saveAll(filtered);
  },
};