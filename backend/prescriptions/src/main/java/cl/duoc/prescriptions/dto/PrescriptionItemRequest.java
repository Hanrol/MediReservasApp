package cl.duoc.prescriptions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemRequest {

    @NotNull
    private Long prescriptionId;

    @NotBlank
    @Size(max = 120)
    private String medicineName;

    @NotBlank
    @Size(max = 100)
    private String dosage;

    @NotBlank
    @Size(max = 100)
    private String frequency;

    @NotBlank
    @Size(max = 100)
    private String duration;

    @Size(max = 255)
    private String instructions;
}