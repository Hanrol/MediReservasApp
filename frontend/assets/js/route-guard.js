import { isSessionValid } from "./auth.js";
import { getSession, getUserById, removeSession } from "./storage.js";
import { getAllowedRolesForRoute, isValidRole } from "./roles.js";

export function evaluateRouteAccess({ authRequired, allowedRoles, session }) {
    if (!authRequired) return "allowed";
    if (!session || !isValidRole(session.role)) return "login";
    if (!allowedRoles.includes(session.role)) return "denied";
    return "allowed";
}

function protectCurrentRoute() {
    const { body } = document;
    const authRequired = body.hasAttribute("data-auth-required");
    const routeName = window.location.pathname.split("/").pop();
    const allowedRoles = getAllowedRolesForRoute(routeName) ?? [];
    const storedSession = getSession();
    const currentUser = storedSession?.userId ? getUserById(storedSession.userId) : null;
    const session = isSessionValid(storedSession, currentUser) ? storedSession : null;

    if (storedSession && !session) removeSession();

    const decision = evaluateRouteAccess({
        authRequired,
        allowedRoles,
        session,
    });

    if (decision === "login") {
        const returnTo = `${routeName}${window.location.search}`;
        window.location.replace(`login.html?returnTo=${encodeURIComponent(returnTo)}`);
        return;
    }

    if (decision === "denied") {
        window.location.replace("acceso-denegado.html");
        return;
    }

    body.setAttribute("data-auth-checked", "");
}

if (typeof document !== "undefined") protectCurrentRoute();
