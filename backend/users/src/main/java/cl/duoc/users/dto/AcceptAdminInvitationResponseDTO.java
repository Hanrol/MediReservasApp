package cl.duoc.users.dto;

public record AcceptAdminInvitationResponseDTO(
        Long userId,
        String email,
        String role) {
}
