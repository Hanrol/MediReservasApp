import {
    getAppointments,
    getSession,
    getUserById,
    initializeBaseAppointments,
    updateAppointment
} from "./storage.js";
import {canCancelAppointment, formatAppointmentDate, getAppointmentStatusLabel} from "./citas-utils.js";
import {appendLabeledText} from "./ui-utils.js";
import {initializeBaseScheduleSlots, releaseScheduleSlot} from "./schedule-storage.js";

const searchInput = document.querySelector("#buscarCita");
const statusFilter = document.querySelector("#estadoCita");
const appointmentList = document.querySelector("#listaCitas");
const emptyMessage = document.querySelector("#mensajeSinCitas");

function createAppointmentCard(appointment) {
    const card = document.createElement("article");
    card.className = "cita rounded-xl border border-line p-5";

    const title = document.createElement("h3");
    title.className = "text-lg font-semibold";
    title.textContent = appointment.specialtyName;
    card.append(title);

    appendLabeledText(card, "Médico", appointment.doctorName, "mt-2");
    appendLabeledText(card, "Fecha", formatAppointmentDate(appointment.date));
    appendLabeledText(card, "Hora", appointment.time);
    if (appointment.modality) appendLabeledText(card, "Modalidad", appointment.modality);

    const status = document.createElement("p");
    status.className = "mt-2";
    const statusLabel = document.createElement("strong");
    statusLabel.textContent = "Estado: ";
    const statusValue = document.createElement("span");
    statusValue.className = "estado font-semibold";
    statusValue.textContent = getAppointmentStatusLabel(appointment.appointmentStatus);
    status.append(statusLabel, statusValue);
    card.append(status);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.dataset.appointmentId = appointment.appointmentId;
    cancelButton.disabled = !canCancelAppointment(appointment.appointmentStatus);
    cancelButton.textContent = appointment.appointmentStatus === "CANCELLED" ? "Cancelada" : "Cancelar cita";
    cancelButton.className = cancelButton.disabled
        ? "mt-4 rounded-xl bg-slate-300 px-4 py-2 font-semibold text-slate-600"
        : "cancelarCita mt-4 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700";
    card.append(cancelButton);

    return card;
}

function getPatientAppointments() {
    const session = getSession();
    const patient = getUserById(session?.userId);

    if (!patient) return [];

    return getAppointments().filter(
        (appointment) => appointment.patientUserId === patient.userId || appointment.patientRun === patient.run
    );
}

function renderAppointments() {
    const search = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const appointments = getPatientAppointments()
        .filter((appointment) => appointment.doctorName.toLowerCase().includes(search))
        .filter((appointment) => !selectedStatus || appointment.appointmentStatus === selectedStatus)
        .sort((first, second) => `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`));

    appointmentList.replaceChildren(...appointments.map(createAppointmentCard));
    emptyMessage.classList.toggle("hidden", appointments.length > 0);
}

searchInput?.addEventListener("input", renderAppointments);
statusFilter?.addEventListener("change", renderAppointments);

appointmentList?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-appointment-id]");
    if (!button || button.disabled) return;

    if (!window.confirm("¿Desea cancelar esta cita médica?")) return;

    const appointment = getAppointments().find(
        (item) => item.appointmentId === Number(button.dataset.appointmentId)
    );
    updateAppointment(button.dataset.appointmentId, {appointmentStatus: "CANCELLED"});
    if (appointment) releaseScheduleSlot(appointment.scheduleSlotId);
    renderAppointments();
});

initializeBaseAppointments();
initializeBaseScheduleSlots();
renderAppointments();
