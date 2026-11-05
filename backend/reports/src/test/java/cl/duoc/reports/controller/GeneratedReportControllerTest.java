package cl.duoc.reports.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import cl.duoc.reports.dto.GeneratedReportResponseDTO;
import cl.duoc.reports.service.GeneratedReportService;

public class GeneratedReportControllerTest {
    private MockMvc mockMvc;
    private GeneratedReportService generatedReportService;

    @BeforeEach
    void setup()
    {
        generatedReportService = Mockito.mock(GeneratedReportService.class);
        GeneratedReportController generatedReportController = new GeneratedReportController(generatedReportService);
        mockMvc = MockMvcBuilders.standaloneSetup(generatedReportController).build();
    }

    @Test
    void testListAll() throws Exception
    {
        GeneratedReportResponseDTO dto = new GeneratedReportResponseDTO(1L, 1L, 1L, "TIPO DEL SISTEMA", LocalDateTime.now(), "FORMATO DEL SISTEMA", "PATH DEL SISTEMA", "ESTADO DEL SISTEMA");
        List<GeneratedReportResponseDTO> dtos = new ArrayList<>();
        dtos.add(dto);
        Mockito
            .when(generatedReportService.listAll())
            .thenReturn(dtos);

        mockMvc.perform(get("/api/v1/generated-reports"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].generatedReportId").value(1L));
    }
}
