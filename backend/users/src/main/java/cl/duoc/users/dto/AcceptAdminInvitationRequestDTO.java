package cl.duoc.users.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AcceptAdminInvitationRequestDTO(

        @NotBlank(message = "El token de invitación es obligatorio")
        String token,

        @NotBlank(message = "El RUN es obligatorio")
        @Pattern(regexp = "^[0-9]{7,8}-[0-9Kk]$", message = "El RUN debe tener el formato 12345678-9")
        String run,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre no puede superar los 80 caracteres")
        String firstName,

        @NotBlank(message = "Los apellidos son obligatorios")
        @Size(max = 80, message = "Los apellidos no pueden superar los 80 caracteres")
        String lastName,

        @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
        String phone,

        @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
        LocalDate birthDate,

        @Size(max = 150, message = "La dirección no puede superar los 150 caracteres")
        String address,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
        String password) {
}
