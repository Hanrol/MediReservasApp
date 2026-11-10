package cl.duoc.auth.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.auth.dto.ApiResponse;
import cl.duoc.auth.dto.AssignRoleRequestDTO;
import cl.duoc.auth.dto.AuthResponseDTO;
import cl.duoc.auth.dto.AuthUserResponseDTO;
import cl.duoc.auth.dto.ChangePasswordRequestDTO;
import cl.duoc.auth.dto.LoginRequestDTO;
import cl.duoc.auth.dto.RegisterRequestDTO;
import cl.duoc.auth.dto.RoleResponseDTO;
import cl.duoc.auth.dto.TokenAuthorizationDTO;
import cl.duoc.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Endpoints para autenticación, usuarios de autenticación, roles y validación de tokens JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar usuario de autenticación", description = "Crea un nuevo usuario de autenticación, asigna un rol activo y genera un token JWT inicial.")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
            @Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        201,
                        "Usuario registrado correctamente",
                        response));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida las credenciales del usuario y genera un token JWT si el inicio de sesión es correcto.")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Inicio de sesión correcto",
                        response));
    }

    @GetMapping("/users")
    @Operation(summary = "Listar usuarios de autenticación", description = "Obtiene todos los usuarios registrados en el microservicio de autenticación.")
    public ResponseEntity<ApiResponse<List<AuthUserResponseDTO>>> getAllUsers() {
        List<AuthUserResponseDTO> response = authService.getAllUsers();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Usuarios de autenticación obtenidos correctamente",
                        response));
    }

    @GetMapping("/users/{authUserId}")
    @Operation(summary = "Buscar usuario de autenticación por ID", description = "Obtiene la información de un usuario de autenticación mediante su identificador.")
    public ResponseEntity<ApiResponse<AuthUserResponseDTO>> getUserById(
            @PathVariable Long authUserId) {
        AuthUserResponseDTO response = authService.getUserById(authUserId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Usuario de autenticación encontrado",
                        response));
    }

    @GetMapping("/users/{authUserId}/exists")
    @Operation(summary = "Validar existencia de usuario", description = "Verifica si existe un usuario de autenticación mediante su identificador.")
    public ResponseEntity<ApiResponse<Boolean>> existsById(
            @PathVariable Long authUserId) {
        boolean response = authService.existsById(authUserId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Validación realizada correctamente",
                        response));
    }

    @GetMapping("/users/email/{email}")
    @Operation(summary = "Buscar usuario por correo", description = "Obtiene un usuario de autenticación mediante su correo electrónico.")
    public ResponseEntity<ApiResponse<AuthUserResponseDTO>> getUserByEmail(
            @PathVariable String email) {
        AuthUserResponseDTO response = authService.getUserByEmail(email);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Usuario de autenticación encontrado por correo",
                        response));
    }

    @PatchMapping("/users/{authUserId}/enable")
    @Operation(summary = "Habilitar usuario", description = "Actualiza el estado del usuario para permitir nuevamente su acceso al sistema.")
    public ResponseEntity<ApiResponse<AuthUserResponseDTO>> enableUser(
            @PathVariable Long authUserId) {
        AuthUserResponseDTO response = authService.enableUser(authUserId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Usuario habilitado correctamente",
                        response));
    }

    @PatchMapping("/users/{authUserId}/disable")
    @Operation(summary = "Deshabilitar usuario", description = "Desactiva el acceso de un usuario de autenticación sin eliminar su registro.")
    public ResponseEntity<ApiResponse<AuthUserResponseDTO>> disableUser(
            @PathVariable Long authUserId) {
        AuthUserResponseDTO response = authService.disableUser(authUserId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Usuario deshabilitado correctamente",
                        response));
    }

    @PutMapping("/users/{authUserId}/password")
    @Operation(summary = "Cambiar contraseña", description = "Actualiza la contraseña de un usuario validando previamente su contraseña actual.")
    public ResponseEntity<ApiResponse<AuthUserResponseDTO>> changePassword(
            @PathVariable Long authUserId,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        AuthUserResponseDTO response = authService.changePassword(authUserId, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Contraseña actualizada correctamente",
                        response));
    }

    @GetMapping("/roles")
    @Operation(summary = "Listar roles", description = "Obtiene todos los roles disponibles para los usuarios del sistema.")
    public ResponseEntity<ApiResponse<List<RoleResponseDTO>>> getAllRoles() {
        List<RoleResponseDTO> response = authService.getAllRoles();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Roles obtenidos correctamente",
                        response));
    }

    @GetMapping("/roles/{roleId}")
    @Operation(summary = "Buscar rol por ID", description = "Obtiene la información de un rol mediante su identificador.")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> getRoleById(
            @PathVariable Long roleId) {
        RoleResponseDTO response = authService.getRoleById(roleId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Rol encontrado",
                        response));
    }

    @GetMapping("/roles/name/{roleName}")
    @Operation(summary = "Buscar rol por nombre", description = "Obtiene la información de un rol mediante su nombre.")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> getRoleByName(
            @PathVariable String roleName) {
        RoleResponseDTO response = authService.getRoleByName(roleName);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Rol encontrado por nombre",
                        response));
    }

    @GetMapping("/roles/{roleId}/exists")
    @Operation(summary = "Validar existencia de rol", description = "Verifica si existe un rol mediante su identificador.")
    public ResponseEntity<ApiResponse<Boolean>> roleExistsById(
            @PathVariable Long roleId) {
        boolean response = authService.roleExistsById(roleId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Validación de rol realizada correctamente",
                        response));
    }

    @GetMapping("/roles/{roleId}/active")
    @Operation(summary = "Validar rol activo", description = "Verifica si un rol existe y se encuentra activo.")
    public ResponseEntity<ApiResponse<Boolean>> roleExistsActiveById(
            @PathVariable Long roleId) {
        boolean response = authService.roleExistsActiveById(roleId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Validación de rol activo realizada correctamente",
                        response));
    }

    @PatchMapping("/roles/{roleId}/activate")
    @Operation(summary = "Activar rol", description = "Activa un rol previamente desactivado para que pueda ser asignado a usuarios.")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> activateRole(
            @PathVariable Long roleId) {
        RoleResponseDTO response = authService.activateRole(roleId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Rol activado correctamente",
                        response));
    }

    @PatchMapping("/roles/{roleId}/deactivate")
    @Operation(summary = "Desactivar rol", description = "Desactiva un rol para evitar que sea asignado a nuevos usuarios.")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> deactivateRole(
            @PathVariable Long roleId) {
        RoleResponseDTO response = authService.deactivateRole(roleId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Rol desactivado correctamente",
                        response));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validar token JWT", description = "Verifica si un token JWT es válido.")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestParam String token) {
        boolean response = authService.validateToken(token);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Token validado correctamente",
                        response));
    }

    @GetMapping("/authorization")
    @Operation(summary = "Obtener autorización del token", description = "Valida el token y devuelve los roles vigentes del usuario para la autorización centralizada del Gateway.")
    public ResponseEntity<ApiResponse<TokenAuthorizationDTO>> getTokenAuthorization(
            @RequestParam String token) {
        TokenAuthorizationDTO authorization = authService.getTokenAuthorization(token);

        return ResponseEntity.ok(new ApiResponse<>(
                200,
                "Token autorizado",
                authorization));
    }

    @GetMapping("/token/email")
    @Operation(summary = "Extraer correo desde token JWT", description = "Obtiene el correo electrónico contenido dentro de un token JWT.")
    public ResponseEntity<ApiResponse<String>> extractEmailFromToken(
            @RequestParam String token) {
        String response = authService.extractEmailFromToken(token);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Correo extraído correctamente desde el token",
                        response));
    }

    @PatchMapping("/users/{authUserId}/roles")
    @Operation(summary = "Asignar rol a usuario", description = "Asigna un rol activo a un usuario de autenticación. Este endpoint puede ser usado por otros microservicios cuando se crea un perfil específico.")
    public ResponseEntity<ApiResponse<AuthUserResponseDTO>> assignRole(
            @PathVariable Long authUserId,
            @Valid @RequestBody AssignRoleRequestDTO request) {
        AuthUserResponseDTO response = authService.assignRole(authUserId, request.roleName());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "Rol asignado correctamente",
                        response));
    }
}
