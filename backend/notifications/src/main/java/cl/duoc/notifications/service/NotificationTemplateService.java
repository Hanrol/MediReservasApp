package cl.duoc.notifications.service;

import cl.duoc.notifications.dto.NotificationTemplateCreateRequestDTO;
import cl.duoc.notifications.dto.NotificationTemplateResponseDTO;
import cl.duoc.notifications.model.NotificationTemplate;
import cl.duoc.notifications.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationTemplateService {

    private final NotificationTemplateRepository templateRepository;

    public NotificationTemplateResponseDTO createTemplate(NotificationTemplateCreateRequestDTO dto) {
        if (templateRepository.existsByTemplateCode(dto.getTemplateCode())) {
            log.warn("Intento de crear plantilla con código duplicado: {}", dto.getTemplateCode());
            throw new RuntimeException("El código de plantilla ya existe: " + dto.getTemplateCode());
        }

        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateCode(dto.getTemplateCode());
        template.setTemplateTitle(dto.getTemplateTitle());
        template.setTemplateBody(dto.getTemplateBody());
        template.setActive(true);

        NotificationTemplate saved = templateRepository.save(template);
        return toResponseDTO(saved);
    }

    public List<NotificationTemplateResponseDTO> getAllTemplates() {
        return templateRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public NotificationTemplateResponseDTO getTemplateById(Long id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Plantilla no encontrada con ID: {}", id);
                    return new RuntimeException("Plantilla no encontrada con ID: " + id);
                });

        return toResponseDTO(template);
    }

    public List<NotificationTemplateResponseDTO> getActiveTemplates() {
        return templateRepository.findByActiveTrue()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }


    private NotificationTemplateResponseDTO toResponseDTO(NotificationTemplate entity) {
        return NotificationTemplateResponseDTO.builder()
                .notificationTemplateId(entity.getNotificationTemplateId())
                .templateCode(entity.getTemplateCode())
                .templateTitle(entity.getTemplateTitle())
                .templateBody(entity.getTemplateBody())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}