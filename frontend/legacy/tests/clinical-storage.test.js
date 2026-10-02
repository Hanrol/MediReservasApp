import test from "node:test";
import assert from "node:assert/strict";
import {
    getDiagnoses,
    getMedicalRecords,
    getMedicalVisits,
    getOrCreateMedicalRecord,
    saveDiagnosis,
    saveMedicalVisit
} from "../assets/js/clinical-storage.js";

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

test.beforeEach(() => localStorage.clear());

test("crea una sola ficha médica por paciente", () => {
    const firstRecord = getOrCreateMedicalRecord(4);
    const sameRecord = getOrCreateMedicalRecord(4);

    assert.deepEqual(firstRecord, {medicalRecordId: 1, patientId: 4});
    assert.deepEqual(sameRecord, firstRecord);
    assert.equal(getMedicalRecords().length, 1);
});

test("relaciona una visita y un diagnóstico con identificadores correlativos", () => {
    const visit = saveMedicalVisit({
        medicalRecordId: 1,
        appointmentId: 3,
        doctorId: 1,
        visitDate: "2026-09-05T15:00:00.000Z",
        visitReason: "Dolor lumbar",
        observations: "Se indica reposo.",
        treatment: "Analgésicos por cinco días."
    });
    const diagnosis = saveDiagnosis({
        medicalVisitId: visit.medicalVisitId,
        diagnosisDescription: "Lumbalgia",
        diagnosisNotes: ""
    });

    assert.equal(getMedicalVisits()[0].medicalVisitId, 1);
    assert.equal(getDiagnoses()[0].diagnosisId, 1);
    assert.equal(diagnosis.medicalVisitId, visit.medicalVisitId);
});
