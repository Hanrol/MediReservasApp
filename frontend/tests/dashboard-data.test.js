import test from "node:test";
import assert from "node:assert/strict";
import {getDashboardSummary} from "../assets/js/dashboard-data.js";

const appointments = [
    {appointmentId: 1, patientUserId: 4, doctorId: 1, date: "2026-09-05", appointmentStatus: "PENDING"},
    {appointmentId: 2, patientUserId: 4, doctorId: 1, date: "2026-09-05", appointmentStatus: "CONFIRMED"},
    {appointmentId: 3, patientUserId: 4, doctorId: 1, date: "2026-09-04", appointmentStatus: "COMPLETED"}
];

test("calcula el resumen del paciente desde sus citas", () => {
    const summary = getDashboardSummary({
        session: {role: "PATIENT", userId: 4},
        appointments,
        today: "2026-09-05"
    });

    assert.deepEqual(summary.map((item) => item.value), ["2", "1", "1"]);
});

test("calcula el resumen del médico desde su agenda", () => {
    const summary = getDashboardSummary({
        session: {role: "DOCTOR", userId: 3},
        doctors: [{doctorId: 1, userId: 3}],
        appointments,
        today: "2026-09-05"
    });

    assert.deepEqual(summary.map((item) => item.value), ["2", "1", "1"]);
});

test("calcula el resumen administrativo desde usuarios y especialidades", () => {
    const summary = getDashboardSummary({
        session: {role: "ADMIN", userId: 1},
        users: [{role: "ADMIN", active: true}, {role: "PATIENT", active: false}],
        specialties: [{active: true}, {active: false}],
        today: "2026-09-05"
    });

    assert.deepEqual(summary.map((item) => item.value), ["2", "1", "1"]);
});
