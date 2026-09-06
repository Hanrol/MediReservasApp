import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRouteAccess } from "../assets/js/route-guard.js";

const allRoles = ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"];

test("permite ingresar a una ruta pública sin sesión", () => {
    assert.equal(
        evaluateRouteAccess({ authRequired: false, allowedRoles: [], session: null }),
        "allowed"
    );
});

test("envía al login cuando falta una sesión válida", () => {
    assert.equal(
        evaluateRouteAccess({ authRequired: true, allowedRoles: allRoles, session: null }),
        "login"
    );
    assert.equal(
        evaluateRouteAccess({
            authRequired: true,
            allowedRoles: allRoles,
            session: { role: "ROL_DESCONOCIDO" },
        }),
        "login"
    );
});

test("permite a cada rol entrar a las vistas compartidas", () => {
    allRoles.forEach((role) => {
        assert.equal(
            evaluateRouteAccess({ authRequired: true, allowedRoles: allRoles, session: { role } }),
            "allowed"
        );
    });
});

test("deniega una vista administrativa a roles no autorizados", () => {
    ["RECEPTIONIST", "DOCTOR", "PATIENT"].forEach((role) => {
        assert.equal(
            evaluateRouteAccess({
                authRequired: true,
                allowedRoles: ["ADMIN"],
                session: { role },
            }),
            "denied"
        );
    });
});

test("restringe las vistas personales al rol del paciente", () => {
    assert.equal(
        evaluateRouteAccess({authRequired: true, allowedRoles: ["PATIENT"], session: {role: "PATIENT"}}),
        "allowed"
    );
    assert.equal(
        evaluateRouteAccess({authRequired: true, allowedRoles: ["PATIENT"], session: {role: "DOCTOR"}}),
        "denied"
    );
});
