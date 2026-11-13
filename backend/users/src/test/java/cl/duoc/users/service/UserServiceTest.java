package cl.duoc.users.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.client.DoctorsClient;
import cl.duoc.users.dto.AuthUserResponseDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.CurrentUserResponseDTO;
import cl.duoc.users.dto.UpdateUserRequestDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.model.User;
import cl.duoc.users.model.UserProfile;
import cl.duoc.users.repository.UserRepository;
import cl.duoc.users.repository.UserProfileRepository;
import cl.duoc.users.repository.PatientProfileRepository;
import cl.duoc.users.repository.ReceptionistProfileRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private AuthClient authClient;

    @Mock
    private DoctorsClient doctorsClient;

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @Mock
    private ReceptionistProfileRepository receptionistProfileRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private AuthUserResponseDTO authUserResponse;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setAuthUserId(10L);
        user.setRun("12345678-9");
        user.setEmail("paciente@test.cl");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.of(2026, 6, 18, 12, 0));

        authUserResponse = new AuthUserResponseDTO(
                10L,
                "paciente@test.cl",
                true,
                null,
                List.of());
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createUser_deberiaCrearUsuarioCorrectamente() {
        CreateUserRequestDTO request = new CreateUserRequestDTO(
                "12345678-9",
                "paciente@test.cl");

        when(authClient.getAuthUserByEmail(request.email()))
                .thenReturn(authUserResponse);

        when(userRepository.existsByAuthUserId(10L))
                .thenReturn(false);

        when(userRepository.existsByRun(request.run()))
                .thenReturn(false);

        when(userRepository.existsByEmail(request.email()))
                .thenReturn(false);

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User saved = invocation.getArgument(0);
                    saved.setUserId(1L);
                    saved.setCreatedAt(LocalDateTime.of(2026, 6, 18, 12, 0));
                    return saved;
                });

        UserResponseDTO response = userService.createUser(request);

        assertNotNull(response);
        assertEquals(1L, response.userId());
        assertEquals(10L, response.authUserId());
        assertEquals("12345678-9", response.run());
        assertEquals("paciente@test.cl", response.email());
        assertTrue(response.active());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(captor.capture());

        User savedUser = captor.getValue();

        assertEquals(10L, savedUser.getAuthUserId());
        assertEquals("12345678-9", savedUser.getRun());
        assertEquals("paciente@test.cl", savedUser.getEmail());
        assertTrue(savedUser.isActive());

        verify(authClient).getAuthUserByEmail("paciente@test.cl");
    }

    @Test
    void createUser_deberiaFallarCuandoAuthUserIdYaExiste() {
        CreateUserRequestDTO request = new CreateUserRequestDTO(
                "12345678-9",
                "paciente@test.cl");

        when(authClient.getAuthUserByEmail(request.email()))
                .thenReturn(authUserResponse);

        when(userRepository.existsByAuthUserId(10L))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.createUser(request));

        assertEquals(
                "Ya existe un usuario con ese authUserId",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    @Test
    void createUser_deberiaFallarCuandoRunYaExiste() {
        CreateUserRequestDTO request = new CreateUserRequestDTO(
                "12345678-9",
                "paciente@test.cl");

        when(authClient.getAuthUserByEmail(request.email()))
                .thenReturn(authUserResponse);

        when(userRepository.existsByAuthUserId(10L))
                .thenReturn(false);

        when(userRepository.existsByRun(request.run()))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.createUser(request));

        assertEquals(
                "Ya existe un usuario con ese RUN",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    @Test
    void createUser_deberiaFallarCuandoEmailYaExiste() {
        CreateUserRequestDTO request = new CreateUserRequestDTO(
                "12345678-9",
                "paciente@test.cl");

        when(authClient.getAuthUserByEmail(request.email()))
                .thenReturn(authUserResponse);

        when(userRepository.existsByAuthUserId(10L))
                .thenReturn(false);

        when(userRepository.existsByRun(request.run()))
                .thenReturn(false);

        when(userRepository.existsByEmail(request.email()))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.createUser(request));

        assertEquals(
                "Ya existe un usuario con ese correo",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getAllUsers_deberiaRetornarLista() {
        when(userRepository.findAll())
                .thenReturn(List.of(user));

        List<UserResponseDTO> response = userService.getAllUsers();

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).userId());
        assertEquals(10L, response.get(0).authUserId());
        assertEquals("paciente@test.cl", response.get(0).email());

        verify(userRepository).findAll();
    }

    @Test
    void getUserById_deberiaRetornarUsuario() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        UserResponseDTO response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.userId());
        assertEquals(10L, response.authUserId());
        assertEquals("12345678-9", response.run());
        assertEquals("paciente@test.cl", response.email());

        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_deberiaFallarCuandoNoExiste() {
        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.getUserById(99L));

        assertEquals(
                "Usuario no encontrado",
                exception.getMessage());
    }

    @Test
    void getProfileCompletion_deberiaConsiderarCompletoAlPacienteSinDatosOpcionales() {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFirstName("Ana");
        profile.setLastName("Pérez");
        when(userRepository.findByEmail("paciente@test.cl")).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserUserId(1L)).thenReturn(Optional.of(profile));
        when(patientProfileRepository.existsByUserUserId(1L)).thenReturn(true);

        var result = userService.getProfileCompletion("paciente@test.cl", "PATIENT");

        assertEquals("PATIENT", result.role());
        assertTrue(result.complete());
        assertTrue(result.missingFields().isEmpty());
    }

    @Test
    void getProfileCompletion_deberiaExigirPerfilProfesionalParaDoctor() {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFirstName("Diego");
        profile.setLastName("Médico");
        profile.setPhone("912345678");
        profile.setBirthDate(LocalDate.of(1985, 2, 1));
        profile.setAddress("Santiago");
        when(userRepository.findByEmail("paciente@test.cl")).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserUserId(1L)).thenReturn(Optional.of(profile));
        when(doctorsClient.hasDoctorProfile(1L)).thenReturn(false);

        var result = userService.getProfileCompletion("paciente@test.cl", "DOCTOR");

        assertEquals(List.of("doctorProfile"), result.missingFields());
    }

    @Test
    void getCurrentUser_deberiaRetornarSoloElUsuarioAutenticadoConSuPerfil() {
        UserProfile profile = new UserProfile();
        profile.setFirstName("Ana");
        profile.setLastName("Pérez");
        profile.setPhone("912345678");
        profile.setBirthDate(LocalDate.of(1990, 5, 10));
        profile.setAddress("Santiago");

        when(userRepository.findByEmail("paciente@test.cl")).thenReturn(Optional.of(user));
        when(userProfileRepository.findByUserUserId(1L)).thenReturn(Optional.of(profile));

        CurrentUserResponseDTO response = userService.getCurrentUser("paciente@test.cl");

        assertEquals(1L, response.userId());
        assertEquals(10L, response.authUserId());
        assertEquals("paciente@test.cl", response.email());
        assertEquals("Ana", response.firstName());
        assertEquals("Pérez", response.lastName());
        assertEquals(LocalDate.of(1990, 5, 10), response.birthDate());
    }

    @Test
    void getUserByRun_deberiaRetornarUsuario() {
        when(userRepository.findByRun("12345678-9"))
                .thenReturn(Optional.of(user));

        UserResponseDTO response = userService.getUserByRun("12345678-9");

        assertNotNull(response);
        assertEquals("12345678-9", response.run());

        verify(userRepository)
                .findByRun("12345678-9");
    }

    @Test
    void getUserByRun_deberiaFallarCuandoNoExiste() {
        when(userRepository.findByRun("99999999-9"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.getUserByRun("99999999-9"));

        assertEquals(
                "Usuario no encontrado por RUN",
                exception.getMessage());
    }

    @Test
    void getUserByEmail_deberiaRetornarUsuario() {
        when(userRepository.findByEmail("paciente@test.cl"))
                .thenReturn(Optional.of(user));

        UserResponseDTO response = userService.getUserByEmail("paciente@test.cl");

        assertNotNull(response);
        assertEquals("paciente@test.cl", response.email());

        verify(userRepository)
                .findByEmail("paciente@test.cl");
    }

    @Test
    void getUserByEmail_deberiaFallarCuandoNoExiste() {
        when(userRepository.findByEmail("noexiste@test.cl"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.getUserByEmail("noexiste@test.cl"));

        assertEquals(
                "Usuario no encontrado por correo",
                exception.getMessage());
    }

    @Test
    void existsById_deberiaRetornarTrue() {
        when(userRepository.existsById(1L))
                .thenReturn(true);

        boolean response = userService.existsById(1L);

        assertTrue(response);

        verify(userRepository)
                .existsById(1L);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateUser_deberiaActualizarUsuario() {
        UpdateUserRequestDTO request = new UpdateUserRequestDTO(
                "98765432-1",
                "nuevo@test.cl");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.existsByRun("98765432-1"))
                .thenReturn(false);

        when(userRepository.existsByEmail("nuevo@test.cl"))
                .thenReturn(false);

        when(userRepository.save(user))
                .thenReturn(user);

        UserResponseDTO response = userService.updateUser(1L, request);

        assertNotNull(response);
        assertEquals("98765432-1", response.run());
        assertEquals("nuevo@test.cl", response.email());

        verify(userRepository).save(user);
    }

    @Test
    void updateUser_deberiaPermitirMismoRunYEmail() {
        UpdateUserRequestDTO request = new UpdateUserRequestDTO(
                "12345678-9",
                "paciente@test.cl");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        UserResponseDTO response = userService.updateUser(1L, request);

        assertNotNull(response);
        assertEquals("12345678-9", response.run());
        assertEquals("paciente@test.cl", response.email());

        verify(userRepository, never())
                .existsByRun(any());

        verify(userRepository, never())
                .existsByEmail(any());

        verify(userRepository).save(user);
    }

    @Test
    void updateUser_deberiaFallarCuandoNuevoRunYaExiste() {
        UpdateUserRequestDTO request = new UpdateUserRequestDTO(
                "98765432-1",
                "paciente@test.cl");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.existsByRun("98765432-1"))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.updateUser(1L, request));

        assertEquals(
                "Ya existe un usuario con ese RUN",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    @Test
    void updateUser_deberiaFallarCuandoNuevoEmailYaExiste() {
        UpdateUserRequestDTO request = new UpdateUserRequestDTO(
                "12345678-9",
                "otro@test.cl");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.existsByEmail("otro@test.cl"))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.updateUser(1L, request));

        assertEquals(
                "Ya existe un usuario con ese correo",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    @Test
    void deactivateUser_deberiaDesactivarUsuario() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        UserResponseDTO response = userService.deactivateUser(1L);

        assertNotNull(response);
        assertFalse(response.active());
        assertFalse(user.isActive());

        verify(userRepository).save(user);
    }

    @Test
    void deactivateUser_deberiaFallarCuandoYaEstaDesactivado() {
        user.setActive(false);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.deactivateUser(1L));

        assertEquals(
                "El usuario ya está desactivado",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }

    @Test
    void activateUser_deberiaActivarUsuario() {
        user.setActive(false);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        UserResponseDTO response = userService.activateUser(1L);

        assertNotNull(response);
        assertTrue(response.active());
        assertTrue(user.isActive());

        verify(userRepository).save(user);
    }

    @Test
    void activateUser_deberiaFallarCuandoYaEstaActivado() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.activateUser(1L));

        assertEquals(
                "El usuario ya está activado",
                exception.getMessage());

        verify(userRepository, never())
                .save(any(User.class));
    }
}
