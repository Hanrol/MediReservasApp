package cl.duoc.appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.model.SlotStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {
    boolean existsByDoctorIdAndSlotDateAndStartTimeLessThanAndEndTimeGreaterThan(
            Long doctorId, LocalDate slotDate, LocalTime endTime, LocalTime startTime);
    List<ScheduleSlot> findByDoctorIdAndSlotStatusAndAppointmentIdIsNullAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
            Long doctorId, SlotStatus slotStatus, LocalDate slotDate);
    List<ScheduleSlot> findByDoctorIdAndSlotStatusInAndAppointmentIdIsNullAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
            Long doctorId, List<SlotStatus> slotStatuses, LocalDate slotDate);
    List<ScheduleSlot> findByDoctorIdAndSlotDateBetween(Long doctorId, LocalDate from, LocalDate to);
    Optional<ScheduleSlot> findByDoctorIdAndSlotDateAndStartTime(Long doctorId, LocalDate slotDate,
            java.time.LocalTime startTime);
    void deleteByDoctorIdAndSlotDateBetweenAndSlotStatusAndAppointmentIdIsNull(Long doctorId,
            LocalDate from, LocalDate to, SlotStatus slotStatus);
}
