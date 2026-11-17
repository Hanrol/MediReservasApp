package cl.duoc.doctors.dto;

public record UserProfileInternalResponseDTO(
        Long userProfileId,
        Long userId,
        String firstName,
        String lastName
) {}
