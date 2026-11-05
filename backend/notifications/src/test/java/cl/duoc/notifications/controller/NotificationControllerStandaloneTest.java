package cl.duoc.notifications.controller;

import cl.duoc.notifications.dto.NotificationResponseDTO;
import cl.duoc.notifications.dto.NotificationSendRequestDTO;
import cl.duoc.notifications.enums.NotificationChannel;
import cl.duoc.notifications.enums.NotificationStatus;
import cl.duoc.notifications.exception.GlobalExceptionHandler;
import cl.duoc.notifications.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


class NotificationControllerStandaloneTest {

    private MockMvc mockMvc;
    private NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private NotificationSendRequestDTO buildRequest(Long userId) {
        NotificationSendRequestDTO dto = new NotificationSendRequestDTO();
        dto.setUserId(userId);
        dto.setNotificationChannel(NotificationChannel.EMAIL);
        dto.setNotificationTitle("Confirmación de cita");
        dto.setNotificationMessage("Su cita fue confirmada");
        return dto;
    }

    private NotificationResponseDTO responseDTO() {
        return NotificationResponseDTO.builder()
                .notificationId(5L)
                .userId(1L)
                .notificationChannel(NotificationChannel.EMAIL)
                .notificationTitle("Confirmación de cita")
                .notificationMessage("Su cita fue confirmada")
                .notificationStatus(NotificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @BeforeEach
    void setup() {
        notificationService = Mockito.mock(NotificationService.class);
        NotificationController notificationController = new NotificationController(notificationService);
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createNotification_returns201() throws Exception {
        Mockito.when(notificationService.createNotification(Mockito.any())).thenReturn(responseDTO());

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest(1L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.notificationId").value(5));
    }

    @Test
    void createNotification_whenUserNotFound_returns404() throws Exception {
        Mockito.when(notificationService.createNotification(Mockito.any()))
                .thenThrow(new RuntimeException("Usuario no encontrado con ID: 99"));

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest(99L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void getNotificationById_returns200() throws Exception {
        Mockito.when(notificationService.getNotificationById(5L)).thenReturn(responseDTO());

        mockMvc.perform(get("/api/v1/notifications/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notificationId").value(5));
    }
}
