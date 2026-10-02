import test from "node:test";
import assert from "node:assert/strict";
import {getAppointments, getDoctorForUser, getDoctors, initializeBaseAppointments, initializeBaseDoctors} from "../assets/js/storage.js";

class LocalStorageMock {
    #data = new Map();

    getItem(key) {
        return this.#data.has(key) ? this.#data.get(key) : null;
    }

    setItem(key, value) {
        this.#data.set(key, String(value));
    }

    clear() {
        this.#data.clear();
    }
}

globalThis.localStorage = new LocalStorageMock();

test.beforeEach(() => {
    localStorage.clear();
    initializeBaseDoctors();
    initializeBaseAppointments();
});

test("cada médico se relaciona con una cuenta diferente", () => {
    const doctors = getDoctors();

    assert.equal(new Set(doctors.map(({userId}) => userId)).size, doctors.length);
    assert.ok(doctors.every(({userId}) => Number.isInteger(userId)));
});

test("usa specialtyIds según el contrato del backend", () => {
    const doctor = getDoctors()[0];

    assert.deepEqual(doctor.specialtyIds, [1, 5]);
    assert.equal("specialtyId" in doctor, false);
    assert.equal("extraSpecialtyIds" in doctor, false);
});

test("convierte la estructura antigua de especialidades médicas", () => {
    localStorage.setItem("medireservas_doctors", JSON.stringify([
        {doctorId: "doctor-2", userId: "doctor-1", specialtyId: 2, extraSpecialtyIds: [4]}
    ]));

    assert.deepEqual(getDoctors()[0].specialtyIds, [2, 4]);
    assert.equal(getDoctors()[0].doctorId, 2);
    assert.equal(getDoctors()[0].userId, 5);
});

test("encuentra la ficha médica desde los datos de la cuenta", () => {
    assert.equal(getDoctorForUser({userId: 3})?.doctorId, 1);
    assert.equal(getDoctorForUser({email: "medico@medireservas.cl"})?.doctorId, 1);
    assert.equal(getDoctorForUser({run: "33333333-3"})?.doctorId, 1);
});

test("las citas usan médicos y especialidades coherentes", () => {
    const doctors = getDoctors();

    getAppointments().forEach((appointment) => {
        const doctor = doctors.find(({doctorId}) => doctorId === appointment.doctorId);

        assert.ok(doctor, `No existe el médico de la cita ${appointment.appointmentId}`);
        assert.ok(doctor.specialtyIds.includes(appointment.specialtyId));
        if (appointment.appointmentStatus === "CONFIRMED") assert.equal(doctor.active, true);
    });
});
