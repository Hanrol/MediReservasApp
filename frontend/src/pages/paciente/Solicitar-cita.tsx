import { useMemo, useState, type FormEvent } from "react";

import { useAppointments } from "../../hooks/useAppointments";
import { useSchedules } from "../../hooks/useSchedules";
import { ScheduleSelector } from "../../components/appointments/ScheduleSelector";
import type { AppointmentModality } from "../../types/appointment";

interface DoctorOption {
  id: string;
  name: string;
  specialtyId: string;
}

interface FormValues {
  specialtyId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  modality: AppointmentModality | "";
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const SPECIALTIES = [
  { id: "specialty-001", name: "Medicina General" },
  { id: "specialty-002", name: "Cardiología" },
  { id: "specialty-003", name: "Dermatología" },
];

const DOCTORS: DoctorOption[] = [
  {
    id: "doctor-001",
    name: "Dra. María González",
    specialtyId: "specialty-001",
  },
  {
    id: "doctor-002",
    name: "Dr. Carlos Rodríguez",
    specialtyId: "specialty-002",
  },
  {
    id: "doctor-003",
    name: "Dra. Laura Fernández",
    specialtyId: "specialty-003",
  },
];

const INITIAL_VALUES: FormValues = {
  specialtyId: "",
  doctorId: "",
  date: "",
  time: "",
  reason: "",
  modality: "",
};

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function SolicitarCita() {
  const {
    createAppointment,
    loading: creatingAppointment,
    error: appointmentError,
  } = useAppointments({
    filters: { patientId: "patient-001" },
    autoLoad: false,
  });

  const { getAvailableTimes } = useSchedules({ autoLoad: false });

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const today = getLocalDateString();

  const availableDoctors = useMemo(() => {
    if (!values.specialtyId) return [];

    return DOCTORS.filter(
      (doctor) => doctor.specialtyId === values.specialtyId,
    );
  }, [values.specialtyId]);

  const availableTimes = useMemo(() => {
    if (!values.doctorId || !values.date || values.date < today) {
      return [];
    }

    return getAvailableTimes(values.doctorId, values.date);
  }, [values.doctorId, values.date, today, getAvailableTimes]);

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      ...(field === "specialtyId"
        ? {
            doctorId: undefined,
            date: undefined,
            time: undefined,
          }
        : {}),
      ...(field === "doctorId"
        ? {
            date: undefined,
            time: undefined,
          }
        : {}),
      ...(field === "date"
        ? {
            time: undefined,
          }
        : {}),
    }));

    setSuccessMessage("");
    setFormError("");
  };

  const handleSpecialtyChange = (specialtyId: string) => {
    setValues((previous) => ({
      ...previous,
      specialtyId,
      doctorId: "",
      date: "",
      time: "",
    }));

    setErrors((previous) => ({
      ...previous,
      specialtyId: undefined,
      doctorId: undefined,
      date: undefined,
      time: undefined,
    }));

    setSuccessMessage("");
    setFormError("");
  };

  const handleDoctorChange = (doctorId: string) => {
    setValues((previous) => ({
      ...previous,
      doctorId,
      date: "",
      time: "",
    }));

    setErrors((previous) => ({
      ...previous,
      doctorId: undefined,
      date: undefined,
      time: undefined,
    }));

    setSuccessMessage("");
    setFormError("");
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!values.specialtyId) {
      newErrors.specialtyId = "Seleccione una especialidad.";
    }

    const selectedDoctor = DOCTORS.find(
      (doctor) => doctor.id === values.doctorId,
    );

    if (!values.doctorId) {
      newErrors.doctorId = "Seleccione un médico.";
    } else if (
      !selectedDoctor ||
      selectedDoctor.specialtyId !== values.specialtyId
    ) {
      newErrors.doctorId =
        "El médico seleccionado no corresponde a la especialidad.";
    }

    if (!values.date) {
      newErrors.date = "Seleccione una fecha.";
    } else if (values.date < today) {
      newErrors.date = "Seleccione una fecha desde hoy en adelante.";
    }

    if (!values.time) {
      newErrors.time = "Seleccione una hora disponible.";
    } else if (!availableTimes.includes(values.time)) {
      newErrors.time = "Seleccione una hora válida.";
    }

    if (!values.reason.trim()) {
      newErrors.reason = "Ingrese el motivo de la consulta.";
    } else if (values.reason.trim().length < 5) {
      newErrors.reason =
        "El motivo debe contener al menos 5 caracteres.";
    } else if (values.reason.trim().length > 500) {
      newErrors.reason =
        "El motivo no puede superar los 500 caracteres.";
    }

    if (!values.modality) {
      newErrors.modality = "Seleccione una modalidad.";
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
        "Revisa los campos indicados antes de continuar.",
      );
      return;
    }

    const selectedSpecialty = SPECIALTIES.find(
      (specialty) => specialty.id === values.specialtyId,
    );

    const selectedDoctor = DOCTORS.find(
      (doctor) => doctor.id === values.doctorId,
    );

    if (!selectedSpecialty || !selectedDoctor || !values.modality) {
      setFormError(
        "No fue posible validar los datos. Revisa el formulario.",
      );
      return;
    }

    const createdAppointment = createAppointment({
      patientId: "patient-001",
      patientName: "Juan Pérez",
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialtyId: selectedSpecialty.id,
      specialtyName: selectedSpecialty.name,
      date: values.date,
      time: values.time,
      reason: values.reason.trim(),
      modality: values.modality,
    });

    if (!createdAppointment) {
      setFormError(
        appointmentError ??
          "No fue posible registrar la cita. Inténtalo nuevamente.",
      );
      return;
    }

    setValues(INITIAL_VALUES);
    setErrors({});
    setSuccessMessage(
      "Tu solicitud de cita se registró correctamente y está pendiente de confirmación.",
    );
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setSuccessMessage("");
    setFormError("");
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
              href="/paciente/solicitar-cita"
              aria-current="page"
              className="text-sm font-semibold text-primary"
            >
              Solicitar cita
            </a>

            <a
              href="/paciente/mis-citas"
              className="text-sm font-medium text-muted transition hover:text-primary"
            >
              Mis citas
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
            Área del paciente
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Solicitar cita médica
          </h1>

          <p className="mt-3 text-muted">
            Completa el formulario para solicitar una atención médica.
            Revisa tus datos antes de enviar la solicitud.
          </p>
        </section>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-primary/20 bg-primary-light p-4 text-sm text-primary-dark"
          >
            <p className="font-semibold">Solicitud registrada</p>
            <p className="mt-1">{successMessage}</p>

            <a
              href="/paciente/mis-citas"
              className="mt-3 inline-block font-semibold underline underline-offset-4"
            >
              Consultar mis citas
            </a>
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

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="mb-6 border-b border-line pb-5">
            <h2 className="text-xl font-semibold">Datos de la cita</h2>
            <p className="mt-1 text-sm text-muted">
              Los campos marcados con * son obligatorios.
            </p>
          </div>

          {/* Especialidad y Médico */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="especialidad"
                className="mb-2 block text-sm font-medium"
              >
                Especialidad <span className="text-red-600">*</span>
              </label>

              <select
                id="especialidad"
                name="especialidad"
                required
                value={values.specialtyId}
                onChange={(event) =>
                  handleSpecialtyChange(event.target.value)
                }
                aria-invalid={Boolean(errors.specialtyId)}
                aria-describedby={
                  errors.specialtyId
                    ? "especialidad-error"
                    : undefined
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary ${
                  errors.specialtyId
                    ? "border-red-500"
                    : "border-line"
                }`}
              >
                <option value="">Seleccione una especialidad</option>

                {SPECIALTIES.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>

              {errors.specialtyId && (
                <p
                  id="especialidad-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.specialtyId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="medico"
                className="mb-2 block text-sm font-medium"
              >
                Médico <span className="text-red-600">*</span>
              </label>

              <select
                id="medico"
                name="medico"
                required
                value={values.doctorId}
                disabled={!values.specialtyId}
                onChange={(event) =>
                  handleDoctorChange(event.target.value)
                }
                aria-invalid={Boolean(errors.doctorId)}
                aria-describedby={
                  errors.doctorId ? "medico-error" : undefined
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                  errors.doctorId ? "border-red-500" : "border-line"
                }`}
              >
                <option value="">
                  {values.specialtyId
                    ? "Seleccione un médico"
                    : "Primero seleccione una especialidad"}
                </option>

                {availableDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>

              {errors.doctorId && (
                <p
                  id="medico-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.doctorId}
                </p>
              )}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="mt-6">
            <ScheduleSelector
              date={values.date}
              time={values.time}
              availableTimes={availableTimes}
              minDate={today}
              disabled={!values.doctorId}
              onDateChange={(date) => updateField("date", date)}
              onTimeChange={(time) => updateField("time", time)}
              dateError={errors.date}
              timeError={errors.time}
            />
          </div>

          {/* Motivo */}
          <div className="mt-6">
            <label
              htmlFor="motivo"
              className="mb-2 block text-sm font-medium"
            >
              Motivo de la consulta{" "}
              <span className="text-red-600">*</span>
            </label>

            <textarea
              id="motivo"
              name="motivo"
              required
              rows={4}
              maxLength={500}
              value={values.reason}
              onChange={(event) =>
                updateField("reason", event.target.value)
              }
              placeholder="Describe brevemente el motivo de tu consulta..."
              aria-invalid={Boolean(errors.reason)}
              aria-describedby={
                errors.reason ? "motivo-error" : "motivo-help"
              }
              className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary ${
                errors.reason ? "border-red-500" : "border-line"
              }`}
            />

            <div className="mt-2 flex items-start justify-between gap-3">
              {errors.reason ? (
                <p
                  id="motivo-error"
                  className="text-sm text-red-600"
                >
                  {errors.reason}
                </p>
              ) : (
                <p id="motivo-help" className="text-sm text-muted">
                  Describe brevemente el motivo de la atención.
                </p>
              )}

              <span className="shrink-0 text-xs text-muted">
                {values.reason.length}/500
              </span>
            </div>
          </div>

          {/* Modalidad */}
          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-medium">
              Modalidad de atención{" "}
              <span className="text-red-600">*</span>
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  values.modality === "presencial"
                    ? "border-primary bg-primary-light"
                    : "border-line hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="modalidad"
                  value="presencial"
                  checked={values.modality === "presencial"}
                  onChange={() =>
                    updateField("modality", "presencial")
                  }
                  className="mt-1 accent-primary"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Presencial
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Atención en el centro médico.
                  </span>
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  values.modality === "online"
                    ? "border-primary bg-primary-light"
                    : "border-line hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="modalidad"
                  value="online"
                  checked={values.modality === "online"}
                  onChange={() => updateField("modality", "online")}
                  className="mt-1 accent-primary"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Virtual
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Atención a distancia.
                  </span>
                </span>
              </label>
            </div>

            {errors.modality && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.modality}
              </p>
            )}
          </fieldset>

          {/* Botones */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-line px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
            >
              Limpiar formulario
            </button>

            <button
              type="submit"
              disabled={creatingAppointment}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingAppointment
                ? "Procesando solicitud..."
                : "Solicitar cita"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          El envío registra una solicitud pendiente; no garantiza una
          confirmación inmediata del horario.
        </p>
      </main>

      <footer className="mt-10 border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted sm:px-6 lg:px-8">
          MediReservas · Gestión de citas médicas
        </div>
      </footer>
    </div>
  );
}

export default SolicitarCita;