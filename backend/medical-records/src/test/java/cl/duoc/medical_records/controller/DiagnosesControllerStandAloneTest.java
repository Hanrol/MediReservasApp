package cl.duoc.medical_records.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import cl.duoc.medical_records.dto.DiagnosisResponseDTO;
import cl.duoc.medical_records.model.Diagnoses;
import cl.duoc.medical_records.model.MedicalVisit;
import cl.duoc.medical_records.service.DiagnosesService;

public class DiagnosesControllerStandAloneTest {

    private MockMvc mockMvc; //simula solicitud HTTP a los endpoints
    private DiagnosesService diagnosesService;
    
    @BeforeEach
    void setup()
    {
        diagnosesService = Mockito.mock(DiagnosesService.class);
        DiagnosesController diagnosesController = new DiagnosesController(diagnosesService);
        mockMvc = MockMvcBuilders.standaloneSetup(diagnosesController).build();
    }

    @Test
    void testNotFound() throws Exception
    {
        Long nonExistentId = 999L;

        Mockito
            .when(diagnosesService.findById(nonExistentId))
           .thenThrow(new RuntimeException("Diagnóstico no encontrado"));
        
        mockMvc
            .perform(get("/api/v3/diagnoses/{id}", nonExistentId))
            .andExpect(status().isNotFound());
            
    }

    @Test
    void testFound() throws Exception {
        Long existingId = 1L;
        DiagnosisResponseDTO dto = new DiagnosisResponseDTO(1L, 1L, "DIAG", "NOTE");
        MedicalVisit medicalVisit = new MedicalVisit();
        Diagnoses diagnoses = new Diagnoses(1L,medicalVisit,"DESCRIPCIÓN DEL SISTEMA","NOTAS DEL SISTEMA");
        Mockito.when(diagnosesService.findById(existingId)).thenReturn(dto);
        Mockito.when(diagnosesService.findDiagnosisEntityById(existingId)).thenReturn(diagnoses);

        mockMvc.perform(get("/api/v3/diagnoses/{id}", existingId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.medicalVisitId").value(1L));
    }
}
