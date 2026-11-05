package cl.duoc.prescriptions.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.prescriptions.dto.ApiResponse;
import cl.duoc.prescriptions.dto.PrescriptionRequest;
import cl.duoc.prescriptions.dto.PrescriptionResponse;
import cl.duoc.prescriptions.services.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "API de gestión de prescripciones")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @Operation(summary = "Crear prescripción")
    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionResponse>> create(@Valid @RequestBody PrescriptionRequest request) {
        PrescriptionResponse data = prescriptionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Prescripción creada", data));
    }

    @Operation(summary = "Obtener prescripción por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> findById(@PathVariable Long id) {
        PrescriptionResponse data = prescriptionService.findById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Prescripción encontrada", data));
    }

    @Operation(summary = "Listar todas las prescripciones")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> findAll() {
        List<PrescriptionResponse> data = prescriptionService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(200, "Lista de prescripciones", data));
    }

    @Operation(summary = "Actualizar prescripción")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> update(@PathVariable Long id, @Valid @RequestBody PrescriptionRequest request) {
        PrescriptionResponse data = prescriptionService.update(id, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Prescripción actualizada", data));
    }

    @Operation(summary = "Eliminar prescripción")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        prescriptionService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Prescripción eliminada", null));
    }
}