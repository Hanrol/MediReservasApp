package cl.duoc.notifications.controller;

import cl.duoc.notifications.dto.ApiResponse;
import cl.duoc.notifications.dto.NotificationResponseDTO;
import cl.duoc.notifications.dto.NotificationSendRequestDTO;
import cl.duoc.notifications.dto.NotificationStatusUpdateRequestDTO;
import cl.duoc.notifications.dto.NotificationUpdateRequestDTO;
import cl.duoc.notifications.enums.NotificationStatus;
import cl.duoc.notifications.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @Operation(summary = "Crear una nueva notificación", description = "Envía una nueva notificación de un evento del sistema.")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> createNotification(
            @Valid @RequestBody NotificationSendRequestDTO dto) {
        NotificationResponseDTO response = notificationService.createNotification(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                    201, 
                    "Notificación creada con éxito", 
                    response));
    }

    @GetMapping
    @Operation(summary = "Obtener todas las notificaciones", description = "Retorna una lista con todas las notificaciones del sistema.")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getAllNotifications() {
        List<NotificationResponseDTO> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(
                new ApiResponse<>(
                    200, 
                    "Notificaciones obtenidas exitosamente", 
                    notifications));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una notificación por ID", description = "Retorna una notificación específica según su ID.")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> getNotificationById(
            @PathVariable Long id) {
        NotificationResponseDTO response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(
                    200, 
                    "Notificación obtenida exitosamente", 
                    response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtener notificaciones por ID de usuario", description = "Retorna una lista de notificaciones asociadas a un usuario específico.")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getNotificationsByUserId(
            @PathVariable Long userId) {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(
                    200, 
                    "Notificaciones del usuario obtenidas exitosamente", 
                    notifications));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Obtener notificaciones por estado", description = "Retorna una lista de notificaciones según su estado.")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getNotificationsByStatus(
            @PathVariable NotificationStatus status) {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsByStatus(status);
        return ResponseEntity.ok(
                new ApiResponse<>(
                    200, 
                    "Notificaciones  por estado  obtenidas exitosamente", 
                    notifications));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Obtener notificaciones por fecha", description = "Retorna una lista de notificaciones creadas en una fecha específica.")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getNotificationsByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsByDate(date);
        return ResponseEntity.ok(
                new ApiResponse<>(
                    200, 
                    "Notificaciones de la fecha obtenidas exitosamente", 
                    notifications));
    }

    @GetMapping("/user/{userId}/status/{status}")
    @Operation(summary = "Obtener notificaciones por ID de usuario y estado", description = "Retorna una lista de notificaciones asociadas a un usuario específico y según su estado.")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getNotificationsByUserIdAndStatus(
            @PathVariable Long userId, @PathVariable NotificationStatus status) {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(
                new ApiResponse<>(
                    200, 
                    "Notificaciones filtradas exitosamente", 
                    notifications));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una notificación", description = "Actualiza los detalles de una notificación existente según su ID.")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> updateNotification(
        @PathVariable Long id,
        @Valid @RequestBody NotificationUpdateRequestDTO dto) {
    NotificationResponseDTO response = notificationService.updateNotification(id, dto);
    return ResponseEntity.ok(
            new ApiResponse<>(
                    200,
                    "Notificación actualizada exitosamente",
                    response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizar el estado de una notificación", description = "Actualiza el estado de una notificación existente según su ID.")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> updateNotificationStatus(
        @PathVariable Long id,
        @Valid @RequestBody NotificationStatusUpdateRequestDTO dto) {
    NotificationResponseDTO response = notificationService.updateNotificationStatus(id, dto);
    return ResponseEntity.ok(
            new ApiResponse<>(
                    200,
                    "Estado de notificación actualizado exitosamente",
                    response));
    }
}