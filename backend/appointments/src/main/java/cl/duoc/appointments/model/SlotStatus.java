package cl.duoc.appointments.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SlotStatus {
    DISPONIBLE,
    BLOQUEADO_TIME_OFF,
    RESERVADO,
    COMPLETADO,
    NO_ASISTIO,
    LIBERADO_POR_CANCELACION;

    @JsonCreator
    public static SlotStatus fromString(String value) {
        return valueOf(value.toUpperCase());
    }
}