package cl.duoc.users.dto;

import java.util.List;

public record ProfileCompletionResponseDTO(
        String role,
        boolean complete,
        List<String> missingFields) {
}
