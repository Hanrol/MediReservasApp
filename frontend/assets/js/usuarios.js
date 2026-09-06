import { getDashboardConfig } from "./roles.js";
import {
    getUsers,
    getUserById,
    getNextUserId,
    initializeBaseUsers,
    isUserDataTaken,
    saveUser,
    updateUser,
    updateUserStatus
} from "./storage.js";
import { normalizeRun, validateManagedUser } from "./validaciones.js";
import {createActiveStatusButton, createActiveStatusCell, createTableCell, setFieldError} from "./ui-utils.js";

const dialog = document.querySelector("#user-dialog");
const form = document.querySelector("#user-form");
const tableBody = document.querySelector("#users-table-body");
const emptyMessage = document.querySelector("#users-empty-message");
const resultCount = document.querySelector("#users-result-count");
const searchInput = document.querySelector("#user-search");
const statusFilter = document.querySelector("#status-filter");
const formMessage = document.querySelector("#user-form-message");
const statusDialog = document.querySelector("#status-dialog");
const statusUserId = document.querySelector("#status-user-id");
const statusDialogTitle = document.querySelector("#status-dialog-title");
const statusDialogDescription = document.querySelector("#status-dialog-description");
const confirmStatusButton = document.querySelector("#confirm-status-button");
const fieldNames = ["run", "firstName", "lastName", "email", "phone", "address", "password"];

initializeBaseUsers();

function getInput(fieldName) {
    return form?.elements.namedItem(fieldName);
}

function getFormValues() {
    const formData = new FormData(form);

    return {
        userId: Number(formData.get("userId") ?? 0),
        run: normalizeRun(String(formData.get("run") ?? "").trim()),
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        phone: String(formData.get("phone") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        password: String(formData.get("password") ?? "")
    };
}

function showFieldError(fieldName, error = "") {
    const input = getInput(fieldName);
    const errorElement = document.querySelector(`#user-${fieldName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-error`);

    setFieldError(input, errorElement, error);
}

function getFilteredUsers() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    return getUsers().filter((user) => {
        const searchableText = `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.run ?? ""} ${user.email ?? ""}`.toLowerCase();
        const matchesQuery = searchableText.includes(query);
        const matchesStatus = status === "all" || (status === "active" ? user.active : !user.active);
        return matchesQuery && matchesStatus;
    });
}

function renderUsers() {
    const users = getFilteredUsers();
    const rows = users.map((user) => {
        const row = document.createElement("tr");
        row.className = "border-b border-line last:border-0";
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Sin nombre";
        const role = getDashboardConfig(user.role)?.label ?? "Usuario";

        row.append(
            createTableCell(fullName, "px-5 py-4 font-semibold"),
            createTableCell(user.run ?? "Sin información"),
            createTableCell(user.email),
            createTableCell(role),
            createActiveStatusCell(user.active)
        );

        const actionsCell = document.createElement("td");
        actionsCell.className = "px-5 py-4 text-right";
        const actions = document.createElement("div");
        actions.className = "flex flex-wrap justify-end gap-2";
        const editButton = document.createElement("button");
        editButton.className = "rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light";
        editButton.type = "button";
        editButton.dataset.editUser = user.userId;
        editButton.textContent = "Editar";
        const statusButton = createActiveStatusButton(user.active, user.userId);
        actions.append(editButton, statusButton);
        actionsCell.append(actions);
        row.append(actionsCell);
        return row;
    });

    tableBody.replaceChildren(...rows);
    resultCount.textContent = `${users.length} ${users.length === 1 ? "usuario encontrado" : "usuarios encontrados"}`;
    emptyMessage.hidden = users.length > 0;
}

function openCreateDialog() {
    form.reset();
    getInput("userId").value = "";
    document.querySelector("#user-dialog-title").textContent = "Crear usuario";
    fieldNames.forEach((fieldName) => showFieldError(fieldName));
    formMessage.textContent = "";
    dialog.showModal();
}

function openEditDialog(userId) {
    const user = getUserById(userId);
    if (!user) return;

    form.reset();
    getInput("userId").value = user.userId;
    fieldNames.filter((field) => field !== "password").forEach((field) => {
        getInput(field).value = user[field] ?? "";
        showFieldError(field);
    });
    showFieldError("password");
    document.querySelector("#user-dialog-title").textContent = "Editar usuario";
    formMessage.textContent = "";
    dialog.showModal();
}

function openStatusDialog(userId) {
    const user = getUserById(userId);
    if (!user) return;

    const nextActiveState = !user.active;
    const action = nextActiveState ? "activar" : "desactivar";
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "este usuario";

    statusUserId.value = user.userId;
    confirmStatusButton.dataset.nextActive = String(nextActiveState);
    statusDialogTitle.textContent = `${nextActiveState ? "Activar" : "Desactivar"} usuario`;
    statusDialogDescription.textContent = `¿Confirmas que deseas ${action} la cuenta de ${fullName}?`;
    confirmStatusButton.textContent = nextActiveState ? "Activar cuenta" : "Desactivar cuenta";
    confirmStatusButton.className = nextActiveState
        ? "rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
        : "rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700";
    statusDialog.showModal();
}

function validateField(fieldName) {
    const values = getFormValues();
    const errors = validateManagedUser(values, Boolean(values.userId));
    showFieldError(fieldName, errors[fieldName]);
}

fieldNames.forEach((fieldName) => {
    const input = getInput(fieldName);
    input?.addEventListener("blur", () => validateField(fieldName));
    input?.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validateField(fieldName);
    });
});

document.querySelector("#new-user-button")?.addEventListener("click", openCreateDialog);
document.querySelector("#close-user-dialog")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-user-button")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-status-button")?.addEventListener("click", () => statusDialog.close());
searchInput?.addEventListener("input", renderUsers);
statusFilter?.addEventListener("change", renderUsers);

tableBody?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-user]");
    if (editButton) openEditDialog(editButton.dataset.editUser);

    const statusButton = event.target.closest("[data-change-status]");
    if (statusButton) openStatusDialog(statusButton.dataset.changeStatus);
});

confirmStatusButton?.addEventListener("click", () => {
    const userId = statusUserId.value;
    const nextActiveState = confirmStatusButton.dataset.nextActive === "true";
    const updatedUser = updateUserStatus(userId, nextActiveState);

    if (!updatedUser) {
        statusDialogDescription.textContent = "No fue posible encontrar al usuario seleccionado.";
        return;
    }

    statusDialog.close();
    renderUsers();
});

getInput("run")?.addEventListener("blur", (event) => {
    event.target.value = normalizeRun(event.target.value);
});

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = getFormValues();
    const isEditing = Boolean(values.userId);
    const errors = validateManagedUser(values, isEditing);

    fieldNames.forEach((fieldName) => showFieldError(fieldName, errors[fieldName]));
    formMessage.textContent = "";

    if (Object.keys(errors).length > 0) {
        getInput(Object.keys(errors)[0])?.focus();
        return;
    }

    if (isUserDataTaken(values.run, values.email, values.userId || null)) {
        formMessage.className = "mt-4 text-center text-sm font-medium text-red-600";
        formMessage.textContent = "El RUN o correo ya está asociado a otra cuenta.";
        return;
    }

    if (isEditing) {
        const changes = { ...values };
        delete changes.userId;
        if (!changes.password) delete changes.password;
        updateUser(values.userId, changes);
    } else {
        saveUser({
            ...values,
            userId: getNextUserId(),
            authUserId: getNextUserId(),
            role: "PATIENT",
            active: true
        });
    }

    dialog.close();
    renderUsers();
});

renderUsers();
