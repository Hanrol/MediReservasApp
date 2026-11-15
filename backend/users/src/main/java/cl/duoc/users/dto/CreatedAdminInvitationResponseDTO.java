package cl.duoc.users.dto;

import java.time.LocalDateTime;

public record CreatedAdminInvitationResponseDTO(
        Long invitationId,
        String email,
        String role,
        String token,
        LocalDateTime expiresAt) {
}
