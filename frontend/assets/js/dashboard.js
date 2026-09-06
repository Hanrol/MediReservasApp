import { getDashboardConfig } from "./roles.js";
import {getAppointments, getDoctors, getSession, getSpecialties, getUsers, initializeBaseAppointments, initializeBaseDoctors, initializeBaseSpecialties, initializeBaseUsers} from "./storage.js";
import {getDashboardSummary} from "./dashboard-data.js";
import {getLocalDateString} from "./validaciones.js";

const session = getSession();
const config = getDashboardConfig(session?.role);

initializeBaseUsers();
initializeBaseSpecialties();
initializeBaseDoctors();
initializeBaseAppointments();

function createActionLink(action, compact = false) {
    const link = document.createElement("a");
    link.href = action.href;

    if (compact) {
        link.className = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-primary-light hover:text-primary-dark";
    } else {
        link.className = "group rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg";
    }

    const icon = document.createElement("span");
    icon.className = compact
        ? "grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark"
        : "grid size-11 place-items-center rounded-xl bg-primary-light text-sm font-bold text-primary-dark";
    icon.textContent = action.icon;
    icon.setAttribute("aria-hidden", "true");

    const title = document.createElement(compact ? "span" : "h3");
    title.className = compact ? "" : "mt-5 text-lg font-bold group-hover:text-primary-dark";
    title.textContent = action.title;

    link.append(icon, title);

    if (!compact) {
        const description = document.createElement("p");
        description.className = "mt-2 text-sm leading-6 text-muted";
        description.textContent = action.description;
        link.append(description);
    }

    return link;
}

function renderDashboard() {
    if (!session || !config) return;

    document.title = `Panel de ${config.label} | MediReservas`;
    document.querySelector("#header-user-name").textContent = `${session.firstName} ${session.lastName}`.trim();
    document.querySelector("#header-user-role").textContent = config.label;
    document.querySelector("#welcome-label").textContent = `Panel de ${config.label.toLowerCase()}`;
    document.querySelector("#welcome-user-name").textContent = session.firstName;
    document.querySelector("#welcome-description").textContent = config.description;

    const actions = document.querySelector("#dashboard-actions");
    actions.replaceChildren(...config.actions.map((action) => createActionLink(action)));

    const summary = document.querySelector("#dashboard-summary");
    summary.className = "mt-6 grid gap-4 sm:grid-cols-3";
    const summaryItems = getDashboardSummary({
        session,
        users: getUsers(),
        doctors: getDoctors(),
        specialties: getSpecialties(),
        appointments: getAppointments(),
        today: getLocalDateString()
    });
    summary.replaceChildren(
        ...summaryItems.map((item) => {
            const card = document.createElement("article");
            card.className = "rounded-2xl border border-line bg-white p-5 shadow-sm";

            const value = document.createElement("p");
            value.className = "text-3xl font-bold text-primary-dark";
            value.textContent = item.value;

            const label = document.createElement("p");
            label.className = "mt-1 text-sm text-muted";
            label.textContent = item.label;

            card.append(value, label);
            return card;
        })
    );
}

renderDashboard();
