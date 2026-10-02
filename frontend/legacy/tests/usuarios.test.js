import test from "node:test";
import assert from "node:assert/strict";
import {
    getUserById,
    getUsers,
    initializeBaseUsers,
    isUserDataTaken,
    saveUser,
    updateUser,
    updateUserStatus
} from "../assets/js/storage.js";
import { validateManagedUser } from "../assets/js/validaciones.js";

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

const newUser = {
    userId: 7,
    authUserId: 7,
    run: "12345678-5",
    firstName: "Camila",
    lastName: "Soto",
    email: "camila@example.com",
    phone: "+56912345678",
    address: "Santiago",
    password: "Temporal123",
    role: "PATIENT",
    active: true
};

test.beforeEach(() => {
    localStorage.clear();
    initializeBaseUsers();
});

test("crea un usuario sin reemplazar las cuentas existentes", () => {
    saveUser(newUser);

    assert.equal(getUsers().length, 7);
    assert.deepEqual(getUserById(newUser.userId), newUser);
});

test("actualiza un usuario conservando su identificador y contraseña", () => {
    saveUser(newUser);
    const updated = updateUser(newUser.userId, {
        firstName: "Camila Andrea",
        userId: 99
    });

    assert.equal(updated.userId, newUser.userId);
    assert.equal(updated.firstName, "Camila Andrea");
    assert.equal(updated.password, newUser.password);
});

test("detecta RUN o correo utilizados por otra cuenta", () => {
    saveUser(newUser);

    assert.equal(isUserDataTaken(newUser.run, "otro@example.com"), true);
    assert.equal(isUserDataTaken("98765432-1", newUser.email), true);
    assert.equal(isUserDataTaken(newUser.run, newUser.email, newUser.userId), false);
});

test("exige contraseña al crear y permite omitirla al editar", () => {
    const values = { ...newUser, password: "" };

    assert.ok(validateManagedUser(values, false).password);
    assert.equal(validateManagedUser(values, true).password, undefined);
});

test("rechaza datos administrativos inválidos", () => {
    const errors = validateManagedUser({
        ...newUser,
        run: "123",
        firstName: "Camila123",
        email: "correo-invalido",
        phone: "12"
    });

    assert.ok(errors.run);
    assert.ok(errors.firstName);
    assert.ok(errors.email);
    assert.ok(errors.phone);
});

test("desactiva y reactiva una cuenta sin modificar sus datos", () => {
    saveUser(newUser);

    const inactiveUser = updateUserStatus(newUser.userId, false);
    assert.equal(inactiveUser.active, false);
    assert.equal(inactiveUser.email, newUser.email);
    assert.equal(inactiveUser.password, newUser.password);
    assert.equal(inactiveUser.role, newUser.role);

    const activeUser = updateUserStatus(newUser.userId, true);
    assert.equal(activeUser.active, true);
});

test("rechaza estados inválidos y usuarios inexistentes", () => {
    assert.equal(updateUserStatus(newUser.userId, "inactive"), null);
    assert.equal(updateUserStatus("missing-user", false), null);
});
