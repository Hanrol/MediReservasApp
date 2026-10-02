import test from "node:test";
import assert from "node:assert/strict";
import {
    createProfileData,
    formatProfileDate,
    getInitials
} from "../assets/js/perfil-data.js";

test("genera las iniciales usando nombre y apellido", () => {
    assert.equal(getInitials("María", "Pérez"), "MP");
    assert.equal(getInitials("Daniel", ""), "D");
    assert.equal(getInitials(), "MR");
});

test("formatea la fecha de nacimiento para Chile", () => {
    assert.equal(formatProfileDate("2000-09-03"), "03 de septiembre de 2000");
    assert.equal(formatProfileDate(""), "Sin información");
});

test("crea los datos visibles de un perfil activo", () => {
    const profile = createProfileData(
        {
            firstName: "Paula",
            lastName: "Contreras",
            run: "12345678-5",
            email: "paula@example.com",
            phone: "+56912345678",
            birthDate: "2000-09-03",
            address: "Santiago",
            active: true
        },
        "Paciente"
    );

    assert.equal(profile.fullName, "Paula Contreras");
    assert.equal(profile.initials, "PC");
    assert.equal(profile.role, "Paciente");
    assert.equal(profile.status, "Activa");
});

test("reemplaza los datos opcionales ausentes por un texto claro", () => {
    const profile = createProfileData({ firstName: "Andrea", active: false }, "Administrador");

    assert.equal(profile.phone, "Sin información");
    assert.equal(profile.birthDate, "Sin información");
    assert.equal(profile.address, "Sin información");
    assert.equal(profile.status, "Inactiva");
});
