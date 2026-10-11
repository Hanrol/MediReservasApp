import { useCallback, useState } from "react";

import {
  appointmentsService,
  type AppointmentFilters,
  type CreateAppointmentInput,
} from "../services/appointments.service";

import type { Appointment } from "../types/appointment";

interface UseAppointmentsOptions {
  filters?: AppointmentFilters;
  autoLoad?: boolean;
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createAppointment: (
    input: CreateAppointmentInput,
  ) => Appointment | null;
  cancelAppointment: (id: number) => boolean;
  confirmAppointment: (id: number) => Appointment | null;
  cancelAppointmentByStaff: (id: number) => Appointment | null;
  rescheduleAppointment: (id: number, scheduleSlotId: number) => Appointment | null;
  updateAppointment: (
    id: number,
    changes: Partial<Omit<Appointment, "appointmentId">>,
  ) => Appointment | null;
}

export function useAppointments(
  options: UseAppointmentsOptions = {},
): UseAppointmentsReturn {
  const { filters = {}, autoLoad = true } = options;
  const { patientUserId, doctorId, date, appointmentStatus, searchTerm } = filters;

  const [, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const appointments = autoLoad
    ? appointmentsService.getAll({ patientUserId, doctorId, date, appointmentStatus, searchTerm })
    : [];

  const refresh = useCallback(() => {
    setError(null);
    setRevision((current) => current + 1);
  }, []);

  const createAppointment = useCallback(
    (input: CreateAppointmentInput): Appointment | null => {
      setError(null);

      try {
        const created = appointmentsService.create(input);
        refresh();
        return created;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo crear la cita médica.",
        );

        return null;
      }
    },
    [refresh],
  );

  const cancelAppointment = useCallback(
    (id: number): boolean => {
      setError(null);

      try {
        appointmentsService.cancel(id);
        refresh();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cancelar la cita médica.",
        );

        return false;
      }
    },
    [refresh],
  );

  const updateAppointment = useCallback(
    (
      id: number,
      changes: Partial<Omit<Appointment, "appointmentId">>,
    ): Appointment | null => {
      setError(null);

      try {
        const updated = appointmentsService.update(id, changes);
        refresh();
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la cita médica.",
        );

        return null;
      }
    },
    [refresh],
  );

  const runAppointmentAction = useCallback(
    (action: () => Appointment, fallbackMessage: string): Appointment | null => {
      setError(null);

      try {
        const updated = action();
        refresh();
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackMessage);
        return null;
      }
    },
    [refresh],
  );

  const confirmAppointment = useCallback(
    (id: number) => runAppointmentAction(
      () => appointmentsService.confirm(id),
      "No se pudo confirmar la cita médica.",
    ),
    [runAppointmentAction],
  );

  const cancelAppointmentByStaff = useCallback(
    (id: number) => runAppointmentAction(
      () => appointmentsService.cancelByStaff(id),
      "No se pudo cancelar la cita médica.",
    ),
    [runAppointmentAction],
  );

  const rescheduleAppointment = useCallback(
    (id: number, scheduleSlotId: number) => runAppointmentAction(
      () => appointmentsService.reschedule(id, scheduleSlotId),
      "No se pudo reagendar la cita médica.",
    ),
    [runAppointmentAction],
  );

  return {
    appointments,
    loading: false,
    error,
    refresh,
    createAppointment,
    cancelAppointment,
    confirmAppointment,
    cancelAppointmentByStaff,
    rescheduleAppointment,
    updateAppointment,
  };
}

