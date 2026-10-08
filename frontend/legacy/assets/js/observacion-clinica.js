import {getAppointmentById, getDoctors, getSession, initializeBaseAppointments, updateAppointment} from "./storage.js";
import {setFieldError} from "./ui-utils.js";
import {getOrCreateMedicalRecord, saveDiagnosis, saveMedicalVisit} from "./clinical-storage.js";
import {completeScheduleSlot, initializeBaseScheduleSlots} from "./schedule-storage.js";

const form = document.querySelector("#observation-form");
const formMessage = document.querySelector("#observation-form-message");
const notFoundMessage = document.querySelector("#observation-not-found");
const summaryCard = document.querySelector("#appointment-summary-card");
const diagnosisInput = document.querySelector("#observation-diagnosis");
const notesInput = document.querySelector("#observation-notes");
const treatmentInput = document.querySelector("#observation-treatment");

initializeBaseAppointments();
initializeBaseScheduleSlots();

const appointmentId = new URLSearchParams(window.location.search).get("id");
const appointment = appointmentId ? getAppointmentById(appointmentId) : null;
const session = getSession();
const doctor = getDoctors().find((item) => item.userId === session?.userId);
const canEditAppointment = appointment?.doctorId === doctor?.doctorId && appointment.appointmentStatus === "CONFIRMED";

function showFieldError(input, errorElementId, error = "") {
    const errorElement = document.querySelector(`#${errorElementId}`);

    setFieldError(input, errorElement, error);
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

    if (!values.treatment) errors.treatment = "El tratamiento es obligatorio.";

    return errors;
}

if (!appointment || !canEditAppointment) {
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
        notes: notesInput.value.trim(),
        treatment: treatmentInput.value.trim()
    };
    const errors = validateObservation(values);

    showFieldError(diagnosisInput, "observation-diagnosis-error", errors.diagnosis);
    showFieldError(notesInput, "observation-notes-error", errors.notes);
    showFieldError(treatmentInput, "observation-treatment-error", errors.treatment);
    formMessage.textContent = "";

    if (Object.keys(errors).length > 0) {
        (errors.diagnosis ? diagnosisInput : errors.notes ? notesInput : treatmentInput)?.focus();
        return;
    }

    const medicalRecord = getOrCreateMedicalRecord(appointment.patientUserId);
    const medicalVisit = saveMedicalVisit({
        medicalRecordId: medicalRecord.medicalRecordId,
        appointmentId: appointment.appointmentId,
        doctorId: appointment.doctorId,
        visitDate: new Date().toISOString(),
        visitReason: appointment.reason,
        observations: values.notes,
        treatment: values.treatment
    });
    saveDiagnosis({
        medicalVisitId: medicalVisit.medicalVisitId,
        diagnosisDescription: values.diagnosis,
        diagnosisNotes: ""
    });
    updateAppointment(appointment.appointmentId, {appointmentStatus: "COMPLETED"});
    completeScheduleSlot(appointment.scheduleSlotId);

    formMessage.className = "mt-4 text-center text-sm font-medium text-primary-dark";
    formMessage.textContent = "Observación registrada correctamente.";
    form.reset();
    diagnosisInput.disabled = true;
    notesInput.disabled = true;
    treatmentInput.disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
});
