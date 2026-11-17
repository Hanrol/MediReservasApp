package cl.duoc.users.dto;

import jakarta.validation.constraints.NotNull;

public record SetUserStatusRequestDTO(@NotNull Boolean active) {
}
