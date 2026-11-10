package cl.duoc.specialties.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.specialties.dto.ApiResponse;
import cl.duoc.specialties.dto.CreateSpecialtyRequestDTO;
import cl.duoc.specialties.dto.SpecialtyResponseDTO;
import cl.duoc.specialties.service.SpecialtyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/specialties")
@RequiredArgsConstructor
@Tag(name = "Specialties", description = "Endpoints para la gestión de especialidades médicas")
public class SpecialtyController {

	private final SpecialtyService specialtyService;

	@PostMapping
	@Operation(summary = "Crear especialidad", description = "Registra una nueva especialidad médica en el catálogo del sistema.")
	public ResponseEntity<ApiResponse<SpecialtyResponseDTO>> createSpecialty(
			@Valid @RequestBody CreateSpecialtyRequestDTO request) {
		SpecialtyResponseDTO response = specialtyService.createSpecialty(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(
						201,
						"Especialidad creada correctamente",
						response));
	}

	@GetMapping
	@Operation(summary = "Listar especialidades", description = "Obtiene todas las especialidades médicas registradas.")
	public ResponseEntity<ApiResponse<List<SpecialtyResponseDTO>>> getAllSpecialties() {
		List<SpecialtyResponseDTO> response = specialtyService.getAllSpecialties();

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Especialidades obtenidas correctamente",
						response));
	}

	@GetMapping("/{specialtyId}")
	@Operation(summary = "Buscar especialidad por ID", description = "Obtiene una especialidad médica mediante su identificador.")
	public ResponseEntity<ApiResponse<SpecialtyResponseDTO>> getSpecialtyById(
			@PathVariable Long specialtyId) {
		SpecialtyResponseDTO response = specialtyService.getSpecialtyById(specialtyId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Especialidad obtenida correctamente",
						response));
	}

	@GetMapping("/name/{specialtyName}")
	@Operation(summary = "Buscar especialidad por nombre", description = "Obtiene una especialidad médica mediante su nombre.")
	public ResponseEntity<ApiResponse<SpecialtyResponseDTO>> getSpecialtyByName(
			@PathVariable String specialtyName) {
		SpecialtyResponseDTO response = specialtyService.getSpecialtyByName(specialtyName);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Especialidad obtenida correctamente por nombre",
						response));
	}

	@GetMapping("/{specialtyId}/exists")
	@Operation(summary = "Validar existencia de especialidad", description = "Verifica si existe una especialidad médica mediante su identificador.")
	public ResponseEntity<ApiResponse<Boolean>> existsById(
			@PathVariable Long specialtyId) {
		boolean response = specialtyService.existsById(specialtyId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Validación realizada correctamente",
						response));
	}

	@GetMapping("/{specialtyId}/active")
	@Operation(summary = "Validar especialidad activa", description = "Verifica si una especialidad existe y se encuentra activa.")
	public ResponseEntity<ApiResponse<Boolean>> existsActiveById(
			@PathVariable Long specialtyId) {
		boolean response = specialtyService.existsActiveById(specialtyId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Validación de especialidad activa realizada correctamente",
						response));
	}

	@PutMapping("/{specialtyId}")
	@Operation(summary = "Actualizar especialidad", description = "Actualiza el nombre y la descripción de una especialidad médica.")
	public ResponseEntity<ApiResponse<SpecialtyResponseDTO>> updateSpecialty(
			@PathVariable Long specialtyId,
			@Valid @RequestBody CreateSpecialtyRequestDTO request) {
		SpecialtyResponseDTO response = specialtyService.updateSpecialty(specialtyId, request);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Especialidad actualizada correctamente",
						response));
	}

	@PatchMapping("/{specialtyId}/deactivate")
	@Operation(summary = "Desactivar especialidad", description = "Desactiva lógicamente una especialidad médica.")
	public ResponseEntity<ApiResponse<SpecialtyResponseDTO>> deactivateSpecialty(
			@PathVariable Long specialtyId) {
		SpecialtyResponseDTO response = specialtyService.deactivateSpecialty(specialtyId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Especialidad desactivada correctamente",
						response));
	}

	@PatchMapping("/{specialtyId}/activate")
	@Operation(summary = "Activar especialidad", description = "Activa una especialidad médica previamente desactivada.")
	public ResponseEntity<ApiResponse<SpecialtyResponseDTO>> activateSpecialty(
			@PathVariable Long specialtyId) {
		SpecialtyResponseDTO response = specialtyService.activateSpecialty(specialtyId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Especialidad activada correctamente",
						response));
	}
}