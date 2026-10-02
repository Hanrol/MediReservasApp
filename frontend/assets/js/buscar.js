import {
    getDoctors,
    getSpecialties,
    initializeBaseDoctors,
    initializeBaseSpecialties
} from "./storage.js";
import {formatAppointmentDate} from "./citas-utils.js";
import {getAvailableScheduleSlots, initializeBaseScheduleSlots} from "./schedule-storage.js";

const specialtySearch = document.querySelector("#buscarEspecialidad");
const specialtyList = document.querySelector("#listaEspecialidades");
const specialtyEmptyMessage = document.querySelector("#mensajeSinEspecialidades");
const doctorSearch = document.querySelector("#buscarMedico");
const specialtyFilter = document.querySelector("#filtroEspecialidad");
const doctorList = document.querySelector("#listaMedicos");
const doctorEmptyMessage = document.querySelector("#mensajeSinMedicos");
const doctorDetail = document.querySelector("#detalleMedico");

function getActiveSpecialties() {
    return getSpecialties().filter((specialty) => specialty.active);
}

function getDoctorSpecialties(doctor) {
    return getActiveSpecialties().filter((specialty) => doctor.specialtyIds.includes(specialty.specialtyId));
}

function createActiveBadge(itemType) {
    const badge = document.createElement("span");
    badge.className = "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-primary-dark";
    badge.textContent = "Activo";
    badge.setAttribute("aria-label", `Estado de ${itemType}: activo`);
    return badge;
}

function createSpecialtyCard(specialty) {
    const card = document.createElement("article");
    const heading = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const button = document.createElement("button");

    card.className = "flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg";
    heading.className = "flex items-start justify-between gap-3";
    title.className = "text-xl font-bold";
    title.textContent = specialty.specialtyName;
    heading.append(title, createActiveBadge("la especialidad"));
    description.className = "mt-3 flex-1 leading-7 text-muted";
    description.textContent = specialty.description;
    button.type = "button";
    button.dataset.specialtyId = specialty.specialtyId;
    button.className = "mt-5 self-start font-semibold text-primary-dark hover:text-primary";
    button.textContent = "Ver médicos";
    card.append(heading, description, button);

    return card;
}

function renderSpecialties() {
    const search = specialtySearch.value.trim().toLowerCase();
    const specialties = getActiveSpecialties().filter((specialty) =>
        specialty.specialtyName.toLowerCase().includes(search)
    );

    specialtyList.replaceChildren(...specialties.map(createSpecialtyCard));
    specialtyEmptyMessage.classList.toggle("hidden", specialties.length > 0);
}

function fillSpecialtyFilter() {
    specialtyFilter.replaceChildren(new Option("Todas las especialidades", ""));
    getActiveSpecialties().forEach((specialty) => {
        specialtyFilter.add(new Option(specialty.specialtyName, specialty.specialtyId));
    });
}

function createDoctorCard(doctor) {
    const specialties = getDoctorSpecialties(doctor);
    const card = document.createElement("article");
    const heading = document.createElement("div");
    const title = document.createElement("h3");
    const specialty = document.createElement("p");
    const license = document.createElement("p");
    const button = document.createElement("button");

    card.className = "medico flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm";
    heading.className = "flex items-start justify-between gap-3";
    title.className = "text-xl font-bold";
    title.textContent = `${doctor.firstName} ${doctor.lastName}`;
    heading.append(title, createActiveBadge("el médico"));
    specialty.className = "mt-3 text-primary-dark";
    specialty.textContent = `Especialidad: ${specialties.map((item) => item.specialtyName).join(", ")}`;
    license.className = "mt-1 text-sm text-muted";
    license.textContent = `Registro médico: ${doctor.medicalLicenseNumber}`;
    button.type = "button";
    button.className = "verDetalle mt-5 self-start rounded-xl border border-primary px-4 py-2 font-semibold text-primary-dark transition hover:bg-primary-light";
    button.dataset.doctorId = doctor.doctorId;
    button.textContent = "Ver detalle";
    card.append(heading, specialty, license, button);

    return card;
}

function renderDoctors() {
    const search = doctorSearch.value.trim().toLowerCase();
    const selectedSpecialtyId = Number(specialtyFilter.value);
    const doctors = getDoctors()
        .filter((doctor) => doctor.active)
        .filter((doctor) => `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(search))
        .filter(
            (doctor) =>
                !selectedSpecialtyId ||
                doctor.specialtyIds.includes(selectedSpecialtyId)
        );

    doctorList.replaceChildren(...doctors.map(createDoctorCard));
    doctorEmptyMessage.classList.toggle("hidden", doctors.length > 0);
}

function showDoctorDetail(doctorId) {
    const doctor = getDoctors().find((item) => item.doctorId === doctorId && item.active);
    if (!doctor) return;

    const specialties = getDoctorSpecialties(doctor);
    document.querySelector("#detalleNombre").textContent = `${doctor.firstName} ${doctor.lastName}`;
    document.querySelector("#detalleEspecialidad").textContent = specialties.map((item) => item.specialtyName).join(", ");
    document.querySelector("#detalleRegistro").textContent = doctor.medicalLicenseNumber;
    document.querySelector("#detalleDescripcion").textContent = specialties.map((item) => item.description).join(" ");
    const availableSlots = getAvailableScheduleSlots(doctorId)
        .sort((first, second) => `${first.slotDate}${first.startTime}`.localeCompare(`${second.slotDate}${second.startTime}`))
        .slice(0, 3);
    const scheduleList = document.querySelector("#detalleHorarios");
    scheduleList.replaceChildren();

    if (availableSlots.length) {
        const list = document.createElement("ul");
        list.className = "flex flex-wrap gap-2";
        availableSlots.forEach((slot) => {
            const item = document.createElement("li");
            item.className = "rounded-lg bg-primary-light px-3 py-2 text-sm font-semibold text-primary-dark";
            item.textContent = `${formatAppointmentDate(slot.slotDate)} · ${slot.startTime.slice(0, 5)} hrs`;
            list.append(item);
        });
        scheduleList.append(list);
    } else {
        scheduleList.textContent = "No hay horarios disponibles por el momento.";
        scheduleList.className = "mt-2 text-sm text-muted";
    }

    document.querySelector("#solicitarCitaMedico").href = `solicitar-cita.html?medico=${doctorId}`;
    doctorDetail.showModal();
}

specialtySearch?.addEventListener("input", renderSpecialties);
doctorSearch?.addEventListener("input", renderDoctors);
specialtyFilter?.addEventListener("change", renderDoctors);

specialtyList?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-specialty-id]");
    if (!button) return;

    specialtyFilter.value = button.dataset.specialtyId;
    renderDoctors();
    document.querySelector("#medicos").scrollIntoView({behavior: "smooth"});
});

doctorList?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-doctor-id]");
    if (button) showDoctorDetail(Number(button.dataset.doctorId));
});

document.querySelector("#cerrarDetalle")?.addEventListener("click", () => {
    doctorDetail.close();
});

doctorDetail?.addEventListener("click", (event) => {
    if (event.target === doctorDetail) doctorDetail.close();
});

initializeBaseSpecialties();
initializeBaseDoctors();
initializeBaseScheduleSlots();
fillSpecialtyFilter();
renderSpecialties();
renderDoctors();
