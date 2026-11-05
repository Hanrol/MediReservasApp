package cl.duoc.doctors.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record SpecialtyResponseDTO(

    Long specialtyId,
    String specialtyName,
    String description,
    boolean active,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt

) {}