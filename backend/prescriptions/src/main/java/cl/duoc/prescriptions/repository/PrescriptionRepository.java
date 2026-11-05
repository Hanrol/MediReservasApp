package cl.duoc.prescriptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.prescriptions.model.Prescription;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {}