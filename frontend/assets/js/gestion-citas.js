import {
    getAppointments,
    getAppointmentById,
    initializeBaseAppointments,
    updateAppointment
} from "./storage.js";
import { getLocalDateString } from "./validaciones.js";

const tableBody = document.querySelector("#appointments-table-body");
const emptyMessage = document.querySelector("#appointments-empty-message");
const resultCount = document.querySelector("#appointments-result-count");
const searchInput = document.querySelector("#appointment-search");
const statusFilter = document.querySelector("#appointment-status-filter");
const feedback = document.querySelector("#appointments-feedback");
const rescheduleDialog = document.querySelector("#reschedule-dialog");
const rescheduleForm = document.querySelector("#reschedule-form");
const rescheduleSummary = document.querySelector("#reschedule-summary");
const cancelDialog = document.querySelector("#cancel-dialog");
const cancelDialogDescription = document.querySelector("#cancel-dialog-description");
const cancelAppointmentId = document.querySelector("#cancel-appointment-id");

const STATUS_LABELS = {
    PENDIENTE: "Pendiente",
    CONFIRMADA: "Confirmada",
    REAGENDADA: "Reagendada",
    CANCELADA: "Cancelada"
};

const STATUS_BADGE_CLASSES = {
    PENDIENTE: "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700",
    CONFIRMADA: "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-primary-dark",
    REAGENDADA: "inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-secondary",
    CANCELADA: "inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
};

initializeBaseAppointments();

function showFeedback(message, isError = false) {
    feedback.hidden = !message;
    feedback.textContent = message;
    feedback.className = isError
        ? "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        : "rounded-2xl border border-emerald-200 bg-primary-light p-4 text-sm font-medium text-primary-dark";
}

function getFilteredAppointments() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    return getAppointments().filter((appointment) => {
        const searchableText = `${appointment.patientName} ${appointment.patientRun} ${appointment.doctorName}`.toLowerCase();
        const matchesQuery = searchableText.includes(query);
        const matchesStatus = status === "all" || appointment.status === status;
        return matchesQuery && matchesStatus;
    });
}

function createCell(text, className = "px-5 py-4") {
    const cell = document.createElement("td");
    cell.className = className;
    cell.textContent = text;
    return cell;
}

function createStatusCell(status) {
    const cell = document.createElement("td");
    cell.className = "px-5 py-4";
    const badge = document.createElement("span");
    badge.className = STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.PENDIENTE;
    badge.textContent = STATUS_LABELS[status] ?? status;
    cell.append(badge);
    return cell;
}

function createActionButtons(appointment) {
    const actions = document.createElement("div");
    actions.className = "flex flex-wrap justify-end gap-2";

    if (appointment.status === "PENDIENTE" || appointment.status === "REAGENDADA") {
        const confirmButton = document.createElement("button");
        confirmButton.className = "rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-emerald-50";
        confirmButton.type = "button";
        confirmButton.dataset.confirmAppointment = appointment.id;
        confirmButton.textContent = "Confirmar";
        actions.append(confirmButton);
    }

    if (appointment.status === "PENDIENTE" || appointment.status === "REAGENDADA") {
        const rescheduleButton = document.createElement("button");
        rescheduleButton.className = "rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light";
        rescheduleButton.type = "button";
        rescheduleButton.dataset.rescheduleAppointment = appointment.id;
        rescheduleButton.textContent = "Reagendar";
        actions.append(rescheduleButton);
    }

    if (appointment.status !== "CANCELADA") {
        const cancelButton = document.createElement("button");
        cancelButton.className = "rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50";
        cancelButton.type = "button";
        cancelButton.dataset.cancelAppointment = appointment.id;
        cancelButton.textContent = "Cancelar";
        actions.append(cancelButton);
    }

    if (!actions.children.length) {
        actions.append(createCell("—", "text-sm text-muted"));
        const emptyLabel = document.createElement("span");
        emptyLabel.className = "text-sm text-muted";
        emptyLabel.textContent = "Sin acciones";
        actions.append(emptyLabel);
    }

    return actions;
}

function renderAppointments() {
    const appointments = getFilteredAppointments();
    const rows = appointments.map((appointment) => {
        const row = document.createElement("tr");
        row.className = "border-b border-line last:border-0";

        row.append(
            createCell(appointment.patientName, "px-5 py-4 font-semibold"),
            createCell(appointment.patientRun),
            createCell(appointment.specialtyName),
            createCell(appointment.doctorName),
            createCell(appointment.date),
            createCell(appointment.time),
            createStatusCell(appointment.status)
        );

        const actionsCell = document.createElement("td");
        actionsCell.className = "px-5 py-4 text-right";
        actionsCell.append(createActionButtons(appointment));
        row.append(actionsCell);
        return row;
    });

    tableBody.replaceChildren(...rows);
    resultCount.textContent = `${appointments.length} ${appointments.length === 1 ? "cita encontrada" : "citas encontradas"}`;
    emptyMessage.hidden = appointments.length > 0;
}

