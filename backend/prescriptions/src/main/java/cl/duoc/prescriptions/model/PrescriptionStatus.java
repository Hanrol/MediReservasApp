package cl.duoc.prescriptions.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PrescriptionStatus {
    ACTIVO, EXPIRADO, CANCELADO;

    @JsonCreator
    public static PrescriptionStatus fromString(String value) {
        return valueOf(value.toUpperCase());
    }
}