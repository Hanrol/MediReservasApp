import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import { ROUTES } from "../../constants/routes";
import { useAppointments } from "../../hooks/useAppointments";
import { useClinical } from "../../hooks/useClinical";
import { useAuth } from "../../hooks/useAuth";
import { getDoctorForUser } from "../../services/doctors.service";
import { validateClinicalForm, type ClinicalFormErrors, type ClinicalFormValues } from "../../utils/clinicalForm";

const INITIAL_VALUES: ClinicalFormValues = {
  diagnosis: "",
  notes: "",
  treatment: "",
};

function ObservacionClinica() {
  const { user } = useAuth();
  const doctor = getDoctorForUser(user);
  const [searchParams] = useSearchParams();
  const appointmentId = Number(searchParams.get("cita"));

  const {
    appointments,
    loading: loadingAppointment,
    error: appointmentError,
    refresh: refreshAppointments,
    updateAppointment,
  } = useAppointments({
    filters: { doctorId: doctor?.doctorId },
  });

  const {
    observations,
    loading: loadingObservations,
    error: observationError,
    refresh: refreshObservations,
    createObservation,
  } = useClinical({
    filters: { appointmentId },
    autoLoad: Number.isInteger(appointmentId) && appointmentId > 0,
  });

  const appointment = useMemo(
    () =>
      appointments.find((item) => item.appointmentId === appointmentId) ?? null,
    [appointments, appointmentId],
  );

  const existingObservation = useMemo(
    () => observations[0] ?? null,
    [observations],
  );

  const [values, setValues] = useState<ClinicalFormValues>(() =>
    existingObservation
      ? {
          diagnosis: existingObservation.diagnosis,
          notes: existingObservation.notes,
          treatment: existingObservation.treatment,
        }
      : INITIAL_VALUES,
  );
  const [errors, setErrors] = useState<ClinicalFormErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

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

    if (appointment.appointmentStatus !== "CONFIRMED") {
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

    const validationErrors = validateClinicalForm(values);
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

    const completedAppointment = updateAppointment(appointment.appointmentId, {
      appointmentStatus: "COMPLETED",
    });

    if (!completedAppointment) {
      setSaving(false);
      setFormError("No fue posible completar la cita. Inténtalo nuevamente.");
      return;
    }

    const created = createObservation({
      appointmentId: appointment.appointmentId,
      patientId: appointment.patientUserId,
      doctorId: appointment.doctorId,
      diagnosis: values.diagnosis.trim(),
      notes: values.notes.trim(),
      treatment: values.treatment.trim(),
    });

    setSaving(false);

    if (!created) {
      updateAppointment(appointment.appointmentId, {
        appointmentStatus: "CONFIRMED",
      });
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
  const loadError = formError ? null : appointmentError ?? observationError;

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return (
      <DashboardLayout currentPath={ROUTES.clinicalObservation}>
        <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Mi agenda médica', href: ROUTES.medicalSchedule }, { label: 'Observación clínica' }]} />
        <div className="mx-auto max-w-3xl py-8">
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

            <Link
              to={ROUTES.medicalSchedule}
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Ir a mi agenda
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPath={ROUTES.clinicalObservation}>
      <Breadcrumbs items={[{ label: 'Panel principal', href: ROUTES.dashboard }, { label: 'Mi agenda médica', href: ROUTES.medicalSchedule }, { label: 'Observación clínica' }]} />
      <div className="mx-auto max-w-4xl">
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
                    ID: {appointment.patientUserId}
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
      </div>
    </DashboardLayout>
  );
}

export default ObservacionClinica;
