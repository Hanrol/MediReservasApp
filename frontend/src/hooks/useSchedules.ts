import { useCallback, useEffect, useState } from "react";

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
  getAvailableTimes: (doctorId: string, date: string) => string[];
  markUnavailable: (
    doctorId: string,
    date: string,
    time: string,
  ) => boolean;
  markAvailable: (
    doctorId: string,
    date: string,
    time: string,
  ) => boolean;
}

export function useSchedules(
  options: UseSchedulesOptions = {},
): UseSchedulesReturn {
  const { filters: initialFilters = {}, autoLoad = true } = options;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<ScheduleFilters>(initialFilters);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const results = schedulesService.getAll(filters);
      setSchedules(results);
    } catch {
      setError("No se pudieron cargar los horarios.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  const getAvailableTimes = useCallback(
    (doctorId: string, date: string): string[] => {
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
    (doctorId: string, date: string, time: string): boolean => {
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
    (doctorId: string, date: string, time: string): boolean => {
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
    loading,
    error,
    refresh,
    getAvailableTimes,
    markUnavailable,
    markAvailable,
  };
}