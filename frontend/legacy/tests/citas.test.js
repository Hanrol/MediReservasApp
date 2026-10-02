import test from "node:test";
import assert from "node:assert/strict";
import {
    getAppointmentById,
    getAppointments,
    getNextAppointmentId,
    initializeBaseAppointments,
    saveAppointment,
    updateAppointment
} from "../assets/js/storage.js";

class LocalStorageMock {
    #data = new Map();

    getItem(key) {
        return this.#data.has(key) ? this.#data.get(key) : null;
    }

    setItem(key, value) {
        this.#data.set(key, String(value));
    }

    removeItem(key) {
        this.#data.delete(key);
    }

    clear() {
        this.#data.clear();
    }
}

globalThis.localStorage = new LocalStorageMock();

test.beforeEach(() => {
    localStorage.clear();
    initializeBaseAppointments();
});

test("guarda una cita sin reemplazar las solicitudes existentes", () => {
    const appointment = {
        appointmentId: getNextAppointmentId(),
        patientUserId: 4,
        patientName: "Paula Contreras",
        patientRun: "44444444-4",
        doctorId: 1,
        doctorName: "Ana Rojas",
        specialtyId: 1,
        scheduleSlotId: 7,
        specialtyName: "Cardiología",
        date: "2026-09-20",
        time: "10:00",
        reason: "Control médico",
        modality: "Presencial",
        appointmentStatus: "PENDING"
    };

    saveAppointment(appointment);

    assert.equal(getAppointments().length, 8);
    assert.deepEqual(getAppointmentById(8), appointment);
});

test("genera un identificador correlativo para la siguiente cita", () => {
    assert.equal(getNextAppointmentId(), 8);
});

test("incorpora citas base nuevas sin borrar las almacenadas", () => {
    localStorage.setItem("medireservas_appointments", JSON.stringify([
        {...getAppointmentById(1), appointmentStatus: "CANCELLED"}
    ]));

    initializeBaseAppointments();

    assert.equal(getAppointmentById(1).appointmentStatus, "CANCELLED");
    assert.equal(getAppointmentById(7).date, "2026-09-06");
});

test("adapta estados antiguos guardados al contrato del backend", () => {
    localStorage.setItem("medireservas_appointments", JSON.stringify([
        {id: "cita-1", doctorId: "doctor-1", specialtyId: 1, status: "CONFIRMADA"},
        {id: "cita-2", doctorId: "doctor-1", specialtyId: 2, status: "REAGENDADA"}
    ]));

    assert.deepEqual(
        getAppointments().map(({doctorId, appointmentStatus}) => ({doctorId, appointmentStatus})),
        [
            {doctorId: 1, appointmentStatus: "CONFIRMED"},
            {doctorId: 1, appointmentStatus: "PENDING"}
        ]
    );
});

test("conserva el número de un médico con identificador antiguo", () => {
    localStorage.setItem("medireservas_appointments", JSON.stringify([
        {id: "cita-2", doctorId: "doctor-2", specialtyId: 2, status: "PENDIENTE"}
    ]));

    assert.equal(getAppointments()[0].doctorId, 2);
});

test("evita asignar una cita simulada a otra cuenta con el mismo identificador", () => {
    localStorage.setItem("medireservas_users", JSON.stringify([
        {userId: 7, run: "99999999-9", email: "nuevo@ejemplo.cl", role: "PATIENT"}
    ]));
    localStorage.setItem("medireservas_appointments", JSON.stringify([
        {appointmentId: 2, patientUserId: 7, patientRun: "15678234-0", doctorId: 2, specialtyId: 2, appointmentStatus: "PENDING"}
    ]));

    assert.equal(getAppointments()[0].patientUserId, 0);
});

test("guarda la cancelación de una cita", () => {
    const cancelled = updateAppointment(1, {appointmentStatus: "CANCELLED"});

    assert.equal(cancelled.appointmentStatus, "CANCELLED");
    assert.equal(getAppointmentById(1).appointmentStatus, "CANCELLED");
});

test("marca una cita como completada sin mezclar datos clínicos", () => {
    updateAppointment(3, {
        appointmentStatus: "COMPLETED"
    });

    const completed = getAppointmentById(3);
    assert.equal(completed.appointmentStatus, "COMPLETED");
    assert.equal("diagnosis" in completed, false);
    assert.equal("clinicalNotes" in completed, false);
});
