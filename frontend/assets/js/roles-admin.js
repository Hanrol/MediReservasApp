import { getDashboardConfig, validateRoleChange } from "./roles.js";
import { getUserById, getUsers, initializeBaseUsers, updateUser } from "./storage.js";
import {createTableCell, setFieldError} from "./ui-utils.js";

const dialog = document.querySelector("#role-dialog");
const form = document.querySelector("#role-form");
const searchInput = document.querySelector("#role-user-search");
const tableBody = document.querySelector("#roles-table-body");
const resultCount = document.querySelector("#roles-result-count");
const emptyMessage = document.querySelector("#roles-empty-message");
const roleSelect = document.querySelector("#role-select");
const roleError = document.querySelector("#role-error");
const formMessage = document.querySelector("#role-form-message");

initializeBaseUsers();

function getFilteredUsers() {
    const query = searchInput.value.trim().toLowerCase();

    return getUsers().filter((user) => {
        const searchableText = `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.run ?? ""} ${user.email ?? ""}`.toLowerCase();
        return searchableText.includes(query);
    });
}

function renderRoles() {
    const users = getFilteredUsers();
    const rows = users.map((user) => {
        const row = document.createElement("tr");
        row.className = "border-b border-line last:border-0";
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Sin nombre";
        const role = getDashboardConfig(user.role)?.label ?? "Sin rol";

        row.append(
            createTableCell(fullName, "px-5 py-4 font-semibold"),
            createTableCell(user.run ?? "Sin información"),
            createTableCell(user.email),
            createTableCell(role)
        );

        const actionCell = document.createElement("td");
        actionCell.className = "px-5 py-4 text-right";
        const button = document.createElement("button");
        button.className = "rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light";
        button.type = "button";
        button.dataset.assignRole = user.userId;
        button.textContent = "Cambiar rol";
        actionCell.append(button);
        row.append(actionCell);
        return row;
    });

    tableBody.replaceChildren(...rows);
    resultCount.textContent = `${users.length} ${users.length === 1 ? "usuario encontrado" : "usuarios encontrados"}`;
    emptyMessage.hidden = users.length > 0;
}

function showRoleError(error = "") {
    setFieldError(roleSelect, roleError, error);
}

function openRoleDialog(userId) {
    const user = getUserById(userId);
    if (!user) return;

    form.reset();
    form.elements.namedItem("userId").value = user.userId;
    roleSelect.value = user.role;
    document.querySelector("#role-user-name").textContent = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Sin nombre";
    document.querySelector("#role-user-email").textContent = user.email;
    showRoleError();
    formMessage.textContent = "";
    dialog.showModal();
}

searchInput?.addEventListener("input", renderRoles);
document.querySelector("#close-role-dialog")?.addEventListener("click", () => dialog.close());
document.querySelector("#cancel-role-button")?.addEventListener("click", () => dialog.close());

tableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-assign-role]");
    if (button) openRoleDialog(button.dataset.assignRole);
});

roleSelect?.addEventListener("change", () => showRoleError());

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const userId = form.elements.namedItem("userId").value;
    const selectedRole = roleSelect.value;
    const user = getUserById(userId);

    if (!user) {
        formMessage.className = "mt-4 text-center text-sm font-medium text-red-600";
        formMessage.textContent = "No fue posible encontrar al usuario.";
        return;
    }

    const validationError = validateRoleChange(user.role, selectedRole);

    if (validationError) {
        showRoleError(validationError);
        roleSelect.focus();
        return;
    }

    const roleLabel = getDashboardConfig(selectedRole).label;
    const confirmed = window.confirm(`¿Confirmas la asignación del rol ${roleLabel} a este usuario?`);
    if (!confirmed) return;

    updateUser(userId, { role: selectedRole });
    dialog.close();
    renderRoles();
});

renderRoles();
