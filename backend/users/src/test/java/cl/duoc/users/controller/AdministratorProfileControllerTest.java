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

import cl.duoc.users.dto.AdministratorProfileResponseDTO;
import cl.duoc.users.dto.CreateAdministratorProfileRequestDTO;
import cl.duoc.users.dto.UpdateAdministratorProfileRequestDTO;
import cl.duoc.users.service.AdministratorProfileService;

@ExtendWith(MockitoExtension.class)
class AdministratorProfileControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private AdministratorProfileService administratorProfileService;

    @InjectMocks
    private AdministratorProfileController administratorProfileController;

    private AdministratorProfileResponseDTO administratorProfileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(administratorProfileController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        administratorProfileResponse = new AdministratorProfileResponseDTO(
                1L,
                1L,
                "Administración",
                "Jefe de operaciones");
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createAdministratorProfile_deberiaRetornar201() throws Exception {
        CreateAdministratorProfileRequestDTO request = new CreateAdministratorProfileRequestDTO(
                1L,
                "Administración",
                "Jefe de operaciones");

        when(administratorProfileService.createAdministratorProfile(
                any(CreateAdministratorProfileRequestDTO.class)))
                .thenReturn(administratorProfileResponse);

        mockMvc.perform(post("/api/v3/administrator-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de administrador creado correctamente"))
                .andExpect(jsonPath("$.data.administratorProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.department")
                        .value("Administración"))
                .andExpect(jsonPath("$.data.positionName")
                        .value("Jefe de operaciones"));

        verify(administratorProfileService)
                .createAdministratorProfile(
                        any(CreateAdministratorProfileRequestDTO.class));
    }

    @Test
    void createAdministratorProfile_deberiaRetornar400CuandoUserIdVieneNull()
            throws Exception {

        String json = """
                {
                    "userId": null,
                    "department": "Administración",
                    "positionName": "Jefe de operaciones"
                }
                """;

        mockMvc.perform(post("/api/v3/administrator-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createAdministratorProfile_deberiaRetornar400CuandoDepartmentSuperaLargoMaximo()
            throws Exception {

        String json = """
                {
                    "userId": 1,
                    "department": "Departamento demasiado largo para superar el máximo de ochenta caracteres permitido en el DTO",
                    "positionName": "Jefe de operaciones"
                }
                """;

        mockMvc.perform(post("/api/v3/administrator-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createAdministratorProfile_deberiaRetornar400CuandoPositionNameSuperaLargoMaximo()
            throws Exception {

        String json = """
                {
                    "userId": 1,
                    "department": "Administración",
                    "positionName": "Cargo demasiado largo para superar el máximo de ochenta caracteres permitido en el DTO de administrador"
                }
                """;

        mockMvc.perform(post("/api/v3/administrator-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getAllAdministratorProfiles_deberiaRetornarLista() throws Exception {
        when(administratorProfileService.getAllAdministratorProfiles())
                .thenReturn(List.of(administratorProfileResponse));

        mockMvc.perform(get("/api/v3/administrator-profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfiles de administrador obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].administratorProfileId").value(1))
                .andExpect(jsonPath("$.data[0].userId").value(1))
                .andExpect(jsonPath("$.data[0].department")
                        .value("Administración"))
                .andExpect(jsonPath("$.data[0].positionName")
                        .value("Jefe de operaciones"));

        verify(administratorProfileService)
                .getAllAdministratorProfiles();
    }

    @Test
    void getAdministratorProfileById_deberiaRetornarPerfilAdministrador()
            throws Exception {

        when(administratorProfileService.getAdministratorProfileById(1L))
                .thenReturn(administratorProfileResponse);

        mockMvc.perform(get("/api/v3/administrator-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de administrador obtenido correctamente"))
                .andExpect(jsonPath("$.data.administratorProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.department")
                        .value("Administración"));

        verify(administratorProfileService)
                .getAdministratorProfileById(1L);
    }

    @Test
    void getAdministratorProfileByUserId_deberiaRetornarPerfilAdministrador()
            throws Exception {

        when(administratorProfileService.getAdministratorProfileByUserId(1L))
                .thenReturn(administratorProfileResponse);

        mockMvc.perform(get("/api/v3/administrator-profiles/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de administrador obtenido correctamente por usuario"))
                .andExpect(jsonPath("$.data.administratorProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1));

        verify(administratorProfileService)
                .getAdministratorProfileByUserId(1L);
    }

    @Test
    void existsByUserId_deberiaRetornarTrue() throws Exception {
        when(administratorProfileService.existsByUserId(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/administrator-profiles/user/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(administratorProfileService)
                .existsByUserId(1L);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateAdministratorProfile_deberiaRetornar200() throws Exception {
        UpdateAdministratorProfileRequestDTO request = new UpdateAdministratorProfileRequestDTO(
                "Dirección",
                "Administrador general");

        AdministratorProfileResponseDTO updatedResponse = new AdministratorProfileResponseDTO(
                1L,
                1L,
                "Dirección",
                "Administrador general");

        when(administratorProfileService.updateAdministratorProfile(
                any(Long.class),
                any(UpdateAdministratorProfileRequestDTO.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v3/administrator-profiles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de administrador actualizado correctamente"))
                .andExpect(jsonPath("$.data.administratorProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.department")
                        .value("Dirección"))
                .andExpect(jsonPath("$.data.positionName")
                        .value("Administrador general"));

        verify(administratorProfileService)
                .updateAdministratorProfile(
                        any(Long.class),
                        any(UpdateAdministratorProfileRequestDTO.class));
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Test
    void deleteAdministratorProfile_deberiaRetornar200() throws Exception {
        mockMvc.perform(delete("/api/v3/administrator-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil de administrador eliminado correctamente"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(administratorProfileService)
                .deleteAdministratorProfile(1L);
    }
}