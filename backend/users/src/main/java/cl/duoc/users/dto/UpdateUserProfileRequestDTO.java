package cl.duoc.users.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequestDTO(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre no puede superar los 80 caracteres")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 80, message = "El apellido no puede superar los 80 caracteres")
        String lastName,

        @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
        String phone,

        @Past(message = "La fecha de nacimiento debe ser anterior a la fecha actual")
        LocalDate birthDate,

        @Size(max = 150, message = "La dirección no puede superar los 150 caracteres")
        String address

) {}
