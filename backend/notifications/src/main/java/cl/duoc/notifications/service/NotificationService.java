package cl.duoc.notifications.service;

import cl.duoc.notifications.client.UsersClient;
import cl.duoc.notifications.dto.NotificationResponseDTO;
import cl.duoc.notifications.dto.NotificationSendRequestDTO;
import cl.duoc.notifications.dto.NotificationStatusUpdateRequestDTO;
import cl.duoc.notifications.dto.NotificationUpdateRequestDTO;
import cl.duoc.notifications.enums.NotificationStatus;
import cl.duoc.notifications.model.Notification;
import cl.duoc.notifications.model.NotificationTemplate;
import cl.duoc.notifications.repository.NotificationRepository;
import cl.duoc.notifications.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    // Cambio: cliente para validar userId contra users-service.
    private final UsersClient usersClient;

    public NotificationResponseDTO createNotification(NotificationSendRequestDTO dto) {
        // Cambio: valida que el usuario destinatario exista en users-service antes de crear la notificación.
        if (!usersClient.userExists(dto.getUserId())) {
            log.warn("Usuario destinatario no encontrado en users-service: {}", dto.getUserId());
            throw new RuntimeException("Usuario no encontrado con ID: " + dto.getUserId());
        }

        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setNotificationChannel(dto.getNotificationChannel());
        notification.setNotificationTitle(dto.getNotificationTitle());
        notification.setNotificationMessage(dto.getNotificationMessage());
        notification.setSentAt(null);

        if (dto.getNotificationTemplateId() != null) {
            NotificationTemplate template = templateRepository.findById(dto.getNotificationTemplateId())
                    .orElseThrow(() -> {
                        log.warn("Template no encontrada con ID: {}", dto.getNotificationTemplateId());
                        return new RuntimeException("Id de template no encontrada " + dto.getNotificationTemplateId());
                    });
            notification.setNotificationTemplate(template);
        }
        Notification saved = notificationRepository.save(notification);
        return toResponseDTO(saved);
    }

    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public NotificationResponseDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Notificación no encontrada con ID: {}", id);
                    return new RuntimeException("Id no encontrada: " + id);
                });
        return toResponseDTO(notification);
    }

    public List<NotificationResponseDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<NotificationResponseDTO> getNotificationsByStatus(NotificationStatus status) {
        return notificationRepository.findByNotificationStatus(status)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<NotificationResponseDTO> getNotificationsByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return notificationRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<NotificationResponseDTO> getNotificationsByUserIdAndStatus(Long userId, NotificationStatus status) {
        return notificationRepository.findByUserIdAndNotificationStatus(userId, status)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public NotificationResponseDTO updateNotification(Long id, NotificationUpdateRequestDTO dto) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> {
                log.warn("Notificación no encontrada con ID: {}", id);
                return new RuntimeException("Id no encontrada: " + id);
            });
            notification.setNotificationChannel(dto.getNotificationChannel());
            notification.setNotificationTitle(dto.getNotificationTitle());
            notification.setNotificationMessage(dto.getNotificationMessage());

        if (dto.getNotificationTemplateId() != null) {
            NotificationTemplate template = templateRepository.findById(dto.getNotificationTemplateId())
                .orElseThrow(() -> {
                    log.warn("Template no encontrada con ID: {}", dto.getNotificationTemplateId());
                    return new RuntimeException("Plantilla no encontrada con ID: " + dto.getNotificationTemplateId());
                });
            notification.setNotificationTemplate(template);
        }
        else {
            notification.setNotificationTemplate(null);
        }
        Notification updated = notificationRepository.save(notification);
            return toResponseDTO(updated);
    }


    public NotificationResponseDTO updateNotificationStatus(Long id, NotificationStatusUpdateRequestDTO dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Notificación no encontrada con ID: {}", id);
                    return new RuntimeException("Id no encontrada: " + id);
                });

        notification.setNotificationStatus(dto.getNotificationStatus());

        if (dto.getNotificationStatus() == NotificationStatus.SENT) {
            notification.setSentAt(LocalDateTime.now());
        }
        Notification updated = notificationRepository.save(notification);
        return toResponseDTO(updated);
    }



    private NotificationResponseDTO toResponseDTO(Notification entity) {
        return NotificationResponseDTO.builder()
                .notificationId(entity.getNotificationId())
                .userId(entity.getUserId())
                .notificationChannel(entity.getNotificationChannel())
                .notificationTitle(entity.getNotificationTitle())
                .notificationMessage(entity.getNotificationMessage())
                .notificationStatus(entity.getNotificationStatus())
                .notificationTemplateId(entity.getNotificationTemplate() != null
                        ? entity.getNotificationTemplate().getNotificationTemplateId()
                        : null)
                .sentAt(entity.getSentAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
