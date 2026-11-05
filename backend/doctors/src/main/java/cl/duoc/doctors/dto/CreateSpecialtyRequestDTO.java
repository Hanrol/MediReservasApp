package cl.duoc.doctors.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSpecialtyRequestDTO(

    @NotBlank(message = "El nombre de la especialidad es obligatorio")
    @Size(max = 100, message = "El nombre de la especialidad no puede superar los 100 caracteres")
    String specialtyName,

    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    String description

) {}