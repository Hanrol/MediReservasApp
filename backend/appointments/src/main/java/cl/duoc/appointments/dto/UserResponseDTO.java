package cl.duoc.appointments.dto;

public record UserResponseDTO(Long userId, Long authUserId, String run, String email, boolean active) {
}
