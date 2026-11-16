package cl.duoc.appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.model.SlotStatus;
import java.time.LocalDate;
import java.util.List;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {
    List<ScheduleSlot> findByDoctorIdAndSlotStatusAndAppointmentIdIsNullAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
            Long doctorId, SlotStatus slotStatus, LocalDate slotDate);
}
