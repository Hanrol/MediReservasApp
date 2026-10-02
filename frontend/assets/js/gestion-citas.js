import {
    getAppointments,
    getAppointmentById,
    initializeBaseAppointments,
    updateAppointment
} from "./storage.js";
import {createTableCell, setFieldError} from "./ui-utils.js";
import {canCancelAppointment, formatAppointmentDate, getAppointmentStatusBadgeClass, getAppointmentStatusLabel, matchesAppointmentFilters} from "./citas-utils.js";
import {getAvailableScheduleSlots, initializeBaseScheduleSlots, releaseScheduleSlot, rescheduleScheduleSlot} from "./schedule-storage.js";

const tableBody = document.querySelector("#appointments-table-body");
const emptyMessage = document.querySelector("#appointments-empty-message");
const resultCount = document.querySelector("#appointments-result-count");
const searchInput = document.querySelector("#appointment-search");
const statusFilter = document.querySelector("#appointment-status-filter");
const dateFilter = document.querySelector("#appointment-date-filter");
const feedback = document.querySelector("#appointments-feedback");
const rescheduleDialog = document.querySelector("#reschedule-dialog");
const rescheduleForm = document.querySelector("#reschedule-form");
const rescheduleSummary = document.querySelector("#reschedule-summary");
const cancelDialog = document.querySelector("#cancel-dialog");
const cancelDialogDescription = document.querySelector("#cancel-dialog-description");
const cancelAppointmentId = document.querySelector("#cancel-appointment-id");
const rescheduleDate = document.querySelector("#reschedule-date");
const rescheduleTime = document.querySelector("#reschedule-time");

initializeBaseAppointments();
initializeBaseScheduleSlots();

function resetSelect(select, placeholder) {
    select.replaceChildren(new Option(placeholder, ""));
}

function fillRescheduleTimes(doctorId) {
    resetSelect(rescheduleTime, "Selecciona una hora");
    getAvailableScheduleSlots(doctorId)
        .filter(({slotDate}) => slotDate === rescheduleDate.value)
        .sort((first, second) => first.startTime.localeCompare(second.startTime))
        .forEach((slot) => rescheduleTime.add(new Option(slot.startTime.slice(0, 5), slot.scheduleSlotId)));
}

function showFeedback(message, isError = false) {
    feedback.hidden = !message;
    feedback.textContent = message;
    feedback.className = isError
        ? "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        : "rounded-2xl border border-emerald-200 bg-primary-light p-4 text-sm font-medium text-primary-dark";
}

function getFilteredAppointments() {
    return getAppointments().filter((appointment) => matchesAppointmentFilters(appointment, {
        query: searchInput.value,
        status: statusFilter.value,
        date: dateFilter.value
    }));
}

function createStatusCell(status) {
    const cell = document.createElement("td");
    cell.className = "px-5 py-4";
    const badge = document.createElement("span");
    badge.className = getAppointmentStatusBadgeClass(status);
    badge.textContent = getAppointmentStatusLabel(status);
    cell.append(badge);
    return cell;
}

function createActionButtons(appointment) {
    const actions = document.createElement("div");
    actions.className = "flex flex-wrap justify-end gap-2";

    if (appointment.appointmentStatus === "PENDING") {
        const confirmButton = document.createElement("button");
        confirmButton.className = "rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-emerald-50";
        confirmButton.type = "button";
        confirmButton.dataset.confirmAppointment = appointment.appointmentId;
        confirmButton.textContent = "Confirmar";
        actions.append(confirmButton);
    }

    if (appointment.appointmentStatus === "PENDING") {
        const rescheduleButton = document.createElement("button");
        rescheduleButton.className = "rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light";
        rescheduleButton.type = "button";
        rescheduleButton.dataset.rescheduleAppointment = appointment.appointmentId;
        rescheduleButton.textContent = "Reagendar";
        actions.append(rescheduleButton);
    }

    if (canCancelAppointment(appointment.appointmentStatus)) {
        const cancelButton = document.createElement("button");
        cancelButton.className = "rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50";
        cancelButton.type = "button";
        cancelButton.dataset.cancelAppointment = appointment.appointmentId;
        cancelButton.textContent = "Cancelar";
        actions.append(cancelButton);
    }

    if (!actions.children.length) {
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
            createTableCell(appointment.patientName, "px-5 py-4 font-semibold"),
            createTableCell(appointment.patientRun),
            createTableCell(appointment.specialtyName),
            createTableCell(appointment.doctorName),
            createTableCell(appointment.date),
            createTableCell(appointment.time),
            createStatusCell(appointment.appointmentStatus)
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

    updateAppointment(appointmentId, {appointmentStatus: "CONFIRMED"});
    renderAppointments();
    showFeedback(`La cita de ${appointment.patientName} del ${appointment.date} a las ${appointment.time} fue confirmada.`);
}

function openRescheduleDialog(appointmentId) {
    const appointment = getAppointmentById(appointmentId);
    if (!appointment) return;

    rescheduleForm.reset();
    document.querySelector("#reschedule-appointment-id").value = appointment.appointmentId;
    rescheduleSummary.textContent = `Cita de ${appointment.patientName} — ${appointment.specialtyName} con ${appointment.doctorName}.`;
    resetSelect(rescheduleDate, "Selecciona una fecha");
    resetSelect(rescheduleTime, "Selecciona una hora");
    [...new Set(getAvailableScheduleSlots(appointment.doctorId).map(({slotDate}) => slotDate))]
        .sort()
        .forEach((date) => rescheduleDate.add(new Option(formatAppointmentDate(date), date)));
    rescheduleDate.dataset.doctorId = appointment.doctorId;
    showRescheduleError("date");
    showRescheduleError("time");
    rescheduleDialog.showModal();
}

function showRescheduleError(fieldName, error = "") {
    const errorElement = document.querySelector(`#reschedule-${fieldName}-error`);
    const input = rescheduleForm?.elements.namedItem(fieldName);

    setFieldError(input, errorElement, error);
}

function openCancelDialog(appointmentId) {
    const appointment = getAppointmentById(appointmentId);
    if (!appointment) return;

    cancelAppointmentId.value = appointment.appointmentId;
    cancelDialogDescription.textContent = `¿Confirmas que deseas cancelar la cita de ${appointment.patientName} del ${appointment.date} a las ${appointment.time}?`;
    cancelDialog.showModal();
}

searchInput?.addEventListener("input", renderAppointments);
statusFilter?.addEventListener("change", renderAppointments);
dateFilter?.addEventListener("change", renderAppointments);
rescheduleDate?.addEventListener("change", () => fillRescheduleTimes(rescheduleDate.dataset.doctorId));

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
    const scheduleSlotId = Number(rescheduleForm.elements.namedItem("time").value);

    showRescheduleError("date");
    showRescheduleError("time");

    let hasErrors = false;
    if (!date) {
        showRescheduleError("date", "Selecciona la nueva fecha.");
        hasErrors = true;
    }
    if (!scheduleSlotId) {
        showRescheduleError("time", "Selecciona la nueva hora.");
        hasErrors = true;
    }
    if (hasErrors) return;

    const currentAppointment = getAppointmentById(appointmentId);
    const newSlot = currentAppointment
        ? rescheduleScheduleSlot(currentAppointment.scheduleSlotId, scheduleSlotId, appointmentId)
        : null;
    if (!newSlot) {
        showRescheduleError("time", "El bloque seleccionado ya no está disponible.");
        return;
    }
    const time = newSlot.startTime.slice(0, 5);
    const appointment = updateAppointment(appointmentId, {
        date: newSlot.slotDate,
        time,
        scheduleSlotId: newSlot.scheduleSlotId,
        appointmentStatus: "PENDING"
    });
    rescheduleDialog.close();
    renderAppointments();
    if (appointment) {
        showFeedback(`La cita de ${appointment.patientName} fue reagendada para el ${date} a las ${time}.`);
    }
});

document.querySelector("#confirm-cancel-button")?.addEventListener("click", () => {
    const appointmentId = cancelAppointmentId.value;
    const currentAppointment = getAppointmentById(appointmentId);
    const appointment = updateAppointment(appointmentId, {appointmentStatus: "CANCELLED"});
    if (currentAppointment) releaseScheduleSlot(currentAppointment.scheduleSlotId);

    cancelDialog.close();
    renderAppointments();
    if (appointment) {
        showFeedback(`La cita de ${appointment.patientName} fue cancelada.`);
    }
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("estado") === "pendiente" || urlParams.get("accion") === "reagendar") {
    statusFilter.value = "PENDING";
}

feedback.hidden = true;
renderAppointments();
