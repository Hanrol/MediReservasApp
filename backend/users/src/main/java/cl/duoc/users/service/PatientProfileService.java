package cl.duoc.users.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.PatientProfileResponseDTO;
import cl.duoc.users.dto.UpdatePatientProfileRequestDTO;
import cl.duoc.users.model.PatientProfile;
import cl.duoc.users.model.User;
import cl.duoc.users.repository.AdministratorProfileRepository;
import cl.duoc.users.repository.PatientProfileRepository;
import cl.duoc.users.repository.ReceptionistProfileRepository;
import cl.duoc.users.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private static final Logger logger = LoggerFactory.getLogger(PatientProfileService.class);

    private final PatientProfileRepository patientProfileRepository;
    private final ReceptionistProfileRepository receptionistProfileRepository;
    private final AdministratorProfileRepository administratorProfileRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserService userService;
    private final AuthClient authClient;

    public PatientProfileResponseDTO createPatientProfile(CreatePatientProfileRequestDTO request) {

        if (!userProfileRepository.existsByUserUserId(request.userId())) {
            logger.warn("Creación de perfil de paciente rechazada: usuario sin perfil general. userId={}",
                    request.userId());
            throw new RuntimeException("El usuario debe tener un perfil general antes de crear un perfil de paciente");
        }

        if (patientProfileRepository.existsByUserUserId(request.userId())) {
            logger.warn("Creación de perfil de paciente rechazada: usuario ya tiene perfil de paciente. userId={}",
                    request.userId());
            throw new RuntimeException("El usuario ya tiene un perfil de paciente");
        }

        if (receptionistProfileRepository.existsByUserUserId(request.userId())) {
            logger.warn("Creación de perfil de paciente rechazada: usuario ya tiene perfil de recepcionista. userId={}",
                    request.userId());
            throw new RuntimeException("El usuario ya tiene un perfil de recepcionista");
        }

        if (administratorProfileRepository.existsByUserUserId(request.userId())) {
            logger.warn("Creación de perfil de paciente rechazada: usuario ya tiene perfil de administrador. userId={}",
                    request.userId());
            throw new RuntimeException("El usuario ya tiene un perfil de administrador");
        }

        User user = userService.findUserEntityById(request.userId());

        PatientProfile profile = new PatientProfile();
        profile.setUser(user);
        profile.setHealthInsurance(request.healthInsurance());
        profile.setEmergencyContactName(request.emergencyContactName());
        profile.setEmergencyContactPhone(request.emergencyContactPhone());
        profile.setBloodType(request.bloodType());
        profile.setAllergies(request.allergies());
        profile.setWeight(request.weight());

        PatientProfile savedProfile = patientProfileRepository.save(profile);

        authClient.assignRole(user.getAuthUserId(), "PATIENT");

        return toResponseDTO(savedProfile);
    }

    public PatientProfileResponseDTO getPatientProfileByUserId(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: perfil de paciente no encontrado para userId={}", userId);
                    return new RuntimeException("Perfil de paciente no encontrado");
                });

        return toResponseDTO(profile);
    }

    public PatientProfileResponseDTO getPatientProfileByUserId(Long userId, String authenticatedEmail) {
        assertPatientOwnsUserId(userId, authenticatedEmail);
        return getPatientProfileByUserId(userId);
    }

    public List<PatientProfileResponseDTO> getAllPatientProfiles() {
        return patientProfileRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public PatientProfileResponseDTO getPatientProfileById(Long patientProfileId) {
        PatientProfile profile = patientProfileRepository.findById(patientProfileId)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: perfil de paciente no encontrado con ID {}", patientProfileId);
                    return new RuntimeException("Perfil de paciente no encontrado");
                });

        return toResponseDTO(profile);
    }

    public boolean existsByUserId(Long userId) {
        return patientProfileRepository.existsByUserUserId(userId);
    }

    public boolean existsByUserId(Long userId, String authenticatedEmail) {
        assertPatientOwnsUserId(userId, authenticatedEmail);
        return existsByUserId(userId);
    }

    private void assertPatientOwnsUserId(Long requestedUserId, String authenticatedEmail) {
        if (authenticatedEmail == null || !userService.getUserByEmail(authenticatedEmail).userId().equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder al perfil de otro paciente");
        }
    }

    public PatientProfileResponseDTO updatePatientProfile(
            Long patientProfileId,
            UpdatePatientProfileRequestDTO request) {
        PatientProfile profile = patientProfileRepository.findById(patientProfileId)
                .orElseThrow(() -> {
                    logger.warn("Actualización rechazada: perfil de paciente no encontrado con ID {}",
                            patientProfileId);
                    return new RuntimeException("Perfil de paciente no encontrado");
                });

        profile.setHealthInsurance(request.healthInsurance());
        profile.setEmergencyContactName(request.emergencyContactName());
        profile.setEmergencyContactPhone(request.emergencyContactPhone());
        profile.setBloodType(request.bloodType());
        profile.setAllergies(request.allergies());
        profile.setWeight(request.weight());

        PatientProfile savedProfile = patientProfileRepository.save(profile);

        return toResponseDTO(savedProfile);
    }

    public PatientProfileResponseDTO updateOwnPatientProfile(
            String authenticatedEmail,
            UpdatePatientProfileRequestDTO request) {
        Long userId = userService.getUserByEmail(authenticatedEmail).userId();
        assertPatientOwnsUserId(userId, authenticatedEmail);
        PatientProfile profile = patientProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Perfil de paciente no encontrado"));
        return updatePatientProfile(profile.getPatientProfileId(), request);
    }

    public void deletePatientProfile(Long patientProfileId) {
        PatientProfile profile = patientProfileRepository.findById(patientProfileId)
                .orElseThrow(() -> {
                    logger.warn("Eliminación rechazada: perfil de paciente no encontrado con ID {}", patientProfileId);
                    return new RuntimeException("Perfil de paciente no encontrado");
                });

        patientProfileRepository.delete(profile);
    }

    public PatientProfileResponseDTO toResponseDTO(PatientProfile profile) {
        return new PatientProfileResponseDTO(
                profile.getPatientProfileId(),
                profile.getUser().getUserId(),
                profile.getHealthInsurance(),
                profile.getEmergencyContactName(),
                profile.getEmergencyContactPhone(),
                profile.getBloodType(),
                profile.getAllergies(),
                profile.getWeight());
    }
}
