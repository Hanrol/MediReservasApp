import {
    getSpecialties,
    getSpecialtyById,
    initializeBaseSpecialties,
    isSpecialtyNameTaken,
    saveSpecialty,
    updateSpecialty,
    getNextSpecialtyId
} from "./storage.js";
import {createActiveStatusButton, createActiveStatusCell, createTableCell, setFieldError} from "./ui-utils.js";

const dialog = document.querySelector("#specialty-dialog");
const form = document.querySelector("#specialty-form");
const tableBody = document.querySelector("#specialties-table-body");
const emptyMessage = document.querySelector("#specialties-empty-message");
const resultCount = document.querySelector("#specialties-result-count");
const formMessage = document.querySelector("#specialty-form-message");
const statusDialog = document.querySelector("#specialty-status-dialog");
const statusSpecialtyId = document.querySelector("#specialty-status-id");
const statusDialogTitle = document.querySelector("#specialty-status-dialog-title");
const statusDialogDescription = document.querySelector("#specialty-status-dialog-description");
const confirmStatusButton = document.querySelector("#confirm-specialty-status-button");

initializeBaseSpecialties();

function getInput(fieldName) {
    return form?.elements.namedItem(fieldName);
}

function getFormValues() {
    const formData = new FormData(form);

    return {
        specialtyId: Number(formData.get("specialtyId") ?? 0),
        specialtyName: String(formData.get("specialtyName") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        active: getInput("active").checked
    };
}

function showFieldError(fieldName, error = "") {
    const input = getInput(fieldName);
    const errorElement = document.querySelector(`#specialty-${fieldName === "specialtyName" ? "name" : "description"}-error`);

    setFieldError(input, errorElement, error);
}

function validateSpecialty(values) {
    const errors = {};

    if (!values.specialtyName) errors.specialtyName = "El nombre de la especialidad es obligatorio.";
    else if (values.specialtyName.length > 60) errors.specialtyName = "El nombre no puede superar 60 caracteres.";

    if (values.description.length > 150) errors.description = "La descripción no puede superar 150 caracteres.";

    return errors;
}

function renderSpecialties() {
    const specialties = getSpecialties();
    const rows = specialties.map((specialty) => {
        const row = document.createElement("tr");
        row.className = "border-b border-line last:border-0";

        row.append(
            createTableCell(specialty.specialtyName, "px-5 py-4 font-semibold"),
            createTableCell(specialty.description || "Sin descripción"),
            createActiveStatusCell(specialty.active, {active: "Activa", inactive: "Inactiva"})
        );

        const actionsCell = document.createElement("td");
        actionsCell.className = "px-5 py-4 text-right";
        const actions = document.createElement("div");
        actions.className = "flex flex-wrap justify-end gap-2";
        const editButton = document.createElement("button");
        editButton.className = "rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light";
        editButton.type = "button";
        editButton.dataset.editSpecialty = specialty.specialtyId;
        editButton.textContent = "Editar";
        const statusButton = createActiveStatusButton(specialty.active, specialty.specialtyId);
        actions.append(editButton, statusButton);
        actionsCell.append(actions);
        row.append(actionsCell);
        return row;
    });

    tableBody.replaceChildren(...rows);
    resultCount.textContent = `${specialties.length} ${specialties.length === 1 ? "especialidad registrada" : "especialidades registradas"}`;
    emptyMessage.hidden = specialties.length > 0;
}

function openCreateDialog() {
    form.reset();
    getInput("specialtyId").value = "";
    getInput("active").checked = true;
    document.querySelector("#specialty-dialog-title").textContent = "Crear especialidad";
    showFieldError("specialtyName");
    showFieldError("description");
    formMessage.textContent = "";
    dialog.showModal();
}

function openEditDialog(specialtyId) {
    const specialty = getSpecialtyById(specialtyId);
    if (!specialty) return;

    form.reset();
    getInput("specialtyId").value = specialty.specialtyId;
    getInput("specialtyName").value = specialty.specialtyName ?? "";
    getInput("description").value = specialty.description ?? "";
    getInput("active").checked = Boolean(specialty.active);
    document.querySelector("#specialty-dialog-title").textContent = "Editar especialidad";
    showFieldError("specialtyName");
    showFieldError("description");
    formMessage.textContent = "";
    dialog.showModal();
}

function openStatusDialog(specialtyId) {
    const specialty = getSpecialtyById(specialtyId);
    if (!specialty) return;

    const nextActiveState = !specialty.active;
    const action = nextActiveState ? "activar" : "desactivar";

    statusSpecialtyId.value = specialty.specialtyId;
    confirmStatusButton.dataset.nextActive = String(nextActiveState);
    statusDialogTitle.textContent = `${nextActiveState ? "Activar" : "Desactivar"} especialidad`;
    statusDialogDescription.textContent = `¿Confirmas que deseas ${action} la especialidad ${specialty.specialtyName}?`;
    confirmStatusButton.textContent = nextActiveState ? "Activar especialidad" : "Desactivar especialidad";
    confirmStatusButton.className = nextActiveState
        ? "rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
        : "rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700";
    statusDialog.showModal();
}

document.querySelector("#new-specialty-button")?.addEventListener("click", openCreateDialog);
document.querySelector("#close-specialty-dialog")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-specialty-button")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-specialty-status-button")?.addEventListener("click", () => statusDialog.close());

tableBody?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-specialty]");
    if (editButton) openEditDialog(editButton.dataset.editSpecialty);

    const statusButton = event.target.closest("[data-change-status]");
    if (statusButton) openStatusDialog(statusButton.dataset.changeStatus);
});

confirmStatusButton?.addEventListener("click", () => {
    const specialtyId = statusSpecialtyId.value;
    const nextActiveState = confirmStatusButton.dataset.nextActive === "true";
    const updatedSpecialty = updateSpecialty(specialtyId, { active: nextActiveState });

    if (!updatedSpecialty) {
        statusDialogDescription.textContent = "No fue posible encontrar la especialidad seleccionada.";
        return;
    }

    statusDialog.close();
    renderSpecialties();
});

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = getFormValues();
    const isEditing = Boolean(values.specialtyId);
    const errors = validateSpecialty(values);

    showFieldError("specialtyName", errors.specialtyName);
    showFieldError("description", errors.description);
    formMessage.textContent = "";

    if (Object.keys(errors).length > 0) {
        getInput(errors.specialtyName ? "specialtyName" : "description")?.focus();
        return;
    }

    if (isSpecialtyNameTaken(values.specialtyName, values.specialtyId || null)) {
        formMessage.className = "mt-4 text-center text-sm font-medium text-red-600";
        formMessage.textContent = "Ya existe una especialidad con ese nombre.";
        return;
    }

    if (isEditing) {
        updateSpecialty(values.specialtyId, {
            specialtyName: values.specialtyName,
            description: values.description,
            active: values.active
        });
    } else {
        saveSpecialty({
            specialtyId: getNextSpecialtyId(),
            specialtyName: values.specialtyName,
            description: values.description,
            active: values.active
        });
    }

    dialog.close();
    renderSpecialties();
});

renderSpecialties();
