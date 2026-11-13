package cl.duoc.users.dto;

public record PatientRegistrationResponseDTO(
        Long userId,
        String email,
        String firstName,
        String lastName) {
}
