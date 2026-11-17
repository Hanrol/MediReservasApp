package cl.duoc.doctors.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.doctors.model.Specialty;
import java.util.List;

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    List<Specialty> findByActiveTrueOrderBySpecialtyNameAsc();

    Optional<Specialty> findBySpecialtyName(String specialtyName);

    boolean existsBySpecialtyName(String specialtyName);

    boolean existsBySpecialtyIdAndActiveTrue(Long specialtyId);
}
