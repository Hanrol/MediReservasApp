package cl.duoc.reports.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReportRequestDTO
(
    @NotBlank(message = "El tipo de reporte es obligatorio")
    @Size(max = 80, message = "El tipo de reporte no puede superar los 80 caracteres")
    String reportType,

    @NotNull(message = "El ID del usuario solicitante es obligatorio")
    Long requestByUserId,

    LocalDate startDAte,

    LocalDate endDate
) 
{}
