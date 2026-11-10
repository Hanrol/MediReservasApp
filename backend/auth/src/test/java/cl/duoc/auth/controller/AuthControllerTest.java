package cl.duoc.auth.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.duoc.auth.dto.AuthResponseDTO;
import cl.duoc.auth.dto.AuthUserResponseDTO;
import cl.duoc.auth.dto.LoginRequestDTO;
import cl.duoc.auth.dto.RegisterRequestDTO;
import cl.duoc.auth.dto.RoleResponseDTO;
import cl.duoc.auth.dto.TokenAuthorizationDTO;
import cl.duoc.auth.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Test
    void register_deberiaRetornar201() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "paciente@test.cl",
                "123456");

        AuthResponseDTO response = new AuthResponseDTO(
                1L,
                "paciente@test.cl",
                "jwt-token",
                List.of());

        when(authService.register(any(RegisterRequestDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v3/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Usuario registrado correctamente"))
                .andExpect(jsonPath("$.data.authUserId").value(1))
                .andExpect(jsonPath("$.data.email")
                        .value("paciente@test.cl"))
                .andExpect(jsonPath("$.data.token")
                        .value("jwt-token"))
                .andExpect(jsonPath("$.data.roles").isArray());

        verify(authService)
                .register(any(RegisterRequestDTO.class));
    }

    @Test
    void getTokenAuthorization_deberiaRetornarEmailYRolesVigentes() throws Exception {
        when(authService.getTokenAuthorization("jwt-token"))
                .thenReturn(new TokenAuthorizationDTO("paciente@test.cl", List.of("PATIENT")));

        mockMvc.perform(get("/api/v3/auth/authorization").param("token", "jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("paciente@test.cl"))
                .andExpect(jsonPath("$.data.roles[0]").value("PATIENT"));
    }

    @Test
    void register_deberiaRetornar400CuandoEmailNoEsValido()
            throws Exception {

        String json = """
                {
                    "email": "correo-invalido",
                    "password": "123456"
                }
                """;

        mockMvc.perform(post("/api/v3/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_deberiaRetornar400CuandoPasswordEsMuyCorta()
            throws Exception {

        String json = """
                {
                    "email": "paciente@test.cl",
                    "password": "123"
                }
                """;

        mockMvc.perform(post("/api/v3/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Test
    void login_deberiaRetornar200() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO(
                "paciente@test.cl",
                "123456");

        AuthResponseDTO response = new AuthResponseDTO(
                1L,
                "paciente@test.cl",
                "jwt-login",
                List.of("PATIENT"));

        when(authService.login(any(LoginRequestDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v3/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Inicio de sesión correcto"))
                .andExpect(jsonPath("$.data.authUserId").value(1))
                .andExpect(jsonPath("$.data.email")
                        .value("paciente@test.cl"))
                .andExpect(jsonPath("$.data.token")
                        .value("jwt-login"))
                .andExpect(jsonPath("$.data.roles[0]")
                        .value("PATIENT"));

        verify(authService)
                .login(any(LoginRequestDTO.class));
    }

    // =========================================================
    // USERS
    // =========================================================

    @Test
    void getUserById_deberiaRetornarUsuario() throws Exception {
        AuthUserResponseDTO response = new AuthUserResponseDTO(
                1L,
                "paciente@test.cl",
                true,
                LocalDateTime.of(2026, 6, 18, 12, 0),
                List.of("PATIENT"));

        when(authService.getUserById(1L))
                .thenReturn(response);

        mockMvc.perform(get("/api/v3/auth/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.authUserId").value(1))
                .andExpect(jsonPath("$.data.email")
                        .value("paciente@test.cl"))
                .andExpect(jsonPath("$.data.enabled").value(true))
                .andExpect(jsonPath("$.data.roles[0]")
                        .value("PATIENT"));

        verify(authService).getUserById(1L);
    }

    @Test
    void getAllUsers_deberiaRetornarLista() throws Exception {
        AuthUserResponseDTO user = new AuthUserResponseDTO(
                1L,
                "paciente@test.cl",
                true,
                LocalDateTime.of(2026, 6, 18, 12, 0),
                List.of("PATIENT"));

        when(authService.getAllUsers())
                .thenReturn(List.of(user));

        mockMvc.perform(get("/api/v3/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].email")
                        .value("paciente@test.cl"));

        verify(authService).getAllUsers();
    }

    @Test
    void existsById_deberiaRetornarTrue() throws Exception {
        when(authService.existsById(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/auth/users/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));

        verify(authService).existsById(1L);
    }

    @Test
    void disableUser_deberiaRetornarUsuarioDeshabilitado()
            throws Exception {

        AuthUserResponseDTO response = new AuthUserResponseDTO(
                1L,
                "paciente@test.cl",
                false,
                LocalDateTime.of(2026, 6, 18, 12, 0),
                List.of("PATIENT"));

        when(authService.disableUser(1L))
                .thenReturn(response);

        mockMvc.perform(
                patch("/api/v3/auth/users/1/disable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Usuario deshabilitado correctamente"))
                .andExpect(jsonPath("$.data.enabled").value(false));

        verify(authService).disableUser(1L);
    }

    // =========================================================
    // ROLES
    // =========================================================

    @Test
    void getAllRoles_deberiaRetornarLista() throws Exception {
        RoleResponseDTO role = new RoleResponseDTO(
                1L,
                "PATIENT",
                "Paciente del sistema",
                true);

        when(authService.getAllRoles())
                .thenReturn(List.of(role));

        mockMvc.perform(get("/api/v3/auth/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].roleId").value(1))
                .andExpect(jsonPath("$.data[0].roleName")
                        .value("PATIENT"))
                .andExpect(jsonPath("$.data[0].active")
                        .value(true));

        verify(authService).getAllRoles();
    }

    // =========================================================
    // TOKEN
    // =========================================================

    @Test
    void validateToken_deberiaRetornarTrue() throws Exception {
        when(authService.validateToken("token-valido"))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/auth/validate")
                .param("token", "token-valido"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Token validado correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(authService)
                .validateToken("token-valido");
    }

    @Test
    void extractEmailFromToken_deberiaRetornarEmail()
            throws Exception {

        when(authService.extractEmailFromToken("token-valido"))
                .thenReturn("paciente@test.cl");

        mockMvc.perform(get("/api/v3/auth/token/email")
                .param("token", "token-valido"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data")
                        .value("paciente@test.cl"));

        verify(authService)
                .extractEmailFromToken("token-valido");
    }
}
