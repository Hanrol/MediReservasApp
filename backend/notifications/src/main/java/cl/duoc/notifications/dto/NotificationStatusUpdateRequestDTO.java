package cl.duoc.notifications.dto;

import cl.duoc.notifications.enums.NotificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationStatusUpdateRequestDTO {

    @NotNull(message = "El estado es obligatorio")
    private NotificationStatus notificationStatus;
}
