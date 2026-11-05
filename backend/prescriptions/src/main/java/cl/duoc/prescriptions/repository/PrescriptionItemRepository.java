package cl.duoc.prescriptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.prescriptions.model.PrescriptionItem;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {}