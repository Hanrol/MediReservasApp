package cl.duoc.doctors.dto;

import java.util.List;

public record PublicDoctorDirectoryDTO(
        Long doctorId,
        String firstName,
        String lastName,
        String medicalLicenseNumber,
        List<PublicDoctorSpecialtyDTO> specialties
) {}
