const DASHBOARD_CONFIG = {
    ADMIN: {
        label: "Administrador",
        description: "Administra usuarios, perfiles y la configuración general de MediReservas.",
        actions: [
            { icon: "US", title: "Gestionar usuarios", description: "Crea, edita y cambia el estado de las cuentas.", href: "usuarios.html" },
            { icon: "RO", title: "Roles y permisos", description: "Asigna perfiles y revisa los accesos disponibles.", href: "roles.html" },
            { icon: "ME", title: "Gestionar médicos", description: "Mantén actualizada la información de los profesionales.", href: "admin-medicos.html" },
            { icon: "ES", title: "Especialidades", description: "Administra las áreas de atención médica disponibles.", href: "admin-especialidades.html" }
        ]
    },
    RECEPTIONIST: {
        label: "Recepcionista",
        description: "Revisa y gestiona las solicitudes de atención de los pacientes.",
        actions: [
            { icon: "CI", title: "Gestionar citas", description: "Consulta, confirma, reagenda o cancela las solicitudes de atención.", href: "gestion-citas.html" }
        ]
    },
    DOCTOR: {
        label: "Médico",
        description: "Consulta tu agenda y registra la información de tus atenciones.",
        actions: [
            { icon: "AG", title: "Mi agenda", description: "Revisa tus citas y registra observaciones de las atenciones confirmadas.", href: "agenda-medica.html" },
            { icon: "HI", title: "Historial clínico", description: "Consulta antecedentes asociados a tus atenciones.", href: "historial-clinico.html" }
        ]
    },
    PATIENT: {
        label: "Paciente",
        description: "Reserva horas y consulta el estado de tus próximas atenciones médicas.",
        actions: [
            { icon: "RE", title: "Reservar una hora", description: "Selecciona especialidad, profesional, fecha y horario.", href: "solicitar-cita.html" },
            { icon: "MC", title: "Mis citas", description: "Consulta, revisa o cancela tus próximas atenciones.", href: "mis-citas.html" },
            { icon: "ME", title: "Buscar médicos", description: "Encuentra profesionales por nombre o especialidad.", href: "medicos-especialidades.html" },
            { icon: "HI", title: "Historial clínico", description: "Revisa las observaciones de tus atenciones anteriores.", href: "historial-clinico.html" }
        ]
    }
};

const ALL_ROLES = Object.freeze(["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"]);

const ROUTE_PERMISSIONS = Object.freeze({
    "dashboard.html": ALL_ROLES,
    "perfil.html": ALL_ROLES,
    "usuarios.html": Object.freeze(["ADMIN"]),
    "roles.html": Object.freeze(["ADMIN"]),
    "admin-medicos.html": Object.freeze(["ADMIN"]),
    "admin-especialidades.html": Object.freeze(["ADMIN"]),
    "gestion-citas.html": Object.freeze(["RECEPTIONIST", "ADMIN"]),
    "agenda-medica.html": Object.freeze(["DOCTOR"]),
    "observacion-clinica.html": Object.freeze(["DOCTOR"]),
    "solicitar-cita.html": Object.freeze(["PATIENT"]),
    "mis-citas.html": Object.freeze(["PATIENT"]),
    "historial-clinico.html": Object.freeze(["DOCTOR", "PATIENT"]),
});

export function getDashboardConfig(role) {
    return DASHBOARD_CONFIG[role] ?? null;
}

export function isValidRole(role) {
    return Object.hasOwn(DASHBOARD_CONFIG, role);
}

export function getAllowedRolesForRoute(routeName) {
    return ROUTE_PERMISSIONS[routeName] ?? null;
}

export function validateRoleChange(currentRole, newRole) {
    if (!isValidRole(newRole)) {
        return "Selecciona un rol válido.";
    }

    if (currentRole === newRole) {
        return "Selecciona un rol diferente al actual.";
    }

    return "";
}
