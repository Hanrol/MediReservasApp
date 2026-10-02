import {BASE_APPOINTMENTS, BASE_DOCTORS, BASE_SPECIALTIES, BASE_USERS} from "./mock-data.js";

const USERS_KEY = "medireservas_users";
const SESSION_KEY = "medireservas_session";
const LEGACY_ROLES = Object.freeze({
    ADMINISTRADOR: "ADMIN",
    RECEPCIONISTA: "RECEPTIONIST",
    MEDICO: "DOCTOR",
    PACIENTE: "PATIENT"
});

function normalizeStoredRole(role) {
    return LEGACY_ROLES[role] ?? role;
}

export function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
        return users.map(({id, ...user}, index) => ({
            ...user,
            userId: Number(user.userId ?? index + 1),
            authUserId: Number(user.authUserId ?? user.userId ?? index + 1),
            role: normalizeStoredRole(user.role)
        }));
    } catch {
        return [];
    }
}

export function userExists(run, email) {
    return isUserDataTaken(run, email);
}

export function getUserById(userId) {
    return getUsers().find((user) => user.userId === Number(userId)) ?? null;
}

export function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isUserDataTaken(run, email, excludedUserId = null) {
    const normalizedEmail = email.toLowerCase();

    return getUsers().some(
        (user) =>
            user.userId !== Number(excludedUserId) &&
            (user.run === run || user.email.toLowerCase() === normalizedEmail)
    );
}

export function updateUser(userId, changes) {
    const users = getUsers();
    const numericUserId = Number(userId);
    const userIndex = users.findIndex((user) => user.userId === numericUserId);

    if (userIndex < 0) return null;

    users[userIndex] = {...users[userIndex], ...changes, userId: numericUserId};
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[userIndex];
}

export function updateUserStatus(userId, active) {
    if (typeof active !== "boolean") return null;
    return updateUser(userId, {active});
}

export function getNextUserId() {
    return getUsers().reduce((maxId, user) => Math.max(maxId, user.userId), 0) + 1;
}

export function initializeBaseUsers() {
    const users = getUsers();
    const existingEmails = new Set(users.map((user) => user.email.toLowerCase()));
    const missingUsers = BASE_USERS.filter(
        (user) => !existingEmails.has(user.email.toLowerCase())
    );

    if (missingUsers.length > 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, ...missingUsers]));
    }
}

export function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!session) return null;

        const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
        const legacyUserIndex = storedUsers.findIndex(
            (user) => String(user.id ?? user.userId) === String(session.userId)
        );
        const userId = Number.isFinite(Number(session.userId))
            ? Number(session.userId)
            : legacyUserIndex + 1;

        return {...session, userId, role: normalizeStoredRole(session.role)};
    } catch {
        return null;
    }
}

export function removeSession() {
    localStorage.removeItem(SESSION_KEY);
}

const DOCTORS_KEY = "medireservas_doctors";
const SPECIALTIES_KEY = "medireservas_specialties";
const APPOINTMENTS_KEY = "medireservas_appointments";
const LEGACY_APPOINTMENT_STATUSES = Object.freeze({
    PENDIENTE: "PENDING",
    CONFIRMADA: "CONFIRMED",
    REAGENDADA: "PENDING",
    CANCELADA: "CANCELLED",
    COMPLETADA: "COMPLETED"
});

function normalizeAppointmentStatus(status) {
    return LEGACY_APPOINTMENT_STATUSES[status] ?? status;
}

function normalizeAppointmentId(appointmentId) {
    return Number(String(appointmentId).replace("cita-", ""));
}

function normalizeDoctorId(doctorId) {
    const normalizedDoctorId = Number(String(doctorId).replace("doctor-", ""));
    return Number.isFinite(normalizedDoctorId) ? normalizedDoctorId : null;
}

function normalizePatientUserId(appointment) {
    const patientUserId = Number(appointment.patientUserId ?? 0);
    const linkedUser = getUsers().find((user) => user.userId === patientUserId);

    if (linkedUser && appointment.patientRun && linkedUser.run !== appointment.patientRun) {
        return 0;
    }

    return patientUserId;
}

export function getSpecialties() {
    try {
        const specialties = JSON.parse(localStorage.getItem(SPECIALTIES_KEY)) ?? [];
        return specialties.map(({id, ...specialty}) => ({
            ...specialty,
            specialtyId: specialty.specialtyId ?? id
        }));
    } catch {
        return [];
    }
}

export function getSpecialtyById(specialtyId) {
    return getSpecialties().find((specialty) => specialty.specialtyId === Number(specialtyId)) ?? null;
}

export function saveSpecialty(specialty) {
    const specialties = getSpecialties();
    specialties.push(specialty);
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(specialties));
}

export function updateSpecialty(specialtyId, changes) {
    const specialties = getSpecialties();
    const specialtyIndex = specialties.findIndex((specialty) => specialty.specialtyId === Number(specialtyId));

    if (specialtyIndex < 0) return null;

    specialties[specialtyIndex] = {...specialties[specialtyIndex], ...changes, specialtyId: Number(specialtyId)};
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(specialties));
    return specialties[specialtyIndex];
}

export function isSpecialtyNameTaken(specialtyName, excludedSpecialtyId = null) {
    const normalizedName = specialtyName.trim().toLowerCase();

    return getSpecialties().some(
        (specialty) =>
            specialty.specialtyId !== excludedSpecialtyId &&
            specialty.specialtyName.trim().toLowerCase() === normalizedName
    );
}

