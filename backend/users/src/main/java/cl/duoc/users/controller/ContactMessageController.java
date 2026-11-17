package cl.duoc.users.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.ContactMessageResponseDTO;
import cl.duoc.users.dto.CreateContactMessageRequestDTO;
import cl.duoc.users.service.ContactMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/contact-messages")
@RequiredArgsConstructor
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessageResponseDTO>> create(
            @Valid @RequestBody CreateContactMessageRequestDTO request) {
        ContactMessageResponseDTO message = contactMessageService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Mensaje de contacto recibido correctamente", message));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactMessageResponseDTO>>> getAll(
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {
        Set<String> parsedRoles = roles == null ? Set.of() : Arrays.stream(roles.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(role -> !role.isEmpty())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        if (!parsedRoles.contains("RECEPTIONIST") && !parsedRoles.contains("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(403, "Solo recepción puede consultar los mensajes", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(
                200, "Mensajes de contacto obtenidos correctamente", contactMessageService.getAll()));
    }
}
