package cl.duoc.appointments.controller;

import cl.duoc.appointments.service.ScheduleSlotService;
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
import cl.duoc.appointments.dto.ScheduleSlotRequest;
import cl.duoc.appointments.dto.ScheduleSlotResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/schedule-slots")
@RequiredArgsConstructor
@Tag(name = "ScheduleSlots", description = "API de gestión de slots de agenda")
public class ScheduleSlotController {

    private final ScheduleSlotService scheduleSlotService;

    @Operation(summary = "Crear slot de agenda")
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleSlotResponse>> create(@Valid @RequestBody ScheduleSlotRequest request) {
        ScheduleSlotResponse data = scheduleSlotService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Slot creado", data));
    }

    @Operation(summary = "Obtener slot de agenda por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleSlotResponse>> findById(@PathVariable Long id) {
        ScheduleSlotResponse data = scheduleSlotService.findById(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Slot encontrado", data));
    }

    @Operation(summary = "Listar todos los slots de agenda")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleSlotResponse>>> findAll() {
        List<ScheduleSlotResponse> data = scheduleSlotService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(200, "Lista de slots", data));
    }

    @Operation(summary = "Actualizar slot de agenda")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleSlotResponse>> update(@PathVariable Long id, @Valid @RequestBody ScheduleSlotRequest request) {
        ScheduleSlotResponse data = scheduleSlotService.update(id, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Slot actualizado", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        scheduleSlotService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Slot eliminado", null));
    }
}