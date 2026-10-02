import test from "node:test";
import assert from "node:assert/strict";
import {
    getLocalDateString,
    isValidEmail,
    isValidName,
    isValidRun,
    normalizeRun,
    validateContact,
    validateRegistration
} from "../assets/js/validaciones.js";

const validForm = {
    run: "12345678-5",
    firstName: "Ana María",
    lastName: "Pérez Soto",
    birthDate: "2000-01-01",
    phone: "+56 9 1234 5678",
    address: "Av. Vicuña Mackenna 4917",
    email: "ana@example.com",
    password: "secreto1",
    passwordConfirmation: "secreto1",
    terms: true
};

test("normaliza el RUN sin puntos y conserva el guion", () => {
    assert.equal(normalizeRun("12.345.678-5"), "12345678-5");
});

test("acepta un RUN válido y rechaza su dígito incorrecto", () => {
    assert.equal(isValidRun("12345678-5"), true);
    assert.equal(isValidRun("12345678-9"), false);
});

test("valida correos y nombres con caracteres españoles", () => {
    assert.equal(isValidEmail("ana@example.com"), true);
    assert.equal(isValidEmail("correo-incompleto"), false);
    assert.equal(isValidName("María José O'Ryan"), true);
    assert.equal(isValidName("Ana123"), false);
});

test("acepta un formulario completo y válido", () => {
    assert.deepEqual(validateRegistration(validForm), {});
});

test("informa campos obligatorios y contraseñas diferentes", () => {
    const errors = validateRegistration({
        ...validForm,
        firstName: "",
        email: "",
        passwordConfirmation: "otra",
        terms: false
    });

    assert.ok(errors.firstName);
    assert.ok(errors.email);
    assert.ok(errors.passwordConfirmation);
    assert.ok(errors.terms);
});

test("rechaza una fecha de nacimiento futura", () => {
    const nextYear = new Date().getFullYear() + 1;
    const errors = validateRegistration({ ...validForm, birthDate: `${nextYear}-01-01` });

    assert.ok(errors.birthDate);
});

test("genera fechas locales en formato ISO", () => {
    assert.equal(getLocalDateString(new Date(2026, 8, 3)), "2026-09-03");
});

test("valida los campos del formulario de contacto", () => {
    assert.deepEqual(validateContact({nombre: "", correo: "correo-invalido", asunto: "", mensaje: ""}), {
        nombre: "El nombre es obligatorio.",
        correo: "Ingresa un correo electrónico válido.",
        asunto: "El asunto es obligatorio.",
        mensaje: "El mensaje es obligatorio."
    });

    assert.deepEqual(
        validateContact({nombre: "Paula", correo: "paula@example.com", asunto: "Consulta", mensaje: "Necesito información."}),
        {}
    );
});
