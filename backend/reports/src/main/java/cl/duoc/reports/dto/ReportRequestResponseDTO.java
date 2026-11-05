package cl.duoc.reports.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
 

public record ReportRequestResponseDTO
(
    Long reportRquestId,
    String reportType,
    Long requestedByUserId,
    LocalDate startDate,
    LocalDate endDate,
    String requestStatus,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt
)
{}
