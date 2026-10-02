import { getDashboardConfig } from "./roles.js";
import { getSession } from "./storage.js";

const session = getSession();
const config = getDashboardConfig(session?.role);

function updateSessionHeader() {
    if (!session || !config) return;

    document.querySelector("body > header nav > div:first-child")?.classList.add("lg:pl-8");
    const name = document.querySelector("#header-user-name");
    const role = document.querySelector("#header-user-role");
    if (name) name.textContent = `${session.firstName} ${session.lastName}`.trim();
    if (role) role.textContent = config.label;
}

export function getNavigationItems(role) {
    const roleConfig = getDashboardConfig(role);
    if (!roleConfig) return [];

    return [
        { title: "Panel principal", href: "dashboard.html", icon: "⌂" },
        { title: "Mi perfil", href: "perfil.html", icon: "MI" },
        ...roleConfig.actions,
    ];
}

export function isNavigationItemCurrent(itemHref, currentPage, currentSearch = "") {
    return itemHref === `${currentPage}${currentSearch}`;
}

function createLink(item) {
    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    const link = document.createElement("a");
    link.href = item.href;
    link.className = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-primary-light hover:text-primary-dark";

    if (isNavigationItemCurrent(item.href, currentPage, window.location.search)) {
        link.classList.add("bg-primary-light", "text-primary-dark");
        link.setAttribute("aria-current", "page");
    }

    const icon = document.createElement("span");
    icon.className = "grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark";
    icon.textContent = item.icon;
    icon.setAttribute("aria-hidden", "true");
    link.append(icon);

    link.append(document.createTextNode(item.title));
    return link;
}

function createMenuItems(items) {
    return items.map((item) => {
        const listItem = document.createElement("li");
        listItem.append(createLink(item));
        return listItem;
    });
}

function addPageLocation(main) {
    const pageName = document.body.dataset.pageName;
    if (!main || !pageName || pageName === "Panel principal" || main.querySelector("[data-page-location]")) return;

    main.classList.add("pt-6", "sm:pt-8", "lg:pt-8");
    const location = document.createElement("nav");
    location.className = "mb-6 overflow-x-auto text-sm";
    location.dataset.pageLocation = "";
    location.setAttribute("aria-label", "Ruta de navegación");
    const list = document.createElement("ol");
    list.className = "flex min-w-max items-center gap-2 text-muted";
    const dashboardItem = document.createElement("li");
    const dashboardLink = document.createElement("a");
    dashboardLink.className = "font-semibold text-primary-dark transition hover:underline";
    dashboardLink.href = "dashboard.html";
    dashboardLink.textContent = "Panel principal";
    dashboardItem.append(dashboardLink);
    const separator = document.createElement("li");
    separator.textContent = "/";
    separator.setAttribute("aria-hidden", "true");
    const currentItem = document.createElement("li");
    currentItem.className = "font-semibold text-ink";
    currentItem.textContent = pageName;
    currentItem.setAttribute("aria-current", "page");
    list.append(dashboardItem, separator, currentItem);
    location.append(list);
    main.prepend(location);
}

function connectMenu(button, sidebar, backdrop, closeButton) {
    const setOpen = (open) => {
        sidebar.classList.toggle("translate-x-0", open);
        sidebar.classList.toggle("-translate-x-full", !open);
        backdrop.classList.toggle("hidden", !open);
        button.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("overflow-hidden", open);
    };

    button.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));
    sidebar.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });
}

function initializeDashboardMenu() {
    const button = document.querySelector("#mobile-menu-button");
    const sidebar = document.querySelector("#dashboard-sidebar");
    const backdrop = document.querySelector("#sidebar-backdrop");
    const closeButton = document.querySelector("#close-mobile-menu");
    const menu = document.querySelector("#dashboard-menu");
    if (!button || !sidebar || !backdrop || !closeButton || !menu || !config) return false;

    const navigation = menu.closest("nav");
    if (navigation && !navigation.querySelector(":scope > p")) {
        const label = document.createElement("p");
        label.className = "mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block";
        label.dataset.navigationLabel = "";
        label.textContent = "Navegación";
        navigation.prepend(label);
    }

    menu.replaceChildren(...createMenuItems(getNavigationItems(session.role)));
    connectMenu(button, sidebar, backdrop, closeButton);
    addPageLocation(sidebar.parentElement?.querySelector(":scope > main"));
    return true;
}

function initializeSharedMenu() {
    const topNav = document.querySelector("body > header nav");
    if (!topNav || !config) return;

    const items = getNavigationItems(session.role);
    const button = document.querySelector("#mobile-menu-button");
    if (!button) return;

    const backdrop = document.createElement("button");
    backdrop.className = "fixed inset-0 z-40 hidden bg-slate-950/45 lg:hidden";
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "Cerrar menú de navegación");

    const sidebar = document.createElement("aside");
    sidebar.className = "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full overflow-y-auto border-r border-line bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:overflow-visible lg:px-5 lg:py-8 lg:shadow-none";
    sidebar.id = "shared-mobile-sidebar";
    sidebar.setAttribute("aria-label", "Menú principal");
    const menuHeader = document.createElement("header");
    menuHeader.className = "mb-6 flex items-center justify-between border-b border-line pb-5 lg:hidden";
    const title = document.createElement("p");
    title.className = "font-bold text-primary-dark";
    title.textContent = "Menú principal";
    const closeButton = document.createElement("button");
    closeButton.className = "grid size-10 place-items-center rounded-xl border border-line text-xl text-muted";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Cerrar menú de navegación");
    closeButton.textContent = "×";
    menuHeader.append(title, closeButton);
    const nav = document.createElement("nav");
    const navLabel = document.createElement("p");
    navLabel.className = "mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block";
    navLabel.dataset.navigationLabel = "";
    navLabel.textContent = "Navegación";
    const menu = document.createElement("ul");
    menu.className = "flex flex-col gap-2";
    menu.append(...createMenuItems(items));
    nav.append(navLabel, menu);
    sidebar.append(menuHeader, nav);

    const main = document.querySelector("body > main");
    const layout = document.createElement("div");
    layout.className = "grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]";
    document.body.append(backdrop);

    if (main) {
        main.classList.add("min-w-0");
        addPageLocation(main);
        main.before(layout);
        layout.append(sidebar, main);
    } else {
        document.body.append(sidebar);
    }

    connectMenu(button, sidebar, backdrop, closeButton);
}

if (typeof document !== "undefined") {
    updateSessionHeader();
    if (!initializeDashboardMenu()) initializeSharedMenu();
}
