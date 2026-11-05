package cl.duoc.appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.appointments.model.DoctorSchedule;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
}
