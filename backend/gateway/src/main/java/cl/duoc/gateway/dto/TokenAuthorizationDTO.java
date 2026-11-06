package cl.duoc.gateway.dto;

import java.util.List;

public record TokenAuthorizationDTO(String email, List<String> roles) {
}
