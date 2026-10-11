import { useCallback, useMemo, useState } from "react";

import {
  schedulesService,
  type ScheduleFilters,
} from "../services/schedules.service";

import type { Schedule } from "../types/schedule";

interface UseSchedulesOptions {
  filters?: ScheduleFilters;
  autoLoad?: boolean;
}

interface UseSchedulesReturn {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  getAvailableTimes: (doctorId: number, date: string) => string[];
  markUnavailable: (
    doctorId: number,
    date: string,
    time: string,
  ) => boolean;
  markAvailable: (
    doctorId: number,
    date: string,
    time: string,
  ) => boolean;
}

export function useSchedules(
  options: UseSchedulesOptions = {},
): UseSchedulesReturn {
  const { filters = {}, autoLoad = true } = options;
  const { doctorId, date, available } = filters;

  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const schedules = useMemo(() => {
    void revision;
    return autoLoad ? schedulesService.getAll({ doctorId, date, available }) : [];
  },
    [autoLoad, available, date, doctorId, revision],
  );

  const refresh = useCallback(() => {
    setError(null);
    setRevision((current) => current + 1);
  }, []);

  const getAvailableTimes = useCallback(
    (doctorId: number, date: string): string[] => {
      try {
        return schedulesService.getAvailableTimes(doctorId, date);
      } catch {
        setError("No se pudieron obtener los horarios disponibles.");
        return [];
      }
    },
    [],
  );

  const markUnavailable = useCallback(
    (doctorId: number, date: string, time: string): boolean => {
      setError(null);

      try {
        schedulesService.markUnavailable(doctorId, date, time);
        refresh();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el horario.",
        );

        return false;
      }
    },
    [refresh],
  );

  const markAvailable = useCallback(
    (doctorId: number, date: string, time: string): boolean => {
      setError(null);

      try {
        schedulesService.markAvailable(doctorId, date, time);
        refresh();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el horario.",
        );

        return false;
      }
    },
    [refresh],
  );

  return {
    schedules,
    loading: false,
    error,
    refresh,
    getAvailableTimes,
    markUnavailable,
    markAvailable,
  };
}
