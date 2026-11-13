package cl.duoc.users.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.AcceptAdminInvitationRequestDTO;
import cl.duoc.users.dto.AdminInvitationRole;
import cl.duoc.users.dto.AuthRegistrationResponseDTO;
import cl.duoc.users.dto.CreateAdminInvitationRequestDTO;
import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.model.AdminInvitation;
import cl.duoc.users.repository.AdminInvitationRepository;
import cl.duoc.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminInvitationServiceTest {

    @Mock
    private AdminInvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthClient authClient;

    @Mock
    private UserService userService;

    @Mock
    private UserProfileService userProfileService;

    @Mock
    private PatientProfileService patientProfileService;

    @Mock
    private ReceptionistProfileService receptionistProfileService;

    @Mock
    private AdministratorProfileService administratorProfileService;

    @InjectMocks
    private AdminInvitationService invitationService;

    @Test
    void createInvitation_normalizesEmailAndStoresOnlyTokenHash() {
        when(userRepository.existsByEmail("doctor@example.test")).thenReturn(false);
        when(authClient.authUserExistsByEmail("doctor@example.test")).thenReturn(false);
        when(invitationRepository.findFirstByEmailIgnoreCaseAndAcceptedAtIsNullOrderByCreatedAtDesc(
                "doctor@example.test")).thenReturn(Optional.empty());
        when(invitationRepository.save(any(AdminInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = invitationService.createInvitation(
                new CreateAdminInvitationRequestDTO(" DOCTOR@EXAMPLE.TEST ", AdminInvitationRole.DOCTOR),
                "admin@example.test");

        ArgumentCaptor<AdminInvitation> invitationCaptor = ArgumentCaptor.forClass(AdminInvitation.class);
        verify(invitationRepository).save(invitationCaptor.capture());
        AdminInvitation saved = invitationCaptor.getValue();

        assertEquals("doctor@example.test", response.email());
        assertEquals("DOCTOR", response.role());
        assertTrue(response.expiresAt().isAfter(LocalDateTime.now(ZoneOffset.UTC)));
        assertNotEquals(response.token(), saved.getTokenHash());
        assertEquals(64, saved.getTokenHash().length());
        assertEquals("admin@example.test", saved.getInvitedByEmail());
    }

    @Test
    void createInvitation_rejectsExistingAccount() {
        when(userRepository.existsByEmail("existing@example.test")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> invitationService.createInvitation(
                        new CreateAdminInvitationRequestDTO("existing@example.test", AdminInvitationRole.PATIENT),
                        "admin@example.test"));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(invitationRepository, never()).save(any());
        verify(authClient, never()).authUserExistsByEmail(any());
    }

    @Test
    void createInvitation_reissuesPendingInviteForPartiallyCreatedAuthAccount() {
        AdminInvitation pending = new AdminInvitation();
        pending.setEmail("recovery@example.test");
        pending.setRoleName("PATIENT");
        pending.setTokenHash("old-token-hash");
        pending.setInvitedByEmail("admin@example.test");
        pending.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusHours(12));
        when(userRepository.existsByEmail("recovery@example.test")).thenReturn(false);
        when(invitationRepository.findFirstByEmailIgnoreCaseAndAcceptedAtIsNullOrderByCreatedAtDesc(
                "recovery@example.test")).thenReturn(Optional.of(pending));
        when(authClient.authUserExistsByEmail("recovery@example.test")).thenReturn(true);
        when(invitationRepository.save(any(AdminInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = invitationService.createInvitation(
                new CreateAdminInvitationRequestDTO("recovery@example.test", AdminInvitationRole.PATIENT),
                "admin@example.test");

        assertEquals("recovery@example.test", response.email());
        assertNotEquals("old-token-hash", pending.getTokenHash());
        assertEquals(response.role(), pending.getRoleName());
        verify(invitationRepository).save(pending);
    }

    @Test
    void acceptInvitation_createsPatientAccountWithRoleFromStoredInvitation() throws Exception {
        String rawToken = "invite-token-test";
        AdminInvitation invitation = invitation(rawToken, "new.patient@example.test", "PATIENT");
        when(invitationRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(invitation));
        when(userRepository.existsByEmail(invitation.getEmail())).thenReturn(false);
        when(userRepository.existsByRun("12345678-5")).thenReturn(false);
        when(authClient.registerUser(invitation.getEmail(), "password-safe-123"))
                .thenReturn(new AuthRegistrationResponseDTO(22L, invitation.getEmail(), "jwt", java.util.List.of()));
        when(userService.createUser(any(CreateUserRequestDTO.class)))
                .thenReturn(new UserResponseDTO(11L, 22L, "12345678-5", invitation.getEmail(), true,
                        LocalDateTime.now()));

        var response = invitationService.acceptInvitation(new AcceptAdminInvitationRequestDTO(
                rawToken,
                "12345678-5",
                "Ana",
                "Paciente",
                "+56911111111",
                LocalDate.of(1990, 5, 10),
                "Santiago",
                "password-safe-123"));

        assertEquals(11L, response.userId());
        assertEquals("PATIENT", response.role());
        assertTrue(invitation.getAcceptedAt() != null);
        verify(userProfileService).createUserProfile(any());
        verify(patientProfileService).createPatientProfile(any(CreatePatientProfileRequestDTO.class));
        verify(authClient, never()).assignRole(22L, "PATIENT");
        verify(invitationRepository).save(invitation);
    }

    @Test
    void acceptInvitation_recoversAuthAccountFromPreviousPartialActivation() throws Exception {
        String rawToken = "partial-activation-token";
        AdminInvitation invitation = invitation(rawToken, "recovery.patient@example.test", "PATIENT");
        when(invitationRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(invitation));
        when(userRepository.existsByEmail(invitation.getEmail())).thenReturn(false);
        when(userRepository.existsByRun("12345678-5")).thenReturn(false);
        when(authClient.registerUser(invitation.getEmail(), "same-password-123"))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Cuenta ya creada en Auth"));
        when(authClient.authenticateExistingUser(invitation.getEmail(), "same-password-123"))
                .thenReturn(new AuthRegistrationResponseDTO(24L, invitation.getEmail(), "jwt", java.util.List.of("PATIENT")));
        when(userService.createUser(any(CreateUserRequestDTO.class)))
                .thenReturn(new UserResponseDTO(15L, 24L, "12345678-5", invitation.getEmail(), true,
                        LocalDateTime.now()));

        var response = invitationService.acceptInvitation(new AcceptAdminInvitationRequestDTO(
                rawToken, "12345678-5", "Ana", "Paciente", null, null, null, "same-password-123"));

        assertEquals(15L, response.userId());
        assertEquals("PATIENT", response.role());
        verify(authClient).authenticateExistingUser(invitation.getEmail(), "same-password-123");
        verify(userProfileService).createUserProfile(any());
        verify(patientProfileService).createPatientProfile(any(CreatePatientProfileRequestDTO.class));
        verify(invitationRepository).save(invitation);
    }

    @Test
    void acceptInvitation_rejectsExpiredInviteWithoutCreatingAuthAccount() throws Exception {
        String rawToken = "expired-token";
        AdminInvitation invitation = invitation(rawToken, "expired@example.test", "DOCTOR");
        invitation.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).minusMinutes(1));
        when(invitationRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(invitation));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> invitationService.acceptInvitation(new AcceptAdminInvitationRequestDTO(
                        rawToken, "12345678-5", "Doctor", "Prueba", null, null, null, "password-safe-123")));

        assertEquals(HttpStatus.GONE, exception.getStatusCode());
        verify(authClient, never()).registerUser(any(), any());
    }

    private AdminInvitation invitation(String token, String email, String role) throws Exception {
        AdminInvitation invitation = new AdminInvitation();
        invitation.setEmail(email);
        invitation.setRoleName(role);
        invitation.setTokenHash(sha256(token));
        invitation.setInvitedByEmail("admin@example.test");
        invitation.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusHours(24));
        return invitation;
    }

    private String sha256(String token) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
    }
}
