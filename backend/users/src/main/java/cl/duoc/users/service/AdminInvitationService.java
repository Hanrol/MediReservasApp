package cl.duoc.users.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.AcceptAdminInvitationRequestDTO;
import cl.duoc.users.dto.AcceptAdminInvitationResponseDTO;
import cl.duoc.users.dto.AdminInvitationResponseDTO;
import cl.duoc.users.dto.AdminInvitationRole;
import cl.duoc.users.dto.CreateAdminInvitationRequestDTO;
import cl.duoc.users.dto.CreateAdministratorProfileRequestDTO;
import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.CreateReceptionistProfileRequestDTO;
import cl.duoc.users.dto.CreateUserProfileRequestDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.CreatedAdminInvitationResponseDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.model.AdminInvitation;
import cl.duoc.users.repository.AdminInvitationRepository;
import cl.duoc.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminInvitationService {

    private static final int TOKEN_BYTES = 32;
    private static final int EXPIRATION_HOURS = 48;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AdminInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final AuthClient authClient;
    private final UserService userService;
    private final UserProfileService userProfileService;
    private final PatientProfileService patientProfileService;
    private final ReceptionistProfileService receptionistProfileService;
    private final AdministratorProfileService administratorProfileService;

    @Transactional
    public CreatedAdminInvitationResponseDTO createInvitation(
            CreateAdminInvitationRequestDTO request,
            String invitedByEmail) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta asociada a este correo");
        }

        var pendingInvitation = invitationRepository
                .findFirstByEmailIgnoreCaseAndAcceptedAtIsNullOrderByCreatedAtDesc(email);
        boolean authAccountExists = authClient.authUserExistsByEmail(email);
        if (authAccountExists && pendingInvitation.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta asociada a este correo");
        }
        if (authAccountExists && !pendingInvitation.get().getRoleName().equals(request.role().name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede cambiar el rol al renovar una invitación de activación incompleta");
        }

        String token = generateToken();
        LocalDateTime expiresAt = LocalDateTime.now(ZoneOffset.UTC).plusHours(EXPIRATION_HOURS);
        AdminInvitation invitation = pendingInvitation.orElseGet(AdminInvitation::new);
        invitation.setEmail(email);
        invitation.setRoleName(request.role().name());
        invitation.setTokenHash(hashToken(token));
        invitation.setInvitedByEmail(invitedByEmail);
        invitation.setExpiresAt(expiresAt);

        AdminInvitation saved = invitationRepository.save(invitation);
        return new CreatedAdminInvitationResponseDTO(
                saved.getInvitationId(), saved.getEmail(), saved.getRoleName(), token, saved.getExpiresAt());
    }

    @Transactional(readOnly = true)
    public List<AdminInvitationResponseDTO> getPendingInvitations() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        return invitationRepository.findAllByAcceptedAtIsNullOrderByCreatedAtDesc().stream()
                .map(invitation -> new AdminInvitationResponseDTO(
                        invitation.getInvitationId(),
                        invitation.getEmail(),
                        invitation.getRoleName(),
                        invitation.getExpiresAt(),
                        invitation.getExpiresAt().isBefore(now) ? "EXPIRED" : "PENDING"))
                .toList();
    }

    @Transactional
    public AcceptAdminInvitationResponseDTO acceptInvitation(AcceptAdminInvitationRequestDTO request) {
        AdminInvitation invitation = invitationRepository.findByTokenHash(hashToken(request.token()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La invitación no es válida"));
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (invitation.getAcceptedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La invitación ya fue utilizada");
        }
        if (invitation.getExpiresAt().isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.GONE, "La invitación venció; solicita una nueva");
        }

        String run = request.run().trim().toUpperCase(Locale.ROOT);
        if (userRepository.existsByEmail(invitation.getEmail()) || userRepository.existsByRun(run)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo o RUN ya está asociado a una cuenta");
        }

        var authUser = registerOrAuthenticateExistingUser(invitation.getEmail(), request.password());
        UserResponseDTO user = userService.createUser(new CreateUserRequestDTO(run, invitation.getEmail()));
        userProfileService.createUserProfile(new CreateUserProfileRequestDTO(
                user.userId(),
                request.firstName().trim(),
                request.lastName().trim(),
                normalizeOptional(request.phone()),
                request.birthDate(),
                normalizeOptional(request.address())));

        if (AdminInvitationRole.DOCTOR.name().equals(invitation.getRoleName())) {
            authClient.assignRole(authUser.authUserId(), invitation.getRoleName());
        }
        createInitialProfile(invitation.getRoleName(), user.userId());

        invitation.setAcceptedAt(now);
        invitationRepository.save(invitation);
        return new AcceptAdminInvitationResponseDTO(user.userId(), invitation.getEmail(), invitation.getRoleName());
    }

    private cl.duoc.users.dto.AuthRegistrationResponseDTO registerOrAuthenticateExistingUser(
            String email,
            String password) {
        try {
            return authClient.registerUser(email, password);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() != HttpStatus.CONFLICT) {
                throw ex;
            }
            // A previous activation attempt may have created Auth but rolled back the Users transaction.
            return authClient.authenticateExistingUser(email, password);
        }
    }

    private void createInitialProfile(String roleName, Long userId) {
        switch (AdminInvitationRole.valueOf(roleName)) {
            case PATIENT -> patientProfileService.createPatientProfile(
                    new CreatePatientProfileRequestDTO(userId, null, null, null, null, null, null));
            case RECEPTIONIST -> receptionistProfileService.createReceptionistProfile(
                    new CreateReceptionistProfileRequestDTO(userId, null, null));
            case ADMIN -> administratorProfileService.createAdministratorProfile(
                    new CreateAdministratorProfileRequestDTO(userId, null, null));
            case DOCTOR -> {
                // El perfil profesional se completa posteriormente durante el onboarding.
            }
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no está disponible", ex);
        }
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
