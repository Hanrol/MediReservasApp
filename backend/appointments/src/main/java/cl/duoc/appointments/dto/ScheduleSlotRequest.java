package cl.duoc.appointments.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import cl.duoc.appointments.model.SlotStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSlotRequest {

    @NotNull(message = "El ID del doctor es obligatorio")
    @Positive(message = "El ID del doctor debe ser un número positivo")
    private Long doctorId;

    @NotNull(message = "La fecha del slot es obligatoria")
    private LocalDate slotDate;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime endTime;

    @NotNull(message = "El estado del slot es obligatorio")
    private SlotStatus slotStatus;

    @Positive(message = "El ID de cita debe ser un número positivo")
    private Long appointmentId;
}