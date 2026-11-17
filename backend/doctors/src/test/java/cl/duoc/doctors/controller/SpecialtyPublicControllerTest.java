package cl.duoc.doctors.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import cl.duoc.doctors.dto.SpecialtyResponseDTO;
import cl.duoc.doctors.service.SpecialtyService;

class SpecialtyPublicControllerTest {
    private MockMvc mockMvc;
    private SpecialtyService specialtyService;

    @BeforeEach
    void setUp() {
        specialtyService = org.mockito.Mockito.mock(SpecialtyService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new SpecialtyController(specialtyService)).build();
    }

    @Test
    void getActiveSpecialtiesReturnsAllActiveCatalogItems() throws Exception {
        when(specialtyService.getActiveSpecialties()).thenReturn(List.of(
                new SpecialtyResponseDTO(2L, "Cardiología", "Corazón", true, null),
                new SpecialtyResponseDTO(8L, "Dermatología", "Piel", true, null)));

        mockMvc.perform(get("/api/v3/specialties/public/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[1].specialtyName").value("Dermatología"));
    }
}
