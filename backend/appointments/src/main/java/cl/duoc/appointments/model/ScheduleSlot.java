package cl.duoc.appointments.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "schedule_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleSlotId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status", nullable = false, length = 30)
    private SlotStatus slotStatus;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}