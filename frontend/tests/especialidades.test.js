import test from "node:test";
import assert from "node:assert/strict";
import {
    getNextSpecialtyId,
    getSpecialties,
    getSpecialtyById,
    initializeBaseSpecialties,
    saveSpecialty
} from "../assets/js/storage.js";

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
    initializeBaseSpecialties();
});

test("usa specialtyId como identificador de especialidades", () => {
    const specialty = getSpecialtyById(1);

    assert.equal(specialty.specialtyId, 1);
    assert.equal("id" in specialty, false);
});

test("convierte el identificador antiguo y genera el siguiente correlativo", () => {
    localStorage.setItem("medireservas_specialties", JSON.stringify([
        {id: 8, specialtyName: "Especialidad anterior", active: true}
    ]));

    assert.equal(getSpecialties()[0].specialtyId, 8);
    assert.equal(getNextSpecialtyId(), 9);
});

test("guarda nuevas especialidades con el contrato del backend", () => {
    saveSpecialty({
        specialtyId: 7,
        specialtyName: "Oftalmología",
        description: "Atención de salud visual.",
        active: true
    });

    assert.equal(getSpecialtyById(7).specialtyName, "Oftalmología");
});
