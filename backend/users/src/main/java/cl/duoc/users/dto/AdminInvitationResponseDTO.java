package cl.duoc.users.dto;

import java.time.LocalDateTime;

public record AdminInvitationResponseDTO(
        Long invitationId,
        String email,
        String role,
        LocalDateTime expiresAt,
        String status) {
}