function confirmAppointment(appointmentId) {
    const appointment = getAppointmentById(appointmentId);
    if (!appointment) return;

    updateAppointment(appointmentId, { status: "CONFIRMADA" });
    renderAppointments();
    showFeedback(`La cita de ${appointment.patientName} del ${appointment.date} a las ${appointment.time} fue confirmada.`);
}

function openRescheduleDialog(appointmentId) {
    const appointment = getAppointmentById(appointmentId);
    if (!appointment) return;

    rescheduleForm.reset();
    document.querySelector("#reschedule-appointment-id").value = appointment.id;
    rescheduleSummary.textContent = `Cita de ${appointment.patientName} — ${appointment.specialtyName} con ${appointment.doctorName}.`;
    document.querySelector("#reschedule-date").value = appointment.date;
    document.querySelector("#reschedule-date").min = getLocalDateString();
    document.querySelector("#reschedule-time").value = appointment.time;
    showRescheduleError("date");
    showRescheduleError("time");
    rescheduleDialog.showModal();
}

function showRescheduleError(fieldName, error = "") {
    const errorElement = document.querySelector(`#reschedule-${fieldName}-error`);
    const input = rescheduleForm?.elements.namedItem(fieldName);

    if (!input || !errorElement) return;
    input.setAttribute("aria-invalid", String(Boolean(error)));
    input.classList.toggle("border-red-500", Boolean(error));
    errorElement.textContent = error;
}

function openCancelDialog(appointmentId) {
    const appointment = getAppointmentById(appointmentId);
    if (!appointment) return;

    cancelAppointmentId.value = appointment.id;
    cancelDialogDescription.textContent = `¿Confirmas que deseas cancelar la cita de ${appointment.patientName} del ${appointment.date} a las ${appointment.time}?`;
    cancelDialog.showModal();
}

searchInput?.addEventListener("input", renderAppointments);
statusFilter?.addEventListener("change", renderAppointments);

tableBody?.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("[data-confirm-appointment]");
    if (confirmButton) confirmAppointment(confirmButton.dataset.confirmAppointment);

    const rescheduleButton = event.target.closest("[data-reschedule-appointment]");
    if (rescheduleButton) openRescheduleDialog(rescheduleButton.dataset.rescheduleAppointment);

    const cancelButton = event.target.closest("[data-cancel-appointment]");
    if (cancelButton) openCancelDialog(cancelButton.dataset.cancelAppointment);
});

document.querySelector("#close-reschedule-dialog")?.addEventListener("click", () => rescheduleDialog.close());
document.querySelector("#cancel-reschedule-button")?.addEventListener("click", () => rescheduleDialog.close());
document.querySelector("#cancel-appointment-button")?.addEventListener("click", () => cancelDialog.close());

rescheduleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const appointmentId = document.querySelector("#reschedule-appointment-id").value;
    const date = rescheduleForm.elements.namedItem("date").value;
    const time = rescheduleForm.elements.namedItem("time").value;

    showRescheduleError("date");
    showRescheduleError("time");

    let hasErrors = false;
    if (!date) {
        showRescheduleError("date", "Selecciona la nueva fecha.");
        hasErrors = true;
    } else if (date < getLocalDateString()) {
        showRescheduleError("date", "La nueva fecha no puede ser pasada.");
        hasErrors = true;
    }
    if (!time) {
        showRescheduleError("time", "Selecciona la nueva hora.");
        hasErrors = true;
    }
    if (hasErrors) return;

    const appointment = updateAppointment(appointmentId, { date, time, status: "REAGENDADA" });
    rescheduleDialog.close();
    renderAppointments();
    if (appointment) {
        showFeedback(`La cita de ${appointment.patientName} fue reagendada para el ${date} a las ${time}.`);
    }
});

document.querySelector("#confirm-cancel-button")?.addEventListener("click", () => {
    const appointmentId = cancelAppointmentId.value;
    const appointment = updateAppointment(appointmentId, { status: "CANCELADA" });

    cancelDialog.close();
    renderAppointments();
    if (appointment) {
        showFeedback(`La cita de ${appointment.patientName} fue cancelada.`);
    }
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("estado") === "pendiente" || urlParams.get("accion") === "reagendar") {
    statusFilter.value = "PENDIENTE";
}

feedback.hidden = true;
renderAppointments();
