package cl.duoc.reports.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
 

public record GeneratedReportResponseDTO
(
    Long generatedReportId,
    Long reportRequestId,
    Long generatedByUserId,
    String reportType,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime generatedAt,
    String reportFormat,
    String filePath,
    String reportStatus
)
{}
