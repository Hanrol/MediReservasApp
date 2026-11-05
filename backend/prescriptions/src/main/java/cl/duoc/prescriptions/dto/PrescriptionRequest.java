package cl.duoc.prescriptions.dto;

import cl.duoc.prescriptions.model.PrescriptionStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequest {

    @NotNull
    @Positive
    private Long medicalVisitId;

    @NotNull
    @Positive
    private Long patientUserId;

    @NotNull
    @Positive
    private Long doctorId;

    @NotNull
    private PrescriptionStatus prescriptionStatus;

    @NotNull
    @Size(max = 255)
    private String notes;
}
