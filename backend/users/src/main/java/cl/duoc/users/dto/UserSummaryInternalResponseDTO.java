package cl.duoc.users.dto;

public record UserSummaryInternalResponseDTO(
        Long userId,
        String run,
        String firstName,
        String lastName) {
}
