package cl.duoc.medical_records.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cl.duoc.medical_records.dto.*;
import cl.duoc.medical_records.service.MedicalVisitService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import cl.duoc.medical_records.security.ClinicalOwnershipVerifier;
import java.util.Arrays;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v3/medical-visit")
public class MedicalVisitController {

    @Autowired
    private ClinicalOwnershipVerifier ownershipVerifier;

    private final MedicalVisitService medicalVisitService;
    private static final Logger logger = LoggerFactory.getLogger(MedicalVisitController.class);

    @PostMapping()
    @Operation(summary = "Registra una visita médica", description = "Permite registrar una visita médica")
    public ResponseEntity<ApiResponse<MedicalVisitResponseDTO>> createMedicalVisit(@Valid @RequestBody CreateMedicalVisitRequestDTO requestDTO,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireDoctor(requestDTO.doctorId(), email, parseRoles(roles));
            MedicalVisitResponseDTO medicalVisit = medicalVisitService.create(requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Visita médica creada", medicalVisit));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al crear una visita médica: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al crear una visita médica: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene visitas médicas por ID del paciente", description = "Permite obtener TODAS las visitas medicas asociadas al ID del paciente")
    public ResponseEntity<ApiResponse<List<MedicalVisitDetailReponseDTO>>> getAllByPatientId(@PathVariable Long id,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            List<MedicalVisitDetailReponseDTO> medicalVisits = medicalVisitService.findAllByPatientId(id);
            if (isDoctor(roles)) {
                Long doctorId = ownershipVerifier.authenticatedDoctorId(email);
                medicalVisits = medicalVisits.stream().filter(visit -> doctorId.equals(visit.doctorId())).toList();
            }
            return ResponseEntity.ok(new ApiResponse<>(200, "Visita(s) Médica(s) encontrada(s)", medicalVisits));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al encontrar visitas médicas: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al encontrar visitas médicas: " + e.getMessage(), null));
        }
    }

    @GetMapping("/detail/{medicalVisitId}")
    @Operation(summary = "Obtiene detalle de una visita médica por ID", description = "Permite obtener el detalle completo de una visita médica")
    public ResponseEntity<ApiResponse<MedicalVisitDetailReponseDTO>> getMedicalVisitDetail(@PathVariable Long medicalVisitId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(medicalVisitId, email, parseRoles(roles));
            MedicalVisitDetailReponseDTO medicalVisit = medicalVisitService.findDetailById(medicalVisitId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Visita médica encontrada", medicalVisit));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    @GetMapping("/record/{medicalRecordId}")
    @Operation(summary = "Obtiene visitas por registro médico", description = "Permite obtener todas las visitas de un registro médico")
    public ResponseEntity<ApiResponse<List<MedicalVisitResponseDTO>>> getByMedicalRecordId(@PathVariable Long medicalRecordId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireMedicalRecord(medicalRecordId, email, parseRoles(roles));
            List<MedicalVisitResponseDTO> visits = medicalVisitService.findByMedicalRecordId(medicalRecordId);
            if (isDoctor(roles)) {
                Long doctorId = ownershipVerifier.authenticatedDoctorId(email);
                visits = visits.stream().filter(visit -> doctorId.equals(visit.doctorId())).toList();
            }
            return ResponseEntity.ok(new ApiResponse<>(200, "Visitas encontradas", visits));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{medicalVisitId}")
    @Operation(summary = "Actualiza una visita médica", description = "Permite actualizar los datos de una visita médica existente")
    public ResponseEntity<ApiResponse<MedicalVisitResponseDTO>> updateMedicalVisit(
            @PathVariable Long medicalVisitId,
            @Valid @RequestBody UpdateMedicalVisitRequestDTO requestDTO,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(medicalVisitId, email, parseRoles(roles));
            MedicalVisitResponseDTO updatedVisit = medicalVisitService.update(medicalVisitId, requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Visita médica actualizada", updatedVisit));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al actualizar: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{medicalVisitId}")
    @Operation(summary = "Elimina una visita médica", description = "Permite eliminar una visita médica (solo si no tiene diagnósticos ni signos vitales asociados)")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalVisit(@PathVariable Long medicalVisitId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(medicalVisitId, email, parseRoles(roles));
            medicalVisitService.delete(medicalVisitId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Visita médica eliminada correctamente", null));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al eliminar: " + e.getMessage(), null));
        }
    }

    private boolean isDoctor(String roles) {
        Set<String> parsed = parseRoles(roles);
        return parsed.contains("DOCTOR") && !parsed.contains("ADMIN") && !parsed.contains("RECEPTIONIST");
    }
    private Set<String> parseRoles(String roles) {
        return roles == null ? Set.of() : Arrays.stream(roles.split(",")).map(String::trim)
                .map(String::toUpperCase).filter(role -> !role.isEmpty())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }
}
