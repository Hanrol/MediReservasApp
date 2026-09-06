import {isSessionValid, logout} from "./auth.js";
import {getSession, getUserById} from "./storage.js";
import {getDashboardConfig} from "./roles.js";

const menuButton = document.querySelector("#menu-button");
const mobileMenu = document.querySelector("#mobile-menu");
const currentYear = document.querySelector("#current-year");

function updatePublicSessionActions() {
    const session = getSession();
    const user = session?.userId ? getUserById(session.userId) : null;
    if (!isSessionValid(session, user)) return;

    const isRootPage = !window.location.pathname.includes("/pages/");
    const pagesPrefix = isRootPage ? "pages/" : "";
    const homePath = isRootPage ? "index.html" : "../index.html";
    const roleLabel = getDashboardConfig(session.role)?.label ?? session.role;

    document.querySelectorAll("[data-public-auth-actions]").forEach((container) => {
        const isMobile = Boolean(container.closest("#mobile-menu"));

        if (isMobile) {
            const dashboardLink = document.createElement("a");
            dashboardLink.href = `${pagesPrefix}dashboard.html`;
            dashboardLink.textContent = "Panel principal";
            dashboardLink.className = "inline-flex justify-center rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-primary-dark";

            const profileLink = document.createElement("a");
            profileLink.href = `${pagesPrefix}perfil.html`;
            profileLink.textContent = "Mi perfil";
            profileLink.className = "inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white";
            container.replaceChildren(dashboardLink, profileLink);
            return;
        }

        const profileLink = document.createElement("a");
        profileLink.href = `${pagesPrefix}perfil.html`;
        profileLink.className = "text-right";
        profileLink.setAttribute("aria-label", "Ver mi perfil");
        const name = document.createElement("p");
        name.className = "text-sm font-semibold";
        name.textContent = `${session.firstName} ${session.lastName}`.trim();
        const role = document.createElement("p");
        role.className = "text-xs text-muted";
        role.textContent = roleLabel;
        profileLink.append(name, role);

        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "inline-flex items-center justify-center rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4";
        const shortLogoutLabel = document.createElement("span");
        shortLogoutLabel.className = "sm:hidden";
        shortLogoutLabel.textContent = "Salir";
        const fullLogoutLabel = document.createElement("span");
        fullLogoutLabel.className = "hidden sm:inline";
        fullLogoutLabel.textContent = "Cerrar sesión";
        logoutButton.append(shortLogoutLabel, fullLogoutLabel);
        logoutButton.addEventListener("click", () => {
            logout();
            window.location.href = homePath;
        });

        const actions = [profileLink, logoutButton];
        if (menuButton) actions.push(menuButton);
        container.replaceChildren(...actions);
    });
}

function closeMobileMenu() {
    if (!menuButton || !mobileMenu) return;

    mobileMenu.classList.add("hidden");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú principal");
}

function toggleMobileMenu() {
    if (!menuButton || !mobileMenu) return;

    const menuIsOpen = menuButton.getAttribute("aria-expanded") === "true";
    mobileMenu.classList.toggle("hidden", menuIsOpen);
    menuButton.setAttribute("aria-expanded", String(!menuIsOpen));
    menuButton.setAttribute(
        "aria-label",
        menuIsOpen ? "Abrir menú principal" : "Cerrar menú principal"
    );
}

menuButton?.addEventListener("click", toggleMobileMenu);

mobileMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
});

document.addEventListener("click", (event) => {
    const clickedOutsideMenu = !mobileMenu?.contains(event.target);
    const clickedOutsideButton = !menuButton?.contains(event.target);

    if (clickedOutsideMenu && clickedOutsideButton) closeMobileMenu();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) closeMobileMenu();
});

if (currentYear) currentYear.textContent = new Date().getFullYear();
updatePublicSessionActions();
