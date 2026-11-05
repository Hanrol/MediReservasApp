package cl.duoc.appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.appointments.model.DoctorTimeOff;

public interface DoctorTimeOffRepository extends JpaRepository<DoctorTimeOff, Long> {
}
