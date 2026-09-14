import { getAppointments, getSession, initializeBaseAppointments } from "./storage.js";
import { getLocalDateString } from "./validaciones.js";

const dateInput = document.querySelector("#agenda-date");
const agendaList = document.querySelector("#agenda-list");
const emptyMessage = document.querySelector("#agenda-empty-message");
const resultCount = document.querySelector("#agenda-result-count");

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

function createStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.PENDIENTE;
    badge.textContent = STATUS_LABELS[status] ?? status;
    return badge;
}

function createAppointmentCard(appointment) {
    const item = document.createElement("li");
    item.className = "rounded-2xl border border-line bg-white p-5 shadow-sm";

    const topRow = document.createElement("div");
    topRow.className = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

    const timeBlock = document.createElement("div");
    const time = document.createElement("p");
    time.className = "text-2xl font-bold text-primary-dark";
    time.textContent = appointment.time;
    const specialty = document.createElement("p");
    specialty.className = "text-sm text-muted";
    specialty.textContent = appointment.specialtyName;
    timeBlock.append(time, specialty);

    topRow.append(timeBlock, createStatusBadge(appointment.status));

    const patientName = document.createElement("p");
    patientName.className = "mt-4 font-semibold";
    patientName.textContent = appointment.patientName;

    const reason = document.createElement("p");
    reason.className = "mt-1 text-sm text-muted";
    reason.textContent = `Motivo: ${appointment.reason}`;

    item.append(topRow, patientName, reason);

    if (appointment.status === "CONFIRMADA" && appointment.date <= getLocalDateString()) {
        const observationLink = document.createElement("a");
        observationLink.className = "mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark";
        observationLink.href = `observacion-clinica.html?id=${appointment.id}`;
        observationLink.textContent = "Registrar observación";
        item.append(observationLink);
    }

    return item;
}

function renderAgenda() {
    const session = getSession();
    const selectedDate = dateInput.value;
    const appointments = getAppointments()
        .filter((appointment) => appointment.date === selectedDate && appointment.doctorId === session?.userId)
        .sort((first, second) => first.time.localeCompare(second.time));

    agendaList.replaceChildren(...appointments.map(createAppointmentCard));
    resultCount.textContent = appointments.length
        ? `${appointments.length} ${appointments.length === 1 ? "cita programada" : "citas programadas"} para el ${selectedDate}`
        : "";
    emptyMessage.hidden = appointments.length > 0;
}

dateInput?.addEventListener("change", renderAgenda);

dateInput.value = getLocalDateString();
renderAgenda();
