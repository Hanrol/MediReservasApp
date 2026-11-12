package cl.duoc.users.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.CreateUserProfileRequestDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.PatientRegistrationRequestDTO;
import cl.duoc.users.dto.PatientRegistrationResponseDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientRegistrationService {

    private final AuthClient authClient;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserProfileService userProfileService;
    private final PatientProfileService patientProfileService;

    @Transactional
    public PatientRegistrationResponseDTO register(PatientRegistrationRequestDTO request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String run = request.run().trim().toUpperCase(Locale.ROOT);

        if (userRepository.existsByEmail(email) || userRepository.existsByRun(run)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una cuenta asociada a este RUN o correo");
        }

        authClient.registerUser(email, request.password());

        UserResponseDTO user = userService.createUser(new CreateUserRequestDTO(run, email));
        userProfileService.createUserProfile(new CreateUserProfileRequestDTO(
                user.userId(),
                request.firstName().trim(),
                request.lastName().trim(),
                normalizeOptional(request.phone()),
                request.birthDate(),
                normalizeOptional(request.address())));

        // El endpoint de perfil asigna PATIENT en Auth. El cliente no puede elegir otro rol.
        patientProfileService.createPatientProfile(new CreatePatientProfileRequestDTO(
                user.userId(), null, null, null, null, null, null));

        return new PatientRegistrationResponseDTO(
                user.userId(), email, request.firstName().trim(), request.lastName().trim());
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
