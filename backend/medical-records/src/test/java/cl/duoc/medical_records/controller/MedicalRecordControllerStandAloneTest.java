package cl.duoc.medical_records.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import cl.duoc.medical_records.dto.DiagnosisResponseDTO;
import cl.duoc.medical_records.dto.MedicalRecordDetailResponseDTO;
import cl.duoc.medical_records.dto.MedicalVisitDetailReponseDTO;
import cl.duoc.medical_records.dto.VitalSignResponseDTO;
import cl.duoc.medical_records.exception.GlobalExceptionHandler;
import cl.duoc.medical_records.model.MedicalRecord;
import cl.duoc.medical_records.service.MedicalRecordService;

public class MedicalRecordControllerStandAloneTest {

    private MockMvc mockMvc;
    private MedicalRecordService medicalRecordService;

    @BeforeEach
    void setup() {
        medicalRecordService = Mockito.mock(MedicalRecordService.class);
        MedicalRecordController medicalRecordController = new MedicalRecordController(medicalRecordService);
        mockMvc = MockMvcBuilders.standaloneSetup(medicalRecordController).setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void testNotFound() throws Exception {
        Long nonExistentId = 999L;

        Mockito.when(medicalRecordService.findByPatientId(nonExistentId))
               .thenThrow(new RuntimeException("Ficha médica no encontrada"));
        
        mockMvc.perform(get("/api/v3/medical-records/{id}", nonExistentId))
               .andExpect(status().isNotFound());
            }

    @Test
    void testFound() throws Exception {
        Long existingId = 1L;

        // Construir datos de prueba
        List<DiagnosisResponseDTO> diagnoses = new ArrayList<>();
        diagnoses.add(new DiagnosisResponseDTO(1L, 1L, "DESCRIPCION", "DIAGNOSTICO"));

        List<VitalSignResponseDTO> vitalSigns = new ArrayList<>();
        vitalSigns.add(new VitalSignResponseDTO(1L, 1L, BigDecimal.valueOf(36.5), "120/80", 70, BigDecimal.valueOf(70), BigDecimal.valueOf(170), LocalDateTime.now()));

        MedicalVisitDetailReponseDTO visit = new MedicalVisitDetailReponseDTO(
            1L, 1L, 1L, LocalDateTime.now(),
            "RAZON", "OBSERVACION", "TRATAMIENTO",
            LocalDateTime.now(), diagnoses, vitalSigns
        );

        List<MedicalVisitDetailReponseDTO> visits = new ArrayList<>();
        visits.add(visit);

        MedicalRecordDetailResponseDTO dto = new MedicalRecordDetailResponseDTO(
            1L, 1L, true, LocalDateTime.now(), visits
        );

        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setId(existingId);

        Mockito.when(medicalRecordService.findByMedicalRecordId(existingId)).thenReturn(dto);
        Mockito.when(medicalRecordService.findMedicalRecordEntityById(existingId)).thenReturn(medicalRecord);


        mockMvc.perform(get("/api/v3/medical-records/{id}", existingId))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.code").value(200))
               .andExpect(jsonPath("$.message").value("Registro médico encontrado")); // Ajusta según el controlador    }
    }
}