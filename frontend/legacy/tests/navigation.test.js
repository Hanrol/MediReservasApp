import test from "node:test";
import assert from "node:assert/strict";
import {getNavigationItems, isNavigationItemCurrent} from "../assets/js/navigation.js";

test("cada rol recibe accesos al panel y al perfil", () => {
    ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"].forEach((role) => {
        const items = getNavigationItems(role);

        assert.equal(items[0].href, "dashboard.html");
        assert.equal(items[1].href, "perfil.html");
        assert.ok(items.length >= 3);
    });
});

test("la navegación no expone enlaces para roles desconocidos", () => {
    assert.deepEqual(getNavigationItems("ROL_DESCONOCIDO"), []);
    assert.deepEqual(getNavigationItems(), []);
});

test("los enlaces internos usan rutas HTML válidas", () => {
    getNavigationItems("ADMIN").forEach((item) => {
        assert.match(item.href, /^[a-z0-9-]+\.html(?:\?[a-z0-9=&-]+)?$/);
    });
});

test("marca como activo solamente el enlace que coincide con su consulta", () => {
    assert.equal(
        isNavigationItemCurrent("gestion-citas.html", "gestion-citas.html"),
        true
    );
    assert.equal(
        isNavigationItemCurrent("gestion-citas.html", "gestion-citas.html", "?estado=pendiente"),
        false
    );
    assert.equal(
        isNavigationItemCurrent("gestion-citas.html?estado=pendiente", "gestion-citas.html", "?estado=pendiente"),
        true
    );
});
