import test from "node:test";
import assert from "node:assert/strict";
import {
    authenticate,
    createSession,
    getPostLoginDestination,
    getRoleDestination,
    logout
} from "../assets/js/auth.js";
import {
    getSession,
    getUsers,
    initializeBaseUsers,
    saveUser
} from "../assets/js/storage.js";
import { validateLogin } from "../assets/js/validaciones.js";

class LocalStorageMock {
    #data = new Map();

    getItem(key) {
        return this.#data.has(key) ? this.#data.get(key) : null;
    }

    setItem(key, value) {
        this.#data.set(key, String(value));
    }

    removeItem(key) {
        this.#data.delete(key);
    }

    clear() {
        this.#data.clear();
    }
}

globalThis.localStorage = new LocalStorageMock();

test.beforeEach(() => {
    localStorage.clear();
    initializeBaseUsers();
});

test("inicializa cuentas para todos los roles del sistema", () => {
    initializeBaseUsers();

    assert.equal(getUsers().length, 6);
    assert.deepEqual(
        new Set(getUsers().map((user) => user.role)),
        new Set(["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"])
    );
});

test("adapta roles antiguos guardados al contrato del backend", () => {
    localStorage.setItem("medireservas_users", JSON.stringify([
        {id: "legacy-1", email: "legacy@medireservas.cl", role: "PACIENTE", active: true}
    ]));
    localStorage.setItem("medireservas_session", JSON.stringify({
        token: "legacy-token",
        userId: "legacy-1",
        role: "PACIENTE"
    }));

    assert.equal(getUsers()[0].role, "PATIENT");
    assert.equal(getUsers()[0].userId, 1);
    assert.equal(getSession().role, "PATIENT");
    assert.equal(getSession().userId, 1);
});

test("autentica credenciales válidas sin distinguir mayúsculas del correo", () => {
    const user = authenticate("ADMINISTRADOR@MEDIRESERVAS.CL", "Admin123");

    assert.equal(user?.role, "ADMIN");
});

test("rechaza una contraseña incorrecta y una cuenta inactiva", () => {
    assert.equal(authenticate("medico@medireservas.cl", "incorrecta"), undefined);

    saveUser({
        userId: 7,
        authUserId: 7,
        email: "inactivo@medireservas.cl",
        password: "Inactivo123",
        role: "PATIENT",
        active: false
    });

    assert.equal(authenticate("inactivo@medireservas.cl", "Inactivo123"), undefined);
});

test("crea una sesión sin incluir la contraseña", () => {
    const user = authenticate("paciente@medireservas.cl", "Paciente123");
    const session = createSession(user);

    assert.equal(session.role, "PATIENT");
    assert.equal(getSession().email, "paciente@medireservas.cl");
    assert.equal("password" in getSession(), false);
});

test("cierra la sesión sin eliminar las cuentas almacenadas", () => {
    const user = authenticate("paciente@medireservas.cl", "Paciente123");
    createSession(user);
    const usersBeforeLogout = getUsers();

    logout();

    assert.equal(getSession(), null);
    assert.deepEqual(getUsers(), usersBeforeLogout);
});

test("dirige los roles reconocidos al dashboard compartido", () => {
    assert.equal(getRoleDestination("ADMIN"), "dashboard.html");
    assert.equal(getRoleDestination("RECEPTIONIST"), "dashboard.html");
    assert.equal(getRoleDestination("DOCTOR"), "dashboard.html");
    assert.equal(getRoleDestination("PATIENT"), "dashboard.html");
    assert.equal(getRoleDestination("ROL_DESCONOCIDO"), "login.html");
});

test("recupera una ruta protegida solo cuando corresponde al rol autenticado", () => {
    assert.equal(
        getPostLoginDestination("PATIENT", "solicitar-cita.html?medico=2"),
        "solicitar-cita.html?medico=2"
    );
    assert.equal(getPostLoginDestination("DOCTOR", "solicitar-cita.html?medico=2"), "dashboard.html");
    assert.equal(getPostLoginDestination("PATIENT", "https://sitio-malicioso.cl"), "dashboard.html");
});

test("valida los campos del formulario antes de autenticar", () => {
    assert.deepEqual(validateLogin({ email: "paciente@medireservas.cl", password: "Paciente123" }), {});

    const errors = validateLogin({ email: "correo-invalido", password: "123" });
    assert.ok(errors.email);
    assert.ok(errors.password);
});
