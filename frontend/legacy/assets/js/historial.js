import {getAppointments, getDoctorForUser, getSession, getUserById, initializeBaseAppointments, initializeBaseDoctors} from "./storage.js";
import {formatAppointmentDate} from "./citas-utils.js";
import {appendLabeledText} from "./ui-utils.js";
import {getDiagnoses, getMedicalRecords, getMedicalVisits} from "./clinical-storage.js";

const consultationList = document.querySelector("#listaConsultas");
const emptyMessage = document.querySelector("#mensajeSinConsultas");

function createConsultationCard({appointment, diagnosis, visit}, showPatient) {
    const card = document.createElement("article");
    card.className = "rounded-xl border border-line p-4";

    const title = document.createElement("h3");
    title.className = "font-semibold";
    title.textContent = `Consulta de ${appointment.specialtyName}`;
    card.append(title);

    if (showPatient) {
        appendLabeledText(card, "Paciente", `${appointment.patientName} (${appointment.patientRun})`, "mt-2");
    }
    appendLabeledText(card, "Fecha", formatAppointmentDate(appointment.date), "mt-2");
    appendLabeledText(card, "Médico", appointment.doctorName);
    appendLabeledText(card, "Motivo", appointment.reason);
    appendLabeledText(card, "Diagnóstico", diagnosis.diagnosisDescription);
    appendLabeledText(card, "Observación clínica", visit.observations || "Sin información");
    appendLabeledText(card, "Tratamiento", visit.treatment);

    return card;
}

function renderHistory() {
    const session = getSession();
    const currentUser = getUserById(session?.userId);

    if (!currentUser) {
        emptyMessage.classList.remove("hidden");
        return;
    }

    const isDoctor = session.role === "DOCTOR";
    const doctor = isDoctor ? getDoctorForUser(currentUser) : null;
    document.querySelector("#patient-data-section").hidden = isDoctor;

    if (!isDoctor) {
        document.querySelector("#patient-name").textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.querySelector("#patient-run").textContent = currentUser.run;
    }

    const appointments = getAppointments();
    const diagnoses = getDiagnoses();
    const patientRecordIds = new Set(
        getMedicalRecords()
            .filter((record) => record.patientId === currentUser.userId)
            .map((record) => record.medicalRecordId)
    );
    const consultations = getMedicalVisits()
        .filter((visit) => isDoctor ? visit.doctorId === doctor?.doctorId : patientRecordIds.has(visit.medicalRecordId))
        .map((visit) => ({
            visit,
            appointment: appointments.find((item) => item.appointmentId === visit.appointmentId),
            diagnosis: diagnoses.find((item) => item.medicalVisitId === visit.medicalVisitId)
        }))
        .filter(({appointment, diagnosis}) => appointment && diagnosis)
        .sort((first, second) => second.visit.visitDate.localeCompare(first.visit.visitDate));

    consultationList.replaceChildren(...consultations.map((appointment) => createConsultationCard(appointment, isDoctor)));
    emptyMessage.classList.toggle("hidden", consultations.length > 0);
}

initializeBaseAppointments();
initializeBaseDoctors();
renderHistory();
