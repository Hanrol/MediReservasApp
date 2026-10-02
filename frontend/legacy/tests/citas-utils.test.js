import test from "node:test";
import assert from "node:assert/strict";
import {
    canCancelAppointment,
    formatAppointmentDate,
    getFirstPendingObservationDate,
    getAppointmentStatusBadgeClass,
    getAppointmentStatusLabel,
    matchesAppointmentFilters
} from "../assets/js/citas-utils.js";

test("presenta todos los estados de cita conocidos", () => {
    assert.equal(getAppointmentStatusLabel("PENDING"), "Pendiente");
    assert.equal(getAppointmentStatusLabel("COMPLETED"), "Completada");
    assert.equal(getAppointmentStatusLabel("NO_SHOW"), "Inasistencia");
    assert.match(getAppointmentStatusBadgeClass("CANCELLED"), /red/);
});

test("formatea las fechas de citas para Chile sin cambiar el día", () => {
    assert.equal(formatAppointmentDate("2026-09-07"), "07-09-2026");
});

test("solo permite cancelar citas que todavía admiten cambios", () => {
    assert.equal(canCancelAppointment("PENDING"), true);
    assert.equal(canCancelAppointment("CONFIRMED"), true);
    assert.equal(canCancelAppointment("CANCELLED"), false);
    assert.equal(canCancelAppointment("COMPLETED"), false);
    assert.equal(canCancelAppointment("NO_SHOW"), false);
});

test("filtra citas por texto, estado y fecha", () => {
    const appointment = {
        patientName: "Camila Soto",
        patientRun: "19.234.567-8",
        doctorName: "Daniela Rojas",
        appointmentStatus: "PENDING",
        date: "2026-09-08"
    };

    assert.equal(matchesAppointmentFilters(appointment, {query: "camila", status: "PENDING", date: "2026-09-08"}), true);
    assert.equal(matchesAppointmentFilters(appointment, {date: "2026-09-09"}), false);
    assert.equal(matchesAppointmentFilters(appointment, {status: "CONFIRMED"}), false);
});

test("encuentra la fecha pendiente más antigua para registrar una observación", () => {
    const appointments = [
        {doctorId: 1, appointmentStatus: "CONFIRMED", date: "2026-09-05", time: "11:00"},
        {doctorId: 1, appointmentStatus: "CONFIRMED", date: "2026-09-04", time: "09:00"},
        {doctorId: 2, appointmentStatus: "CONFIRMED", date: "2026-09-03", time: "10:00"},
        {doctorId: 1, appointmentStatus: "COMPLETED", date: "2026-09-02", time: "08:00"}
    ];

    assert.equal(getFirstPendingObservationDate(appointments, 1, "2026-09-05"), "2026-09-04");
    assert.equal(getFirstPendingObservationDate(appointments, 3, "2026-09-05"), "2026-09-05");
});
