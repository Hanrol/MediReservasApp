package cl.duoc.appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.appointments.model.ScheduleSlot;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {
}