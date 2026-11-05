package cl.duoc.reports.controller;

import java.time.LocalDateTime;
import java.time.LocalDate; 
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import cl.duoc.reports.dto.ReportRequestResponseDTO; 
import cl.duoc.reports.service.ReportRequestService;

public class ReportRequestControllerTest {
    private MockMvc mockMvc;
    private ReportRequestService reportRequestService; 

    @BeforeEach
    void setup()
    {
        reportRequestService = Mockito.mock(ReportRequestService.class);
        ReportRequestController reportRequestController = new ReportRequestController(reportRequestService);
        mockMvc = MockMvcBuilders.standaloneSetup(reportRequestController).build();
    }

    @Test
    void testListAll() throws Exception
    {
        ReportRequestResponseDTO dto = new ReportRequestResponseDTO(1L, "TIPO DEL SISTEMA", 1L, LocalDate.now(), LocalDate.now(), "ESTADO DEL SISTEMA", LocalDateTime.now());
        List<ReportRequestResponseDTO> dtos = new ArrayList<>();
        dtos.add(dto);
        Mockito
            .when(reportRequestService.listAll())
            .thenReturn(dtos);

        mockMvc.perform(get("/api/v1/reports-request"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].reportRquestId").value(1L));
    }
}
