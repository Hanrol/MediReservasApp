INSERT INTO appointments (
    appointment_id,
    patient_user_id,
    doctor_id,
    specialty_id,
    schedule_slot_id,
    appointment_status,
    reason,
    created_at
) VALUES
    (1, 101, 201, 1, 1001, 'CANCELLED', 'Consulta general por dolor de cabeza', '2026-06-16 09:00:00'),
    (2, 102, 202, 2, 1002, 'CANCELLED', 'Control cardiologico', '2026-06-16 09:30:00'),
    (3, 103, 203, 3, 1003, 'CANCELLED', 'Revision dermatologica', '2026-06-16 10:00:00'),
    (4, 104, 204, 4, 1004, 'CANCELLED', 'Control traumatologico', '2026-06-16 10:30:00'),
    (5, 105, 205, 5, 1005, 'CANCELLED', 'Evaluacion oftalmologica', '2026-06-16 11:00:00');

INSERT INTO appointment_status_history (
    appointment_status_history_id,
    appointment_id,
    old_status,
    new_status,
    changed_by_user_id,
    change_reason,
    changed_at
) VALUES
    (1, 1, 'CONFIRMED', 'CANCELLED', 101, 'Paciente cancela por motivos personales', '2026-06-16 09:10:00'),
    (2, 2, 'CONFIRMED', 'CANCELLED', 102, 'Paciente solicita reagendar', '2026-06-16 09:40:00'),
    (3, 3, 'CONFIRMED', 'CANCELLED', 103, 'Paciente cancela por motivos personales', '2026-06-16 10:10:00'),
    (4, 4, 'CONFIRMED', 'CANCELLED', 301, 'Cancelacion administrativa por cierre de agenda', '2026-06-16 10:40:00'),
    (5, 5, 'CONFIRMED', 'CANCELLED', 302, 'Doctor no disponible', '2026-06-16 11:10:00');

INSERT INTO appointment_cancellations (
    appointment_cancellation_id,
    appointment_id,
    cancelled_by_user_id,
    cancellation_reason,
    cancelled_at
) VALUES
    (1, 1, 101, 'Paciente cancela por motivos personales', '2026-06-16 09:10:00'),
    (2, 2, 102, 'Paciente solicita reagendar', '2026-06-16 09:40:00'),
    (3, 3, 103, 'Paciente cancela por motivos personales', '2026-06-16 10:10:00'),
    (4, 4, 301, 'Cancelacion administrativa por cierre de agenda', '2026-06-16 10:40:00'),
    (5, 5, 302, 'Doctor no disponible', '2026-06-16 11:10:00');
