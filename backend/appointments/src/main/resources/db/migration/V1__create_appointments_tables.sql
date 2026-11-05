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
