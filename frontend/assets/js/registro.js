import { getLocalDateString, normalizeRun, validateRegistration } from "./validaciones.js";
import {getNextUserId, saveUser, userExists} from "./storage.js";
import {setFieldError} from "./ui-utils.js";

const form = document.querySelector("#register-form");
const message = document.querySelector("#register-message");
const submitButton = form?.querySelector('button[type="submit"]');
const birthDateInput = form?.elements.namedItem("birthDate");
const fieldNames = [
    "run",
    "firstName",
    "lastName",
    "birthDate",
    "phone",
    "address",
    "email",
    "password",
    "passwordConfirmation",
    "terms"
];

function getFormValues() {
    const formData = new FormData(form);

    return {
        run: normalizeRun(String(formData.get("run") ?? "").trim()),
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        birthDate: String(formData.get("birthDate") ?? ""),
        phone: String(formData.get("phone") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        password: String(formData.get("password") ?? ""),
        passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
        terms: formData.get("terms") === "on"
    };
}

function getInput(fieldName) {
    return form?.elements.namedItem(fieldName);
}

function showFieldError(fieldName, error = "") {
    const input = getInput(fieldName);
    const errorElement = document.querySelector(
        `#${fieldName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-error`
    );

    setFieldError(input, errorElement, error);
}

function validateField(fieldName) {
    const errors = validateRegistration(getFormValues());
    showFieldError(fieldName, errors[fieldName]);
}

fieldNames.forEach((fieldName) => {
    const input = getInput(fieldName);
    const eventName = input?.type === "checkbox" ? "change" : "blur";

    input?.addEventListener(eventName, () => validateField(fieldName));
    input?.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validateField(fieldName);
    });
});

getInput("run")?.addEventListener("blur", (event) => {
    event.target.value = normalizeRun(event.target.value);
});

if (birthDateInput) birthDateInput.max = getLocalDateString();

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = getFormValues();
    const errors = validateRegistration(values);

    fieldNames.forEach((fieldName) => showFieldError(fieldName, errors[fieldName]));
    message.textContent = "";

    if (Object.keys(errors).length > 0) {
        getInput(Object.keys(errors)[0])?.focus();
        return;
    }

    if (userExists(values.run, values.email)) {
        message.className = "text-center text-sm font-medium text-red-600";
        message.textContent = "Ya existe una cuenta asociada a este RUN o correo.";
        return;
    }

    submitButton.disabled = true;
    saveUser({
        userId: getNextUserId(),
        authUserId: getNextUserId(),
        run: values.run,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        phone: values.phone,
        address: values.address,
        email: values.email,
        password: values.password,
        role: "PATIENT",
        active: true
    });

    form.reset();
    fieldNames.forEach((fieldName) => showFieldError(fieldName));
    message.className = "text-center text-sm font-medium text-primary-dark";
    message.textContent = "Cuenta creada correctamente. Ya puedes iniciar sesión.";

    window.setTimeout(() => {
        window.location.href = "login.html";
    }, 800);
});
