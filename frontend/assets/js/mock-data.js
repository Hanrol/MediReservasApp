export const BASE_USERS = [
    {
        userId: 1,
        authUserId: 1,
        run: "11111111-1",
        firstName: "Andrea",
        lastName: "Muñoz",
        email: "administrador@medireservas.cl",
        password: "Admin123",
        role: "ADMIN",
        active: true
    },
    {
        userId: 2,
        authUserId: 2,
        run: "22222222-2",
        firstName: "Ricardo",
        lastName: "Silva",
        email: "recepcion@medireservas.cl",
        password: "Recepcion123",
        role: "RECEPTIONIST",
        active: true
    },
    {
        userId: 3,
        authUserId: 3,
        run: "33333333-3",
        firstName: "Daniela",
        lastName: "Rojas",
        email: "medico@medireservas.cl",
        password: "Medico123",
        role: "DOCTOR",
        active: true
    },
    {
        userId: 4,
        authUserId: 4,
        run: "44444444-4",
        firstName: "Paula",
        lastName: "Contreras",
        email: "paciente@medireservas.cl",
        password: "Paciente123",
        role: "PATIENT",
        active: true
    },
    {
        userId: 5,
        authUserId: 5,
        run: "18265432-9",
        firstName: "Luis",
        lastName: "Pérez",
        email: "luis.perez@medireservas.cl",
        password: "Medico123",
        role: "DOCTOR",
        active: true
    },
    {
        userId: 6,
        authUserId: 6,
        run: "16753248-9",
        firstName: "María",
        lastName: "Soto",
        email: "maria.soto@medireservas.cl",
        password: "Medico123",
        role: "DOCTOR",
        active: false
    }
];

export const BASE_SPECIALTIES = [
    {
        specialtyId: 1,
        specialtyName: "Cardiología",
        description: "Diagnóstico y tratamiento de enfermedades del corazón.",
        active: true
    },
    {specialtyId: 2, specialtyName: "Pediatría", description: "Atención médica para niños y adolescentes.", active: true},
    {
        specialtyId: 3,
        specialtyName: "Traumatología",
        description: "Tratamiento de lesiones de huesos, músculos y articulaciones.",
        active: true
    },
    {specialtyId: 4, specialtyName: "Dermatología", description: "Cuidado de la piel, cabello y uñas.", active: true},
    {
        specialtyId: 5,
        specialtyName: "Neurología",
        description: "Diagnóstico y tratamiento de enfermedades del sistema nervioso.",
        active: true
    },
    {specialtyId: 6, specialtyName: "Medicina General", description: "Atención primaria y controles de salud.", active: false}
];

export const BASE_DOCTORS = [
    {
        doctorId: 1,
        userId: 3,
        firstName: "Daniela",
        lastName: "Rojas",
        run: "33333333-3",
        email: "medico@medireservas.cl",
        phone: "+56 9 1234 5678",
        medicalLicenseNumber: "RUM-12345",
        specialtyIds: [1, 5],
        admissionDate: "2024-03-15",
        active: true
    },
    {
        doctorId: 2,
        userId: 5,
        firstName: "Luis",
        lastName: "Pérez",
        run: "18265432-9",
        email: "luis.perez@medireservas.cl",
        phone: "+56 9 8765 4321",
        medicalLicenseNumber: "RUM-67890",
        specialtyIds: [2, 4],
        admissionDate: "2023-08-02",
        active: true
    },
    {
        doctorId: 3,
        userId: 6,
        firstName: "María",
        lastName: "Soto",
        run: "16753248-9",
        email: "maria.soto@medireservas.cl",
        phone: "",
        medicalLicenseNumber: "RUM-11223",
        specialtyIds: [3],
        admissionDate: "2022-01-10",
        active: false
    }
];

export const BASE_APPOINTMENTS = [
    {
        appointmentId: 1,
        patientUserId: 4,
        scheduleSlotId: 1,
        patientName: "Paula Contreras",
        patientRun: "44444444-4",
        doctorId: 1,
        doctorName: "Daniela Rojas",
        specialtyId: 1,
        specialtyName: "Cardiología",
        date: "2026-09-07",
        time: "09:30",
        reason: "Control de presión arterial",
        appointmentStatus: "PENDING"
    },
    {
        appointmentId: 2,
        patientUserId: 0,
        scheduleSlotId: 2,
        patientName: "Juan Morales",
        patientRun: "15678234-0",
        doctorId: 2,
        doctorName: "Luis Pérez",
        specialtyId: 2,
        specialtyName: "Pediatría",
        date: "2026-09-08",
        time: "10:00",
        reason: "Control de niño sano",
        appointmentStatus: "PENDING"
    },
    {
        appointmentId: 3,
        patientUserId: 0,
        scheduleSlotId: 3,
        patientName: "Carolina Fuentes",
        patientRun: "14235876-3",
        doctorId: 1,
        doctorName: "Daniela Rojas",
        specialtyId: 1,
        specialtyName: "Cardiología",
        date: "2026-09-05",
        time: "11:15",
        reason: "Molestia torácica durante actividad física",
        appointmentStatus: "CONFIRMED"
    },
    {
        appointmentId: 4,
        patientUserId: 0,
        scheduleSlotId: 4,
        patientName: "Pedro Salinas",
        patientRun: "13987654-2",
        doctorId: 2,
        doctorName: "Luis Pérez",
        specialtyId: 4,
        specialtyName: "Dermatología",
        date: "2026-09-10",
        time: "16:00",
        reason: "Evaluación de lunar en el brazo",
        appointmentStatus: "CONFIRMED"
    },
    {
        appointmentId: 5,
        patientUserId: 0,
        scheduleSlotId: 5,
        patientName: "Lucía Vega",
        patientRun: "16543987-K",
        doctorId: 1,
        doctorName: "Daniela Rojas",
        specialtyId: 5,
        specialtyName: "Neurología",
        date: "2026-09-09",
        time: "12:00",
        reason: "Control de migrañas",
        appointmentStatus: "PENDING"
    },
    {
        appointmentId: 6,
        patientUserId: 0,
        scheduleSlotId: 6,
        patientName: "Marcos Díaz",
        patientRun: "17893451-1",
        doctorId: 1,
        doctorName: "Daniela Rojas",
        specialtyId: 1,
        specialtyName: "Cardiología",
        date: "2026-09-03",
        time: "09:00",
        reason: "Control post operatorio",
        appointmentStatus: "CANCELLED"
    },
    {
        appointmentId: 7,
        patientUserId: 4,
        scheduleSlotId: 13,
        patientName: "Paula Contreras",
        patientRun: "44444444-4",
        doctorId: 1,
        doctorName: "Daniela Rojas",
        specialtyId: 1,
        specialtyName: "Cardiología",
        date: "2026-09-06",
        time: "15:30",
        reason: "Control cardiológico",
        appointmentStatus: "CONFIRMED"
    }
];
