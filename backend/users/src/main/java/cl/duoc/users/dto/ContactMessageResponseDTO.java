package cl.duoc.users.dto;

import java.time.LocalDateTime;

public record ContactMessageResponseDTO(
        Long contactMessageId,
        String name,
        String email,
        String subject,
        String message,
        LocalDateTime createdAt) {
}
