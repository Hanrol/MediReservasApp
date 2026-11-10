package cl.duoc.medical_records.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cl.duoc.medical_records.dto.*;
import cl.duoc.medical_records.service.VitalSignsService;
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
@RequestMapping("/api/v3/vital-signs")
public class VitalSignsController {

    @Autowired
    private ClinicalOwnershipVerifier ownershipVerifier;

    private final VitalSignsService vitalSignsService;
    private static final Logger logger = LoggerFactory.getLogger(VitalSignsController.class);

    @PostMapping()
    @Operation(summary = "Registra signos vitales", description = "Permite registrar los signos vitales relacionados al ID de visita médica")
    public ResponseEntity<ApiResponse<VitalSignResponseDTO>> createVitalSigns(@Valid @RequestBody CreateVitalSignRequestDTO requestDTO,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(requestDTO.medicalVisitId(), email, parseRoles(roles));
            VitalSignResponseDTO vitalSign = vitalSignsService.create(requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Signos vitales creados", vitalSign));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al registrar signos vitales: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al registrar signos vitales: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{vitalSignId}")
    @Operation(summary = "Obtiene signos vitales por ID", description = "Permite obtener signos vitales por su ID")
    public ResponseEntity<ApiResponse<VitalSignResponseDTO>> getVitalSignById(@PathVariable Long vitalSignId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVitalSign(vitalSignId, email, parseRoles(roles));
            VitalSignResponseDTO vitalSign = vitalSignsService.findById(vitalSignId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Signos vitales encontrados", vitalSign));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    @GetMapping("/medical-visit/{medicalVisitId}")
    @Operation(summary = "Obtiene signos vitales por visita médica", description = "Permite obtener todos los signos vitales registrados en una visita médica")
    public ResponseEntity<ApiResponse<java.util.List<VitalSignResponseDTO>>> getVitalSignsByMedicalVisit(@PathVariable Long medicalVisitId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVisit(medicalVisitId, email, parseRoles(roles));
            java.util.List<VitalSignResponseDTO> vitalSigns = vitalSignsService.findByMedicalVisitId(medicalVisitId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Signos vitales encontrados", vitalSigns));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{vitalSignId}")
    @Operation(summary = "Actualiza signos vitales", description = "Permite actualizar los signos vitales existentes")
    public ResponseEntity<ApiResponse<VitalSignResponseDTO>> updateVitalSigns(
            @PathVariable Long vitalSignId,
            @Valid @RequestBody UpdateVitalSignRequestDTO requestDTO,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVitalSign(vitalSignId, email, parseRoles(roles));
            VitalSignResponseDTO updatedVitalSign = vitalSignsService.update(vitalSignId, requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Signos vitales actualizados", updatedVitalSign));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al actualizar: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{vitalSignId}")
    @Operation(summary = "Elimina signos vitales", description = "Permite eliminar un registro de signos vitales")
    public ResponseEntity<ApiResponse<Void>> deleteVitalSigns(@PathVariable Long vitalSignId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            if (isDoctor(roles)) ownershipVerifier.requireVitalSign(vitalSignId, email, parseRoles(roles));
            vitalSignsService.delete(vitalSignId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Signos vitales eliminados correctamente", null));
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
