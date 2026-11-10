package cl.duoc.appointments.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record ScheduleSlotResponse(
    Long scheduleSlotId,
    Long doctorId,
    
    @JsonFormat(pattern = "yyyy-MM-dd") 
    LocalDate slotDate,
    
    @JsonFormat(pattern = "HH:mm:ss") 
    LocalTime startTime,
    
    @JsonFormat(pattern = "HH:mm:ss") 
    LocalTime endTime,
    
    String slotStatus,
    Long appointmentId,
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt
) {}