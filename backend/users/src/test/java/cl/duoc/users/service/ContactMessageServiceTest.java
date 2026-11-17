package cl.duoc.users.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.duoc.users.dto.CreateContactMessageRequestDTO;
import cl.duoc.users.model.ContactMessage;
import cl.duoc.users.repository.ContactMessageRepository;

@ExtendWith(MockitoExtension.class)
class ContactMessageServiceTest {

    @Mock
    private ContactMessageRepository repository;

    @InjectMocks
    private ContactMessageService service;

    @Test
    void savesNormalizedMessageAndReturnsStoredMessage() {
        when(repository.save(any(ContactMessage.class))).thenAnswer(invocation -> {
            ContactMessage saved = invocation.getArgument(0);
            saved.setContactMessageId(7L);
            return saved;
        });

        var response = service.create(new CreateContactMessageRequestDTO(
                "  Ana Pérez  ", " ANA@EXAMPLE.COM ", "  Consulta  ", "  Necesito información.  "));

        assertThat(response.contactMessageId()).isEqualTo(7L);
        assertThat(response.name()).isEqualTo("Ana Pérez");
        assertThat(response.email()).isEqualTo("ana@example.com");
        assertThat(response.subject()).isEqualTo("Consulta");
        assertThat(response.message()).isEqualTo("Necesito información.");
        assertThat(response.createdAt()).isNotNull();
        verify(repository).save(any(ContactMessage.class));
    }

    @Test
    void listsMessagesFromSharedInboxInRepositoryOrder() {
        ContactMessage latest = new ContactMessage();
        latest.setContactMessageId(2L);
        latest.setName("Ana");
        latest.setEmail("ana@example.com");
        latest.setSubject("Consulta nueva");
        latest.setMessage("Mensaje");
        latest.setCreatedAt(LocalDateTime.now());
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(latest));

        var messages = service.getAll();

        assertThat(messages).hasSize(1);
        assertThat(messages.getFirst().contactMessageId()).isEqualTo(2L);
    }
}
