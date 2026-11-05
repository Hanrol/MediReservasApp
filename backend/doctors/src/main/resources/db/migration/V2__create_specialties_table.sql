CREATE TABLE specialties (
    specialty_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    specialty_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE doctor_specialties
    ADD CONSTRAINT fk_doctor_specialties_specialty
    FOREIGN KEY (specialty_id)
    REFERENCES specialties(specialty_id);

INSERT INTO specialties (specialty_id, specialty_name, description, active) VALUES
    (1, 'Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón.', TRUE),
    (2, 'Pediatría', 'Atención médica para niños y adolescentes.', TRUE),
    (3, 'Traumatología', 'Tratamiento de lesiones de huesos, músculos y articulaciones.', TRUE),
    (4, 'Dermatología', 'Cuidado de la piel, cabello y uñas.', TRUE),
    (5, 'Neurología', 'Diagnóstico y tratamiento de enfermedades del sistema nervioso.', TRUE),
    (6, 'Medicina General', 'Atención primaria y controles de salud.', FALSE);
