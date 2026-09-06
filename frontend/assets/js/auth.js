import { getUsers, removeSession, saveSession } from "./storage.js";
import {getAllowedRolesForRoute} from "./roles.js";

const ROLE_DESTINATIONS = {
    ADMIN: "dashboard.html",
    RECEPTIONIST: "dashboard.html",
    DOCTOR: "dashboard.html",
    PATIENT: "dashboard.html"
};

export function authenticate(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    return getUsers().find(
        (user) =>
            user.email.toLowerCase() === normalizedEmail &&
            user.password === password &&
            user.active
    );
}

export function createSession(user) {
    const session = {
        token: crypto.randomUUID?.() ?? `session-${Date.now()}`,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
    };

    saveSession(session);
    return session;
}

export function getRoleDestination(role) {
    return ROLE_DESTINATIONS[role] ?? "login.html";
}

export function getPostLoginDestination(role, returnTo = "") {
    if (!returnTo || returnTo.includes(":")) return getRoleDestination(role);

    const destination = new URL(returnTo, "https://medireservas.local/");
    const routeName = destination.pathname.slice(1);
    const allowedRoles = getAllowedRolesForRoute(routeName);

    if (!routeName || routeName.includes("/") || !allowedRoles?.includes(role)) {
        return getRoleDestination(role);
    }

    return `${routeName}${destination.search}`;
}

export function isSessionValid(session, user) {
    return Boolean(
        typeof session?.token === "string" &&
        session.token.trim() &&
        user?.active === true &&
        session.userId === user.userId &&
        session.role === user.role
    );
}

export function logout() {
    removeSession();
}
