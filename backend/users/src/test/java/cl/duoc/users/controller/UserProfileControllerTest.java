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

import java.time.LocalDate;
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

import cl.duoc.users.dto.CreateUserProfileRequestDTO;
import cl.duoc.users.dto.UpdateUserProfileRequestDTO;
import cl.duoc.users.dto.UserProfileResponseDTO;
import cl.duoc.users.service.UserProfileService;

@ExtendWith(MockitoExtension.class)
class UserProfileControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserProfileController userProfileController;

    private UserProfileResponseDTO userProfileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(userProfileController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        userProfileResponse = new UserProfileResponseDTO(
                1L,
                1L,
                "Juan",
                "Pérez",
                "912345678",
                LocalDate.of(2000, 1, 15),
                "Av. Siempre Viva 123");
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createUserProfile_deberiaRetornar201() throws Exception {
        CreateUserProfileRequestDTO request = new CreateUserProfileRequestDTO(
                1L,
                "Juan",
                "Pérez",
                "912345678",
                LocalDate.of(2000, 1, 15),
                "Av. Siempre Viva 123");

        when(userProfileService.createUserProfile(any(CreateUserProfileRequestDTO.class)))
                .thenReturn(userProfileResponse);

        mockMvc.perform(post("/api/v3/user-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Perfil general creado correctamente"))
                .andExpect(jsonPath("$.data.userProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.firstName")
                        .value("Juan"))
                .andExpect(jsonPath("$.data.lastName")
                        .value("Pérez"))
                .andExpect(jsonPath("$.data.phone")
                        .value("912345678"))
                .andExpect(jsonPath("$.data.address")
                        .value("Av. Siempre Viva 123"));

        verify(userProfileService)
                .createUserProfile(any(CreateUserProfileRequestDTO.class));
    }

    @Test
    void createUserProfile_deberiaRetornar400CuandoUserIdVieneNull()
            throws Exception {

        String json = """
                {
                    "userId": null,
                    "firstName": "Juan",
                    "lastName": "Pérez",
                    "phone": "912345678",
                    "birthDate": "2000-01-15",
                    "address": "Av. Siempre Viva 123"
                }
                """;

        mockMvc.perform(post("/api/v3/user-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUserProfile_deberiaRetornar400CuandoNombreVieneVacio()
            throws Exception {

        String json = """
                {
                    "userId": 1,
                    "firstName": "",
                    "lastName": "Pérez",
                    "phone": "912345678",
                    "birthDate": "2000-01-15",
                    "address": "Av. Siempre Viva 123"
                }
                """;

        mockMvc.perform(post("/api/v3/user-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUserProfile_deberiaRetornar400CuandoFechaNacimientoEsFutura()
            throws Exception {

        String json = """
                {
                    "userId": 1,
                    "firstName": "Juan",
                    "lastName": "Pérez",
                    "phone": "912345678",
                    "birthDate": "2099-01-15",
                    "address": "Av. Siempre Viva 123"
                }
                """;

        mockMvc.perform(post("/api/v3/user-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getProfileByUserId_deberiaRetornarPerfilGeneral() throws Exception {
        when(userProfileService.getProfileByUserId(1L))
                .thenReturn(userProfileResponse);

        mockMvc.perform(get("/api/v3/user-profiles/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil general obtenido correctamente"))
                .andExpect(jsonPath("$.data.userProfileId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.firstName")
                        .value("Juan"));

        verify(userProfileService)
                .getProfileByUserId(1L);
    }

    @Test
    void getAllProfiles_deberiaRetornarLista() throws Exception {
        when(userProfileService.getAllProfiles())
                .thenReturn(List.of(userProfileResponse));

        mockMvc.perform(get("/api/v3/user-profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfiles generales obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].userProfileId").value(1))
                .andExpect(jsonPath("$.data[0].firstName")
                        .value("Juan"));

        verify(userProfileService)
                .getAllProfiles();
    }

    @Test
    void getProfileById_deberiaRetornarPerfilGeneral() throws Exception {
        when(userProfileService.getProfileById(1L))
                .thenReturn(userProfileResponse);

        mockMvc.perform(get("/api/v3/user-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil general obtenido correctamente"))
                .andExpect(jsonPath("$.data.userProfileId").value(1))
                .andExpect(jsonPath("$.data.firstName")
                        .value("Juan"));

        verify(userProfileService)
                .getProfileById(1L);
    }

    @Test
    void existsByUserId_deberiaRetornarTrue() throws Exception {
        when(userProfileService.existsByUserId(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/user-profiles/user/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(userProfileService)
                .existsByUserId(1L);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateUserProfile_deberiaRetornar200() throws Exception {
        UpdateUserProfileRequestDTO request = new UpdateUserProfileRequestDTO(
                "Pedro",
                "González",
                "987654321",
                LocalDate.of(1998, 5, 20),
                "Nueva dirección 456");

        UserProfileResponseDTO updatedResponse = new UserProfileResponseDTO(
                1L,
                1L,
                "Pedro",
                "González",
                "987654321",
                LocalDate.of(1998, 5, 20),
                "Nueva dirección 456");

        when(userProfileService.updateUserProfile(
                any(Long.class),
                any(UpdateUserProfileRequestDTO.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v3/user-profiles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil general actualizado correctamente"))
                .andExpect(jsonPath("$.data.userProfileId").value(1))
                .andExpect(jsonPath("$.data.firstName")
                        .value("Pedro"))
                .andExpect(jsonPath("$.data.lastName")
                        .value("González"))
                .andExpect(jsonPath("$.data.phone")
                        .value("987654321"))
                .andExpect(jsonPath("$.data.address")
                        .value("Nueva dirección 456"));

        verify(userProfileService)
                .updateUserProfile(
                        any(Long.class),
                        any(UpdateUserProfileRequestDTO.class));
    }

    @Test
    void updateUserProfile_deberiaRetornar400CuandoApellidoVieneVacio()
            throws Exception {

        String json = """
                {
                    "firstName": "Pedro",
                    "lastName": "",
                    "phone": "987654321",
                    "birthDate": "1998-05-20",
                    "address": "Nueva dirección 456"
                }
                """;

        mockMvc.perform(put("/api/v3/user-profiles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateUserProfile_deberiaRetornar400CuandoFechaNacimientoEsFutura()
            throws Exception {

        String json = """
                {
                    "firstName": "Pedro",
                    "lastName": "González",
                    "phone": "987654321",
                    "birthDate": "2099-05-20",
                    "address": "Nueva dirección 456"
                }
                """;

        mockMvc.perform(put("/api/v3/user-profiles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Test
    void deleteUserProfile_deberiaRetornar200() throws Exception {
        mockMvc.perform(delete("/api/v3/user-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Perfil general eliminado correctamente"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(userProfileService)
                .deleteUserProfile(1L);
    }
}