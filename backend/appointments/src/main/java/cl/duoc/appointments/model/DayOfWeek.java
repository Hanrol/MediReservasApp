package cl.duoc.appointments.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DayOfWeek {
    LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO;

    @JsonCreator
    public static DayOfWeek fromString(String value) {
        return valueOf(value.toUpperCase());
    }
}