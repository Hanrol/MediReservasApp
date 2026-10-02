import {
    getDoctors,
    getDoctorById,
    getUsers,
    getSpecialties,
    getSpecialtyById,
    initializeBaseDoctors,
    initializeBaseSpecialties,
    initializeBaseUsers,
    isDoctorDataTaken,
    saveDoctor,
    updateDoctor,
    getNextDoctorId
} from "./storage.js";
import {
    getLocalDateString,
    isValidEmail,
    isValidName,
    isValidRun,
    normalizeRun
} from "./validaciones.js";
import {createActiveStatusButton, createActiveStatusCell, createTableCell, setFieldError} from "./ui-utils.js";

const dialog = document.querySelector("#doctor-dialog");
const form = document.querySelector("#doctor-form");
const tableBody = document.querySelector("#doctors-table-body");
const emptyMessage = document.querySelector("#doctors-empty-message");
const resultCount = document.querySelector("#doctors-result-count");
const searchInput = document.querySelector("#doctor-search");
const statusFilter = document.querySelector("#doctor-status-filter");
const formMessage = document.querySelector("#doctor-form-message");
const statusDialog = document.querySelector("#doctor-status-dialog");
const statusDoctorId = document.querySelector("#doctor-status-id");
const statusDialogTitle = document.querySelector("#doctor-status-dialog-title");
const statusDialogDescription = document.querySelector("#doctor-status-dialog-description");
const confirmStatusButton = document.querySelector("#confirm-doctor-status-button");
const fieldNames = ["userId", "firstName", "lastName", "run", "email", "phone", "medicalLicenseNumber", "specialtyId", "admissionDate"];

initializeBaseUsers();
initializeBaseSpecialties();
initializeBaseDoctors();

function getInput(fieldName) {
    return form?.elements.namedItem(fieldName);
}

function getFormValues() {
    const formData = new FormData(form);

    return {
        doctorId: Number(formData.get("doctorId") ?? 0),
        userId: Number(formData.get("userId") ?? 0),
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        run: normalizeRun(String(formData.get("run") ?? "").trim()),
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        phone: String(formData.get("phone") ?? "").trim(),
        medicalLicenseNumber: String(formData.get("medicalLicenseNumber") ?? "").trim().toUpperCase(),
        specialtyIds: [
            Number(formData.get("specialtyId") ?? 0),
            ...formData.getAll("extraSpecialtyIds").map(Number)
        ].filter((specialtyId, index, values) => specialtyId && values.indexOf(specialtyId) === index),
        admissionDate: String(formData.get("admissionDate") ?? ""),
        active: getInput("active").checked
    };
}

function showFieldError(fieldName, error = "") {
    const input = getInput(fieldName);
    const errorElementId = {
        userId: "doctor-user-error",
        firstName: "doctor-first-name-error",
        lastName: "doctor-last-name-error",
        run: "doctor-run-error",
        email: "doctor-email-error",
        phone: "doctor-phone-error",
        medicalLicenseNumber: "doctor-license-error",
        specialtyId: "doctor-specialty-error",
        admissionDate: "doctor-admission-error"
    }[fieldName];
    const errorElement = document.querySelector(`#${errorElementId}`);

    setFieldError(input, errorElement, error);
}

function validateDoctor(values) {
    const errors = {};

    if (!values.userId) errors.userId = "Selecciona el usuario asociado.";

    if (!values.firstName) errors.firstName = "El nombre es obligatorio.";
    else if (!isValidName(values.firstName)) errors.firstName = "El nombre contiene caracteres no permitidos.";

    if (!values.lastName) errors.lastName = "El apellido es obligatorio.";
    else if (!isValidName(values.lastName)) errors.lastName = "El apellido contiene caracteres no permitidos.";

    if (!values.run) errors.run = "El RUN es obligatorio.";
    else if (!isValidRun(values.run)) errors.run = "Ingresa un RUN chileno válido.";

    if (!values.email) errors.email = "El correo electrónico es obligatorio.";
    else if (!isValidEmail(values.email)) errors.email = "Ingresa un correo electrónico válido.";

    if (values.phone) {
        const phoneDigits = values.phone.replace(/\D/g, "");
        if (phoneDigits.length < 9 || phoneDigits.length > 12) {
            errors.phone = "Ingresa un teléfono válido de 9 a 12 dígitos.";
        }
    }

    if (!values.medicalLicenseNumber) errors.medicalLicenseNumber = "El N° de registro médico es obligatorio.";
    else if (!/^[A-Za-z0-9-]{5,20}$/.test(values.medicalLicenseNumber)) {
        errors.medicalLicenseNumber = "Usa entre 5 y 20 letras, números o guiones.";
    }

    if (!values.specialtyIds.length) errors.specialtyId = "Selecciona la especialidad principal.";

    if (values.admissionDate && values.admissionDate > getLocalDateString()) {
        errors.admissionDate = "La fecha de ingreso no puede ser futura.";
    }

    return errors;
}