export function getNextSpecialtyId() {
    return getSpecialties().reduce((maxId, specialty) => Math.max(maxId, specialty.specialtyId), 0) + 1;
}

export function initializeBaseSpecialties() {
    if (localStorage.getItem(SPECIALTIES_KEY)) return;

    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(BASE_SPECIALTIES));
}

export function getDoctors() {
    try {
        const doctors = JSON.parse(localStorage.getItem(DOCTORS_KEY)) ?? [];
        return doctors.map(({specialtyId, extraSpecialtyIds, ...doctor}, index) => {
            const doctorId = normalizeDoctorId(doctor.doctorId) ?? index + 1;
            const numericUserId = Number(doctor.userId);
            const baseDoctor = BASE_DOCTORS.find((item) => item.doctorId === doctorId);

            return {
                ...doctor,
                doctorId,
                userId: Number.isFinite(numericUserId) ? numericUserId : baseDoctor?.userId,
                specialtyIds: doctor.specialtyIds ?? [specialtyId, ...(extraSpecialtyIds ?? [])].filter(Boolean)
            };
        });
    } catch {
        return [];
    }
}

export function getDoctorById(doctorId) {
    return getDoctors().find((doctor) => doctor.doctorId === Number(doctorId)) ?? null;
}

export function getDoctorForUser(user) {
    if (!user) return null;

    const normalizedEmail = String(user.email ?? "").trim().toLowerCase();
    const normalizedRun = String(user.run ?? "").trim().toLowerCase();
    const normalizedName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim().toLowerCase();

    return getDoctors().find((doctor) => {
        const doctorName = `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim().toLowerCase();

        return doctor.userId === Number(user.userId) ||
            (normalizedEmail && doctor.email?.trim().toLowerCase() === normalizedEmail) ||
            (normalizedRun && doctor.run?.trim().toLowerCase() === normalizedRun) ||
            (normalizedName && doctorName === normalizedName);
    }) ?? null;
}

export function saveDoctor(doctor) {
    const doctors = getDoctors();
    doctors.push(doctor);
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
}

export function updateDoctor(doctorId, changes) {
    const doctors = getDoctors();
    const doctorIndex = doctors.findIndex((doctor) => doctor.doctorId === Number(doctorId));

    if (doctorIndex < 0) return null;

    doctors[doctorIndex] = {...doctors[doctorIndex], ...changes, doctorId: Number(doctorId)};
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    return doctors[doctorIndex];
}

export function isDoctorDataTaken(run, medicalLicenseNumber, excludedDoctorId = null) {
    const normalizedRun = run.trim().toLowerCase();
    const normalizedLicense = medicalLicenseNumber.trim().toLowerCase();

    return getDoctors().some(
        (doctor) =>
            doctor.doctorId !== excludedDoctorId &&
            (doctor.run.trim().toLowerCase() === normalizedRun ||
                doctor.medicalLicenseNumber.trim().toLowerCase() === normalizedLicense)
    );
}

export function getNextDoctorId() {
    return getDoctors().reduce((maxId, doctor) => Math.max(maxId, doctor.doctorId), 0) + 1;
}

export function initializeBaseDoctors() {
    if (localStorage.getItem(DOCTORS_KEY)) return;

    localStorage.setItem(DOCTORS_KEY, JSON.stringify(BASE_DOCTORS));
}

export function getAppointments() {
    try {
        const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY)) ?? [];
        return appointments.map(({id, status, ...appointment}, index) => ({
            ...appointment,
            appointmentId: normalizeAppointmentId(appointment.appointmentId ?? id ?? index + 1),
            patientUserId: normalizePatientUserId(appointment),
            doctorId: normalizeDoctorId(appointment.doctorId) ?? 1,
            specialtyId: Number(appointment.specialtyId),
            scheduleSlotId: normalizeAppointmentId(appointment.scheduleSlotId ?? appointment.appointmentId ?? id ?? index + 1),
            appointmentStatus: normalizeAppointmentStatus(appointment.appointmentStatus ?? status)
        }));
    } catch {
        return [];
    }
}

export function getAppointmentById(appointmentId) {
    return getAppointments().find((appointment) => appointment.appointmentId === normalizeAppointmentId(appointmentId)) ?? null;
}

export function saveAppointment(appointment) {
    const appointments = getAppointments();
    appointments.push(appointment);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

export function getNextAppointmentId() {
    const highestId = getAppointments().reduce((maxId, appointment) => {
        return Math.max(maxId, appointment.appointmentId);
    }, 0);

    return highestId + 1;
}

export function updateAppointment(appointmentId, changes) {
    const appointments = getAppointments();
    const numericAppointmentId = normalizeAppointmentId(appointmentId);
    const appointmentIndex = appointments.findIndex((appointment) => appointment.appointmentId === numericAppointmentId);

    if (appointmentIndex < 0) return null;

    appointments[appointmentIndex] = {...appointments[appointmentIndex], ...changes, appointmentId: numericAppointmentId};
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointments[appointmentIndex];
}

export function initializeBaseAppointments() {
    const appointments = getAppointments();
    const existingIds = new Set(appointments.map(({appointmentId}) => appointmentId));
    const missingAppointments = BASE_APPOINTMENTS.filter(
        ({appointmentId}) => !existingIds.has(appointmentId)
    );

    if (missingAppointments.length > 0) {
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([...appointments, ...missingAppointments]));
    }
}
