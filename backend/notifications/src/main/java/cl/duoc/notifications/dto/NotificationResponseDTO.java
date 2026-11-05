package cl.duoc.notifications.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import cl.duoc.notifications.enums.NotificationChannel;
import cl.duoc.notifications.enums.NotificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private Long notificationId;
    private Long userId;
    private NotificationChannel notificationChannel;
    private String notificationTitle;
    private String notificationMessage;
    private NotificationStatus notificationStatus;
    private Long notificationTemplateId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime sentAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}