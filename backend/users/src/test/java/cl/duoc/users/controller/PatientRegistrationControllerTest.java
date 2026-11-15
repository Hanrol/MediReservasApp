package cl.duoc.users.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.duoc.users.dto.PatientRegistrationRequestDTO;
import cl.duoc.users.dto.PatientRegistrationResponseDTO;
import cl.duoc.users.service.PatientRegistrationService;

@ExtendWith(MockitoExtension.class)
class PatientRegistrationControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private PatientRegistrationService patientRegistrationService;

    @InjectMocks
    private PatientRegistrationController patientRegistrationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientRegistrationController).build();
        objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    @Test
    void registerPatient_returnsCreatedResponseWithoutAcceptingAClientRole() throws Exception {
        PatientRegistrationRequestDTO request = new PatientRegistrationRequestDTO(
                "12345678-5", "Ana", "Pérez", LocalDate.of(1990, 5, 10),
                "912345678", "Santiago", "ana@example.test", "clave-segura", true);
        when(patientRegistrationService.register(any(PatientRegistrationRequestDTO.class)))
                .thenReturn(new PatientRegistrationResponseDTO(7L, "ana@example.test", "Ana", "Pérez"));

        mockMvc.perform(post("/api/v3/patient-registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.userId").value(7))
                .andExpect(jsonPath("$.data.email").value("ana@example.test"))
                .andExpect(jsonPath("$.data.role").doesNotExist());

        verify(patientRegistrationService).register(any(PatientRegistrationRequestDTO.class));
    }

    @Test
    void registerPatient_requiresAcceptanceOfTerms() throws Exception {
        PatientRegistrationRequestDTO request = new PatientRegistrationRequestDTO(
                "12345678-5", "Ana", "Pérez", LocalDate.of(1990, 5, 10),
                "912345678", "Santiago", "ana@example.test", "clave-segura", false);

        mockMvc.perform(post("/api/v3/patient-registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(patientRegistrationService);
    }
}
