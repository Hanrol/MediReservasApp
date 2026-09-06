import { authenticate, createSession, getPostLoginDestination } from "./auth.js";
import { initializeBaseUsers } from "./storage.js";
import { validateLogin } from "./validaciones.js";
import {setFieldError} from "./ui-utils.js";

const form = document.querySelector("#login-form");
const message = document.querySelector("#login-message");
const submitButton = form?.querySelector('button[type="submit"]');
const fieldNames = ["email", "password"];

initializeBaseUsers();

function getFormValues() {
    const formData = new FormData(form);

    return {
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        password: String(formData.get("password") ?? "")
    };
}

function getInput(fieldName) {
    return form?.elements.namedItem(fieldName);
}

function showFieldError(fieldName, error = "") {
    const input = getInput(fieldName);
    const errorElement = document.querySelector(`#${fieldName}-error`);

    setFieldError(input, errorElement, error);
}

function validateField(fieldName) {
    const errors = validateLogin(getFormValues());
    showFieldError(fieldName, errors[fieldName]);
}

fieldNames.forEach((fieldName) => {
    const input = getInput(fieldName);

    input?.addEventListener("blur", () => validateField(fieldName));
    input?.addEventListener("input", () => {
        message.textContent = "";
        if (input.getAttribute("aria-invalid") === "true") validateField(fieldName);
    });
});

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = getFormValues();
    const errors = validateLogin(values);

    fieldNames.forEach((fieldName) => showFieldError(fieldName, errors[fieldName]));
    message.textContent = "";

    if (Object.keys(errors).length > 0) {
        getInput(Object.keys(errors)[0])?.focus();
        return;
    }

    const user = authenticate(values.email, values.password);

    if (!user) {
        message.className = "text-center text-sm font-medium text-red-600";
        message.textContent = "El correo o la contraseña son incorrectos.";
        getInput("email")?.focus();
        return;
    }

    submitButton.disabled = true;
    message.className = "text-center text-sm font-medium text-primary-dark";
    message.textContent = "Inicio de sesión correcto. Redirigiendo...";
    const session = createSession(user);
    const returnTo = new URLSearchParams(window.location.search).get("returnTo") ?? "";

    window.setTimeout(() => {
        window.location.href = getPostLoginDestination(session.role, returnTo);
    }, 500);
});
