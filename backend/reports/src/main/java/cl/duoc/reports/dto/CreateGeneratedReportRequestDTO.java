package cl.duoc.reports.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateGeneratedReportRequestDTO
(
    Long reportRequestId,

    @NotNull(message = "El ID del usuario generador es obligatorio")
    Long generatedByUserID,

    @NotBlank(message = "El tipo de reporte es obligatorio")
    String reportType,

    @NotBlank(message = "El formato del reporte es obligatorio")
    String reportFormat,

    String filePath
)
{}
