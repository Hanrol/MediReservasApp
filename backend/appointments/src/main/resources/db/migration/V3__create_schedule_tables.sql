CREATE TABLE doctor_schedules (
    doctor_schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE schedule_slots (
    schedule_slot_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_status VARCHAR(30) NOT NULL,
    appointment_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_doctor_slot
        UNIQUE (doctor_id, slot_date, start_time, end_time)
);

CREATE TABLE doctor_time_off (
    doctor_time_off_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schedule_slots (
    schedule_slot_id,
    doctor_id,
    slot_date,
    start_time,
    end_time,
    slot_status,
    appointment_id,
    created_at
) VALUES
    (1001, 201, '2026-06-16', '09:00:00', '09:30:00', 'LIBERADO_POR_CANCELACION', 1, '2026-06-16 08:00:00'),
    (1002, 202, '2026-06-16', '09:30:00', '10:00:00', 'LIBERADO_POR_CANCELACION', 2, '2026-06-16 08:00:00'),
    (1003, 203, '2026-06-16', '10:00:00', '10:30:00', 'LIBERADO_POR_CANCELACION', 3, '2026-06-16 08:00:00'),
    (1004, 204, '2026-06-16', '10:30:00', '11:00:00', 'LIBERADO_POR_CANCELACION', 4, '2026-06-16 08:00:00'),
    (1005, 205, '2026-06-16', '11:00:00', '11:30:00', 'LIBERADO_POR_CANCELACION', 5, '2026-06-16 08:00:00');
