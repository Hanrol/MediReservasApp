package cl.duoc.doctors.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record DoctorOnboardingRequestDTO(
        @NotBlank(message = "El número de registro profesional es obligatorio")
        @Size(max = 50, message = "El número de registro no puede superar 50 caracteres")
        String medicalLicenseNumber,
        @NotEmpty(message = "Selecciona al menos una especialidad")
        List<Long> specialtyIds) {
}
