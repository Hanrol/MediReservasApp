import type {
  Appointment,
  AppointmentStatus,
} from "../types/appointment";
import { appointmentsStorage } from "../storage/appointments.storage";

export interface CreateAppointmentInput {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialtyId: string;
  specialtyName: string;
  date: string;
  time: string;
  reason: string;
  modality: Appointment["modality"];
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  date?: string;
  status?: AppointmentStatus;
  searchTerm?: string;
}

function generateAppointmentId(): string {
  return `appointment-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const appointmentsService = {
  /**
   * Obtiene todas las citas, con filtros opcionales.
   */
  getAll(filters: AppointmentFilters = {}): Appointment[] {
    let appointments = appointmentsStorage.getAll();

    if (filters.patientId) {
      appointments = appointments.filter(
        (appointment) => appointment.patientId === filters.patientId,
      );
    }

    if (filters.doctorId) {
      appointments = appointments.filter(
        (appointment) => appointment.doctorId === filters.doctorId,
      );
    }

    if (filters.date) {
      appointments = appointments.filter(
        (appointment) => appointment.date === filters.date,
      );
    }

    if (filters.status) {
      appointments = appointments.filter(
        (appointment) => appointment.status === filters.status,
      );
    }

    if (filters.searchTerm?.trim()) {
      const search = filters.searchTerm.trim().toLocaleLowerCase("es");

      appointments = appointments.filter((appointment) =>
        appointment.doctorName.toLocaleLowerCase("es").includes(search),
      );
    }

    return appointments.sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);

      return dateComparison !== 0
        ? dateComparison
        : a.time.localeCompare(b.time);
    });
  },

  /**
   * Busca una cita por su identificador.
   */
  getById(id: string): Appointment | undefined {
    return appointmentsStorage
      .getAll()
      .find((appointment) => appointment.id === id);
  },

  /**
   * Obtiene las citas de un paciente.
   */
  getByPatient(patientId: string): Appointment[] {
    return this.getAll({ patientId });
  },

  /**
   * Obtiene las citas de un médico, opcionalmente para una fecha.
   */
  getByDoctor(doctorId: string, date?: string): Appointment[] {
    return this.getAll({ doctorId, date });
  },

  /**
   * Crea una cita nueva con estado pendiente.
   */
  create(input: CreateAppointmentInput): Appointment {
    const appointments = appointmentsStorage.getAll();

    const slotTaken = appointments.some(
      (appointment) =>
        appointment.doctorId === input.doctorId &&
        appointment.date === input.date &&
        appointment.time === input.time &&
        appointment.status !== "cancelled",
    );

    if (slotTaken) {
      throw new Error("El horario seleccionado ya está ocupado.");
    }

    const appointment: Appointment = {
      ...input,
      id: generateAppointmentId(),
      status: "pending",
    };

    appointmentsStorage.saveAll([...appointments, appointment]);

    return appointment;
  },

  /**
   * Actualiza los datos de una cita existente.
   */
  update(
    id: string,
    changes: Partial<Omit<Appointment, "id">>,
  ): Appointment {
    const appointments = appointmentsStorage.getAll();
    const index = appointments.findIndex(
      (appointment) => appointment.id === id,
    );

    if (index === -1) {
      throw new Error("No se encontró la cita solicitada.");
    }

    const currentAppointment = appointments[index];

    if (!currentAppointment) {
      throw new Error("No se pudo recuperar la cita.");
    }

    const updatedAppointment: Appointment = {
      ...currentAppointment,
      ...changes,
      id: currentAppointment.id,
    };

    if (
      updatedAppointment.status !== "cancelled" &&
      appointments.some(
        (appointment) =>
          appointment.id !== id &&
          appointment.doctorId === updatedAppointment.doctorId &&
          appointment.date === updatedAppointment.date &&
          appointment.time === updatedAppointment.time &&
          appointment.status !== "cancelled",
      )
    ) {
      throw new Error("El horario seleccionado ya está ocupado.");
    }

    const updatedAppointments = [...appointments];
    updatedAppointments[index] = updatedAppointment;

    appointmentsStorage.saveAll(updatedAppointments);

    return updatedAppointment;
  },

  /**
   * Cancela una cita que todavía está pendiente.
   */
  cancel(id: string): Appointment {
    const appointment = this.getById(id);

    if (!appointment) {
      throw new Error("No se encontró la cita solicitada.");
    }

    if (appointment.status !== "pending") {
      throw new Error("Solo se pueden cancelar citas pendientes.");
    }

    return this.update(id, { status: "cancelled" });
  },
};

