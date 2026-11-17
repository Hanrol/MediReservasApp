package cl.duoc.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactMessageRequestDTO(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(max = 120) String subject,
        @NotBlank @Size(max = 2000) String message) {
}
