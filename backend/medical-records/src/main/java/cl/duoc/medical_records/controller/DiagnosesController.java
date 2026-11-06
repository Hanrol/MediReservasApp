package cl.duoc.medical_records.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cl.duoc.medical_records.dto.*;
import cl.duoc.medical_records.service.DiagnosesService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import cl.duoc.medical_records.security.ClinicalOwnershipVerifier;
import java.util.Arrays;
import java.util.Set;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v3/diagnoses")
public class DiagnosesController {

    @Autowired
    private ClinicalOwnershipVerifier ownershipVerifier;
    
    private final DiagnosesService diagnosesService;
    private static final Logger logger = LoggerFactory.getLogger(DiagnosesController.class);

    @PostMapping()
    @Operation(summary = "Crear diagnóstico", description = "Permite crear diagnóstico con id del paciente, descripción y notas")
    public ResponseEntity<ApiResponse<DiagnosisResponseDTO>> createDiagnosis(@Valid @RequestBody CreateDiagnosisRequestDTO requestDTO,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(requestDTO.medicalVisitId(), email, parseRoles(roles));
            DiagnosisResponseDTO diagnosis = diagnosesService.create(requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Diagnóstico creado", diagnosis));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al registrar diagnóstico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al registrar diagnóstico: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener diagnóstico por ID", description = "Permite obtener un diagnóstico por su ID")
    public ResponseEntity<ApiResponse<DiagnosisResponseDTO>> getDiagnosisById(@PathVariable Long id,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireDiagnosis(id, email, parseRoles(roles));
            DiagnosisResponseDTO diagnosis = diagnosesService.findById(id);
            return ResponseEntity.ok(new ApiResponse<>(200, "Diagnóstico encontrado", diagnosis));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al obtener diagnóstico: {}", e.getMessage());
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    @GetMapping("/medical-visit/{medicalVisitId}")
    @Operation(summary = "Obtener diagnósticos por visita médica", description = "Permite obtener todos los diagnósticos de una visita médica")
    public ResponseEntity<ApiResponse<List<DiagnosisResponseDTO>>> getDiagnosesByMedicalVisit(@PathVariable Long medicalVisitId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(medicalVisitId, email, parseRoles(roles));
            List<DiagnosisResponseDTO> diagnoses = diagnosesService.findByMedicalVisitId(medicalVisitId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Diagnósticos encontrados", diagnoses));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al obtener diagnósticos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar diagnóstico", description = "Permite actualizar un diagnóstico existente")
    public ResponseEntity<ApiResponse<DiagnosisResponseDTO>> updateDiagnosis(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDiagnosisRequestDTO requestDTO,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireDiagnosis(id, email, parseRoles(roles));
            DiagnosisResponseDTO updatedDiagnosis = diagnosesService.update(id, requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Diagnóstico actualizado", updatedDiagnosis));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            logger.error("Error al actualizar diagnóstico: {}", e.getMessage());
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error al actualizar diagnóstico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al actualizar diagnóstico: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar diagnóstico", description = "Permite eliminar un diagnóstico existente")
    public ResponseEntity<ApiResponse<Void>> deleteDiagnosis(@PathVariable Long id,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireDiagnosis(id, email, parseRoles(roles));
            diagnosesService.delete(id);
            return ResponseEntity.ok(new ApiResponse<>(200, "Diagnóstico eliminado correctamente", null));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            logger.error("Error al eliminar diagnóstico: {}", e.getMessage());
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error al eliminar diagnóstico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al eliminar diagnóstico: " + e.getMessage(), null));
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
