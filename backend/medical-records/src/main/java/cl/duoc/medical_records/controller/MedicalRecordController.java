package cl.duoc.medical_records.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cl.duoc.medical_records.dto.*;
import cl.duoc.medical_records.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import cl.duoc.medical_records.security.ClinicalOwnershipVerifier;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v3/medical-records")
public class MedicalRecordController {

    @Autowired
    private ClinicalOwnershipVerifier ownershipVerifier;
    
    private final MedicalRecordService medicalRecordService;
    private static final Logger logger = LoggerFactory.getLogger(MedicalRecordController.class);

    @GetMapping()
    @Operation(summary = "Lista los registros médicos", description = "Permite listar TODOS los registros médicos almacenados")
    public ResponseEntity<ApiResponse<List<MedicalRecordDetailResponseDTO>>> getAllMedicalRecords(
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            List<MedicalRecordDetailResponseDTO> medicalRecords = isDoctor(roles)
                    ? medicalRecordService.listAllForDoctor(ownershipVerifier.authenticatedDoctorId(email))
                    : medicalRecordService.listAll();
            return ResponseEntity.ok(new ApiResponse<>(200, "Listado de registros médicos", medicalRecords));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (Exception e) {
            logger.error("Error al listar registros médicos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al listar registros médicos: " + e.getMessage(), null));
        }
    }

    @PostMapping()
    @Operation(summary = "Crea un nuevo registro médico", description = "Permite crear un nuevo registro médico utilizando el ID del paciente")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDTO>> createMedicalRecord(@Valid @RequestBody CreateMedicalRecordRequestDTO requestDTO) {
        try {
            MedicalRecordResponseDTO medicalRecord = medicalRecordService.create(requestDTO);
            return ResponseEntity.ok(new ApiResponse<>(200, "Registro médico creado", medicalRecord));
        } catch (Exception e) {
            logger.error("Error al crear registro médico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al crear registro médico: " + e.getMessage(), null));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtiene un registro médico por ID del paciente", description = "Permite obtener un registro médico consultando con el ID del paciente")
    public ResponseEntity<ApiResponse<MedicalRecordDetailResponseDTO>> getByPatientId(@PathVariable Long id,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            MedicalRecordDetailResponseDTO medicalRecord = isDoctor(roles)
                    ? medicalRecordService.findByPatientIdForDoctor(id, ownershipVerifier.authenticatedDoctorId(email))
                    : medicalRecordService.findByPatientId(id);
            return ResponseEntity.ok(new ApiResponse<>(200, "Registro médico encontrado", medicalRecord));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            logger.error("Error al obtener registro médico: {}", e.getMessage());
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error al obtener registro médico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al obtener registro médico: " + e.getMessage(), null));
        }
    }

    @GetMapping("/detail/{medicalRecordId}")
    @Operation(summary = "Obtiene detalle completo por ID de registro médico", description = "Permite obtener el detalle completo de un registro médico")
    public ResponseEntity<ApiResponse<MedicalRecordDetailResponseDTO>> getByMedicalRecordId(@PathVariable Long medicalRecordId,
            @RequestHeader(value = "X-Authenticated-Email", required = false) String email,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        try {
            MedicalRecordDetailResponseDTO medicalRecord = isDoctor(roles)
                    ? medicalRecordService.findByMedicalRecordIdForDoctor(medicalRecordId, ownershipVerifier.authenticatedDoctorId(email))
                    : medicalRecordService.findByMedicalRecordId(medicalRecordId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Registro médico encontrado", medicalRecord));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            int status = e.getStatusCode().value();
            return ResponseEntity.status(status).body(new ApiResponse<>(status, e.getReason(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{medicalRecordId}/deactivate")
    @Operation(summary = "Desactivar registro médico", description = "Permite desactivar un registro médico (soft delete)")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDTO>> deactivateMedicalRecord(@PathVariable Long medicalRecordId) {
        try {
            MedicalRecordResponseDTO updatedRecord = medicalRecordService.deactivate(medicalRecordId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Registro médico desactivado", updatedRecord));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{medicalRecordId}/activate")
    @Operation(summary = "Activar registro médico", description = "Permite activar un registro médico")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDTO>> activateMedicalRecord(@PathVariable Long medicalRecordId) {
        try {
            MedicalRecordResponseDTO updatedRecord = medicalRecordService.activate(medicalRecordId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Registro médico activado", updatedRecord));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{medicalRecordId}")
    @Operation(summary = "Eliminar registro médico", description = "Permite eliminar un registro médico (hard delete - solo si no tiene visitas)")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalRecord(@PathVariable Long medicalRecordId) {
        try {
            medicalRecordService.delete(medicalRecordId);
            return ResponseEntity.ok(new ApiResponse<>(200, "Registro médico eliminado correctamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Error al eliminar: " + e.getMessage(), null));
        }
    }

    private boolean isDoctor(String roles) {
        if (roles == null) return false;
        java.util.Set<String> roleSet = java.util.Arrays.stream(roles.split(","))
                .map(String::trim).map(String::toUpperCase).collect(java.util.stream.Collectors.toSet());
        return roleSet.contains("DOCTOR") && !roleSet.contains("ADMIN") && !roleSet.contains("RECEPTIONIST");
    }
}
