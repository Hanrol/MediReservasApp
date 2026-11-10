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

import cl.duoc.users.dto.CreateReceptionistProfileRequestDTO;
import cl.duoc.users.dto.ReceptionistProfileResponseDTO;
import cl.duoc.users.dto.UpdateReceptionistProfileRequestDTO;
import cl.duoc.users.service.ReceptionistProfileService;

@ExtendWith(MockitoExtension.class)
class ReceptionistProfileControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private ReceptionistProfileService receptionistProfileService;

    @InjectMocks
    private ReceptionistProfileController receptionistProfileController;

    private ReceptionistProfileResponseDTO receptionistProfileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(receptionistProfileController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        receptionistProfileResponse = new ReceptionistProfileResponseDTO(
                1L,
                1L,
                "Mañana",
                "Admisión");
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createReceptionistProfile_deberiaRetornar201() throws Exception {
        CreateReceptionistProfileRequestDTO request = new CreateReceptionistProfileRequestDTO(
                1L,
                "Mañana",
                "Admisión");

        when(receptionistProfileService.createReceptionistProfile(
                any(CreateReceptionistProfileRequestDTO.class)))
                .thenReturn(receptionistProfileResponse);

        mockMvc.perform(post("/api/v3/receptionist-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de recepcionista creado correctamente"))
                .andExpect(jsonPath("$.data.receptionistProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.shift")
                        .value("Mañana"))
                .andExpect(jsonPath("$.data.department")
                        .value("Admisión"));

        verify(receptionistProfileService)
                .createReceptionistProfile(
                        any(CreateReceptionistProfileRequestDTO.class));
    }

    @Test
    void createReceptionistProfile_deberiaRetornar400CuandoUserIdVieneNull()
            throws Exception {

        String json = """
                {
                    "userId": null,
                    "shift": "Mañana",
                    "department": "Admisión"
                }
                """;

        mockMvc.perform(post("/api/v3/receptionist-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReceptionistProfile_deberiaRetornar400CuandoShiftSuperaLargoMaximo()
            throws Exception {

        String json = """
                {
                    "userId": 1,
                    "shift": "Turno demasiado largo para superar los treinta caracteres",
                    "department": "Admisión"
                }
                """;

        mockMvc.perform(post("/api/v3/receptionist-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReceptionistProfile_deberiaRetornar400CuandoDepartmentSuperaLargoMaximo()
            throws Exception {

        String json = """
                {
                    "userId": 1,
                    "shift": "Mañana",
                    "department": "Departamento demasiado largo para superar el máximo de ochenta caracteres permitido en el DTO"
                }
                """;

        mockMvc.perform(post("/api/v3/receptionist-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getAllReceptionistProfiles_deberiaRetornarLista() throws Exception {
        when(receptionistProfileService.getAllReceptionistProfiles())
                .thenReturn(List.of(receptionistProfileResponse));

        mockMvc.perform(get("/api/v3/receptionist-profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfiles de recepcionista obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].receptionistProfileId").value(1))
                .andExpect(jsonPath("$.data[0].userId").value(1))
                .andExpect(jsonPath("$.data[0].shift")
                        .value("Mañana"))
                .andExpect(jsonPath("$.data[0].department")
                        .value("Admisión"));

        verify(receptionistProfileService)
                .getAllReceptionistProfiles();
    }

    @Test
    void getReceptionistProfileById_deberiaRetornarPerfilRecepcionista()
            throws Exception {

        when(receptionistProfileService.getReceptionistProfileById(1L))
                .thenReturn(receptionistProfileResponse);

        mockMvc.perform(get("/api/v3/receptionist-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de recepcionista obtenido correctamente"))
                .andExpect(jsonPath("$.data.receptionistProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.shift")
                        .value("Mañana"));

        verify(receptionistProfileService)
                .getReceptionistProfileById(1L);
    }

    @Test
    void getReceptionistProfileByUserId_deberiaRetornarPerfilRecepcionista()
            throws Exception {

        when(receptionistProfileService.getReceptionistProfileByUserId(1L))
                .thenReturn(receptionistProfileResponse);

        mockMvc.perform(get("/api/v3/receptionist-profiles/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de recepcionista obtenido correctamente por usuario"))
                .andExpect(jsonPath("$.data.receptionistProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1));

        verify(receptionistProfileService)
                .getReceptionistProfileByUserId(1L);
    }

    @Test
    void existsByUserId_deberiaRetornarTrue() throws Exception {
        when(receptionistProfileService.existsByUserId(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/receptionist-profiles/user/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(receptionistProfileService)
                .existsByUserId(1L);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateReceptionistProfile_deberiaRetornar200() throws Exception {
        UpdateReceptionistProfileRequestDTO request = new UpdateReceptionistProfileRequestDTO(
                "Tarde",
                "Atención al paciente");

        ReceptionistProfileResponseDTO updatedResponse = new ReceptionistProfileResponseDTO(
                1L,
                1L,
                "Tarde",
                "Atención al paciente");

        when(receptionistProfileService.updateReceptionistProfile(
                any(Long.class),
                any(UpdateReceptionistProfileRequestDTO.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v3/receptionist-profiles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de recepcionista actualizado correctamente"))
                .andExpect(jsonPath("$.data.receptionistProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.shift")
                        .value("Tarde"))
                .andExpect(jsonPath("$.data.department")
                        .value("Atención al paciente"));

        verify(receptionistProfileService)
                .updateReceptionistProfile(
                        any(Long.class),
                        any(UpdateReceptionistProfileRequestDTO.class));
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Test
    void deleteReceptionistProfile_deberiaRetornar200() throws Exception {
        mockMvc.perform(delete("/api/v3/receptionist-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de recepcionista eliminado correctamente"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(receptionistProfileService)
                .deleteReceptionistProfile(1L);
    }
}