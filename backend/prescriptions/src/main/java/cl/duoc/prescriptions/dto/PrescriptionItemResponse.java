package cl.duoc.prescriptions.dto;

public record PrescriptionItemResponse(
    Long prescriptionItemId,
    PrescriptionResponse prescription,
    String medicineName,
    String dosage,
    String frequency,
    String duration,
    String instructions
) {}