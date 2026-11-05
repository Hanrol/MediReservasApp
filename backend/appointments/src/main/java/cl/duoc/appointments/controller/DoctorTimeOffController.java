package cl.duoc.appointments.controller;

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

import cl.duoc.appointments.dto.ApiResponse;
import cl.duoc.appointments.dto.DoctorTimeOffRequest;
import cl.duoc.appointments.dto.DoctorTimeOffResponse;
import cl.duoc.appointments.service.DoctorTimeOffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1/doctor-time-off")
@RequiredArgsConstructor
@Tag(name = "DoctorTimeOff", description = "API de gestión de permisos de doctores")
public class DoctorTimeOffController {

    private final DoctorTimeOffService doctorTimeOffService;

    @Operation(summary = "Crear permiso de doctor")
    @PostMapping
    public ResponseEntity<ApiResponse<DoctorTimeOffResponse>> create(@Valid @RequestBody DoctorTimeOffRequest request) {
        DoctorTimeOffResponse data = doctorTimeOffService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Time off creado", data));
    }

    @Operation(summary = "Obtener permiso de doctor por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorTimeOffResponse>> findById(@PathVariable Long id) {
        DoctorTimeOffResponse data = doctorTimeOffService.findById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Time off encontrado", data));
    }

    @Operation(summary = "Listar todos los permisos de doctor")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorTimeOffResponse>>> findAll() {
        List<DoctorTimeOffResponse> data = doctorTimeOffService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(200, "Lista de time off", data));
    }

    @Operation(summary = "Actualizar permiso de doctor")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorTimeOffResponse>> update(@PathVariable Long id, @Valid @RequestBody DoctorTimeOffRequest request) {
        DoctorTimeOffResponse data = doctorTimeOffService.update(id, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Time off actualizado", data));
    }

    @Operation(summary = "Eliminar permiso de doctor")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        doctorTimeOffService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Time off eliminado", null));
    }
}
