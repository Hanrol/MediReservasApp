package cl.duoc.auth.dto;

import java.util.List;

public record TokenAuthorizationDTO(String email, List<String> roles) {
}
