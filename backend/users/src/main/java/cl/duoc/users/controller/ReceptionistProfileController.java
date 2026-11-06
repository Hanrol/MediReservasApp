package cl.duoc.users.controller;

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

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.CreateReceptionistProfileRequestDTO;
import cl.duoc.users.dto.ReceptionistProfileResponseDTO;
import cl.duoc.users.dto.UpdateReceptionistProfileRequestDTO;
import cl.duoc.users.service.ReceptionistProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/receptionist-profiles")
@RequiredArgsConstructor
@Tag(name = "Receptionist Profiles", description = "Endpoints para la gestión de perfiles de recepcionista")
public class ReceptionistProfileController {

	private final ReceptionistProfileService receptionistProfileService;

	@PostMapping
	@Operation(summary = "Crear perfil de recepcionista", description = "Crea un perfil de recepcionista para un usuario existente que ya posee perfil general. Al crearlo, se asigna el rol RECEPTIONIST en Auth Service.")
	public ResponseEntity<ApiResponse<ReceptionistProfileResponseDTO>> createReceptionistProfile(
			@Valid @RequestBody CreateReceptionistProfileRequestDTO request) {
		ReceptionistProfileResponseDTO response = receptionistProfileService.createReceptionistProfile(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(
						201,
						"Perfil de recepcionista creado correctamente",
						response));
	}

	@GetMapping
	@Operation(summary = "Listar perfiles de recepcionista", description = "Obtiene todos los perfiles de recepcionista registrados.")
	public ResponseEntity<ApiResponse<List<ReceptionistProfileResponseDTO>>> getAllReceptionistProfiles() {
		List<ReceptionistProfileResponseDTO> response = receptionistProfileService.getAllReceptionistProfiles();

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfiles de recepcionista obtenidos correctamente",
						response));
	}

	@GetMapping("/{receptionistProfileId}")
	@Operation(summary = "Buscar perfil de recepcionista por ID", description = "Obtiene un perfil de recepcionista mediante su identificador.")
	public ResponseEntity<ApiResponse<ReceptionistProfileResponseDTO>> getReceptionistProfileById(
			@PathVariable Long receptionistProfileId) {
		ReceptionistProfileResponseDTO response = receptionistProfileService
				.getReceptionistProfileById(receptionistProfileId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de recepcionista obtenido correctamente",
						response));
	}

	@GetMapping("/user/{userId}")
	@Operation(summary = "Buscar perfil de recepcionista por usuario", description = "Obtiene el perfil de recepcionista asociado a un usuario mediante su userId.")
	public ResponseEntity<ApiResponse<ReceptionistProfileResponseDTO>> getReceptionistProfileByUserId(
			@PathVariable Long userId) {
		ReceptionistProfileResponseDTO response = receptionistProfileService
				.getReceptionistProfileByUserId(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de recepcionista obtenido correctamente por usuario",
						response));
	}

	@GetMapping("/user/{userId}/exists")
	@Operation(summary = "Validar existencia de perfil de recepcionista", description = "Verifica si un usuario ya posee perfil de recepcionista.")
	public ResponseEntity<ApiResponse<Boolean>> existsByUserId(
			@PathVariable Long userId) {
		boolean response = receptionistProfileService.existsByUserId(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Validación realizada correctamente",
						response));
	}

	@PutMapping("/{receptionistProfileId}")
	@Operation(summary = "Actualizar perfil de recepcionista", description = "Actualiza los datos laborales asociados a un perfil de recepcionista, como turno y departamento.")
	public ResponseEntity<ApiResponse<ReceptionistProfileResponseDTO>> updateReceptionistProfile(
			@PathVariable Long receptionistProfileId,
			@Valid @RequestBody UpdateReceptionistProfileRequestDTO request) {
		ReceptionistProfileResponseDTO response = receptionistProfileService.updateReceptionistProfile(
				receptionistProfileId,
				request);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de recepcionista actualizado correctamente",
						response));
	}

	@DeleteMapping("/{receptionistProfileId}")
	@Operation(summary = "Eliminar perfil de recepcionista", description = "Elimina un perfil de recepcionista registrado.")
	public ResponseEntity<ApiResponse<Object>> deleteReceptionistProfile(
			@PathVariable Long receptionistProfileId) {
		receptionistProfileService.deleteReceptionistProfile(receptionistProfileId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de recepcionista eliminado correctamente",
						null));
	}
}