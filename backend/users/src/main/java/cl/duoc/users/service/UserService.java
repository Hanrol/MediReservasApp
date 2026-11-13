package cl.duoc.users.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.client.DoctorsClient;
import cl.duoc.users.dto.AuthUserResponseDTO;
import cl.duoc.users.dto.CurrentUserResponseDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.ProfileCompletionResponseDTO;
import cl.duoc.users.dto.UpdateUserRequestDTO;
import cl.duoc.users.dto.UpdateUserProfileRequestDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.model.User;
import cl.duoc.users.model.UserProfile;
import cl.duoc.users.repository.UserRepository;
import cl.duoc.users.repository.UserProfileRepository;
import cl.duoc.users.repository.PatientProfileRepository;
import cl.duoc.users.repository.ReceptionistProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AuthClient authClient;
    private final DoctorsClient doctorsClient;
    private final PatientProfileRepository patientProfileRepository;
    private final ReceptionistProfileRepository receptionistProfileRepository;

    @Value("${app.master-admin.email:}")
    private String masterAdminEmail;

    public UserResponseDTO createUser(CreateUserRequestDTO request) {

        AuthUserResponseDTO authUser = authClient.getAuthUserByEmail(request.email());

        if (!authUser.enabled()) {
            logger.warn("Creación de usuario rechazada: auth user deshabilitado. email={}", request.email());
            throw new RuntimeException("El usuario de autenticación está deshabilitado");
        }

        if (userRepository.existsByAuthUserId(authUser.authUserId())) {
            logger.warn("Creación de usuario rechazada: ya existe usuario con authUserId={}", authUser.authUserId());
            throw new RuntimeException("Ya existe un usuario con ese authUserId");
        }

        if (userRepository.existsByRun(request.run())) {
            logger.warn("Creación de usuario rechazada: RUN duplicado {}", request.run());
            throw new RuntimeException("Ya existe un usuario con ese RUN");
        }

        if (userRepository.existsByEmail(request.email())) {
            logger.warn("Creación de usuario rechazada: correo duplicado {}", request.email());
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        User user = new User();
        user.setAuthUserId(authUser.authUserId());
        user.setRun(request.run());
        user.setEmail(request.email());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        return toResponseDTO(savedUser);
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UserResponseDTO getUserById(Long userId) {
        User user = findUserEntityById(userId);
        return toResponseDTO(user);
    }

    public UserResponseDTO getUserByRun(String run) {
        User user = userRepository.findByRun(run)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: usuario no encontrado por RUN {}", run);
                    return new RuntimeException("Usuario no encontrado por RUN");
                });

        return toResponseDTO(user);
    }

    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: usuario no encontrado por correo {}", email);
                    return new RuntimeException("Usuario no encontrado por correo");
                });

        return toResponseDTO(user);
    }

    public CurrentUserResponseDTO getCurrentUser(String authenticatedEmail) {
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe un perfil asociado a la cuenta"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta está deshabilitada");
        }

        UserProfile profile = userProfileRepository.findByUserUserId(user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "El perfil de la cuenta está incompleto"));

        return new CurrentUserResponseDTO(
                user.getUserId(),
                user.getAuthUserId(),
                user.getRun(),
                user.getEmail(),
                user.isActive(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone(),
                profile.getBirthDate(),
                profile.getAddress());
    }

    public CurrentUserResponseDTO updateCurrentUserProfile(
            String authenticatedEmail,
            UpdateUserProfileRequestDTO request) {
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un perfil asociado a la cuenta"));
        UserProfile profile = userProfileRepository.findByUserUserId(user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El perfil de la cuenta está incompleto"));

        profile.setFirstName(request.firstName().trim());
        profile.setLastName(request.lastName().trim());
        profile.setPhone(normalizeOptional(request.phone()));
        profile.setBirthDate(request.birthDate());
        profile.setAddress(normalizeOptional(request.address()));
        userProfileRepository.save(profile);
        return getCurrentUser(authenticatedEmail);
    }

    public ProfileCompletionResponseDTO getProfileCompletion(String authenticatedEmail, String rolesHeader) {
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un perfil asociado a la cuenta"));
        UserProfile profile = userProfileRepository.findByUserUserId(user.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El perfil de la cuenta está incompleto"));
        String role = java.util.Arrays.stream(rolesHeader == null ? new String[0] : rolesHeader.split(","))
                .map(String::trim)
                .map(value -> value.toUpperCase(java.util.Locale.ROOT))
                .filter(value -> java.util.Set.of("PATIENT", "DOCTOR", "RECEPTIONIST").contains(value))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Este rol no requiere completar el perfil"));

        List<String> missing = new java.util.ArrayList<>();

        if ("PATIENT".equals(role) && !patientProfileRepository.existsByUserUserId(user.getUserId())) {
            missing.add("patientProfile");
        } else if ("RECEPTIONIST".equals(role)
                && !receptionistProfileRepository.existsByUserUserId(user.getUserId())) {
            missing.add("receptionistProfile");
        } else if ("DOCTOR".equals(role) && !doctorsClient.hasDoctorProfile(user.getUserId())) {
            missing.add("doctorProfile");
        }

        return new ProfileCompletionResponseDTO(role, missing.isEmpty(), List.copyOf(missing));
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    public boolean existsById(Long userId) {
        return userRepository.existsById(userId);
    }

    public User findUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: usuario no encontrado con ID {}", userId);
                    return new RuntimeException("Usuario no encontrado");
                });
    }

    public UserResponseDTO updateUser(Long userId, UpdateUserRequestDTO request) {
        User user = findUserEntityById(userId);

        if (isMasterAdmin(user) && !user.getEmail().equalsIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cambiar el correo del administrador maestro");
        }

        if (!user.getRun().equalsIgnoreCase(request.run())
                && userRepository.existsByRun(request.run())) {
            logger.warn("Actualización rechazada: RUN duplicado {}", request.run());
            throw new RuntimeException("Ya existe un usuario con ese RUN");
        }

        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            logger.warn("Actualización rechazada: correo duplicado {}", request.email());
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        user.setRun(request.run());
        user.setEmail(request.email());

        User savedUser = userRepository.save(user);

        return toResponseDTO(savedUser);
    }

    public UserResponseDTO activateUser(Long userId) {
        User user = findUserEntityById(userId);

        if (user.isActive()) {
            logger.warn("Activación rechazada: usuario ya estaba activo. userId={}", userId);
            throw new RuntimeException("El usuario ya está activado");
        }

        user.setActive(true);

        User savedUser = userRepository.save(user);

        return toResponseDTO(savedUser);
    }

    public UserResponseDTO deactivateUser(Long userId) {
        User user = findUserEntityById(userId);

        if (isMasterAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede desactivar el administrador maestro");
        }

        if (!user.isActive()) {
            logger.warn("Desactivación rechazada: usuario ya estaba desactivado. userId={}", userId);
            throw new RuntimeException("El usuario ya está desactivado");
        }

        user.setActive(false);

        User savedUser = userRepository.save(user);

        return toResponseDTO(savedUser);
    }

    public UserResponseDTO ensureMasterAdminActive(Long userId) {
        User user = findUserEntityById(userId);
        if (!isMasterAdmin(user)) {
            throw new IllegalArgumentException("El usuario no corresponde al administrador maestro configurado");
        }
        if (!user.isActive()) {
            user.setActive(true);
            user = userRepository.save(user);
        }
        return toResponseDTO(user);
    }

    private boolean isMasterAdmin(User user) {
        return masterAdminEmail != null && !masterAdminEmail.isBlank()
                && user.getEmail().equalsIgnoreCase(masterAdminEmail.trim());
    }

    private UserResponseDTO toResponseDTO(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getAuthUserId(),
                user.getRun(),
                user.getEmail(),
                user.isActive(),
                user.getCreatedAt());
    }
}
