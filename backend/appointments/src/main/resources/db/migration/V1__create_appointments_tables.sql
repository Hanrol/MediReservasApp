CREATE TABLE appointments (
    appointment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_user_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    specialty_id BIGINT NOT NULL,
    schedule_slot_id BIGINT NOT NULL,
    appointment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_appointments_schedule_slot
        UNIQUE (schedule_slot_id)
);

CREATE TABLE appointment_status_history (
    appointment_status_history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by_user_id BIGINT,
    change_reason VARCHAR(255),
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_status_history_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
);

CREATE TABLE appointment_cancellations (
    appointment_cancellation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    cancelled_by_user_id BIGINT NOT NULL,
    cancellation_reason VARCHAR(255),
    cancelled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_cancellations_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
);

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
