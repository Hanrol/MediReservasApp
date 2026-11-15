package cl.duoc.users.dto;

import java.util.List;

public record AuthRegistrationResponseDTO(
        Long authUserId,
        String email,
        String token,
        List<String> roles) {
}
