package cl.duoc.users.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
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

import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.UpdateUserRequestDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.service.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserResponseDTO userResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(userController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        userResponse = new UserResponseDTO(
                1L,
                10L,
                "12345678-9",
                "paciente@test.cl",
                true,
                LocalDateTime.of(2026, 6, 18, 12, 0));
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createUser_deberiaRetornar201() throws Exception {
        CreateUserRequestDTO request = new CreateUserRequestDTO(
                "12345678-9",
                "paciente@test.cl");

        when(userService.createUser(any(CreateUserRequestDTO.class)))
                .thenReturn(userResponse);

        mockMvc.perform(post("/api/v3/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Usuario creado correctamente"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.authUserId").value(10))
                .andExpect(jsonPath("$.data.run")
                        .value("12345678-9"))
                .andExpect(jsonPath("$.data.email")
                        .value("paciente@test.cl"))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(userService)
                .createUser(any(CreateUserRequestDTO.class));
    }

    @Test
    void createUser_deberiaRetornar400CuandoRunVieneVacio()
            throws Exception {

        String json = """
                {
                    "run": "",
                    "email": "paciente@test.cl"
                }
                """;

        mockMvc.perform(post("/api/v3/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUser_deberiaRetornar400CuandoEmailNoEsValido()
            throws Exception {

        String json = """
                {
                    "run": "12345678-9",
                    "email": "correo-invalido"
                }
                """;

        mockMvc.perform(post("/api/v3/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getAllUsers_deberiaRetornarLista() throws Exception {
        when(userService.getAllUsers())
                .thenReturn(List.of(userResponse));

        mockMvc.perform(get("/api/v3/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuarios obtenidos correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].userId").value(1))
                .andExpect(jsonPath("$.data[0].authUserId").value(10))
                .andExpect(jsonPath("$.data[0].email")
                        .value("paciente@test.cl"));

        verify(userService)
                .getAllUsers();
    }

    @Test
    void getUserById_deberiaRetornarUsuario() throws Exception {
        when(userService.getUserById(1L))
                .thenReturn(userResponse);

        mockMvc.perform(get("/api/v3/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario obtenido correctamente"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.authUserId").value(10))
                .andExpect(jsonPath("$.data.run")
                        .value("12345678-9"))
                .andExpect(jsonPath("$.data.email")
                        .value("paciente@test.cl"));

        verify(userService)
                .getUserById(1L);
    }

    @Test
    void existsById_deberiaRetornarTrue() throws Exception {
        when(userService.existsById(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/users/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(userService)
                .existsById(1L);
    }

    @Test
    void getUserByRun_deberiaRetornarUsuario() throws Exception {
        when(userService.getUserByRun("12345678-9"))
                .thenReturn(userResponse);

        mockMvc.perform(get("/api/v3/users/run/12345678-9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario obtenido correctamente por RUN"))
                .andExpect(jsonPath("$.data.run")
                        .value("12345678-9"));

        verify(userService)
                .getUserByRun("12345678-9");
    }

    @Test
    void getUserByEmail_deberiaRetornarUsuario() throws Exception {
        when(userService.getUserByEmail("paciente@test.cl"))
                .thenReturn(userResponse);

        mockMvc.perform(get(
                "/api/v3/users/email/{email}",
                "paciente@test.cl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario obtenido correctamente por correo"))
                .andExpect(jsonPath("$.data.email")
                        .value("paciente@test.cl"));

        verify(userService)
                .getUserByEmail("paciente@test.cl");
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateUser_deberiaRetornar200() throws Exception {
        UpdateUserRequestDTO request = new UpdateUserRequestDTO(
                "98765432-1",
                "nuevo@test.cl");

        UserResponseDTO updatedResponse = new UserResponseDTO(
                1L,
                10L,
                "98765432-1",
                "nuevo@test.cl",
                true,
                LocalDateTime.of(2026, 6, 18, 12, 0));

        when(userService.updateUser(
                any(Long.class),
                any(UpdateUserRequestDTO.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v3/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario actualizado correctamente"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.run")
                        .value("98765432-1"))
                .andExpect(jsonPath("$.data.email")
                        .value("nuevo@test.cl"));

        verify(userService)
                .updateUser(
                        any(Long.class),
                        any(UpdateUserRequestDTO.class));
    }

    @Test
    void updateUser_deberiaRetornar400CuandoEmailNoEsValido()
            throws Exception {

        String json = """
                {
                    "run": "98765432-1",
                    "email": "correo-invalido"
                }
                """;

        mockMvc.perform(put("/api/v3/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    @Test
    void activateUser_deberiaRetornar200() throws Exception {
        when(userService.activateUser(1L))
                .thenReturn(userResponse);

        mockMvc.perform(patch("/api/v3/users/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario activado correctamente"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(userService)
                .activateUser(1L);
    }

    @Test
    void deactivateUser_deberiaRetornar200() throws Exception {
        UserResponseDTO inactiveResponse = new UserResponseDTO(
                1L,
                10L,
                "12345678-9",
                "paciente@test.cl",
                false,
                LocalDateTime.of(2026, 6, 18, 12, 0));

        when(userService.deactivateUser(1L))
                .thenReturn(inactiveResponse);

        mockMvc.perform(patch("/api/v3/users/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario desactivado correctamente"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.active").value(false));

        verify(userService)
                .deactivateUser(1L);
    }
}