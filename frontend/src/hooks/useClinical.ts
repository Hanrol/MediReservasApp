import { useCallback, useState } from "react";

import {
  clinicalService,
  type ClinicalFilters,
  type CreateObservationInput,
} from "../services/clinical.service";

import type { ClinicalObservation } from "../types/clinical";

interface UseClinicalOptions {
  filters?: ClinicalFilters;
  autoLoad?: boolean;
}

interface UseClinicalReturn {
  observations: ClinicalObservation[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createObservation: (
    input: CreateObservationInput,
  ) => ClinicalObservation | null;
  updateObservation: (
    id: string,
    changes: Partial<Omit<ClinicalObservation, "id" | "createdAt">>,
  ) => ClinicalObservation | null;
  removeObservation: (id: string) => boolean;
}

export function useClinical(
  options: UseClinicalOptions = {},
): UseClinicalReturn {
  const { filters: initialFilters = {}, autoLoad = true } = options;

  const [observations, setObservations] = useState<ClinicalObservation[]>(() =>
    autoLoad ? clinicalService.getAll(initialFilters) : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<ClinicalFilters>(initialFilters);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const results = clinicalService.getAll(filters);
      setObservations(results);
    } catch {
      setError("No se pudieron cargar las observaciones clínicas.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createObservation = useCallback(
    (input: CreateObservationInput): ClinicalObservation | null => {
      setError(null);

      try {
        const created = clinicalService.create(input);
        refresh();
        return created;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo crear la observación clínica.",
        );

        return null;
      }
    },
    [refresh],
  );

  const updateObservation = useCallback(
    (
      id: string,
      changes: Partial<Omit<ClinicalObservation, "id" | "createdAt">>,
    ): ClinicalObservation | null => {
      setError(null);

      try {
        const updated = clinicalService.update(id, changes);
        refresh();
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la observación clínica.",
        );

        return null;
      }
    },
    [refresh],
  );

  const removeObservation = useCallback(
    (id: string): boolean => {
      setError(null);

      try {
        clinicalService.remove(id);
        refresh();
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo eliminar la observación clínica.",
        );

        return false;
      }
    },
    [refresh],
  );

  return {
    observations,
    loading,
    error,
    refresh,
    createObservation,
    updateObservation,
    removeObservation,
  };
}
