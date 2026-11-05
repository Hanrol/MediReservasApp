package cl.duoc.appointments.dto;

import java.time.LocalTime;

import cl.duoc.appointments.model.DayOfWeek;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleRequest {

    @NotNull(message = "El ID del doctor es obligatorio")
    @Positive(message = "El ID del doctor debe ser un número positivo")
    private Long doctorId;

    @NotNull(message = "El día de la semana es obligatorio")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime endTime;

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean active;
}
