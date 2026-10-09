import { useState, type FormEvent } from "react";

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

function ObservacionClinica() {
  const [values, setValues] =
    useState<ClinicalFormValues>(INITIAL_VALUES);

  const [errors, setErrors] = useState<ClinicalFormErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedObservation, setSavedObservation] =
    useState<ClinicalFormValues | null>(null);

  // Datos provisionales para visualizar la página.
  // Más adelante deben obtenerse de la cita seleccionada.
  const appointment = {
    id: "appointment-001",
    patientName: "Juan Pérez",
    patientId: "patient-001",
    doctorName: "Dra. María González",
    specialtyName: "Medicina General",
    date: "2026-10-09",
    time: "09:00",
    status: "confirmed",
  };

  const updateField = (
    field: keyof ClinicalFormValues,
    value: string
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
      newErrors.treatment = "Ingrese el tratamiento o las indicaciones.";
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

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormError(
        "Revisa los campos indicados antes de guardar la observación."
      );
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas guardar la observación clínica de este paciente?"
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const observation: ClinicalFormValues = {
        diagnosis: values.diagnosis.trim(),
        notes: values.notes.trim(),
        treatment: values.treatment.trim(),
      };

      // Guardado temporal en el estado de React.
      // La persistencia se conectará después con clinical.service.ts.
      setSavedObservation(observation);

      setSuccessMessage(
        "La observación clínica pasó las validaciones y se guardó temporalmente en esta pantalla."
      );

      setValues(INITIAL_VALUES);
      setErrors({});
    } catch {
      setFormError(
        "No fue posible guardar la observación. Inténtalo nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setFormError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      {/* Encabezado */}
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
            href="/"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Volver
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Título */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Área médica
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Observación clínica
          </h1>

          <p className="mt-3 text-muted">
            Registra el diagnóstico, las observaciones y las indicaciones
            correspondientes a la atención del paciente.
          </p>
        </section>

        {/* Aviso de datos de demostración */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Esta pantalla utiliza datos de ejemplo. Verifica la cita y el
          paciente antes de conectar el guardado definitivo.
        </div>

        {/* Datos de la cita */}
        <section className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Datos de la atención</h2>

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
              <p className="mt-1 font-medium">{appointment.date}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Hora
              </p>
              <p className="mt-1 font-medium">{appointment.time}</p>
            </div>
          </div>
        </section>

        {/* Mensaje de éxito */}
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

        {/* Error general */}
        {formError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {formError}
          </div>
        )}

        {/* Formulario clínico */}
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

          {/* Diagnóstico */}
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
              onChange={(event) =>
                updateField("diagnosis", event.target.value)
              }
              placeholder="Ingrese el diagnóstico clínico"
              aria-invalid={Boolean(errors.diagnosis)}
              aria-describedby={
                errors.diagnosis ? "diagnosis-error" : "diagnosis-help"
              }
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary ${
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
                <p id="diagnosis-help" className="text-sm text-muted">
                  Máximo 300 caracteres.
                </p>
              )}

              <span className="shrink-0 text-xs text-muted">
                {values.diagnosis.length}/300
              </span>
            </div>
          </div>

          {/* Observaciones */}
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
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
              placeholder="Registre los síntomas, hallazgos y antecedentes relevantes..."
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "notes-error" : "notes-help"}
              className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary ${
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

          {/* Tratamiento */}
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
              className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary ${
                errors.treatment ? "border-red-500" : "border-line"
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
                <p id="treatment-help" className="text-sm text-muted">
                  Máximo 1000 caracteres.
                </p>
              )}

              <span className="shrink-0 text-xs text-muted">
                {values.treatment.length}/1000
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="rounded-xl border border-line px-5 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpiar formulario
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar observación"}
            </button>
          </div>
        </form>

        {/* Vista temporal de la última observación */}
        {savedObservation && (
          <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">
              Última observación registrada en pantalla
            </h2>

            <p className="mt-4 text-sm font-semibold">Diagnóstico</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
              {savedObservation.diagnosis}
            </p>

            <p className="mt-4 text-sm font-semibold">Observaciones</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
              {savedObservation.notes}
            </p>

            <p className="mt-4 text-sm font-semibold">
              Tratamiento e indicaciones
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
              {savedObservation.treatment}
            </p>

            <p className="mt-4 text-xs text-muted">
              Este registro es temporal y se perderá al recargar la página.
            </p>
          </section>
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

export default ObservacionClinica