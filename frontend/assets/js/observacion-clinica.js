import { getAppointmentById, initializeBaseAppointments } from "./storage.js";

const form = document.querySelector("#observation-form");
const formMessage = document.querySelector("#observation-form-message");
const notFoundMessage = document.querySelector("#observation-not-found");
const summaryCard = document.querySelector("#appointment-summary-card");
const diagnosisInput = document.querySelector("#observation-diagnosis");
const notesInput = document.querySelector("#observation-notes");

initializeBaseAppointments();

const appointmentId = new URLSearchParams(window.location.search).get("id");
const appointment = appointmentId ? getAppointmentById(appointmentId) : null;

function showFieldError(input, errorElementId, error = "") {
    const errorElement = document.querySelector(`#${errorElementId}`);

    if (!input || !errorElement) return;
    input.setAttribute("aria-invalid", String(Boolean(error)));
    input.classList.toggle("border-red-500", Boolean(error));
    errorElement.textContent = error;
}

function fillSummary() {
    document.querySelector("#summary-patient").textContent = appointment.patientName;
    document.querySelector("#summary-run").textContent = appointment.patientRun;
    document.querySelector("#summary-specialty").textContent = appointment.specialtyName;
    document.querySelector("#summary-date").textContent = `${appointment.date} · ${appointment.time} hrs`;
    document.querySelector("#summary-reason").textContent = appointment.reason;
}

function validateObservation(values) {
    const errors = {};

    if (!values.diagnosis) errors.diagnosis = "El diagnóstico es obligatorio.";
    else if (values.diagnosis.length > 120) errors.diagnosis = "El diagnóstico no puede superar 120 caracteres.";

    if (!values.notes) errors.notes = "La observación clínica es obligatoria.";
    else if (values.notes.trim().length < 10) errors.notes = "La observación debe tener al menos 10 caracteres.";

    return errors;
}

if (!appointment) {
    notFoundMessage.hidden = false;
    summaryCard.hidden = true;
    form.hidden = true;
} else {
    fillSummary();
}

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {
        diagnosis: diagnosisInput.value.trim(),
        notes: notesInput.value.trim()
    };
    const errors = validateObservation(values);

    showFieldError(diagnosisInput, "observation-diagnosis-error", errors.diagnosis);
    showFieldError(notesInput, "observation-notes-error", errors.notes);
    formMessage.textContent = "";

    if (Object.keys(errors).length > 0) {
        (errors.diagnosis ? diagnosisInput : notesInput)?.focus();
        return;
    }

    formMessage.className = "mt-4 text-center text-sm font-medium text-primary-dark";
    formMessage.textContent = "Observación registrada correctamente.";
    form.reset();
});
