package cl.duoc.auth.service;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.auth.dto.AuthResponseDTO;
import cl.duoc.auth.dto.AuthUserResponseDTO;
import cl.duoc.auth.dto.LoginRequestDTO;
import cl.duoc.auth.dto.RegisterRequestDTO;
import cl.duoc.auth.dto.TokenAuthorizationDTO;
import cl.duoc.auth.model.AuthUser;
import cl.duoc.auth.model.Role;
import cl.duoc.auth.repository.AuthUserRepository;
import cl.duoc.auth.repository.RoleRepository;
import cl.duoc.auth.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthUserRepository authUserRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private AuthUser authUser;
    private Role patientRole;

    @BeforeEach
    void setUp() {
        authUser = new AuthUser();
        authUser.setAuthUserId(1L);
        authUser.setEmail("paciente@test.cl");
        authUser.setPasswordHash("password-cifrada");
        authUser.setEnabled(true);
        authUser.setRoles(new HashSet<>());

        patientRole = new Role();
        patientRole.setRoleId(1L);
        patientRole.setRoleName("PATIENT");
        patientRole.setDescription("Paciente del sistema");
        patientRole.setActive(true);
        patientRole.setUsers(new HashSet<>());
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Test
    void register_deberiaCrearUsuarioCorrectamente() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "paciente@test.cl",
                "123456");

        when(authUserRepository.existsByEmail(request.email()))
                .thenReturn(false);

        when(passwordEncoder.encode(request.password()))
                .thenReturn("password-cifrada");

        when(authUserRepository.save(any(AuthUser.class)))
                .thenAnswer(invocation -> {
                    AuthUser savedUser = invocation.getArgument(0);
                    savedUser.setAuthUserId(1L);
                    return savedUser;
                });

        when(jwtUtil.generateToken(request.email()))
                .thenReturn("jwt-de-prueba");

        AuthResponseDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals(1L, response.authUserId());
        assertEquals("paciente@test.cl", response.email());
        assertEquals("jwt-de-prueba", response.token());
        assertTrue(response.roles().isEmpty());

        ArgumentCaptor<AuthUser> captor = ArgumentCaptor.forClass(AuthUser.class);

        verify(authUserRepository).save(captor.capture());

        AuthUser savedUser = captor.getValue();

        assertEquals("paciente@test.cl", savedUser.getEmail());
        assertEquals("password-cifrada", savedUser.getPasswordHash());
        assertTrue(savedUser.isEnabled());

        verify(passwordEncoder).encode("123456");
        verify(jwtUtil).generateToken("paciente@test.cl");
    }

    @Test
    void getTokenAuthorization_deberiaValidarTokenYRetornarRolesVigentes() {
        authUser.getRoles().add(patientRole);
        when(jwtUtil.validateToken("token-valido")).thenReturn(true);
        when(jwtUtil.extractEmail("token-valido")).thenReturn(authUser.getEmail());
        when(authUserRepository.findByEmail(authUser.getEmail())).thenReturn(Optional.of(authUser));

        TokenAuthorizationDTO authorization = authService.getTokenAuthorization("token-valido");

        assertEquals(authUser.getEmail(), authorization.email());
        assertEquals(java.util.List.of("PATIENT"), authorization.roles());
    }

    @Test
    void getTokenAuthorization_deberiaRechazarTokenInvalido() {
        when(jwtUtil.validateToken("token-invalido")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.getTokenAuthorization("token-invalido"));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void getTokenAuthorization_deberiaRechazarUsuarioDeshabilitadoConForbidden() {
        authUser.setEnabled(false);
        when(jwtUtil.validateToken("token-deshabilitado")).thenReturn(true);
        when(jwtUtil.extractEmail("token-deshabilitado")).thenReturn(authUser.getEmail());
        when(authUserRepository.findByEmail(authUser.getEmail())).thenReturn(Optional.of(authUser));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.getTokenAuthorization("token-deshabilitado"));
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void register_deberiaLanzarExcepcionCuandoCorreoYaExiste() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "paciente@test.cl",
                "123456");

        when(authUserRepository.existsByEmail(request.email()))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.register(request));

        assertEquals(
                "Ya existe un usuario registrado con ese correo",
                exception.getMessage());

        verify(authUserRepository, never())
                .save(any(AuthUser.class));

        verify(passwordEncoder, never())
                .encode(any());
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Test
    void login_deberiaRetornarTokenCuandoCredencialesSonCorrectas() {
        authUser.getRoles().add(patientRole);

        LoginRequestDTO request = new LoginRequestDTO(
                "paciente@test.cl",
                "123456");

        when(authUserRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(authUser));

        when(passwordEncoder.matches(
                request.password(),
                authUser.getPasswordHash()))
                .thenReturn(true);

        when(jwtUtil.generateToken(authUser.getEmail()))
                .thenReturn("jwt-login");

        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals(1L, response.authUserId());
        assertEquals("paciente@test.cl", response.email());
        assertEquals("jwt-login", response.token());
        assertTrue(response.roles().contains("PATIENT"));

        verify(jwtUtil)
                .generateToken("paciente@test.cl");
    }

    @Test
    void login_deberiaFallarCuandoCorreoNoExiste() {
        LoginRequestDTO request = new LoginRequestDTO(
                "noexiste@test.cl",
                "123456");

        when(authUserRepository.findByEmail(request.email()))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(request));

        assertEquals(
                "Credenciales inválidas",
                exception.getMessage());

        verify(passwordEncoder, never())
                .matches(any(), any());

        verify(jwtUtil, never())
                .generateToken(any());
    }

    @Test
    void login_deberiaFallarCuandoUsuarioEstaDeshabilitado() {
        authUser.setEnabled(false);

        LoginRequestDTO request = new LoginRequestDTO(
                "paciente@test.cl",
                "123456");

        when(authUserRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(authUser));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(request));

        assertEquals(
                "El usuario está deshabilitado",
                exception.getMessage());

        verify(passwordEncoder, never())
                .matches(any(), any());

        verify(jwtUtil, never())
                .generateToken(any());
    }

    @Test
    void login_deberiaFallarCuandoPasswordEsIncorrecta() {
        LoginRequestDTO request = new LoginRequestDTO(
                "paciente@test.cl",
                "incorrecta");

        when(authUserRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(authUser));

        when(passwordEncoder.matches(
                request.password(),
                authUser.getPasswordHash()))
                .thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.login(request));

        assertEquals(
                "Credenciales inválidas",
                exception.getMessage());

        verify(jwtUtil, never())
                .generateToken(any());
    }

    // =========================================================
    // ASSIGN ROLE
    // =========================================================

    @Test
    void assignRole_deberiaAsignarRolCorrectamente() {
        when(authUserRepository.findById(1L))
                .thenReturn(Optional.of(authUser));

        when(roleRepository.findByRoleName("PATIENT"))
                .thenReturn(Optional.of(patientRole));

        when(authUserRepository.save(authUser))
                .thenReturn(authUser);

        AuthUserResponseDTO response = authService.assignRole(1L, "PATIENT");

        assertNotNull(response);
        assertEquals(1L, response.authUserId());
        assertTrue(response.roles().contains("PATIENT"));
        assertTrue(authUser.getRoles().contains(patientRole));

        verify(authUserRepository).save(authUser);
    }

    @Test
    void assignRole_deberiaFallarCuandoRolNoExiste() {
        when(authUserRepository.findById(1L))
                .thenReturn(Optional.of(authUser));

        when(roleRepository.findByRoleName("INVENTADO"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.assignRole(1L, "INVENTADO"));

        assertEquals(
                "Rol no encontrado",
                exception.getMessage());

        verify(authUserRepository, never())
                .save(any(AuthUser.class));
    }

    @Test
    void assignRole_deberiaFallarCuandoRolEstaInactivo() {
        patientRole.setActive(false);

        when(authUserRepository.findById(1L))
                .thenReturn(Optional.of(authUser));

        when(roleRepository.findByRoleName("PATIENT"))
                .thenReturn(Optional.of(patientRole));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.assignRole(1L, "PATIENT"));

        assertEquals(
                "El rol seleccionado no está activo",
                exception.getMessage());

        verify(authUserRepository, never())
                .save(any(AuthUser.class));
    }

    @Test
    void assignRole_deberiaFallarCuandoUsuarioYaTieneRol() {
        authUser.getRoles().add(patientRole);

        when(authUserRepository.findById(1L))
                .thenReturn(Optional.of(authUser));

        when(roleRepository.findByRoleName("PATIENT"))
                .thenReturn(Optional.of(patientRole));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> authService.assignRole(1L, "PATIENT"));

        assertEquals(
                "El usuario ya tiene asignado ese rol",
                exception.getMessage());

        verify(authUserRepository, never())
                .save(any(AuthUser.class));
    }

    // =========================================================
    // ENABLE / DISABLE
    // =========================================================

    @Test
    void disableUser_deberiaDeshabilitarUsuario() {
        when(authUserRepository.findById(1L))
                .thenReturn(Optional.of(authUser));

        when(authUserRepository.save(authUser))
                .thenReturn(authUser);

        AuthUserResponseDTO response = authService.disableUser(1L);

        assertFalse(response.enabled());
        assertFalse(authUser.isEnabled());

        verify(authUserRepository).save(authUser);
    }

    @Test
    void enableUser_deberiaHabilitarUsuario() {
        authUser.setEnabled(false);

        when(authUserRepository.findById(1L))
                .thenReturn(Optional.of(authUser));

        when(authUserRepository.save(authUser))
                .thenReturn(authUser);

        AuthUserResponseDTO response = authService.enableUser(1L);

        assertTrue(response.enabled());
        assertTrue(authUser.isEnabled());

        verify(authUserRepository).save(authUser);
    }
}
