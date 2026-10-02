import test from "node:test";
import assert from "node:assert/strict";
import {
    getAvailableScheduleSlots,
    getScheduleSlots,
    completeScheduleSlot,
    initializeBaseScheduleSlots,
    releaseScheduleSlot,
    reserveScheduleSlot,
    rescheduleScheduleSlot
} from "../assets/js/schedule-storage.js";

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
    initializeBaseScheduleSlots();
});

test("crea bloques disponibles con el contrato del backend", () => {
    const slot = getScheduleSlots().find(({scheduleSlotId}) => scheduleSlotId === 7);

    assert.deepEqual(
        Object.keys(slot).sort(),
        ["appointmentId", "doctorId", "endTime", "scheduleSlotId", "slotDate", "slotStatus", "startTime"].sort()
    );
    assert.equal(slot.slotStatus, "DISPONIBLE");
});

test("filtra los bloques disponibles por médico", () => {
    const slots = getAvailableScheduleSlots(1);

    assert.ok(slots.length > 0);
    assert.ok(slots.every(({doctorId, slotStatus}) => doctorId === 1 && slotStatus === "DISPONIBLE"));
});

test("reserva un bloque una sola vez y lo relaciona con la cita", () => {
    const reservedSlot = reserveScheduleSlot(7, 15);

    assert.equal(reservedSlot.slotStatus, "RESERVADO");
    assert.equal(reservedSlot.appointmentId, 15);
    assert.equal(reserveScheduleSlot(7, 16), null);
    assert.equal(getAvailableScheduleSlots(1).some(({scheduleSlotId}) => scheduleSlotId === 7), false);
});

test("inicializa los bloques ocupados por las citas base", () => {
    const reservedSlot = getScheduleSlots().find(({scheduleSlotId}) => scheduleSlotId === 1);
    const cancelledSlot = getScheduleSlots().find(({scheduleSlotId}) => scheduleSlotId === 6);

    assert.equal(reservedSlot.slotStatus, "RESERVADO");
    assert.equal(reservedSlot.appointmentId, 1);
    assert.equal(cancelledSlot.slotStatus, "LIBERADO_POR_CANCELACION");
});

test("libera el bloque asociado a una cita cancelada", () => {
    const releasedSlot = releaseScheduleSlot(1);

    assert.equal(releasedSlot.slotStatus, "LIBERADO_POR_CANCELACION");
    assert.equal(releasedSlot.appointmentId, null);
    assert.ok(getAvailableScheduleSlots(1).some(({scheduleSlotId}) => scheduleSlotId === 1));
});

test("reagenda una cita cambiando su bloque de forma atómica", () => {
    const newSlot = rescheduleScheduleSlot(1, 7, 1);
    const oldSlot = getScheduleSlots().find(({scheduleSlotId}) => scheduleSlotId === 1);

    assert.equal(newSlot.slotStatus, "RESERVADO");
    assert.equal(newSlot.appointmentId, 1);
    assert.equal(oldSlot.slotStatus, "LIBERADO_POR_CANCELACION");
});

test("marca como completado el bloque de una atención realizada", () => {
    assert.equal(completeScheduleSlot(3).slotStatus, "COMPLETADO");
});
