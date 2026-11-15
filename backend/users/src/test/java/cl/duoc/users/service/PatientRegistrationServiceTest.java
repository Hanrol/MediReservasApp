package cl.duoc.users.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.CreateUserProfileRequestDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.PatientRegistrationRequestDTO;
import cl.duoc.users.dto.PatientRegistrationResponseDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PatientRegistrationServiceTest {

    @Mock
    private AuthClient authClient;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private UserProfileService userProfileService;

    @Mock
    private PatientProfileService patientProfileService;

    @InjectMocks
    private PatientRegistrationService patientRegistrationService;

    @Test
    void register_createsAuthUserAndPatientProfilesWithFixedPatientRoleFlow() {
        PatientRegistrationRequestDTO request = validRequest();
        when(userService.createUser(any(CreateUserRequestDTO.class)))
                .thenReturn(new UserResponseDTO(9L, 42L, request.run(), request.email(), true, LocalDateTime.now()));

        PatientRegistrationResponseDTO response = patientRegistrationService.register(request);

        assertEquals(9L, response.userId());
        assertEquals("patient@example.test", response.email());
        var order = inOrder(authClient, userService, userProfileService, patientProfileService);
        order.verify(authClient).registerUser("patient@example.test", request.password());
        order.verify(userService).createUser(new CreateUserRequestDTO("12345678-5", "patient@example.test"));
        order.verify(userProfileService).createUserProfile(any(CreateUserProfileRequestDTO.class));

        ArgumentCaptor<CreatePatientProfileRequestDTO> patientRequest =
                ArgumentCaptor.forClass(CreatePatientProfileRequestDTO.class);
        order.verify(patientProfileService).createPatientProfile(patientRequest.capture());
        assertEquals(9L, patientRequest.getValue().userId());
        assertEquals(null, patientRequest.getValue().healthInsurance());
    }

    @Test
    void register_rejectsDuplicateRunBeforeCreatingAuthAccount() {
        PatientRegistrationRequestDTO request = validRequest();
        when(userRepository.existsByEmail("patient@example.test")).thenReturn(false);
        when(userRepository.existsByRun("12345678-5")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> patientRegistrationService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(authClient, never()).registerUser(any(), any());
    }

    private PatientRegistrationRequestDTO validRequest() {
        return new PatientRegistrationRequestDTO(
                "12345678-5",
                " Ana ",
                " Pérez ",
                LocalDate.of(1990, 5, 10),
                " 912345678 ",
                " Santiago ",
                " PATIENT@example.test ",
                "clave-segura",
                true);
    }
}
