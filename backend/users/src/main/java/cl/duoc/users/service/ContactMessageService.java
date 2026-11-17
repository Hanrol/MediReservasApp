package cl.duoc.users.service;

import java.util.List;
import java.util.Locale;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.users.dto.ContactMessageResponseDTO;
import cl.duoc.users.dto.CreateContactMessageRequestDTO;
import cl.duoc.users.model.ContactMessage;
import cl.duoc.users.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageResponseDTO create(CreateContactMessageRequestDTO request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.name().trim());
        message.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        message.setSubject(request.subject().trim());
        message.setMessage(request.message().trim());
        message.setCreatedAt(LocalDateTime.now());
        return toResponse(contactMessageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponseDTO> getAll() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ContactMessageResponseDTO toResponse(ContactMessage message) {
        return new ContactMessageResponseDTO(
                message.getContactMessageId(),
                message.getName(),
                message.getEmail(),
                message.getSubject(),
                message.getMessage(),
                message.getCreatedAt());
    }
}
