import test from "node:test";
import assert from "node:assert/strict";
import {
    getDashboardConfig,
    isValidRole,
    validateRoleChange,
} from "../assets/js/roles.js";

const roles = ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"];

test("existe una configuración completa para cada rol", () => {
    roles.forEach((role) => {
        const config = getDashboardConfig(role);

        assert.ok(config, `Falta la configuración de ${role}`);
        assert.ok(config.label);
        assert.ok(config.description);
        assert.ok(config.actions.length >= 1);
    });
});

test("cada rol recibe un conjunto diferente de accesos", () => {
    const actionSets = roles.map((role) =>
        getDashboardConfig(role).actions.map((action) => action.title).join("|")
    );

    assert.equal(new Set(actionSets).size, roles.length);
});

test("todos los accesos contienen datos y rutas internas válidas", () => {
    roles.forEach((role) => {
        getDashboardConfig(role).actions.forEach((action) => {
            assert.ok(action.icon);
            assert.ok(action.title);
            assert.ok(action.description);
            assert.match(action.href, /^[a-z0-9-]+\.html(?:\?[a-z0-9=&-]+)?$/);
        });
    });
});

test("un rol desconocido no obtiene contenido del dashboard", () => {
    assert.equal(getDashboardConfig("ROL_DESCONOCIDO"), null);
    assert.equal(getDashboardConfig(), null);
});

test("administrador y paciente reciben sus accesos principales", () => {
    const adminActions = getDashboardConfig("ADMIN").actions.map(({ title }) => title);
    const patientActions = getDashboardConfig("PATIENT").actions.map(({ title }) => title);

    assert.ok(adminActions.includes("Gestionar usuarios"));
    assert.ok(adminActions.includes("Roles y permisos"));
    assert.ok(patientActions.includes("Reservar una hora"));
    assert.ok(patientActions.includes("Mis citas"));
    assert.equal(patientActions.includes("Gestionar usuarios"), false);
});

test("recepción y médico no reciben accesos duplicados a una misma vista", () => {
    assert.deepEqual(getDashboardConfig("RECEPTIONIST").actions.map(({href}) => href), ["gestion-citas.html"]);
    assert.deepEqual(getDashboardConfig("DOCTOR").actions.map(({href}) => href), ["agenda-medica.html", "historial-clinico.html"]);
});

test("acepta únicamente los cuatro roles definidos", () => {
    roles.forEach((role) => assert.equal(isValidRole(role), true));
    assert.equal(isValidRole("SUPERUSUARIO"), false);
    assert.equal(isValidRole(""), false);
});

test("rechaza una selección vacía o desconocida", () => {
    assert.equal(validateRoleChange("PATIENT", ""), "Selecciona un rol válido.");
    assert.equal(
        validateRoleChange("PATIENT", "SUPERUSUARIO"),
        "Selecciona un rol válido."
    );
});

test("exige cambiar a un rol diferente", () => {
    assert.equal(
        validateRoleChange("DOCTOR", "DOCTOR"),
        "Selecciona un rol diferente al actual."
    );
    assert.equal(validateRoleChange("PATIENT", "DOCTOR"), "");
});
