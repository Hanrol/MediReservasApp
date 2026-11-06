package cl.duoc.schedule.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.duoc.schedule.dto.DoctorScheduleRequest;
import cl.duoc.schedule.dto.DoctorScheduleResponse;
import cl.duoc.schedule.model.DayOfWeek;
import cl.duoc.schedule.services.DoctorScheduleService;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private DoctorScheduleService doctorScheduleService;

    @BeforeEach
    void setup() {
        doctorScheduleService = Mockito.mock(DoctorScheduleService.class);
        DoctorScheduleController doctorScheduleController = new DoctorScheduleController(doctorScheduleService);
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Requerido para serializar LocalTime
        
        mockMvc = MockMvcBuilders
                .standaloneSetup(doctorScheduleController)
                .build();
    }

    @Test
    void createShouldReturnCreatedResponse() throws Exception {
        DoctorScheduleResponse response = new DoctorScheduleResponse(
                1L,
                10L,
                "LUNES",
                LocalTime.of(8, 0),
                LocalTime.of(12, 0),
                true
        );

        DoctorScheduleRequest request = new DoctorScheduleRequest(
                10L,
                DayOfWeek.LUNES,
                LocalTime.of(8, 0),
                LocalTime.of(12, 0),
                true
        );

        when(doctorScheduleService.create(any(DoctorScheduleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v3/doctor-schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.doctorScheduleId").value(1))
                .andExpect(jsonPath("$.data.doctorId").value(10))
                .andExpect(jsonPath("$.message").value("Horario creado"));
    }

    @Test
    void findByIdShouldReturnOkResponse() throws Exception {
        DoctorScheduleResponse response = new DoctorScheduleResponse(
                1L,
                20L,
                "VIERNES",
                LocalTime.of(14, 0),
                LocalTime.of(18, 0),
                false
        );

        when(doctorScheduleService.findById(eq(1L))).thenReturn(response);

        mockMvc.perform(get("/api/v3/doctor-schedules/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.doctorScheduleId").value(1))
                .andExpect(jsonPath("$.data.dayOfWeek").value("VIERNES"))
                .andExpect(jsonPath("$.message").value("Horario encontrado"));
    }
}