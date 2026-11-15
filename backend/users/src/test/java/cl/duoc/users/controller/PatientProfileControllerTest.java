package cl.duoc.users.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

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

import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.PatientProfileResponseDTO;
import cl.duoc.users.dto.UpdatePatientProfileRequestDTO;
import cl.duoc.users.service.PatientProfileService;

@ExtendWith(MockitoExtension.class)
class PatientProfileControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private PatientProfileService patientProfileService;

    @InjectMocks
    private PatientProfileController patientProfileController;

    private PatientProfileResponseDTO patientProfileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(patientProfileController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        patientProfileResponse = new PatientProfileResponseDTO(
                1L,
                1L,
                "Fonasa",
                "María Pérez",
                "912345678",
                "O+",
                "Ninguna",
                new BigDecimal("75.50"));
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createPatientProfile_deberiaRetornar201() throws Exception {
        CreatePatientProfileRequestDTO request = new CreatePatientProfileRequestDTO(
                1L,
                "Fonasa",
                "María Pérez",
                "912345678",
                "O+",
                "Ninguna",
                new BigDecimal("75.50"));

        when(patientProfileService.createPatientProfile(
                any(CreatePatientProfileRequestDTO.class)))
                .thenReturn(patientProfileResponse);

        mockMvc.perform(post("/api/v3/patient-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de paciente creado correctamente"))
                .andExpect(jsonPath("$.data.patientProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.healthInsurance")
                        .value("Fonasa"))
                .andExpect(jsonPath("$.data.emergencyContactName")
                        .value("María Pérez"))
                .andExpect(jsonPath("$.data.emergencyContactPhone")
                        .value("912345678"))
                .andExpect(jsonPath("$.data.bloodType")
                        .value("O+"))
                .andExpect(jsonPath("$.data.allergies")
                        .value("Ninguna"))
                .andExpect(jsonPath("$.data.weight")
                        .value(75.50));

        verify(patientProfileService)
                .createPatientProfile(any(CreatePatientProfileRequestDTO.class));
    }

    @Test
    void createPatientProfile_deberiaRetornar400CuandoUserIdVieneNull()
            throws Exception {

        String json = """
                {
                    "userId": null,
                    "healthInsurance": "Fonasa",
                    "emergencyContactName": "María Pérez",
                    "emergencyContactPhone": "912345678",
                    "bloodType": "O+",
                    "allergies": "Ninguna",
                    "weight": 75.50
                }
                """;

        mockMvc.perform(post("/api/v3/patient-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getAllPatientProfiles_deberiaRetornarLista() throws Exception {
        when(patientProfileService.getAllPatientProfiles())
                .thenReturn(List.of(patientProfileResponse));

        mockMvc.perform(get("/api/v3/patient-profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfiles de paciente obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].patientProfileId").value(1))
                .andExpect(jsonPath("$.data[0].healthInsurance")
                        .value("Fonasa"));

        verify(patientProfileService)
                .getAllPatientProfiles();
    }

    @Test
    void getPatientProfileById_deberiaRetornarPerfilPaciente()
            throws Exception {

        when(patientProfileService.getPatientProfileById(1L))
                .thenReturn(patientProfileResponse);

        mockMvc.perform(get("/api/v3/patient-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de paciente obtenido correctamente"))
                .andExpect(jsonPath("$.data.patientProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.bloodType")
                        .value("O+"));

        verify(patientProfileService)
                .getPatientProfileById(1L);
    }

    @Test
    void getPatientProfileByUserId_deberiaRetornarPerfilPaciente()
            throws Exception {

        when(patientProfileService.getPatientProfileByUserId(1L, "paciente@test.cl"))
                .thenReturn(patientProfileResponse);

        mockMvc.perform(get("/api/v3/patient-profiles/user/1").header("X-Authenticated-Email", "paciente@test.cl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de paciente obtenido correctamente por usuario"))
                .andExpect(jsonPath("$.data.patientProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1));

        verify(patientProfileService)
                .getPatientProfileByUserId(1L, "paciente@test.cl");
    }

    @Test
    void existsByUserId_deberiaRetornarTrue() throws Exception {
        when(patientProfileService.existsByUserId(1L, "paciente@test.cl"))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/patient-profiles/user/1/exists").header("X-Authenticated-Email", "paciente@test.cl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(patientProfileService)
                .existsByUserId(1L, "paciente@test.cl");
    }

    @Test
    void existsByUserIdForInternalService_noRequiereEmailAutenticado() throws Exception {
        when(patientProfileService.existsByUserId(1L)).thenReturn(false);

        mockMvc.perform(get("/api/v3/patient-profiles/internal/user/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(false));

        verify(patientProfileService).existsByUserId(1L);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updatePatientProfile_deberiaRetornar200() throws Exception {
        UpdatePatientProfileRequestDTO request = new UpdatePatientProfileRequestDTO(
                "Isapre",
                "Carlos Pérez",
                "987654321",
                "A+",
                "Penicilina",
                new BigDecimal("80.25"));

        PatientProfileResponseDTO updatedResponse = new PatientProfileResponseDTO(
                1L,
                1L,
                "Isapre",
                "Carlos Pérez",
                "987654321",
                "A+",
                "Penicilina",
                new BigDecimal("80.25"));

        when(patientProfileService.updatePatientProfile(
                any(Long.class),
                any(UpdatePatientProfileRequestDTO.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v3/patient-profiles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de paciente actualizado correctamente"))
                .andExpect(jsonPath("$.data.patientProfileId").value(1))
                .andExpect(jsonPath("$.data.healthInsurance")
                        .value("Isapre"))
                .andExpect(jsonPath("$.data.emergencyContactName")
                        .value("Carlos Pérez"))
                .andExpect(jsonPath("$.data.emergencyContactPhone")
                        .value("987654321"))
                .andExpect(jsonPath("$.data.bloodType")
                        .value("A+"))
                .andExpect(jsonPath("$.data.allergies")
                        .value("Penicilina"))
                .andExpect(jsonPath("$.data.weight")
                        .value(80.25));

        verify(patientProfileService)
                .updatePatientProfile(
                        any(Long.class),
                        any(UpdatePatientProfileRequestDTO.class));
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Test
    void deletePatientProfile_deberiaRetornar200() throws Exception {
        mockMvc.perform(delete("/api/v3/patient-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de paciente eliminado correctamente"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(patientProfileService)
                .deletePatientProfile(1L);
    }
}
