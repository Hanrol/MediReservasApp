package cl.duoc.appointments.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record DoctorTimeOffResponse(
    Long doctorTimeOffId,
    Long doctorId,
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate startDate,
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate endDate,
    
    String reason,
    Boolean active,
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt
) {}