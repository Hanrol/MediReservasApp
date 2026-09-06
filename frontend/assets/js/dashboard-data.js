function createSummary(value, label) {
    return {value: String(value), label};
}

export function getDashboardSummary({session, users = [], doctors = [], specialties = [], appointments = [], today}) {
    if (!session) return [];

    if (session.role === "ADMIN") {
        return [
            createSummary(new Set(users.map((user) => user.role)).size, "Perfiles del sistema"),
            createSummary(users.filter((user) => user.active).length, "Usuarios activos"),
            createSummary(specialties.filter((specialty) => specialty.active).length, "Especialidades activas")
        ];
    }

    if (session.role === "RECEPTIONIST") {
        return [
            createSummary(appointments.filter((appointment) => appointment.appointmentStatus === "PENDING").length, "Citas pendientes"),
            createSummary(appointments.filter((appointment) => appointment.appointmentStatus === "CONFIRMED").length, "Citas confirmadas"),
            createSummary(appointments.filter((appointment) => appointment.appointmentStatus === "CANCELLED").length, "Citas canceladas")
        ];
    }

    if (session.role === "DOCTOR") {
        const doctor = doctors.find((item) => item.userId === session.userId);
        const doctorAppointments = appointments.filter((appointment) => appointment.doctorId === doctor?.doctorId);
        return [
            createSummary(doctorAppointments.filter((appointment) => appointment.date === today && appointment.appointmentStatus !== "CANCELLED").length, "Atenciones de hoy"),
            createSummary(doctorAppointments.filter((appointment) => appointment.appointmentStatus === "CONFIRMED" && appointment.date <= today).length, "Observaciones pendientes"),
            createSummary(doctorAppointments.filter((appointment) => appointment.appointmentStatus === "COMPLETED").length, "Atenciones completadas")
        ];
    }

    if (session.role === "PATIENT") {
        const patientRun = users.find((user) => user.userId === session.userId)?.run ?? session.run;
        const patientAppointments = appointments.filter(
            (appointment) => appointment.patientUserId === session.userId || appointment.patientRun === patientRun
        );
        return [
            createSummary(
                patientAppointments.filter(
                    (appointment) => appointment.date >= today && !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.appointmentStatus)
                ).length,
                "Próximas citas"
            ),
            createSummary(patientAppointments.filter((appointment) => appointment.appointmentStatus === "PENDING").length, "Solicitudes pendientes"),
            createSummary(patientAppointments.filter((appointment) => appointment.appointmentStatus === "COMPLETED").length, "Atenciones realizadas")
        ];
    }

    return [];
}
