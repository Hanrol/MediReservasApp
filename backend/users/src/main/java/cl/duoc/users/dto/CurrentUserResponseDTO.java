package cl.duoc.users.dto;

import java.time.LocalDate;

public record CurrentUserResponseDTO(
        Long userId,
        Long authUserId,
        String run,
        String email,
        boolean active,
        String firstName,
        String lastName,
        String phone,
        LocalDate birthDate,
        String address) {
}