function getSpecialtyNames(doctor) {
    const names = doctor.specialtyIds
        .map((specialtyId) => getSpecialtyById(specialtyId)?.specialtyName)
        .filter(Boolean);

    return names.join(", ") || "Sin información";
}

function getFilteredDoctors() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    return getDoctors().filter((doctor) => {
        const searchableText = `${doctor.firstName ?? ""} ${doctor.lastName ?? ""} ${doctor.run ?? ""} ${doctor.email ?? ""}`.toLowerCase();
        const matchesQuery = searchableText.includes(query);
        const matchesStatus = status === "all" || (status === "active" ? doctor.active : !doctor.active);
        return matchesQuery && matchesStatus;
    });
}

function renderDoctors() {
    const doctors = getFilteredDoctors();
    const rows = doctors.map((doctor) => {
        const row = document.createElement("tr");
        row.className = "border-b border-line last:border-0";
        const fullName = `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim() || "Sin nombre";

        row.append(
            createTableCell(fullName, "px-5 py-4 font-semibold"),
            createTableCell(doctor.run ?? "Sin información"),
            createTableCell(doctor.email),
            createTableCell(doctor.medicalLicenseNumber),
            createTableCell(getSpecialtyNames(doctor)),
            createTableCell(doctor.admissionDate || "Sin información"),
            createActiveStatusCell(doctor.active)
        );

        const actionsCell = document.createElement("td");
        actionsCell.className = "px-5 py-4 text-right";
        const actions = document.createElement("div");
        actions.className = "flex flex-wrap justify-end gap-2";
        const editButton = document.createElement("button");
        editButton.className = "rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light";
        editButton.type = "button";
        editButton.dataset.editDoctor = doctor.doctorId;
        editButton.textContent = "Editar";
        const statusButton = createActiveStatusButton(doctor.active, doctor.doctorId);
        actions.append(editButton, statusButton);
        actionsCell.append(actions);
        row.append(actionsCell);
        return row;
    });

    tableBody.replaceChildren(...rows);
    resultCount.textContent = `${doctors.length} ${doctors.length === 1 ? "médico encontrado" : "médicos encontrados"}`;
    emptyMessage.hidden = doctors.length > 0;
}

function fillSelect(select, options, placeholder) {
    if (!select) return;
    const currentValue = select.value;
    const optionElements = options.map((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        return element;
    });

    select.replaceChildren(...optionElements);
    if (currentValue && options.some((option) => String(option.value) === currentValue)) {
        select.value = currentValue;
    } else if (placeholder) {
        select.prepend(new Option(placeholder, ""));
    }
}

function fillDoctorSelects() {
    const doctorUsers = getUsers().filter((user) => user.role === "DOCTOR" && user.active);
    fillSelect(
        getInput("userId"),
        doctorUsers.map((user) => ({value: user.userId, label: `${user.firstName} ${user.lastName} — ${user.email}`})),
        "Selecciona un usuario con rol médico"
    );

    const activeSpecialties = getSpecialties().filter((specialty) => specialty.active);
    fillSelect(
        getInput("specialtyId"),
        activeSpecialties.map((specialty) => ({value: specialty.specialtyId, label: specialty.specialtyName})),
        "Selecciona una especialidad"
    );
    fillSelect(
        getInput("extraSpecialtyIds"),
        activeSpecialties.map((specialty) => ({value: specialty.specialtyId, label: specialty.specialtyName}))
    );
}

function openCreateDialog() {
    fillDoctorSelects();
    form.reset();
    form.dataset.mode = "create";
    getInput("doctorId").value = "";
    getInput("active").checked = true;
    getInput("admissionDate").max = getLocalDateString();
    document.querySelector("#doctor-dialog-title").textContent = "Crear médico";
    fieldNames.forEach((fieldName) => showFieldError(fieldName));
    formMessage.textContent = "";
    dialog.showModal();
}

function openEditDialog(doctorId) {
    const doctor = getDoctorById(doctorId);
    if (!doctor) return;

    fillDoctorSelects();
    form.reset();
    form.dataset.mode = "edit";
    getInput("doctorId").value = doctor.doctorId;
    getInput("userId").value = doctor.userId ?? "";
    getInput("firstName").value = doctor.firstName ?? "";
    getInput("lastName").value = doctor.lastName ?? "";
    getInput("run").value = doctor.run ?? "";
    getInput("email").value = doctor.email ?? "";
    getInput("phone").value = doctor.phone ?? "";
    getInput("medicalLicenseNumber").value = doctor.medicalLicenseNumber ?? "";
    getInput("specialtyId").value = doctor.specialtyIds[0] ?? "";
    getInput("admissionDate").value = doctor.admissionDate ?? "";
    getInput("admissionDate").max = getLocalDateString();
    getInput("active").checked = Boolean(doctor.active);

    const extraSpecialties = getInput("extraSpecialtyIds");
    [...extraSpecialties.options].forEach((option) => {
        option.selected = doctor.specialtyIds.slice(1).includes(Number(option.value));
    });

    document.querySelector("#doctor-dialog-title").textContent = "Editar médico";
    fieldNames.forEach((fieldName) => showFieldError(fieldName));
    formMessage.textContent = "";
    dialog.showModal();
}

function openStatusDialog(doctorId) {
    const doctor = getDoctorById(doctorId);
    if (!doctor) return;

    const nextActiveState = !doctor.active;
    const action = nextActiveState ? "activar" : "desactivar";
    const fullName = `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim() || "este médico";

    statusDoctorId.value = doctor.doctorId;
    confirmStatusButton.dataset.nextActive = String(nextActiveState);
    statusDialogTitle.textContent = `${nextActiveState ? "Activar" : "Desactivar"} médico`;
    statusDialogDescription.textContent = `¿Confirmas que deseas ${action} al médico ${fullName}?`;
    confirmStatusButton.textContent = nextActiveState ? "Activar médico" : "Desactivar médico";
    confirmStatusButton.className = nextActiveState
        ? "rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
        : "rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700";
    statusDialog.showModal();
}

function validateField(fieldName) {
    const values = getFormValues();
    const errors = validateDoctor(values);
    showFieldError(fieldName, errors[fieldName]);
}

fieldNames.forEach((fieldName) => {
    const input = getInput(fieldName);
    input?.addEventListener("blur", () => validateField(fieldName));
    input?.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validateField(fieldName);
    });
});

