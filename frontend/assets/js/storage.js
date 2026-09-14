const USERS_KEY = "medireservas_users";
const SESSION_KEY = "medireservas_session";

const BASE_USERS = [
    {
        id: "admin-1",
        run: "11111111-1",
        firstName: "Andrea",
        lastName: "Muñoz",
        email: "administrador@medireservas.cl",
        password: "Admin123",
        role: "ADMINISTRADOR",
        active: true
    },
    {
        id: "receptionist-1",
        run: "22222222-2",
        firstName: "Ricardo",
        lastName: "Silva",
        email: "recepcion@medireservas.cl",
        password: "Recepcion123",
        role: "RECEPCIONISTA",
        active: true
    },
    {
        id: "doctor-1",
        run: "33333333-3",
        firstName: "Daniela",
        lastName: "Rojas",
        email: "medico@medireservas.cl",
        password: "Medico123",
        role: "MEDICO",
        active: true
    },
    {
        id: "patient-1",
        run: "44444444-4",
        firstName: "Paula",
        lastName: "Contreras",
        email: "paciente@medireservas.cl",
        password: "Paciente123",
        role: "PACIENTE",
        active: true
    }
];

export function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
    } catch {
        return [];
    }
}

export function userExists(run, email) {
    return isUserDataTaken(run, email);
}

export function getUserById(userId) {
    return getUsers().find((user) => user.id === userId) ?? null;
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
            user.id !== excludedUserId &&
            (user.run === run || user.email.toLowerCase() === normalizedEmail)
    );
}

export function updateUser(userId, changes) {
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex < 0) return null;

    users[userIndex] = { ...users[userIndex], ...changes, id: userId };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[userIndex];
}

export function updateUserStatus(userId, active) {
    if (typeof active !== "boolean") return null;
    return updateUser(userId, { active });
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
        return JSON.parse(localStorage.getItem(SESSION_KEY));
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

const BASE_SPECIALTIES = [
    {
        id: 1,
        specialtyName: "Cardiología",
        description: "Diagnóstico y tratamiento de enfermedades del corazón.",
        active: true
    },
    { id: 2, specialtyName: "Pediatría", description: "Atención médica para niños y adolescentes.", active: true },
    {
        id: 3,
        specialtyName: "Traumatología",
        description: "Tratamiento de lesiones de huesos, músculos y articulaciones.",
        active: true
    },
    { id: 4, specialtyName: "Dermatología", description: "Cuidado de la piel, cabello y uñas.", active: true },
    {
        id: 5,
        specialtyName: "Neurología",
        description: "Diagnóstico y tratamiento de enfermedades del sistema nervioso.",
        active: true
    },
    { id: 6, specialtyName: "Medicina General", description: "Atención primaria y controles de salud.", active: false }
];

const BASE_DOCTORS = [
    {
        doctorId: 1,
        userId: "doctor-1",
        firstName: "Ana",
        lastName: "Rojas",
        run: "12345678-5",
        email: "ana.rojas@medireservas.cl",
        phone: "+56 9 1234 5678",
        medicalLicenseNumber: "RUM-12345",
        specialtyId: 1,
        extraSpecialtyIds: [],
        admissionDate: "2024-03-15",
        active: true
    },
    {
        doctorId: 2,
        userId: "doctor-1",
        firstName: "Luis",
        lastName: "Pérez",
        run: "18265432-9",
        email: "luis.perez@medireservas.cl",
        phone: "+56 9 8765 4321",
        medicalLicenseNumber: "RUM-67890",
        specialtyId: 2,
        extraSpecialtyIds: [4],
        admissionDate: "2023-08-02",
        active: true
    },
    {
        doctorId: 3,
        userId: "doctor-1",
        firstName: "María",
        lastName: "Soto",
        run: "16753248-9",
        email: "maria.soto@medireservas.cl",
        phone: "",
        medicalLicenseNumber: "RUM-11223",
        specialtyId: 3,
        extraSpecialtyIds: [],
        admissionDate: "2022-01-10",
        active: false
    }
];

const BASE_APPOINTMENTS = [
    {
        id: "cita-1",
        patientName: "Paula Contreras",
        patientRun: "44444444-4",
        doctorId: "doctor-1",
        doctorName: "Daniela Rojas",
        specialtyId: 1,
        specialtyName: "Cardiología",
        date: "2026-09-07",
        time: "09:30",
        reason: "Control de presión arterial",
        status: "PENDIENTE"
    },
    {
        id: "cita-2",
        patientName: "Juan Morales",
        patientRun: "15678234-0",
        doctorId: "doctor-1",
        doctorName: "Daniela Rojas",
        specialtyId: 2,
        specialtyName: "Pediatría",
        date: "2026-09-08",
        time: "10:00",
        reason: "Control de niño sano",
        status: "PENDIENTE"
    },
    {
        id: "cita-3",
        patientName: "Carolina Fuentes",
        patientRun: "14235876-3",
        doctorId: "doctor-1",
        doctorName: "Daniela Rojas",
        specialtyId: 3,
        specialtyName: "Traumatología",
        date: "2026-09-05",
        time: "11:15",
        reason: "Dolor lumbar persistente",
        status: "CONFIRMADA"
    },
    {
        id: "cita-4",
        patientName: "Pedro Salinas",
        patientRun: "13987654-2",
        doctorId: "doctor-1",
        doctorName: "Daniela Rojas",
        specialtyId: 4,
        specialtyName: "Dermatología",
        date: "2026-09-10",
        time: "16:00",
        reason: "Evaluación de lunar en el brazo",
        status: "CONFIRMADA"
    },
    {
        id: "cita-5",
        patientName: "Lucía Vega",
        patientRun: "16543987-K",
        doctorId: "doctor-1",
        doctorName: "Daniela Rojas",
        specialtyId: 5,
        specialtyName: "Neurología",
        date: "2026-09-09",
        time: "12:00",
        reason: "Control de migrañas",
        status: "REAGENDADA"
    },
    {
        id: "cita-6",
        patientName: "Marcos Díaz",
        patientRun: "17893451-1",
        doctorId: "doctor-1",
        doctorName: "Daniela Rojas",
        specialtyId: 1,
        specialtyName: "Cardiología",
        date: "2026-09-03",
        time: "09:00",
        reason: "Control post operatorio",
        status: "CANCELADA"
    }
];

export function getSpecialties() {
    try {
        return JSON.parse(localStorage.getItem(SPECIALTIES_KEY)) ?? [];
    } catch {
        return [];
    }
}

export function getSpecialtyById(specialtyId) {
    return getSpecialties().find((specialty) => specialty.id === Number(specialtyId)) ?? null;
}

export function saveSpecialty(specialty) {
    const specialties = getSpecialties();
    specialties.push(specialty);
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(specialties));
}

