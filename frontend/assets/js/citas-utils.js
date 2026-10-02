const STATUS_LABELS = Object.freeze({
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
    NO_SHOW: "Inasistencia"
});

const STATUS_BADGE_CLASSES = Object.freeze({
    PENDING: "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700",
    CONFIRMED: "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-primary-dark",
    CANCELLED: "inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700",
    COMPLETED: "inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700",
    NO_SHOW: "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
});

export function getAppointmentStatusLabel(status) {
    return STATUS_LABELS[status] ?? status;
}

export function getAppointmentStatusBadgeClass(status) {
    return STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.PENDING;
}

export function canCancelAppointment(status) {
    return ["PENDING", "CONFIRMED"].includes(status);
}

export function matchesAppointmentFilters(appointment, {query = "", status = "all", date = ""} = {}) {
    const normalizedQuery = query.trim().toLowerCase();
    const searchableText = `${appointment.patientName} ${appointment.patientRun} ${appointment.doctorName}`.toLowerCase();

    return searchableText.includes(normalizedQuery)
        && (status === "all" || appointment.appointmentStatus === status)
        && (!date || appointment.date === date);
}

export function getFirstPendingObservationDate(appointments, doctorId, today) {
    return appointments
        .filter(
            (appointment) =>
                appointment.doctorId === Number(doctorId) &&
                appointment.appointmentStatus === "CONFIRMED" &&
                appointment.date <= today
        )
        .sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`))[0]?.date ?? today;
}

export function formatAppointmentDate(date) {
    return new Intl.DateTimeFormat("es-CL", {timeZone: "UTC"}).format(new Date(`${date}T00:00:00Z`));
}
