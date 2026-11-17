package cl.duoc.appointments.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import cl.duoc.appointments.dto.PublicScheduleSlotDTO;
import cl.duoc.appointments.service.ScheduleSlotService;

class PublicScheduleSlotControllerTest {
    private MockMvc mockMvc;
    private ScheduleSlotService scheduleSlotService;

    @BeforeEach
    void setUp() {
        scheduleSlotService = org.mockito.Mockito.mock(ScheduleSlotService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new ScheduleSlotController(scheduleSlotService)).build();
    }

    @Test
    void getPublicAvailabilityReturnsOnlyScheduleDetails() throws Exception {
        when(scheduleSlotService.findPublicAvailability(7L)).thenReturn(List.of(
                new PublicScheduleSlotDTO(15L, 7L, LocalDate.of(2026, 11, 20),
                        LocalTime.of(10, 30), LocalTime.of(11, 0))));

        mockMvc.perform(get("/api/v3/schedule-slots/public").param("doctorId", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].scheduleSlotId").value(15L))
                .andExpect(jsonPath("$.data[0].slotDate").value("2026-11-20"))
                .andExpect(jsonPath("$.data[0].startTime").value("10:30:00"))
                .andExpect(jsonPath("$.data[0].appointmentId").doesNotExist());
    }
}
