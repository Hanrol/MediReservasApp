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
import cl.duoc.appointments.dto.DoctorScheduleRequest;
import cl.duoc.appointments.dto.DoctorScheduleResponse;
import cl.duoc.appointments.service.DoctorScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/doctor-schedules")
@RequiredArgsConstructor
@Tag(name = "DoctorSchedules", description = "API de gestión de horarios de doctores")
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    @Operation(summary = "Crear horario de doctor")
    @PostMapping
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> create(@Valid @RequestBody DoctorScheduleRequest request) {
        DoctorScheduleResponse data = doctorScheduleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Horario creado", data));
    }

    @Operation(summary = "Obtener horario de doctor por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> findById(@PathVariable Long id) {
        DoctorScheduleResponse data = doctorScheduleService.findById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Horario encontrado", data));
    }

    @Operation(summary = "Listar todos los horarios de doctores")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> findAll() {
        List<DoctorScheduleResponse> data = doctorScheduleService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(200, "Lista de horarios", data));
    }

    @Operation(summary = "Actualizar horario de doctor")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> update(@PathVariable Long id, @Valid @RequestBody DoctorScheduleRequest request) {
        DoctorScheduleResponse data = doctorScheduleService.update(id, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Horario actualizado", data));
    }

    @Operation(summary = "Eliminar horario de doctor")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        doctorScheduleService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Horario eliminado", null));
    }
}