document.querySelector("#new-doctor-button")?.addEventListener("click", openCreateDialog);
document.querySelector("#close-doctor-dialog")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-doctor-button")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-doctor-status-button")?.addEventListener("click", () => statusDialog.close());
searchInput?.addEventListener("input", renderDoctors);
statusFilter?.addEventListener("change", renderDoctors);

tableBody?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-doctor]");
    if (editButton) openEditDialog(editButton.dataset.editDoctor);

    const statusButton = event.target.closest("[data-change-status]");
    if (statusButton) openStatusDialog(statusButton.dataset.changeStatus);
});

confirmStatusButton?.addEventListener("click", () => {
    const doctorId = statusDoctorId.value;
    const nextActiveState = confirmStatusButton.dataset.nextActive === "true";
    const updatedDoctor = updateDoctor(doctorId, {active: nextActiveState});

    if (!updatedDoctor) {
        statusDialogDescription.textContent = "No fue posible encontrar al médico seleccionado.";
        return;
    }

    statusDialog.close();
    renderDoctors();
});

getInput("run")?.addEventListener("blur", (event) => {
    event.target.value = normalizeRun(event.target.value);
});

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = getFormValues();
    const isEditing = Boolean(values.doctorId);
    const errors = validateDoctor(values);

    fieldNames.forEach((fieldName) => showFieldError(fieldName, errors[fieldName]));
    formMessage.textContent = "";

    if (Object.keys(errors).length > 0) {
        getInput(Object.keys(errors)[0])?.focus();
        return;
    }

    if (isDoctorDataTaken(values.run, values.medicalLicenseNumber, values.doctorId || null)) {
        formMessage.className = "mt-4 text-center text-sm font-medium text-red-600";
        formMessage.textContent = "El RUN o N° de registro ya está asociado a otro médico.";
        return;
    }

    const doctorData = {...values};
    delete doctorData.doctorId;

    if (isEditing) {
        updateDoctor(values.doctorId, doctorData);
    } else {
        saveDoctor({...doctorData, doctorId: getNextDoctorId()});
    }

    dialog.close();
    renderDoctors();
});

renderDoctors();