export function updateSpecialty(specialtyId, changes) {
    const specialties = getSpecialties();
    const specialtyIndex = specialties.findIndex((specialty) => specialty.id === Number(specialtyId));

    if (specialtyIndex < 0) return null;

    specialties[specialtyIndex] = { ...specialties[specialtyIndex], ...changes, id: Number(specialtyId) };
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(specialties));
    return specialties[specialtyIndex];
}

export function isSpecialtyNameTaken(specialtyName, excludedSpecialtyId = null) {
    const normalizedName = specialtyName.trim().toLowerCase();

    return getSpecialties().some(
        (specialty) =>
            specialty.id !== excludedSpecialtyId &&
            specialty.specialtyName.trim().toLowerCase() === normalizedName
    );
}

export function getNextSpecialtyId() {
    return getSpecialties().reduce((maxId, specialty) => Math.max(maxId, specialty.id), 0) + 1;
}

export function initializeBaseSpecialties() {
    if (localStorage.getItem(SPECIALTIES_KEY)) return;

    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(BASE_SPECIALTIES));
}

export function getDoctors() {
    try {
        return JSON.parse(localStorage.getItem(DOCTORS_KEY)) ?? [];
    } catch {
        return [];
    }
}

export function getDoctorById(doctorId) {
    return getDoctors().find((doctor) => doctor.doctorId === Number(doctorId)) ?? null;
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

    doctors[doctorIndex] = { ...doctors[doctorIndex], ...changes, doctorId: Number(doctorId) };
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
        return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY)) ?? [];
    } catch {
        return [];
    }
}

export function getAppointmentById(appointmentId) {
    return getAppointments().find((appointment) => appointment.id === appointmentId) ?? null;
}

export function updateAppointment(appointmentId, changes) {
    const appointments = getAppointments();
    const appointmentIndex = appointments.findIndex((appointment) => appointment.id === appointmentId);

    if (appointmentIndex < 0) return null;

    appointments[appointmentIndex] = { ...appointments[appointmentIndex], ...changes, id: appointmentId };
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointments[appointmentIndex];
}

export function initializeBaseAppointments() {
    if (localStorage.getItem(APPOINTMENTS_KEY)) return;

    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(BASE_APPOINTMENTS));
}
