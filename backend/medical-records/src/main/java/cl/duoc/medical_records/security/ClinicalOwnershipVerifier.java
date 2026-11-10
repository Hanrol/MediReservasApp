package cl.duoc.medical_records.security;

import java.util.List;
import java.util.Set;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.medical_records.dto.ApiResponse;
import cl.duoc.medical_records.model.MedicalRecord;
import cl.duoc.medical_records.model.MedicalVisit;
import cl.duoc.medical_records.repository.DiagnosesRepository;
import cl.duoc.medical_records.repository.MedicalRecordRepository;
import cl.duoc.medical_records.repository.MedicalVisitRepository;
import cl.duoc.medical_records.repository.VitalSignsRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ClinicalOwnershipVerifier {
    private final WebClient.Builder webClientBuilder;
    private final MedicalRecordRepository records;
    private final MedicalVisitRepository visits;
    private final DiagnosesRepository diagnoses;
    private final VitalSignsRepository vitalSigns;

    public boolean isDoctorOnly(Set<String> roles) {
        return roles.contains("DOCTOR") && !roles.contains("ADMIN") && !roles.contains("RECEPTIONIST");
    }

    public Long authenticatedDoctorId(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No se pudo verificar la identidad del médico");
        }
        ApiResponse<UserInfo> userResponse;
        List<DoctorInfo> doctors;
        try {
            userResponse = webClientBuilder.build().get()
                    .uri("http://users-service/api/v3/users/email/{email}", email)
                    .retrieve().bodyToMono(new ParameterizedTypeReference<ApiResponse<UserInfo>>() {}).block();
            doctors = webClientBuilder.build().get()
                    .uri("http://doctors-service/api/v3/doctors")
                    .retrieve().bodyToMono(new ParameterizedTypeReference<List<DoctorInfo>>() {}).block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario autenticado no válido");
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el médico");
        }
        if (userResponse == null || userResponse.getData() == null || !userResponse.getData().active()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario autenticado no válido");
        }
        if (doctors == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el médico");
        }
        Long userId = userResponse.getData().userId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario autenticado no válido");
        }
        return doctors.stream().filter(java.util.Objects::nonNull).filter(DoctorInfo::active)
                .filter(doctor -> userId.equals(doctor.userId()) && doctor.doctorId() != null)
                .map(DoctorInfo::doctorId).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario no tiene perfil médico activo"));
    }

    public void requireVisit(Long visitId, String email, Set<String> roles) {
        if (isDoctorOnly(roles)) requireDoctor(visits.findById(visitId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Visita no encontrada"))
                .getDoctorId(), email, roles);
    }

    public void requireMedicalRecord(Long recordId, String email, Set<String> roles) {
        if (!isDoctorOnly(roles)) return;
        MedicalRecord record = records.findById(recordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro no encontrado"));
        Long doctorId = authenticatedDoctorId(email);
        if (!hasVisitOwnedBy(record, doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a este registro médico");
        }
    }

    public void requireDiagnosis(Long diagnosisId, String email, Set<String> roles) {
        if (isDoctorOnly(roles)) {
            var entity = diagnoses.findById(diagnosisId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diagnóstico no encontrado"));
            requireDoctor(entity.getMedicalVisit() == null ? null : entity.getMedicalVisit().getDoctorId(), email, roles);
        }
    }

    public void requireVitalSign(Long vitalSignId, String email, Set<String> roles) {
        if (isDoctorOnly(roles)) {
            var entity = vitalSigns.findById(vitalSignId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Signo vital no encontrado"));
            requireDoctor(entity.getMedicalVisit() == null ? null : entity.getMedicalVisit().getDoctorId(), email, roles);
        }
    }

    public void requireDoctor(Long resourceDoctorId, String email, Set<String> roles) {
        if (isDoctorOnly(roles)) assertDoctorAccess(authenticatedDoctorId(email), resourceDoctorId);
    }

    public static void assertDoctorAccess(Long authenticatedDoctorId, Long resourceDoctorId) {
        if (authenticatedDoctorId == null || !authenticatedDoctorId.equals(resourceDoctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a recursos de otro médico");
        }
    }

    private boolean hasVisitOwnedBy(MedicalRecord record, Long doctorId) {
        return record.getMedicalVisits() != null && record.getMedicalVisits().stream()
                .filter(java.util.Objects::nonNull)
                .anyMatch(visit -> doctorId != null && doctorId.equals(visit.getDoctorId()));
    }

    public List<MedicalVisit> filterVisits(List<MedicalVisit> items, String email, Set<String> roles) {
        if (!isDoctorOnly(roles)) return items;
        Long doctorId = authenticatedDoctorId(email);
        return items.stream().filter(visit -> doctorId.equals(visit.getDoctorId())).toList();
    }

    private record UserInfo(Long userId, Long authUserId, String run, String email, boolean active) {}
    private record DoctorInfo(Long doctorId, Long userId, String medicalLicenseNumber, boolean active, List<Long> specialtyIds) {}
}
