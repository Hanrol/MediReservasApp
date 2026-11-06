package cl.duoc.appointments.dto;

public record DoctorResponseDTO(Long doctorId, Long userId, String medicalLicenseNumber, boolean active) {
}
