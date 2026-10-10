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
  cancelAppointment: (id: string) => boolean;
  updateAppointment: (
    id: string,
    changes: Partial<Omit<Appointment, "id">>,
  ) => Appointment | null;
}

export function useAppointments(
  options: UseAppointmentsOptions = {},
): UseAppointmentsReturn {
  const {
    filters: initialFilters = {},
    autoLoad = true,
  } = options;

  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    autoLoad ? appointmentsService.getAll(initialFilters) : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<AppointmentFilters>(initialFilters);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const results = appointmentsService.getAll(filters);
      setAppointments(results);
    } catch {
      setError("No se pudieron cargar las citas médicas.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
    (id: string): boolean => {
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
      id: string,
      changes: Partial<Omit<Appointment, "id">>,
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

  return {
    appointments,
    loading,
    error,
    refresh,
    createAppointment,
    cancelAppointment,
    updateAppointment,
  };
}

