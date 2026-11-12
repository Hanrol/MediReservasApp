package cl.duoc.users.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.dto.CurrentUserResponseDTO;
import cl.duoc.users.dto.UpdateUserRequestDTO;
import cl.duoc.users.dto.UserResponseDTO;
import cl.duoc.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints para la gestión de usuarios base del sistema")
public class UserController {

	private final UserService userService;

	@GetMapping("/me")
	@Operation(summary = "Obtener mi usuario", description = "Obtiene únicamente los datos del usuario autenticado a partir del correo verificado por el Gateway.")
	public ResponseEntity<ApiResponse<CurrentUserResponseDTO>> getCurrentUser(
			@RequestHeader("X-Authenticated-Email") String authenticatedEmail) {
		CurrentUserResponseDTO response = userService.getCurrentUser(authenticatedEmail);

		return ResponseEntity.ok(
				new ApiResponse<>(200, "Usuario autenticado obtenido correctamente", response));
	}

	@PostMapping
	@Operation(summary = "Crear usuario base", description = "Crea un usuario base del sistema validando previamente que exista un usuario de autenticación en Auth Service con el correo indicado.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> createUser(
			@Valid @RequestBody CreateUserRequestDTO request) {
		UserResponseDTO response = userService.createUser(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(201, "Usuario creado correctamente", response));
	}

	@GetMapping
	@Operation(summary = "Listar usuarios", description = "Obtiene todos los usuarios base registrados en el sistema.")
	public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers() {
		List<UserResponseDTO> response = userService.getAllUsers();

		return ResponseEntity.ok(
				new ApiResponse<>(200, "Usuarios obtenidos correctamente", response));
	}

	@GetMapping("/{userId}")
	@Operation(summary = "Buscar usuario por ID", description = "Obtiene un usuario base mediante su identificador interno.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(
			@PathVariable Long userId) {
		UserResponseDTO response = userService.getUserById(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(200, "Usuario obtenido correctamente", response));
	}

	@GetMapping("/{userId}/exists")
	@Operation(summary = "Validar existencia de usuario", description = "Verifica si existe un usuario base mediante su identificador. Este endpoint puede ser utilizado por otros microservicios como referencia lógica.")
	public ResponseEntity<ApiResponse<Boolean>> existsById(
			@PathVariable Long userId) {
		boolean exists = userService.existsById(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(200, "Validación realizada correctamente", exists));
	}

	@GetMapping("/run/{run}")
	@Operation(summary = "Buscar usuario por RUN", description = "Obtiene un usuario base mediante su RUN.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByRun(
			@PathVariable String run) {
		UserResponseDTO response = userService.getUserByRun(run);

		return ResponseEntity.ok(
				new ApiResponse<>(200, "Usuario obtenido correctamente por RUN", response));
	}

	@GetMapping("/email/{email}")
	@Operation(summary = "Buscar usuario por correo", description = "Obtiene un usuario base mediante su correo electrónico.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByEmail(
			@PathVariable String email) {
		UserResponseDTO response = userService.getUserByEmail(email);

		return ResponseEntity.ok(
				new ApiResponse<>(200, "Usuario obtenido correctamente por correo", response));
	}

	@PutMapping("/{userId}")
	@Operation(summary = "Actualizar usuario", description = "Actualiza los datos principales de un usuario base, como RUN y correo.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(
			@PathVariable Long userId,
			@Valid @RequestBody UpdateUserRequestDTO request) {
		UserResponseDTO response = userService.updateUser(userId, request);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Usuario actualizado correctamente",
						response));
	}

	@PatchMapping("/{userId}/activate")
	@Operation(summary = "Activar usuario", description = "Activa lógicamente un usuario base previamente desactivado.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> activateUser(
			@PathVariable Long userId) {
		UserResponseDTO response = userService.activateUser(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Usuario activado correctamente",
						response));
	}

	@PatchMapping("/{userId}/deactivate")
	@Operation(summary = "Desactivar usuario", description = "Desactiva lógicamente un usuario base sin eliminarlo de la base de datos.")
	public ResponseEntity<ApiResponse<UserResponseDTO>> deactivateUser(
			@PathVariable Long userId) {
		UserResponseDTO response = userService.deactivateUser(userId);

		return ResponseEntity.ok(
				new ApiResponse<>(
						200,
						"Usuario desactivado correctamente",
						response));
	}
}
