package cl.duoc.prescriptions.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record PrescriptionResponse(
    Long prescriptionId,
    Long medicalVisitId,
    Long patientUserId,
    Long doctorId,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime issuedAt,
    String prescriptionStatus,
    String notes
) {}