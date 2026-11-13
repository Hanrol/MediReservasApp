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
import org.springframework.web.bind.annotation.RequestHeader;

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.CreatePatientProfileRequestDTO;
import cl.duoc.users.dto.PatientProfileResponseDTO;
import cl.duoc.users.dto.UpdatePatientProfileRequestDTO;
import cl.duoc.users.service.PatientProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/patient-profiles")
@RequiredArgsConstructor
@Tag(name = "Patient Profiles", description = "Endpoints para la gestión de perfiles de paciente")
public class PatientProfileController {

	private final PatientProfileService patientProfileService;

	@PostMapping
	@Operation(summary = "Crear perfil de paciente", description = "Crea un perfil de paciente para un usuario existente que ya posee perfil general. Al crearlo, se asigna el rol PATIENT en Auth Service.")
	public ResponseEntity<ApiResponse<PatientProfileResponseDTO>> createPatientProfile(
			@Valid @RequestBody CreatePatientProfileRequestDTO request) {
		PatientProfileResponseDTO response = patientProfileService.createPatientProfile(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(
						201,
						"Perfil de paciente creado correctamente",
						response));
	}

	@GetMapping
	@Operation(summary = "Listar perfiles de paciente", description = "Obtiene todos los perfiles de paciente registrados.")
	public ResponseEntity<ApiResponse<List<PatientProfileResponseDTO>>> getAllPatientProfiles() {
		List<PatientProfileResponseDTO> response = patientProfileService.getAllPatientProfiles();

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfiles de paciente obtenidos correctamente",
						response));
	}

	@GetMapping("/{patientProfileId}")
	@Operation(summary = "Buscar perfil de paciente por ID", description = "Obtiene un perfil de paciente mediante su identificador.")
	public ResponseEntity<ApiResponse<PatientProfileResponseDTO>> getPatientProfileById(
			@PathVariable Long patientProfileId) {
		PatientProfileResponseDTO response = patientProfileService.getPatientProfileById(patientProfileId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de paciente obtenido correctamente",
						response));
	}

	@GetMapping("/user/{userId}")
	@Operation(summary = "Buscar perfil de paciente por usuario", description = "Obtiene el perfil de paciente asociado a un usuario mediante su userId.")
	public ResponseEntity<ApiResponse<PatientProfileResponseDTO>> getPatientProfileByUserId(
			@PathVariable Long userId,
			@RequestHeader("X-Authenticated-Email") String email) {
		PatientProfileResponseDTO response = patientProfileService.getPatientProfileByUserId(userId, email);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de paciente obtenido correctamente por usuario",
						response));
	}

	@GetMapping("/user/{userId}/exists")
	@Operation(summary = "Validar existencia de perfil de paciente", description = "Verifica si un usuario ya posee perfil de paciente.")
	public ResponseEntity<ApiResponse<Boolean>> existsByUserId(
			@PathVariable Long userId,
			@RequestHeader("X-Authenticated-Email") String email) {
		boolean response = patientProfileService.existsByUserId(userId, email);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Validación realizada correctamente",
						response));
	}

	@PutMapping("/{patientProfileId}")
	@Operation(summary = "Actualizar perfil de paciente", description = "Actualiza los datos médicos y de contacto asociados a un perfil de paciente.")
	public ResponseEntity<ApiResponse<PatientProfileResponseDTO>> updatePatientProfile(
			@PathVariable Long patientProfileId,
			@Valid @RequestBody UpdatePatientProfileRequestDTO request) {
		PatientProfileResponseDTO response = patientProfileService.updatePatientProfile(
				patientProfileId,
				request);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de paciente actualizado correctamente",
						response));
	}

	@PutMapping("/me")
	public ResponseEntity<ApiResponse<PatientProfileResponseDTO>> updateOwnPatientProfile(
			@RequestHeader("X-Authenticated-Email") String authenticatedEmail,
			@Valid @RequestBody UpdatePatientProfileRequestDTO request) {
		PatientProfileResponseDTO response = patientProfileService.updateOwnPatientProfile(authenticatedEmail, request);
		return ResponseEntity.ok(new ApiResponse<>(200, "Datos opcionales del paciente actualizados", response));
	}

	@DeleteMapping("/{patientProfileId}")
	@Operation(summary = "Eliminar perfil de paciente", description = "Elimina un perfil de paciente registrado.")
	public ResponseEntity<ApiResponse<Object>> deletePatientProfile(
			@PathVariable Long patientProfileId) {
		patientProfileService.deletePatientProfile(patientProfileId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Perfil de paciente eliminado correctamente",
						null));
	}
}
