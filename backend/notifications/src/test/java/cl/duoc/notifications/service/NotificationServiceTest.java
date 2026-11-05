package cl.duoc.notifications.service;

import cl.duoc.notifications.client.UsersClient;
import cl.duoc.notifications.dto.NotificationResponseDTO;
import cl.duoc.notifications.dto.NotificationSendRequestDTO;
import cl.duoc.notifications.enums.NotificationChannel;
import cl.duoc.notifications.enums.NotificationStatus;
import cl.duoc.notifications.model.Notification;
import cl.duoc.notifications.repository.NotificationRepository;
import cl.duoc.notifications.repository.NotificationTemplateRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


class NotificationServiceTest {

    private NotificationSendRequestDTO buildRequest(Long userId) {
        NotificationSendRequestDTO dto = new NotificationSendRequestDTO();
        dto.setUserId(userId);
        dto.setNotificationChannel(NotificationChannel.EMAIL);
        dto.setNotificationTitle("Confirmación de cita");
        dto.setNotificationMessage("Su cita fue confirmada");
        return dto;
    }

    private Notification savedEntity(Long id) {
        Notification n = new Notification();
        n.setNotificationId(id);
        n.setUserId(1L);
        n.setNotificationChannel(NotificationChannel.EMAIL);
        n.setNotificationTitle("Confirmación de cita");
        n.setNotificationMessage("Su cita fue confirmada");
        n.setNotificationStatus(NotificationStatus.PENDING);
        n.setCreatedAt(LocalDateTime.now());
        return n;
    }

    @Test
    void createNotification_whenUserExists_savesAndReturnsDTO() {
        NotificationRepository notificationRepository = Mockito.mock(NotificationRepository.class);
        NotificationTemplateRepository templateRepository = Mockito.mock(NotificationTemplateRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        NotificationService notificationService = new NotificationService(
                notificationRepository, templateRepository, usersClient);

        Mockito.when(usersClient.userExists(1L)).thenReturn(true);
        Mockito.when(notificationRepository.save(Mockito.any(Notification.class))).thenReturn(savedEntity(5L));

        NotificationResponseDTO result = notificationService.createNotification(buildRequest(1L));

        assertThat(result).isNotNull();
        assertThat(result.getNotificationId()).isEqualTo(5L);
        Mockito.verify(notificationRepository).save(Mockito.any(Notification.class));
    }

    @Test
    void createNotification_whenUserDoesNotExist_throwsRuntimeException() {
        NotificationRepository notificationRepository = Mockito.mock(NotificationRepository.class);
        NotificationTemplateRepository templateRepository = Mockito.mock(NotificationTemplateRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        NotificationService notificationService = new NotificationService(
                notificationRepository, templateRepository, usersClient);

        Mockito.when(usersClient.userExists(99L)).thenReturn(false);

        assertThatThrownBy(() -> notificationService.createNotification(buildRequest(99L)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");

        Mockito.verify(notificationRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void createNotification_whenUsersClientThrows_throwsRuntimeException() {
        NotificationRepository notificationRepository = Mockito.mock(NotificationRepository.class);
        NotificationTemplateRepository templateRepository = Mockito.mock(NotificationTemplateRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        NotificationService notificationService = new NotificationService(
                notificationRepository, templateRepository, usersClient);

        Mockito.when(usersClient.userExists(1L))
                .thenThrow(new RuntimeException("No se pudo conectar con Users Service"));

        assertThatThrownBy(() -> notificationService.createNotification(buildRequest(1L)))
                .isInstanceOf(RuntimeException.class);

        Mockito.verify(notificationRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void getNotificationById_whenFound_returnsDTO() {
        NotificationRepository notificationRepository = Mockito.mock(NotificationRepository.class);
        NotificationTemplateRepository templateRepository = Mockito.mock(NotificationTemplateRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        NotificationService notificationService = new NotificationService(
                notificationRepository, templateRepository, usersClient);

        Mockito.when(notificationRepository.findById(5L)).thenReturn(Optional.of(savedEntity(5L)));

        NotificationResponseDTO result = notificationService.getNotificationById(5L);

        assertThat(result).isNotNull();
        assertThat(result.getNotificationId()).isEqualTo(5L);
        assertThat(result.getNotificationStatus()).isEqualTo(NotificationStatus.PENDING);
    }
}
