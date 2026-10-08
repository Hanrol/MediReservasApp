export function getInitials(firstName, lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "MR";
}

export function formatProfileDate(dateValue) {
    if (!dateValue) return "Sin información";

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(`${dateValue}T00:00:00Z`));
}

export function createProfileData(user, roleLabel) {
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    return {
        initials: getInitials(user.firstName, user.lastName),
        fullName: fullName || "Usuario MediReservas",
        role: roleLabel || "Usuario",
        run: user.run || "Sin información",
        email: user.email || "Sin información",
        phone: user.phone || "Sin información",
        birthDate: formatProfileDate(user.birthDate),
        address: user.address || "Sin información",
        status: user.active ? "Activa" : "Inactiva"
    };
}
