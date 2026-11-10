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

import cl.duoc.users.dto.AdministratorProfileResponseDTO;
import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.CreateAdministratorProfileRequestDTO;
import cl.duoc.users.dto.UpdateAdministratorProfileRequestDTO;
import cl.duoc.users.service.AdministratorProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/administrator-profiles")
@RequiredArgsConstructor
@Tag(name = "Administrator Profiles", description = "Endpoints para la gestión de perfiles de administrador")
public class AdministratorProfileController {

	private final AdministratorProfileService administratorProfileService;

	@PostMapping
	@Operation(summary = "Crear perfil de administrador", description = "Crea un perfil de administrador para un usuario existente que ya posee perfil general. Al crearlo, se asigna el rol ADMIN en Auth Service.")
	public ResponseEntity<ApiResponse<AdministratorProfileResponseDTO>> createAdministratorProfile(
			@Valid @RequestBody CreateAdministratorProfileRequestDTO request) {
		AdministratorProfileResponseDTO response = administratorProfileService.createAdministratorProfile(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(
						201,
						"Perfil de administrador creado correctamente",
						response));
	}

	@GetMapping
	@Operation(summary = "Listar perfiles de administrador", description = "Obtiene todos los perfiles de administrador registrados.")
	public ResponseEntity<ApiResponse<List<AdministratorProfileResponseDTO>>> getAllAdministratorProfiles() {
		List<AdministratorProfileResponseDTO> response = administratorProfileService.getAllAdministratorProfiles();

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfiles de administrador obtenidos correctamente",
						response));
	}

	@GetMapping("/{administratorProfileId}")
	@Operation(summary = "Buscar perfil de administrador por ID", description = "Obtiene un perfil de administrador mediante su identificador.")
	public ResponseEntity<ApiResponse<AdministratorProfileResponseDTO>> getAdministratorProfileById(
			@PathVariable Long administratorProfileId) {
		AdministratorProfileResponseDTO response = administratorProfileService
				.getAdministratorProfileById(administratorProfileId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de administrador obtenido correctamente",
						response));
	}

	@GetMapping("/user/{userId}")
	@Operation(summary = "Buscar perfil de administrador por usuario", description = "Obtiene el perfil de administrador asociado a un usuario mediante su userId.")
	public ResponseEntity<ApiResponse<AdministratorProfileResponseDTO>> getAdministratorProfileByUserId(
			@PathVariable Long userId) {
		AdministratorProfileResponseDTO response = administratorProfileService
				.getAdministratorProfileByUserId(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de administrador obtenido correctamente por usuario",
						response));
	}

	@GetMapping("/user/{userId}/exists")
	@Operation(summary = "Validar existencia de perfil de administrador", description = "Verifica si un usuario ya posee perfil de administrador.")
	public ResponseEntity<ApiResponse<Boolean>> existsByUserId(
			@PathVariable Long userId) {
		boolean response = administratorProfileService.existsByUserId(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Validación realizada correctamente",
						response));
	}

	@PutMapping("/{administratorProfileId}")
	@Operation(summary = "Actualizar perfil de administrador", description = "Actualiza los datos administrativos del perfil, como departamento y cargo.")
	public ResponseEntity<ApiResponse<AdministratorProfileResponseDTO>> updateAdministratorProfile(
			@PathVariable Long administratorProfileId,
			@Valid @RequestBody UpdateAdministratorProfileRequestDTO request) {
		AdministratorProfileResponseDTO response = administratorProfileService.updateAdministratorProfile(
				administratorProfileId,
				request);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de administrador actualizado correctamente",
						response));
	}

	@DeleteMapping("/{administratorProfileId}")
	@Operation(summary = "Eliminar perfil de administrador", description = "Elimina un perfil de administrador registrado.")
	public ResponseEntity<ApiResponse<Object>> deleteAdministratorProfile(
			@PathVariable Long administratorProfileId) {
		administratorProfileService.deleteAdministratorProfile(administratorProfileId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de administrador eliminado correctamente",
						null));
	}
}