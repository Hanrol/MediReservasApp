package cl.duoc.doctors.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.doctors.model.Doctors;

public interface DoctorsRepository extends JpaRepository<Doctors, Long> {
    boolean existsByUserId(Long userId);

    java.util.Optional<Doctors> findByUserId(Long userId);

    boolean existsByMedicalLicenseNumber(String medicalLicenseNumber);
}
