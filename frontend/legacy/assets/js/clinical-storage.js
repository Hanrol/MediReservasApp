const MEDICAL_RECORDS_KEY = "medireservas_medical_records";
const MEDICAL_VISITS_KEY = "medireservas_medical_visits";
const DIAGNOSES_KEY = "medireservas_diagnoses";

function readCollection(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? [];
    } catch {
        return [];
    }
}

function saveCollection(key, collection) {
    localStorage.setItem(key, JSON.stringify(collection));
}

function getNextId(collection, field) {
    return collection.reduce((highestId, item) => Math.max(highestId, Number(item[field]) || 0), 0) + 1;
}

export function getMedicalRecords() {
    return readCollection(MEDICAL_RECORDS_KEY);
}

export function getOrCreateMedicalRecord(patientId) {
    const records = getMedicalRecords();
    const existingRecord = records.find((record) => record.patientId === Number(patientId));
    if (existingRecord) return existingRecord;

    const record = {
        medicalRecordId: getNextId(records, "medicalRecordId"),
        patientId: Number(patientId)
    };
    records.push(record);
    saveCollection(MEDICAL_RECORDS_KEY, records);
    return record;
}

export function getMedicalVisits() {
    return readCollection(MEDICAL_VISITS_KEY);
}

export function saveMedicalVisit(visit) {
    const visits = getMedicalVisits();
    const storedVisit = {...visit, medicalVisitId: getNextId(visits, "medicalVisitId")};
    visits.push(storedVisit);
    saveCollection(MEDICAL_VISITS_KEY, visits);
    return storedVisit;
}

export function getDiagnoses() {
    return readCollection(DIAGNOSES_KEY);
}

export function saveDiagnosis(diagnosis) {
    const diagnoses = getDiagnoses();
    const storedDiagnosis = {...diagnosis, diagnosisId: getNextId(diagnoses, "diagnosisId")};
    diagnoses.push(storedDiagnosis);
    saveCollection(DIAGNOSES_KEY, diagnoses);
    return storedDiagnosis;
}
