package cl.duoc.users.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.users.dto.AcceptAdminInvitationRequestDTO;
import cl.duoc.users.dto.AcceptAdminInvitationResponseDTO;
import cl.duoc.users.dto.AdminInvitationResponseDTO;
import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.CreateAdminInvitationRequestDTO;
import cl.duoc.users.dto.CreatedAdminInvitationResponseDTO;
import cl.duoc.users.service.AdminInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin Invitations", description = "Invitaciones para crear cuentas con rol asignado por ADMIN")
public class AdminInvitationController {

    private final AdminInvitationService adminInvitationService;

    @PostMapping("/api/v3/admin/invitations")
    @Operation(summary = "Crear invitación", description = "Genera un enlace de activación de un solo uso y vigencia de 48 horas.")
    public ResponseEntity<ApiResponse<CreatedAdminInvitationResponseDTO>> createInvitation(
            @Valid @RequestBody CreateAdminInvitationRequestDTO request,
            @RequestHeader("X-Authenticated-Email") String authenticatedEmail) {
        CreatedAdminInvitationResponseDTO response = adminInvitationService.createInvitation(request, authenticatedEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Invitación creada correctamente", response));
    }

    @GetMapping("/api/v3/admin/invitations")
    @Operation(summary = "Listar invitaciones pendientes", description = "Lista invitaciones sin aceptar, indicando si siguen vigentes.")
    public ResponseEntity<ApiResponse<List<AdminInvitationResponseDTO>>> getPendingInvitations() {
        return ResponseEntity.ok(new ApiResponse<>(200, "Invitaciones obtenidas correctamente",
                adminInvitationService.getPendingInvitations()));
    }

    @PostMapping("/api/v3/invitations/accept")
    @Operation(summary = "Aceptar invitación", description = "Activa la cuenta, asigna el rol definido por ADMIN y crea la identidad y los perfiles iniciales.")
    public ResponseEntity<ApiResponse<AcceptAdminInvitationResponseDTO>> acceptInvitation(
            @Valid @RequestBody AcceptAdminInvitationRequestDTO request) {
        AcceptAdminInvitationResponseDTO response = adminInvitationService.acceptInvitation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Cuenta activada correctamente", response));
    }
}
