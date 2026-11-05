package cl.duoc.prescriptions.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.duoc.prescriptions.dto.PrescriptionRequest;
import cl.duoc.prescriptions.dto.PrescriptionResponse;
import cl.duoc.prescriptions.model.PrescriptionStatus;
import cl.duoc.prescriptions.services.PrescriptionService;

@ExtendWith(MockitoExtension.class)
class PrescriptionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private PrescriptionService prescriptionService;

    @BeforeEach
    void setup() {
        prescriptionService = Mockito.mock(PrescriptionService.class);
        PrescriptionController prescriptionController = new PrescriptionController(prescriptionService);
        objectMapper = new ObjectMapper();
        
        mockMvc = MockMvcBuilders
                .standaloneSetup(prescriptionController)
                .build();
    }

    @Test
    void createShouldReturnCreatedResponse() throws Exception {
        PrescriptionResponse response = new PrescriptionResponse(
                1L,
                100L,
                200L,
                300L,
                null,
                "ACTIVO",
                "Tomar una al día"
        );

        PrescriptionRequest request = new PrescriptionRequest(
                100L,
                200L,
                300L,
                PrescriptionStatus.ACTIVO,
                "Tomar una al día"
        );

        when(prescriptionService.create(any(PrescriptionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/prescriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.prescriptionId").value(1))
                .andExpect(jsonPath("$.data.prescriptionStatus").value("ACTIVO"))
                .andExpect(jsonPath("$.message").value("Prescripción creada"));
    }

    @Test
    void findByIdShouldReturnOkResponse() throws Exception {
        PrescriptionResponse response = new PrescriptionResponse(
                1L,
                100L,
                200L,
                300L,
                null,
                "ACTIVO",
                "Tomar una al día"
        );

        when(prescriptionService.findById(eq(1L))).thenReturn(response);

        mockMvc.perform(get("/api/v1/prescriptions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.prescriptionId").value(1))
                .andExpect(jsonPath("$.data.prescriptionStatus").value("ACTIVO"))
                .andExpect(jsonPath("$.message").value("Prescripción encontrada"));
    }
}