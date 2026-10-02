import test from "node:test";
import assert from "node:assert/strict";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {fileURLToPath} from "node:url";

const pageDirectoryUrl = new URL("../pages/", import.meta.url);
const pagePaths = ["../index.html", ...readdirSync(pageDirectoryUrl)
    .filter((fileName) => fileName.endsWith(".html"))
    .map((fileName) => `../pages/${fileName}`)];

const pages = pagePaths.map((path) => ({
    path,
    url: new URL(path, import.meta.url),
    html: readFileSync(new URL(path, import.meta.url), "utf8"),
}));

test("todas las vistas declaran un nombre de página", () => {
    const names = pages.map(({ path, html }) => {
        const match = html.match(/data-page-name="([^"]+)"/);
        assert.ok(match, `${path} no declara data-page-name`);
        return match[1];
    });

    assert.equal(new Set(names).size, pages.length);
});

test("todas las vistas permiten saltar al contenido principal", () => {
    pages.forEach(({ path, html }) => {
        assert.match(html, /href="#main-content"/, `${path} no tiene enlace de salto`);
        assert.match(html, /id="main-content"/, `${path} no tiene destino principal`);
        assert.match(html, /id="main-content"[^>]*tabindex="-1"/, `${path} no permite enfocar el destino`);
    });
});

test("cada vista contiene un único destino principal", () => {
    pages.forEach(({ path, html }) => {
        const destinations = html.match(/id="main-content"/g) ?? [];
        assert.equal(destinations.length, 1, `${path} debe tener un solo main-content`);
    });
});

test("el logo de las vistas internas siempre dirige al inicio público", () => {
    pages
        .filter(({html}) => html.includes("data-auth-required"))
        .forEach(({path, html}) => {
            assert.match(
                html,
                /<a(?=[^>]*href="\.\.\/index\.html")(?=[^>]*aria-label="Ir al inicio de MediReservas")[^>]*>/,
                `${path} no dirige su logo al inicio`
            );
        });
});

test("todos los enlaces y recursos locales apuntan a archivos existentes", () => {
    pages.forEach(({path, url, html}) => {
        const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

        references
            .filter((reference) => !reference.startsWith("#"))
            .filter((reference) => !/^(?:https?:|mailto:|tel:)/.test(reference))
            .forEach((reference) => {
                const targetUrl = new URL(reference, url);
                targetUrl.search = "";
                targetUrl.hash = "";
                assert.ok(existsSync(fileURLToPath(targetUrl)), `${path} contiene una ruta inexistente: ${reference}`);
            });
    });
});
