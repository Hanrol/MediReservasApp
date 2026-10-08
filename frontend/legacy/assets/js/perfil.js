import { getDashboardConfig } from "./roles.js";
import { getSession, getUserById } from "./storage.js";
import { createProfileData } from "./perfil-data.js";

const session = getSession();
const user = session ? getUserById(session.userId) : null;

function setText(selector, value, fallback = "Sin información") {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || fallback;
}

function renderProfile() {
    if (!session || !user) return;

    const role = getDashboardConfig(session.role)?.label ?? "Usuario";
    const profile = createProfileData(user, role);

    document.title = `${profile.fullName} | MediReservas`;
    setText("#profile-initials", profile.initials);
    setText("#profile-name", profile.fullName);
    setText("#profile-role", profile.role);
    setText("#profile-run", profile.run);
    setText("#profile-email", profile.email);
    setText("#profile-phone", profile.phone);
    setText("#profile-birth-date", profile.birthDate);
    setText("#profile-address", profile.address);
    setText("#profile-status", profile.status);
}

renderProfile();
