package cl.duoc.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NotificationTemplateCreateRequestDTO {

    @NotBlank(message = "El código de plantilla es obligatorio")
    @Size(max = 80, message = "El código debe tener máximo 80 caracteres")
    private String templateCode;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 100, message = "El título debe tener máximo 100 caracteres")
    private String templateTitle;

    @NotBlank(message = "El cuerpo de la plantilla es obligatorio")
    private String templateBody;
}