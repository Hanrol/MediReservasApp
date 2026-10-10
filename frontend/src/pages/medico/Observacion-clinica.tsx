import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppointments } from "../../hooks/useAppointments";
import { useClinical } from "../../hooks/useClinical";

interface ClinicalFormValues {
  diagnosis: string;
  notes: string;
  treatment: string;
}

type ClinicalFormErrors = Partial<
  Record<keyof ClinicalFormValues, string>
>;

const INITIAL_VALUES: ClinicalFormValues = {
  diagnosis: "",
  notes: "",
  treatment: "",
};

const DOCTOR_ID = "doctor-001";

function ObservacionClinica() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("cita") ?? "";

  const {
    appointments,
    loading: loadingAppointment,
    error: appointmentError,
    refresh: refreshAppointments,
  } = useAppointments({
    filters: { doctorId: DOCTOR_ID },
  });

  const {
    observations,
    loading: loadingObservations,
    error: observationError,
    refresh: refreshObservations,
    createObservation,
  } = useClinical({
    filters: { appointmentId },
    autoLoad: Boolean(appointmentId),
  });

  const appointment = useMemo(
    () =>
      appointments.find((item) => item.id === appointmentId) ?? null,
    [appointments, appointmentId],
  );

  const existingObservation = useMemo(
    () => observations[0] ?? null,
    [observations],
  );

  const [values, setValues] =
    useState<ClinicalFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ClinicalFormErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingObservation) {
      setValues(INITIAL_VALUES);
      return;
    }

    setValues({
      diagnosis: existingObservation.diagnosis,
      notes: existingObservation.notes,
      treatment: existingObservation.treatment,
    });
  }, [existingObservation]);

  const updateField = (
    field: keyof ClinicalFormValues,
    value: string,
  ) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  const validateForm = (): ClinicalFormErrors => {
    const newErrors: ClinicalFormErrors = {};

    if (!values.diagnosis.trim()) {
      newErrors.diagnosis = "Ingrese el diagnóstico clínico.";
    } else if (values.diagnosis.trim().length < 3) {
      newErrors.diagnosis =
        "El diagnóstico debe contener al menos 3 caracteres.";
    } else if (values.diagnosis.trim().length > 300) {
      newErrors.diagnosis =
        "El diagnóstico no puede superar los 300 caracteres.";
    }

    if (!values.notes.trim()) {
      newErrors.notes = "Ingrese las observaciones clínicas.";
    } else if (values.notes.trim().length < 5) {
      newErrors.notes =
        "Las observaciones deben contener al menos 5 caracteres.";
    } else if (values.notes.trim().length > 2000) {
      newErrors.notes =
        "Las observaciones no pueden superar los 2000 caracteres.";
    }

    if (!values.treatment.trim()) {
      newErrors.treatment =
        "Ingrese el tratamiento o las indicaciones.";
    } else if (values.treatment.trim().length < 3) {
      newErrors.treatment =
        "El tratamiento debe contener al menos 3 caracteres.";
    } else if (values.treatment.trim().length > 1000) {
      newErrors.treatment =
        "El tratamiento no puede superar los 1000 caracteres.";
    }

    return newErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setFormError("");

    if (!appointment) {
      setFormError(
        "No se encontró la cita asociada a esta observación.",
      );
      return;
    }

    if (appointment.status !== "confirmed") {
      setFormError(
        "Solo se pueden registrar observaciones de citas confirmadas.",
      );
      return;
    }

    if (existingObservation) {
      setFormError(
        "Ya existe una observación registrada para esta cita.",
      );
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormError(
        "Revisa los campos indicados antes de guardar la observación.",
      );
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas guardar la observación clínica de este paciente?",
    );

    if (!confirmed) return;

    setSaving(true);

    const created = createObservation({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      diagnosis: values.diagnosis.trim(),
      notes: values.notes.trim(),
      treatment: values.treatment.trim(),
    });

    setSaving(false);

    if (!created) {
      setFormError(
        "No fue posible guardar la observación. Inténtalo nuevamente.",
      );
      return;
    }

    setSuccessMessage(
      "La observación clínica se guardó correctamente.",
    );

    refreshObservations();
  };

  const handleReset = () => {
    if (existingObservation) {
      setValues({
        diagnosis: existingObservation.diagnosis,
        notes: existingObservation.notes,
        treatment: existingObservation.treatment,
      });
    } else {
      setValues(INITIAL_VALUES);
    }

    setErrors({});
    setFormError("");
    setSuccessMessage("");
  };

  const loading = loadingAppointment || loadingObservations;
  const loadError = appointmentError ?? observationError;

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-page text-ink">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <a
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg text-white"
                aria-hidden="true"
              >
                M
              </span>
              MediReservas
            </a>

            <a
              href="/medico/agenda"
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              Volver a mi agenda
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900"
          >
            <h1 className="text-lg font-semibold">
              No se seleccionó ninguna cita
            </h1>
            <p className="mt-2 text-sm">
              Debes ingresar a esta pantalla desde tu agenda médica
              seleccionando una cita confirmada.
            </p>

            <a
              href="/medico/agenda"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Ir a mi agenda
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg text-white"
              aria-hidden="true"
            >
              M
            </span>
            MediReservas
          </a>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-6 md:flex"
          >
            <a
              href="/medico/agenda"
              className="text-sm font-medium text-muted transition hover:text-primary"
            >
              Mi agenda
            </a>

            <a
              href="/medico/observacion-clinica"
              aria-current="page"
              className="text-sm font-semibold text-primary"
            >
              Observación clínica
            </a>
          </nav>

          <a
            href="/medico/agenda"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Volver
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Área médica
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Observación clínica
          </h1>

          <p className="mt-3 text-muted">
            Registra el diagnóstico, las observaciones y las
            indicaciones correspondientes a la atención del paciente.
          </p>
        </section>

        {loading && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-line bg-white px-6 py-12 text-center"
          >
            <div
              className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"
              aria-hidden="true"
            />
            <p className="font-medium">Cargando datos de la cita...</p>
          </div>
        )}

        {loadError && !loading && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-semibold text-red-800">
              No se pudieron cargar los datos.
            </p>
            <p className="mt-1 text-sm text-red-700">{loadError}</p>

            <button
              type="button"
              onClick={() => {
                refreshAppointments();
                refreshObservations();
              }}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!loading && !loadError && !appointment && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            No se encontró la cita seleccionada. Puede que haya sido
            eliminada o no pertenezca a tu agenda.
          </div>
        )}

        {!loading && !loadError && appointment && (
          <>
            <section className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Datos de la atención
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-200">
                  Cita confirmada
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Paciente
                  </p>
                  <p className="mt-1 font-semibold">
                    {appointment.patientName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    ID: {appointment.patientId}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Médico
                  </p>
                  <p className="mt-1 font-semibold">
                    {appointment.doctorName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {appointment.specialtyName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Fecha
                  </p>
                  <p className="mt-1 font-medium">
                    {appointment.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Hora
                  </p>
                  <p className="mt-1 font-medium">
                    {appointment.time}
                  </p>
                </div>
              </div>
            </section>

            {existingObservation && (
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                Esta cita ya tiene una observación registrada el{" "}
                {new Date(
                  existingObservation.createdAt,
                ).toLocaleString("es-CL")}
                . Los campos se muestran solo como lectura.
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="mb-6 rounded-xl border border-primary/20 bg-primary-light p-4 text-sm text-primary-dark"
              >
                <p className="font-semibold">Proceso completado</p>
                <p className="mt-1">{successMessage}</p>
              </div>
            )}

            {formError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8"
            >
              <div className="mb-6 border-b border-line pb-5">
                <h2 className="text-xl font-semibold">
                  Registro de observación
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Todos los campos son obligatorios.
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="diagnosis"
                  className="mb-2 block text-sm font-medium"
                >
                  Diagnóstico <span className="text-red-600">*</span>
                </label>

                <input
                  id="diagnosis"
                  name="diagnosis"
                  type="text"
                  required
                  maxLength={300}
                  value={values.diagnosis}
                  disabled={Boolean(existingObservation)}
                  onChange={(event) =>
                    updateField("diagnosis", event.target.value)
                  }
                  placeholder="Ingrese el diagnóstico clínico"
                  aria-invalid={Boolean(errors.diagnosis)}
                  aria-describedby={
                    errors.diagnosis
                      ? "diagnosis-error"
                      : "diagnosis-help"
                  }
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-50 ${
                    errors.diagnosis ? "border-red-500" : "border-line"
                  }`}
                />

                <div className="mt-2 flex justify-between gap-3">
                  {errors.diagnosis ? (
                    <p
                      id="diagnosis-error"
                      className="text-sm text-red-600"
                    >
                      {errors.diagnosis}
                    </p>
                  ) : (
                    <p
                      id="diagnosis-help"
                      className="text-sm text-muted"
                    >
                      Máximo 300 caracteres.
                    </p>
                  )}

                  <span className="shrink-0 text-xs text-muted">
                    {values.diagnosis.length}/300
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Observaciones clínicas{" "}
                  <span className="text-red-600">*</span>
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  required
                  rows={5}
                  maxLength={2000}
                  value={values.notes}
                  disabled={Boolean(existingObservation)}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Registre los síntomas, hallazgos y antecedentes relevantes..."
                  aria-invalid={Boolean(errors.notes)}
                  aria-describedby={
                    errors.notes ? "notes-error" : "notes-help"
                  }
                  className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-50 ${
                    errors.notes ? "border-red-500" : "border-line"
                  }`}
                />

                <div className="mt-2 flex justify-between gap-3">
                  {errors.notes ? (
                    <p id="notes-error" className="text-sm text-red-600">
                      {errors.notes}
                    </p>
                  ) : (
                    <p id="notes-help" className="text-sm text-muted">
                      Máximo 2000 caracteres.
                    </p>
                  )}

                  <span className="shrink-0 text-xs text-muted">
                    {values.notes.length}/2000
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="treatment"
                  className="mb-2 block text-sm font-medium"
                >
                  Tratamiento e indicaciones{" "}
                  <span className="text-red-600">*</span>
                </label>

                <textarea
                  id="treatment"
                  name="treatment"
                  required
                  rows={4}
                  maxLength={1000}
                  value={values.treatment}
                  disabled={Boolean(existingObservation)}
                  onChange={(event) =>
                    updateField("treatment", event.target.value)
                  }
                  placeholder="Ingrese las indicaciones y el tratamiento definido..."
                  aria-invalid={Boolean(errors.treatment)}
                  aria-describedby={
                    errors.treatment
                      ? "treatment-error"
                      : "treatment-help"
                  }
                  className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-50 ${
                    errors.treatment
                      ? "border-red-500"
                      : "border-line"
                  }`}
                />

                <div className="mt-2 flex justify-between gap-3">
                  {errors.treatment ? (
                    <p
                      id="treatment-error"
                      className="text-sm text-red-600"
                    >
                      {errors.treatment}
                    </p>
                  ) : (
                    <p
                      id="treatment-help"
                      className="text-sm text-muted"
                    >
                      Máximo 1000 caracteres.
                    </p>
                  )}

                  <span className="shrink-0 text-xs text-muted">
                    {values.treatment.length}/1000
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving || Boolean(existingObservation)}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Limpiar formulario
                </button>

                <button
                  type="submit"
                  disabled={saving || Boolean(existingObservation)}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : existingObservation
                      ? "Observación ya registrada"
                      : "Guardar observación"}
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      <footer className="mt-10 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted sm:px-6 lg:px-8">
          MediReservas · Gestión de atención clínica
        </div>
      </footer>
    </div>
  );
}

export default ObservacionClinica;