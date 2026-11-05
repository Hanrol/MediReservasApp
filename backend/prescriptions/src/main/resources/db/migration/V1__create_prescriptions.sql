-- V1__create_prescriptions.sql
CREATE TABLE prescriptions (
    prescription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medical_visit_id BIGINT NOT NULL,
    patient_user_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prescription_status VARCHAR(30) NOT NULL,
    notes VARCHAR(255)
);