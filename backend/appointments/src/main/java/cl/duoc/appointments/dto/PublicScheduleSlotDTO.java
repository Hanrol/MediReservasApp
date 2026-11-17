package cl.duoc.appointments.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record PublicScheduleSlotDTO(
        Long scheduleSlotId,
        Long doctorId,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate slotDate,
        @JsonFormat(pattern = "HH:mm:ss") LocalTime startTime,
        @JsonFormat(pattern = "HH:mm:ss") LocalTime endTime
) {}
