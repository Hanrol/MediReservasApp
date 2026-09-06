import test from "node:test";
import assert from "node:assert/strict";
import {
    appendLabeledText,
    createActiveStatusButton,
    createActiveStatusCell,
    createTableCell,
    setFieldError
} from "../assets/js/ui-utils.js";

test("crea una celda segura con texto y clases", () => {
    globalThis.document = {
        createElement(tagName) {
            return {tagName: tagName.toUpperCase(), className: "", textContent: ""};
        }
    };

    const cell = createTableCell("Paciente <script>", "cell-class");

    assert.equal(cell.tagName, "TD");
    assert.equal(cell.className, "cell-class");
    assert.equal(cell.textContent, "Paciente <script>");
});

test("crea una celda de estado activo con etiquetas configurables", () => {
    globalThis.document = {
        createElement(tagName) {
            return {
                tagName: tagName.toUpperCase(),
                className: "",
                textContent: "",
                append(...items) {
                    this.children = items;
                }
            };
        }
    };

    const activeCell = createActiveStatusCell(true);
    const inactiveCell = createActiveStatusCell(false, {inactive: "Inactiva"});

    assert.equal(activeCell.children[0].textContent, "Activo");
    assert.match(activeCell.children[0].className, /bg-emerald-50/);
    assert.equal(inactiveCell.children[0].textContent, "Inactiva");
    assert.match(inactiveCell.children[0].className, /bg-red-50/);
});

test("crea un botón para cambiar el estado activo", () => {
    globalThis.document = {
        createElement(tagName) {
            return {
                tagName: tagName.toUpperCase(),
                className: "",
                dataset: {},
                textContent: "",
                type: ""
            };
        }
    };

    const button = createActiveStatusButton(true, 25);

    assert.equal(button.type, "button");
    assert.equal(button.dataset.changeStatus, "25");
    assert.equal(button.textContent, "Desactivar");
    assert.match(button.className, /border-red-200/);
});

test("agrega texto etiquetado sin interpretar HTML", () => {
    const children = [];
    globalThis.document = {
        createElement(tagName) {
            return {
                tagName: tagName.toUpperCase(),
                className: "",
                textContent: "",
                append(...items) {
                    this.children = items;
                }
            };
        },
        createTextNode(textContent) {
            return {textContent};
        }
    };
    const container = {append(item) { children.push(item); }};

    appendLabeledText(container, "Médico", "Ana <script>", "mt-2");

    assert.equal(children[0].className, "mt-2");
    assert.equal(children[0].children[0].textContent, "Médico: ");
    assert.equal(children[0].children[1].textContent, "Ana <script>");
});

test("actualiza de forma consistente el error visual de un campo", () => {
    const classes = new Map();
    const attributes = new Map();
    const input = {
        setAttribute(name, value) { attributes.set(name, value); },
        classList: {toggle(name, active) { classes.set(name, active); }}
    };
    const errorElement = {textContent: ""};

    setFieldError(input, errorElement, "Campo obligatorio.");

    assert.equal(attributes.get("aria-invalid"), "true");
    assert.equal(classes.get("border-red-500"), true);
    assert.equal(errorElement.textContent, "Campo obligatorio.");
});
