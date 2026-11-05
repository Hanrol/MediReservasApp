package cl.duoc.notifications.dto;

import cl.duoc.notifications.enums.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NotificationUpdateRequestDTO {
 @NotNull(message = "El canal es obligatorio")
    private NotificationChannel notificationChannel;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 100, message = "El título debe tener máximo 100 caracteres")
    private String notificationTitle;

    @NotBlank(message = "El mensaje es obligatorio")
    private String notificationMessage;

    private Long notificationTemplateId;
}
