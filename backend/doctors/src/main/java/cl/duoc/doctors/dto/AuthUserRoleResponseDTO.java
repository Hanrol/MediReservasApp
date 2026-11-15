package cl.duoc.doctors.dto;

import java.util.List;

public record AuthUserRoleResponseDTO(
        Long authUserId,
        String email,
        boolean enabled,
        List<String> roles) {
}
