import type {
  ClinicalConsultation,
  ClinicalObservation,
} from "../types/clinical";
import { clinicalStorage } from "../storage/clinical.storage";
import { appointmentsService } from "./appointments.service";
import { getUsers } from "./users.service";

export interface CreateObservationInput {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  notes: string;
  treatment: string;
}

export interface ClinicalFilters {
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
}

interface ConsultationFilters {
  patientId?: number;
  doctorId?: number;
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

  getByAppointment(appointmentId: number): ClinicalObservation[] {
    return this.getAll({ appointmentId });
  },

  getByPatient(patientId: number): ClinicalObservation[] {
    return this.getAll({ patientId });
  },

  getByDoctor(doctorId: number): ClinicalObservation[] {
    return this.getAll({ doctorId });
  },

  getConsultations(filters: ConsultationFilters): ClinicalConsultation[] {
    return this.getAll(filters)
      .map((observation): ClinicalConsultation | null => {
        const appointment = appointmentsService.getById(observation.appointmentId);
        if (!appointment) return null;

        const patient = getUsers().find((user) => user.userId === observation.patientId);

        return {
          id: observation.id,
          patientName: appointment.patientName,
          patientRun: patient?.run ?? "Sin información",
          doctorName: appointment.doctorName,
          specialtyName: appointment.specialtyName,
          date: appointment.date,
          reason: appointment.reason || "Sin información",
          diagnosis: observation.diagnosis,
          observations: observation.notes,
          treatment: observation.treatment,
        };
      })
      .filter((consultation): consultation is ClinicalConsultation => consultation !== null)
      .sort((first, second) => second.date.localeCompare(first.date));
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

};
