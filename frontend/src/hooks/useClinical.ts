import { useCallback, useMemo, useState } from "react";

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
}

export function useClinical(
  options: UseClinicalOptions = {},
): UseClinicalReturn {
  const { filters = {}, autoLoad = true } = options;
  const { patientId, doctorId, appointmentId } = filters;

  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const observations = useMemo(() => {
    void revision;
    return autoLoad ? clinicalService.getAll({ patientId, doctorId, appointmentId }) : [];
  },
    [appointmentId, autoLoad, doctorId, patientId, revision],
  );

  const refresh = useCallback(() => {
    setError(null);
    setRevision((current) => current + 1);
  }, []);

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

  return {
    observations,
    loading: false,
    error,
    refresh,
    createObservation,
  };
}
