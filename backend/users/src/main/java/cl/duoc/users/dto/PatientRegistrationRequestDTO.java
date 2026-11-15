package cl.duoc.users.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PatientRegistrationRequestDTO(

        @NotBlank(message = "El RUN es obligatorio")
        @Pattern(regexp = "^[0-9]{7,8}-[0-9Kk]$", message = "El RUN debe tener el formato 12345678-9")
        @Size(max = 12, message = "El RUN no puede superar los 12 caracteres")
        String run,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre no puede superar los 80 caracteres")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 80, message = "El apellido no puede superar los 80 caracteres")
        String lastName,

        @Past(message = "La fecha de nacimiento debe ser anterior a la fecha actual")
        LocalDate birthDate,

        @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
        String phone,

        @Size(max = 150, message = "La dirección no puede superar los 150 caracteres")
        String address,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo debe tener un formato válido")
        @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
        String password,

        @AssertTrue(message = "Debes aceptar los términos para continuar")
        boolean termsAccepted) {
}
