package cl.duoc.appointments.controller;

import cl.duoc.appointments.dto.AppointmentCreateRequestDTO;
import cl.duoc.appointments.dto.AppointmentResponseDTO;
import cl.duoc.appointments.enums.AppointmentStatus;
import cl.duoc.appointments.exception.GlobalExceptionHandler;
import cl.duoc.appointments.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


class AppointmentControllerStandaloneTest {

    private MockMvc mockMvc;
    private AppointmentService appointmentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private AppointmentCreateRequestDTO buildRequest(Long patientId) {
        AppointmentCreateRequestDTO dto = new AppointmentCreateRequestDTO();
        dto.setPatientUserId(patientId);
        dto.setDoctorId(2L);
        dto.setSpecialtyId(3L);
        dto.setScheduleSlotId(4L);
        dto.setReason("Consulta general");
        return dto;
    }

    private AppointmentResponseDTO responseDTO() {
        return AppointmentResponseDTO.builder()
                .appointmentId(10L)
                .patientUserId(1L)
                .doctorId(2L)
                .specialtyId(3L)
                .scheduleSlotId(4L)
                .appointmentStatus(AppointmentStatus.PENDING)
                .reason("Consulta general")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @BeforeEach
    void setup() {
        appointmentService = Mockito.mock(AppointmentService.class);
        AppointmentController appointmentController = new AppointmentController(appointmentService);
        mockMvc = MockMvcBuilders.standaloneSetup(appointmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createAppointment_returns201() throws Exception {
        Mockito.when(appointmentService.createAppointment(Mockito.any(), Mockito.anyString(), Mockito.anySet())).thenReturn(responseDTO());

        mockMvc.perform(post("/api/v3/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Authenticated-Email", "patient@test.cl")
                        .header("X-Authenticated-Roles", "PATIENT")
                        .content(objectMapper.writeValueAsString(buildRequest(1L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.appointmentId").value(10))
                .andExpect(jsonPath("$.data.appointmentStatus").value("PENDING"));
    }

    @Test
    void createAppointment_whenUserNotFound_returns404() throws Exception {
        Mockito.when(appointmentService.createAppointment(Mockito.any(), Mockito.anyString(), Mockito.anySet()))
                .thenThrow(new RuntimeException("Usuario no encontrado con ID: 99"));

        mockMvc.perform(post("/api/v3/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Authenticated-Email", "patient@test.cl")
                        .header("X-Authenticated-Roles", "PATIENT")
                        .content(objectMapper.writeValueAsString(buildRequest(99L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void existsAppointment_returns200WithBoolean() throws Exception {
        Mockito.when(appointmentService.existsAppointment(10L)).thenReturn(true);

        mockMvc.perform(get("/api/v3/appointments/10/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));
    }
}
